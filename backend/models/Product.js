import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  id: String,
  weight: String,
  mrp: Number,
  price: Number,
  unitPrice: String,
  discount: String,
  stock: { type: Number, default: 0 }
});

const contentSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  quantity: String
}, { _id: false });

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Custom ID: "prod_001"
  brand: String,
  name: String,
  category: String,
  subcategory: String,
  image: String,
  description: String,
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  tag: String,
  variants: [variantSchema],
  benefits: [String],
  specifications: [{ label: String, value: String, _id: false }],
  faqs: [{ q: String, a: String, _id: false }],
  nutrition: [{ label: String, value: String, _id: false }],
  contents: [contentSchema], // For combo packs
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
