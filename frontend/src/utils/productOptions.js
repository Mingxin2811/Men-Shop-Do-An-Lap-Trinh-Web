const COLOR_LABELS = {
  Den: 'Đen',
  Trang: 'Trắng',
  Xam: 'Xám',
  Navy: 'Xanh navy',
  Nau: 'Nâu',
};

// Bản đồ màu -> mã hex để hiển thị swatch. Hỗ trợ cả dạng raw (Den) lẫn nhãn (Đen).
const COLOR_HEX = {
  Den: '#1a1a1a', 'Đen': '#1a1a1a',
  Trang: '#f3f3f3', 'Trắng': '#f3f3f3',
  Xam: '#9aa0a6', 'Xám': '#9aa0a6',
  Navy: '#1f3a5f', 'Xanh navy': '#1f3a5f',
  Nau: '#8b5e3c', 'Nâu': '#8b5e3c',
};

export const formatProductColor = (color) => COLOR_LABELS[color] || color;

export const normalizeProductColor = (color) =>
  formatProductColor(String(color || '').trim());

// Trả về mã hex của màu để vẽ swatch, hoặc null nếu không biết màu (rơi về nút chữ).
export const getColorHex = (color) => COLOR_HEX[String(color || '').trim()] || null;
