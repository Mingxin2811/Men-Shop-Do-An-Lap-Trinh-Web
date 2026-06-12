import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/product/ProductCard';
import './WishlistPage.css';

export default function WishlistPage() {
  const { ids, count, clear } = useWishlist();
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(new Set());

  // Tải chi tiết cho những sản phẩm yêu thích chưa có trong cache.
  // Sản phẩm đã bị xoá/ẩn sẽ trả lỗi và được đánh dấu null để bỏ qua.
  useEffect(() => {
    const missing = ids.filter((id) => !fetchedRef.current.has(id));
    if (missing.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    missing.forEach((id) => fetchedRef.current.add(id));

    Promise.all(
      missing.map((id) =>
        productService
          .getProduct(id)
          .then((res) => [id, res.data.data])
          .catch(() => [id, null])
      )
    )
      .then((entries) => {
        setCache((prev) => {
          const next = { ...prev };
          for (const [id, product] of entries) next[id] = product;
          return next;
        });
      })
      .finally(() => setLoading(false));
  }, [ids]);

  // Giữ đúng thứ tự đã lưu, loại bỏ sản phẩm không còn tồn tại.
  const products = ids.map((id) => cache[id]).filter(Boolean);
  const stillLoading = loading && products.length === 0;

  return (
    <div className="wishlist-page container">
      <div className="wishlist-head">
        <div>
          <p className="section__label">Danh sách yêu thích</p>
          <h1 className="wishlist-title">Sản phẩm bạn đã lưu</h1>
          <p className="wishlist-count">{count} sản phẩm</p>
        </div>
        {count > 0 && (
          <button className="btn btn-outline btn-sm" onClick={clear}>
            Xoá tất cả
          </button>
        )}
      </div>

      {stillLoading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : count === 0 ? (
        <div className="wishlist-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          <h3>Chưa có sản phẩm yêu thích</h3>
          <p>Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại những món đồ bạn thích.</p>
          <Link to="/products" className="btn btn-primary mt-md">Khám phá bộ sưu tập</Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
