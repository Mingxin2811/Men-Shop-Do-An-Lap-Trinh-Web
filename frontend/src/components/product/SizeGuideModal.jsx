import { useEffect } from 'react';
import './SizeGuideModal.css';

// Bảng size tham khảo cho trang phục nam (đơn vị cm / kg).
const SIZE_ROWS = [
  { size: 'S', height: '160 - 165', weight: '48 - 55', chest: '86 - 90' },
  { size: 'M', height: '165 - 170', weight: '55 - 63', chest: '90 - 94' },
  { size: 'L', height: '170 - 175', weight: '63 - 70', chest: '94 - 98' },
  { size: 'XL', height: '175 - 180', weight: '70 - 78', chest: '98 - 104' },
  { size: 'XXL', height: '180 - 185', weight: '78 - 88', chest: '104 - 110' },
];

export default function SizeGuideModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="size-modal" onClick={onClose}>
      <div className="size-modal__box" onClick={(e) => e.stopPropagation()}>
        <button className="size-modal__close" onClick={onClose} aria-label="Đóng">✕</button>
        <h3 className="size-modal__title">Hướng dẫn chọn size</h3>
        <p className="size-modal__sub">Bảng size tham khảo theo chiều cao và cân nặng.</p>

        <table className="size-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Chiều cao (cm)</th>
              <th>Cân nặng (kg)</th>
              <th>Vòng ngực (cm)</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_ROWS.map((row) => (
              <tr key={row.size}>
                <td className="size-table__size">{row.size}</td>
                <td>{row.height}</td>
                <td>{row.weight}</td>
                <td>{row.chest}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="size-modal__note">
          * Bảng size chỉ mang tính tham khảo. Nếu bạn ở giữa hai size, nên chọn size lớn hơn để thoải mái hơn.
        </p>
      </div>
    </div>
  );
}
