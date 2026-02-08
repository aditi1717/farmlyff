import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import asyncHandler from 'express-async-handler';
import shiprocketService from '../utils/shiprocketService.js';

// Initialize Razorpay
// Note: These will be undefined until the user adds them to .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Public (or Private if auth is needed)
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

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
    const { orderData } = req.body;
    
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
