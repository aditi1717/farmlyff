import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  id: String,
  weight: String,
  mrp: Number,
  price: Number,
  unitPrice: String,
  discount: String
});

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Custom ID: "prod_001"
  brand: String,
  name: String,
  category: String,
  image: String,
  rating: Number,
  reviews: Number,
  tag: String,
  variants: [variantSchema],
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
