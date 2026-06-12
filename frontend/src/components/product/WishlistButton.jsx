import { useWishlist } from '../../contexts/WishlistContext';
import './WishlistButton.css';

export default function WishlistButton({ productId, className = '', size = 20 }) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
  };

  return (
    <button
      type="button"
      className={`wishlist-btn${active ? ' active' : ''} ${className}`}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'Bỏ khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
      title={active ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
