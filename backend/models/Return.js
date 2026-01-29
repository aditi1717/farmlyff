import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Custom ID: "RET-..."
  orderId: String,
  userId: String,
  type: { type: String, enum: ['refund', 'replace'] },
  status: { type: String, default: 'Pending' }, // Pending, Approved, Picked Up, Refunded, Rejected
  reason: String,
  comments: String,
  items: [Object], // Can be more specific if item structure is strictly defined
  requestDate: Date
}, { timestamps: true });

export default mongoose.model('Return', returnSchema);
