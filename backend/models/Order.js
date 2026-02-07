import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  qty: Number,
  price: Number
});

const statusHistorySchema = new mongoose.Schema({
  status: String,
  timestamp: Date,
  info: String
});

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Custom ID: "ORD-..."
  userId: String,
  date: Date,
  status: { type: String, default: 'pending' },
  deliveryStatus: { type: String, default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  paymentMethod: String,
  courierPartner: String,
  trackingId: String,
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  statusHistory: [statusHistorySchema]
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
