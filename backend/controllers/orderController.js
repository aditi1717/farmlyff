import Order from '../models/Order.js';
import Razorpay from 'razorpay';
import shiprocketService from '../utils/shiprocketService.js';
import asyncHandler from 'express-async-handler';

// Initialize Razorpay for refunds
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();

    // Map stats to a more friendly format
    const statsMap = {
      All: totalOrders,
      Processing: 0,
      Received: 0,
      Processed: 0,
      Shipped: 0,
      OutForDelivery: 0,
      Delivered: 0,
      Cancelled: 0
    };

    stats.forEach(item => {
      // Normalize 'pending' to 'Processing'
      if (item._id === 'pending') {
        statsMap.Processing += item.count;
      } else if (statsMap.hasOwnProperty(item._id)) {
        statsMap[item._id] = item.count;
      } else {
        // Fallback for case sensitivity or unknown statuses
        const normalizedKey = item._id.charAt(0).toUpperCase() + item._id.slice(1);
        if (statsMap.hasOwnProperty(normalizedKey)) {
          statsMap[normalizedKey] = item.count;
        }
      }
    });

    res.json(statsMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an order
// @route   POST /api/orders/:orderId/cancel
// @access  Public (should be authenticated in production)
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    // Find order by custom ID or MongoDB _id
    const order = await Order.findOne({ 
      $or: [{ id: orderId }, { _id: orderId }] 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled (only pending/processing orders)
    const cancellableStatuses = ['pending', 'Processing', 'Received', 'Processed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel order with status "${order.status}". Only orders that haven't been shipped can be cancelled.` 
      });
    }

    // Already cancelled check
    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    let shiprocketCancelled = false;
    let refundInitiated = false;
    let refundId = null;
    let refundStatus = 'not_applicable';

    // 1. Cancel in Shiprocket if order exists there
    if (order.shiprocketOrderId && shiprocketService.isConfigured()) {
      try {
        await shiprocketService.cancelOrder(order.shiprocketOrderId);
        shiprocketCancelled = true;
        console.log(`Shiprocket order ${order.shiprocketOrderId} cancelled successfully`);
      } catch (shiprocketError) {
        console.error('Shiprocket cancellation failed:', shiprocketError.message);
        // Continue with local cancellation even if Shiprocket fails
      }
    }

    // 2. Initiate Razorpay refund if payment was made online
    if (order.razorpayPaymentId && order.paymentStatus === 'paid') {
      try {
        const refundAmount = order.amount * 100; // Convert to paise
        const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: refundAmount,
          speed: 'normal', // 'normal' (5-7 days) or 'optimum' (instant if eligible)
          notes: {
            order_id: order.id,
            reason: reason || 'Customer requested cancellation'
          }
        });

        refundId = refund.id;
        refundStatus = 'pending'; // Refund initiated, pending processing
        refundInitiated = true;
        console.log(`Razorpay refund initiated: ${refund.id} for ₹${order.amount}`);
      } catch (refundError) {
        console.error('Razorpay refund failed:', refundError.message);
        refundStatus = 'failed';
        // Continue with cancellation but mark refund as failed
      }
    } else if (order.paymentMethod === 'cod') {
      refundStatus = 'not_applicable'; // COD orders don't need refund
    }

    // 3. Update order in database
    order.status = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Customer requested cancellation';
    order.refundId = refundId;
    order.refundStatus = refundStatus;
    order.refundAmount = refundInitiated ? order.amount : null;

    // Add to status history
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      info: `Order cancelled by customer. ${shiprocketCancelled ? 'Shiprocket notified. ' : ''}${refundInitiated ? `Refund of ₹${order.amount} initiated (ID: ${refundId})` : ''}`
    });

    await order.save();

    res.status(200).json({
      message: 'Order cancelled successfully',
      orderId: order.id,
      shiprocketCancelled,
      refund: {
        initiated: refundInitiated,
        id: refundId,
        status: refundStatus,
        amount: refundInitiated ? order.amount : null
      }
    });

  } catch (error) {
    console.error('Order cancellation error:', error.message);
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
});
