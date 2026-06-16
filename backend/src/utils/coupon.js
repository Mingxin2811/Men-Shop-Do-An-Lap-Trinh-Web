// Tinh so tien duoc giam cua mot ma cho gia tri tam tinh (subtotal).
// PERCENT: giam theo % (co the gioi han boi maxDiscount).
// FIXED: giam so tien co dinh. Khong bao gio giam vuot qua subtotal.
const computeDiscount = (coupon, subtotal) => {
  let discount = 0;

  if (coupon.discountType === "PERCENT") {
    discount = (subtotal * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }
  } else {
    discount = Number(coupon.discountValue);
  }

  discount = Math.min(discount, subtotal);
  return Math.max(0, Math.round(discount));
};

// Kiem tra ma con dung duoc voi gia tri don hang khong.
// Tra ve chuoi loi neu khong dung duoc, nguoc lai tra ve null.
const getCouponError = (coupon, subtotal) => {
  if (!coupon || !coupon.isActive) {
    return "Ma giam gia khong ton tai hoac da bi vo hieu";
  }

  const now = new Date();
  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    return "Ma giam gia chua co hieu luc";
  }
  if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
    return "Ma giam gia da het han";
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return "Ma giam gia da het luot su dung";
  }
  if (Number(coupon.minOrderValue) > subtotal) {
    const min = Number(coupon.minOrderValue).toLocaleString("vi-VN");
    return `Don hang toi thieu ${min}d de dung ma nay`;
  }

  return null;
};

module.exports = { computeDiscount, getCouponError };
