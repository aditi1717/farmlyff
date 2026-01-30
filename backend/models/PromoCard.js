import mongoose from 'mongoose';

const promoCardSchema = new mongoose.Schema({
  topBadge: { type: String, default: 'Hot Deal' },
  badgeText1: { type: String, default: 'Upto' },
  discountTitle: { type: String, default: '60' },
  discountSuffix: { type: String, default: '%' },
  discountLabel: { type: String, default: 'OFF' },
  subtitle: { type: String, default: 'EXTRA SAVE' },
  extraDiscount: { type: String, default: '15' },
  extraDiscountSuffix: { type: String, default: '%' },
  showCouponCode: { type: Boolean, default: true },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('PromoCard', promoCardSchema);
