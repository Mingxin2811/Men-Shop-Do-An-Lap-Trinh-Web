import { useState, useEffect, useRef } from 'react';
import { productService } from '../../services/product.service';
import { useRecentlyViewed } from '../../contexts/RecentlyViewedContext';
import ProductCard from './ProductCard';

export default function RecentlyViewedSection({ excludeId = null, title = 'Sản phẩm vừa xem' }) {
  const { ids } = useRecentlyViewed();
  const [cache, setCache] = useState({});
  const fetchedRef = useRef(new Set());

  useEffect(() => {
    const missing = ids.filter((id) => !fetchedRef.current.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => fetchedRef.current.add(id));

    Promise.all(
      missing.map((id) =>
        productService.getProduct(id)
          .then((res) => [id, res.data.data])
          .catch(() => [id, null])
      )
    ).then((entries) => {
      setCache((prev) => {
        const next = { ...prev };
        for (const [id, product] of entries) next[id] = product;
        return next;
      });
    });
  }, [ids]);

  const products = ids
    .filter((id) => id !== excludeId)
    .map((id) => cache[id])
    .filter(Boolean);

  if (products.length === 0) return null;

  return (
    <section className="section container">
      <div className="section__header section__header--products">
        <p className="section__label">Gần đây</p>
        <h2 className="section__title">{title}</h2>
      </div>
      <div className="product-grid">
        {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
