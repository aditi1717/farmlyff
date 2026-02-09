import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Referral from '../models/Referral.js';
import asyncHandler from 'express-async-handler';
import shiprocketService from '../utils/shiprocketService.js';

// Initialize Razorpay
// Note: These will be undefined until the user adds them to .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// Helper function to deduct stock from products
const deductStock = async (orderItems) => {
  const Product = (await import('../models/Product.js')).default;
  
  for (const item of orderItems) {
    try {
      const product = await Product.findOne({ id: item.productId });
      
      if (!product) {
        console.error(`Product not found: ${item.productId}`);
        continue;
      }

      // Check if it's a variant product or simple product
      if (item.id && item.id.includes('_')) {
        // Variant product (format: productId_variantId)
        const variantId = item.id.split('_')[1];
        const variant = product.variants.find(v => v.id === variantId);
        
        if (variant) {
          variant.stock = Math.max(0, (variant.stock || 0) - item.qty);
          console.log(`Deducted ${item.qty} from variant ${variantId} of ${product.name}. New stock: ${variant.stock}`);
        }
      } else {
        // Simple product
        product.stock.quantity = Math.max(0, (product.stock.quantity || 0) - item.qty);
        console.log(`Deducted ${item.qty} from ${product.name}. New stock: ${product.stock.quantity}`);
      }

      // Update inStock flag
      const hasStock = product.variants.length > 0
        ? product.variants.some(v => (v.stock || 0) > 0)
        : (product.stock.quantity || 0) > 0;
      
      product.inStock = hasStock;

      await product.save();
    } catch (error) {
      console.error(`Error deducting stock for item ${item.id}:`, error.message);
    }
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Public (or Private if auth is needed)
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', receipt, userId } = req.body;

  // Validation: Check if user profile is complete
  if (userId) {
      const user = await User.findOne({ id: userId });
      if (!user || !user.phone || !user.addresses || user.addresses.length === 0) {
          return res.status(400).json({ 
              message: 'Please complete your profile (Mobile Number and Address) before placing an order.' 
          });
      }
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      // In development, if keys are missing, we might want to throw a specific error or 
      // return a mock response if the user just wants to see the UI.
      // But for production safety, we should error.
      // return res.status(400).json({ message: 'Razorpay keys not configured' });
  }

  const options = {
    amount: Math.round(amount * 100), // amount in the smallest currency unit (paise for INR)
    currency,
    receipt,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
});

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Public
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData // Custom data sent from frontend to create our DB order record
  } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    // Payment verified
    try {
        // Generate unique order ID
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        const orderId = `ORD-${timestamp}-${randomSuffix}`;

        // Create order in our database
        const newOrder = new Order({
            ...orderData,
            id: orderId,
            userName: orderData.shippingAddress?.fullName, // Added for quick access
            date: new Date(),
            paymentStatus: 'paid',
            status: 'pending', // Order received
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        await newOrder.save();

        // Deduct stock from products
        await deductStock(orderData.items || []);

        // Update Referral Stats if a coupon/code was used
        if (orderData.appliedCoupon) {
            const referral = await Referral.findOne({ code: orderData.appliedCoupon });
            if (referral) {
                referral.usageCount = (referral.usageCount || 0) + 1;
                // Add the gross amount (subtotal before discount) to totalSales
                // If subtotal isn't passed, we'll use total + discount as an estimate
                const saleAmount = orderData.amount + (orderData.discount || 0);
                referral.totalSales = (referral.totalSales || 0) + saleAmount;
                await referral.save();
            }
        }

        // Create shipment in Shiprocket for prepaid orders (only if configured)
        if (shiprocketService.isConfigured()) {
            try {
                const shiprocketResponse = await shiprocketService.createOrder(newOrder);
                
                if (shiprocketResponse && shiprocketResponse.order_id) {
                    newOrder.shiprocketOrderId = shiprocketResponse.order_id;
                    newOrder.shiprocketShipmentId = shiprocketResponse.shipment_id;
                    
                    // Assign AWB automatically
                    try {
                        const awbResponse = await shiprocketService.assignAWB(shiprocketResponse.shipment_id);
                        if (awbResponse && awbResponse.response) {
                            newOrder.awbCode = awbResponse.response.data.awb_code;
                            newOrder.courierName = awbResponse.response.data.courier_name;
                        }

                        // Generate pickup
                        await shiprocketService.generatePickup(shiprocketResponse.shipment_id);
                    } catch (awbError) {
                        console.error('AWB assignment failed:', awbError.message);
                    }
                    
                    await newOrder.save();
                }
            } catch (shiprocketError) {
                console.error('Shiprocket integration failed:', shiprocketError.message);
                // Don't fail the order if Shiprocket fails
            }
        } else {
            console.log('Shiprocket not configured, skipping shipment creation');
        }

        res.status(200).json({ message: "Payment verified successfully", orderId: newOrder.id });
    } catch (dbError) {
        console.error('DB Order Creation Error after payment verification:', dbError);
        res.status(500).json({ message: "Payment verified but failed to save order", error: dbError.message });
    }
  } else {
    res.status(400).json({ message: "Invalid signature sent!" });
  }
});

