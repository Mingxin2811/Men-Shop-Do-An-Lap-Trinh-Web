const COLOR_LABELS = {
  Den: 'Đen',
  Trang: 'Trắng',
  Xam: 'Xám',
  Navy: 'Xanh navy',
  Nau: 'Nâu',
};

export const formatProductColor = (color) => COLOR_LABELS[color] || color;

export const normalizeProductColor = (color) =>
  formatProductColor(String(color || '').trim());
