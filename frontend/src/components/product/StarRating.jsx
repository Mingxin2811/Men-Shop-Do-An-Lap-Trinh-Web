import { useState } from 'react';
import './StarRating.css';

function Star({ filled, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" />
    </svg>
  );
}

// value: số sao hiện tại (0-5). onChange => chế độ nhập (interactive).
export default function StarRating({ value = 0, onChange, size = 16, className = '' }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === 'function';
  const display = interactive ? (hover || value) : value;

  return (
    <span className={`star-rating${interactive ? ' star-rating--input' : ''} ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(display);
        return interactive ? (
          <button
            key={star}
            type="button"
            className={`star-rating__btn${filled ? ' filled' : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${star} sao`}
          >
            <Star filled={filled} size={size} />
          </button>
        ) : (
          <span key={star} className={`star-rating__star${filled ? ' filled' : ''}`}>
            <Star filled={filled} size={size} />
          </span>
        );
      })}
    </span>
  );
}
