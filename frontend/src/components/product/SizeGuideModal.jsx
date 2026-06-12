import { useEffect } from 'react';
import './SizeGuideModal.css';

const TOP_GUIDES = {
  'ao-thun': {
    title: 'Bảng size áo thun và polo nam',
    description: 'Chọn size theo chiều cao, cân nặng và vòng ngực.',
    rows: [
      ['S', '160 - 165', '48 - 55', '86 - 90'],
      ['M', '165 - 170', '55 - 63', '90 - 94'],
      ['L', '170 - 175', '63 - 70', '94 - 98'],
      ['XL', '175 - 180', '70 - 78', '98 - 104'],
      ['XXL', '180 - 185', '78 - 88', '104 - 110'],
    ],
  },
  'ao-so-mi': {
    title: 'Bảng size áo sơ mi nam',
    description: 'Ưu tiên số đo vòng cổ và vòng ngực để áo vừa vặn.',
    rows: [
      ['S', '37 - 38', '86 - 90', '43'],
      ['M', '39 - 40', '90 - 96', '44'],
      ['L', '41 - 42', '96 - 102', '45'],
      ['XL', '43 - 44', '102 - 108', '46'],
      ['XXL', '45 - 46', '108 - 114', '47'],
    ],
    columns: ['Size', 'Vòng cổ (cm)', 'Vòng ngực (cm)', 'Vai (cm)'],
  },
  'ao-khoac': {
    title: 'Bảng size áo khoác nam',
    description: 'Nên chọn rộng hơn áo mặc trong khoảng 4 - 6 cm.',
    rows: [
      ['S', '88 - 94', '43', '62'],
      ['M', '94 - 100', '45', '64'],
      ['L', '100 - 106', '47', '66'],
      ['XL', '106 - 112', '49', '68'],
      ['XXL', '112 - 118', '51', '70'],
    ],
    columns: ['Size', 'Vòng ngực (cm)', 'Vai (cm)', 'Dài áo (cm)'],
  },
};

const PANTS_GUIDES = {
  'quan-jeans': {
    title: 'Bảng size quần jeans nam',
    description: 'Đo vòng eo tại vị trí thường mặc quần, không siết thước.',
    rows: [
      ['28', '71 - 73', '88 - 91', '99'],
      ['29', '74 - 76', '92 - 94', '100'],
      ['30', '77 - 79', '95 - 97', '101'],
      ['31', '80 - 82', '98 - 100', '102'],
      ['32', '83 - 85', '101 - 103', '103'],
      ['34', '86 - 89', '104 - 107', '104'],
    ],
  },
  'quan-tay': {
    title: 'Bảng size quần tây nam',
    description: 'Chọn theo vòng eo và vòng mông để phom quần đứng, thoải mái.',
    rows: [
      ['28', '70 - 73', '88 - 91', '98'],
      ['29', '74 - 76', '92 - 94', '99'],
      ['30', '77 - 79', '95 - 97', '100'],
      ['31', '80 - 82', '98 - 100', '101'],
      ['32', '83 - 85', '101 - 103', '102'],
      ['34', '86 - 89', '104 - 107', '103'],
    ],
  },
};

const DEFAULT_GUIDE = {
  title: 'Hướng dẫn chọn size trang phục nam',
  description: 'Bảng size tham khảo theo chiều cao và cân nặng.',
  columns: ['Size', 'Chiều cao (cm)', 'Cân nặng (kg)', 'Vòng ngực (cm)'],
  rows: TOP_GUIDES['ao-thun'].rows,
};

const ACCESSORY_GUIDE = {
  title: 'Hướng dẫn chọn phụ kiện nam',
  description: 'Mỗi loại phụ kiện có cách đo và lựa chọn riêng.',
  columns: ['Phụ kiện', 'Cách đo', 'Gợi ý chọn'],
  rows: [
    ['Thắt lưng', 'Đo vòng eo tại vị trí đeo', 'Dài hơn vòng eo 15 - 20 cm'],
    ['Mũ / nón', 'Đo vòng đầu trên lông mày', 'S: 54 - 56, M: 57 - 58, L: 59 - 60 cm'],
    ['Vòng tay', 'Đo sát chu vi cổ tay', 'Cộng thêm 1 - 2 cm'],
    ['Cà vạt', 'Theo chiều cao cơ thể', 'Bản 6 - 8 cm, đầu cà vạt chạm khóa thắt lưng'],
  ],
};

function getGuide(categorySlug, categoryName) {
  if (categorySlug === 'phu-kien') return ACCESSORY_GUIDE;
  if (PANTS_GUIDES[categorySlug]) {
    return {
      ...PANTS_GUIDES[categorySlug],
      columns: ['Size', 'Vòng eo (cm)', 'Vòng mông (cm)', 'Dài quần (cm)'],
    };
  }
  if (TOP_GUIDES[categorySlug]) {
    return {
      columns: DEFAULT_GUIDE.columns,
      ...TOP_GUIDES[categorySlug],
    };
  }
  if (categoryName) {
    return { ...DEFAULT_GUIDE, title: `Bảng size ${categoryName}` };
  }
  return DEFAULT_GUIDE;
}

export default function SizeGuideModal({ open, onClose, categorySlug = '', categoryName = '' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const guide = getGuide(categorySlug, categoryName);

  return (
    <div className="size-modal" onClick={onClose}>
      <div className="size-modal__box" onClick={(event) => event.stopPropagation()}>
        <button className="size-modal__close" onClick={onClose} aria-label="Đóng">×</button>
        <h3 className="size-modal__title">{guide.title}</h3>
        <p className="size-modal__sub">{guide.description}</p>

        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                {guide.columns.map(column => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {guide.rows.map((row) => (
                <tr key={row.join('-')}>
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`} className={index === 0 ? 'size-table__size' : ''}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="size-modal__note">
          * Số đo chỉ mang tính tham khảo. Nếu nằm giữa hai size, hãy chọn size lớn hơn để mặc thoải mái.
        </p>
      </div>
    </div>
  );
}
