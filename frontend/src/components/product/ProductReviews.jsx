import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../../services/review.service';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import StarRating from './StarRating';
import './ProductReviews.css';

const formatDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

export default function ProductReviews({ productId, onStatsChange }) {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({ reviews: [], averageRating: 0, totalReviews: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState({
    canReview: false,
    hasPurchased: false,
    hasCompletedPurchase: false,
    hasReview: false
  });
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  const load = useCallback(() => {
    reviewService.getReviews(productId)
      .then((res) => {
        setData(res.data.data);
        onStatsChange?.(res.data.data.averageRating, res.data.data.totalReviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, onStatsChange]);

  useEffect(() => { load(); }, [load]);

  const loadEligibility = useCallback((showLoading = false) => {
    if (!user) {
      setEligibility({ canReview: false, hasPurchased: false, hasCompletedPurchase: false, hasReview: false });
      return Promise.resolve();
    }
    if (showLoading) setEligibilityLoading(true);
    return reviewService.getEligibility(productId)
      .then((res) => setEligibility(res.data.data))
      .catch(() => setEligibility({ canReview: false, hasPurchased: false, hasCompletedPurchase: false, hasReview: false }))
      .finally(() => {
        if (showLoading) setEligibilityLoading(false);
      });
  }, [productId, user]);

  useEffect(() => {
    loadEligibility(true);
  }, [loadEligibility]);

  useEffect(() => {
    if (!user) return undefined;
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') loadEligibility(false);
    };
    const intervalId = window.setInterval(refreshIfVisible, 8000);
    document.addEventListener('visibilitychange', refreshIfVisible);
    window.addEventListener('focus', refreshIfVisible);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.removeEventListener('focus', refreshIfVisible);
    };
  }, [loadEligibility, user]);

  // Điền sẵn form nếu người dùng đã đánh giá sản phẩm này.
  useEffect(() => {
    const mine = user ? data.reviews.find((r) => r.user?.id === user.id) : null;
    setRating(mine ? mine.rating : 0);
    setComment(mine ? (mine.comment || '') : '');
  }, [data, user]);

  const myReview = user ? data.reviews.find((r) => r.user?.id === user.id) : null;

  const submit = async (e) => {
    e.preventDefault();
    if (rating < 1) { toast.error('Vui lòng chọn số sao'); return; }
    try {
      setSubmitting(true);
      await reviewService.submitReview(productId, { rating, comment: comment.trim() });
      toast.success(myReview ? 'Đã cập nhật đánh giá' : 'Cảm ơn bạn đã đánh giá!');
      load();
      loadEligibility(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally { setSubmitting(false); }
  };

  const remove = async () => {
    if (!window.confirm('Xóa đánh giá của bạn?')) return;
    try {
      await reviewService.deleteReview(productId);
      toast.success('Đã xóa đánh giá');
      load();
      loadEligibility(false);
    } catch {
      toast.error('Không thể xóa đánh giá');
    }
  };

  const { reviews, averageRating, totalReviews, distribution } = data;

  return (
    <section className="reviews container">
      <h2 className="reviews__title">Đánh giá sản phẩm</h2>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="reviews__body">
          {/* Tóm tắt */}
          <div className="reviews__summary">
            <div className="reviews__avg">
              <span className="reviews__avg-num">{averageRating.toFixed(1)}</span>
              <StarRating value={averageRating} size={18} />
              <span className="reviews__avg-count">{totalReviews} đánh giá</span>
            </div>
            <div className="reviews__bars">
              {[5, 4, 3, 2, 1].map((star) => {
                const c = distribution?.[star] || 0;
                const pct = totalReviews ? (c / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="reviews__bar-row">
                    <span className="reviews__bar-label">{star}★</span>
                    <span className="reviews__bar"><span style={{ width: `${pct}%` }} /></span>
                    <span className="reviews__bar-count">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form viết đánh giá */}
          {user && eligibility.canReview ? (
            <form className="reviews__form" onSubmit={submit}>
              <h4>{myReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá'}</h4>
              <div className="reviews__form-stars">
                <span>Chọn số sao:</span>
                <StarRating value={rating} onChange={setRating} size={26} />
              </div>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
              />
              <div className="reviews__form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner" /> : myReview ? 'Cập nhật' : 'Gửi đánh giá'}
                </button>
                {myReview && (
                  <button type="button" className="btn btn-ghost" onClick={remove}>Xóa đánh giá</button>
                )}
              </div>
            </form>
          ) : !user ? (
            <p className="reviews__login-hint">
              <Link to="/login">Đăng nhập</Link> để viết đánh giá cho sản phẩm này.
            </p>
          ) : (
            <div className="reviews__locked">
              <strong>{eligibilityLoading ? 'Đang kiểm tra quyền đánh giá...' : 'Chưa thể đánh giá sản phẩm'}</strong>
              {!eligibilityLoading && (
                <p>Bạn có thể đánh giá sau khi sản phẩm này có trong đơn hàng chưa bị hủy của bạn.</p>
              )}
              <Link to="/orders">Xem đơn hàng của tôi →</Link>
            </div>
          )}

          {/* Danh sách đánh giá */}
          <div className="reviews__list">
            {reviews.length === 0 ? (
              <p className="reviews__empty">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="review-item">
                  <div className="review-item__avatar">{r.user?.name?.[0]?.toUpperCase() || '?'}</div>
                  <div className="review-item__body">
                    <div className="review-item__head">
                      <span className="review-item__name">{r.user?.name || 'Ẩn danh'}</span>
                      <span className="review-item__date">{formatDate(r.createdAt)}</span>
                    </div>
                    <StarRating value={r.rating} size={14} />
                    {r.comment && <p className="review-item__comment">{r.comment}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
