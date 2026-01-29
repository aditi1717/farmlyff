import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String }, // e.g., 'exotic-nuts'
  image: { type: String }, // URL from Cloudinary
  status: { type: String, enum: ['Active', 'Hidden'], default: 'Active' },
  showInNavbar: { type: Boolean, default: false },
  // showInShopByCategory removed from Parent? Or kept for flexibility? 
  // Plan said "Categories are now always top-level".
  // Let's keep general visibility flags if needed, but primary strip logic moves to SubCategory.
  order: { type: Number, default: 0 }
}, { timestamps: true,  toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual to find children
categorySchema.virtual('subCategories', {
  ref: 'SubCategory',
  localField: '_id',
  foreignField: 'parent'
});

export default mongoose.model('Category', categorySchema);
