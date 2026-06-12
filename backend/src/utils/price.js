// Tra ve gia thuc te cua san pham: dung salePrice neu hop le (> 0 va < price),
// nguoc lai dung gia goc. Dung chung cho gio hang va dat hang.
const getEffectivePrice = (product) => {
  const price = Number(product.price);
  const sale = product.salePrice != null ? Number(product.salePrice) : null;
  if (sale != null && Number.isFinite(sale) && sale > 0 && sale < price) {
    return sale;
  }
  return price;
};

module.exports = { getEffectivePrice };
