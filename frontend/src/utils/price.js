// Tiện ích tính toán & hiển thị giá, hỗ trợ giá khuyến mãi (salePrice).

export const formatPrice = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

// Trả về thông tin khuyến mãi của một sản phẩm.
export const getSaleInfo = (product) => {
  const price = Number(product?.price ?? 0);
  const sale = product?.salePrice != null && product?.salePrice !== ''
    ? Number(product.salePrice)
    : null;
  const onSale = sale != null && Number.isFinite(sale) && sale < price && sale > 0;

  return {
    onSale,
    effectivePrice: onSale ? sale : price,
    originalPrice: price,
    discountPercent: onSale ? Math.round((1 - sale / price) * 100) : 0,
  };
};