// @desc    Create COD Order
// @route   POST /api/payments/cod
// @access  Public
export const createCODOrder = asyncHandler(async (req, res) => {
    const { orderData, userId } = req.body;
    
    // Validation: Check if user profile is complete
    if (userId) {
        const user = await User.findOne({ id: userId });
        if (!user || !user.phone || !user.addresses || user.addresses.length === 0) {
            return res.status(400).json({ 
                message: 'Please complete your profile (Mobile Number and Address) before placing an order.' 
            });
        }
    }

    try {
        // Generate unique order ID
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        const orderId = `ORD-${timestamp}-${randomSuffix}`;

        const newOrder = new Order({
            ...orderData,
            id: orderId,
            userName: orderData.shippingAddress?.fullName, // Added for quick access
            date: new Date(),
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            status: 'pending'
        });

        await newOrder.save();

        // Deduct stock from products
        await deductStock(orderData.items || []);

        // Update Referral Stats if a coupon/code was used
        if (orderData.appliedCoupon) {
            const referral = await Referral.findOne({ code: orderData.appliedCoupon });
            if (referral) {
                referral.usageCount = (referral.usageCount || 0) + 1;
                const saleAmount = orderData.amount + (orderData.discount || 0);
                referral.totalSales = (referral.totalSales || 0) + saleAmount;
                await referral.save();
            }
        }

        // Create shipment in Shiprocket (only if configured)
        if (shiprocketService.isConfigured()) {
            try {
                const shiprocketResponse = await shiprocketService.createOrder(newOrder);
                
                if (shiprocketResponse && shiprocketResponse.order_id) {
                    newOrder.shiprocketOrderId = shiprocketResponse.order_id;
                    newOrder.shiprocketShipmentId = shiprocketResponse.shipment_id;
                    
                    // Assign AWB automatically
                    try {
                        const awbResponse = await shiprocketService.assignAWB(shiprocketResponse.shipment_id);
                        if (awbResponse && awbResponse.response) {
                            newOrder.awbCode = awbResponse.response.data.awb_code;
                            newOrder.courierName = awbResponse.response.data.courier_name;
                        }

                        // Generate pickup
                        await shiprocketService.generatePickup(shiprocketResponse.shipment_id);
                    } catch (awbError) {
                        console.error('AWB assignment failed:', awbError.message);
                    }
                    
                    await newOrder.save();
                }
            } catch (shiprocketError) {
                console.error('Shiprocket integration failed:', shiprocketError.message);
                // Don't fail the order creation if Shiprocket fails
            }
        } else {
            console.log('Shiprocket not configured, skipping shipment creation');
        }

        res.status(201).json({ message: "Order placed successfully", orderId: newOrder.id });
    } catch (error) {
        res.status(500).json({ message: "Failed to place COD order", error: error.message });
    }
});
