import './ProductCardSkeleton.css';

export default function ProductCardSkeleton() {
  return (
    <div className="pc-skeleton" aria-hidden="true">
      <div className="pc-skeleton__image skeleton-shimmer" />
      <div className="pc-skeleton__line skeleton-shimmer" style={{ width: '40%' }} />
      <div className="pc-skeleton__line skeleton-shimmer" style={{ width: '80%' }} />
      <div className="pc-skeleton__line skeleton-shimmer" style={{ width: '30%' }} />
    </div>
  );
}
