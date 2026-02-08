import Order from '../models/Order.js';

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
