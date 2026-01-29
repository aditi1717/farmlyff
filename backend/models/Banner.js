import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  badgeText: { type: String },
  image: { type: String, required: true }, // Cloudinary URL
  publicId: { type: String }, // Cloudinary Public ID for deletion
  link: { type: String, default: '/' }, // Where clicking the banner goes
  section: { type: String, enum: ['hero', 'promo'], default: 'hero' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);
