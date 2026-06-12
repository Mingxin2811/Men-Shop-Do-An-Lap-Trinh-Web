import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, categoryService } from '../services/product.service';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import SizeGuideModal from '../components/product/SizeGuideModal';
import './ProductListPage.css';

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];
const COLOR_OPTIONS = [
  { label: 'Đen', value: 'Đen' },
  { label: 'Trắng', value: 'Trắng' },
  { label: 'Xám', value: 'Xám' },
  { label: 'Xanh navy', value: 'Xanh navy' },
  { label: 'Nâu', value: 'Nâu' },
  { label: 'Be', value: 'Be' },
];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || '';
  const [searchInput, setSearchInput] = useState(currentSearch);
  const selectedCategory = categories.find(category => category.slug === currentCategory);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        sort: currentSort,
        ...(currentCategory && { category: currentCategory }),
        ...(currentSearch && { search: currentSearch }),
        ...(currentMinPrice && { minPrice: currentMinPrice }),
        ...(currentMaxPrice && { maxPrice: currentMaxPrice }),
        ...(currentSize && { size: currentSize }),
        ...(currentColor && { color: currentColor }),
      };
      const res = await productService.getProducts(params);
      setProducts(res.data.data.products || []);
      setTotalPages(res.data.data.totalPages || 1);
      setTotalProducts(res.data.data.totalProducts || 0);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [currentPage, currentSort, currentCategory, currentSearch, currentMinPrice, currentMaxPrice, currentSize, currentColor]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    categoryService.getCategories().then(res => setCategories(res.data.data || []));
  }, []);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const handlePageChange = (page) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', page);
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="product-list-page">
      <nav className="plp-breadcrumb container" aria-label="Breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/products">Bộ sưu tập</Link>
        {selectedCategory && (
          <>
            <span>/</span>
            <span className="plp-breadcrumb__current">{selectedCategory.name}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="plp-header container">
        <div>
          <h1 className="plp-title">Bộ sưu tập</h1>
          <p className="plp-count">{totalProducts} sản phẩm</p>
        </div>
        <div className="plp-controls">
          <button
            type="button"
            className="plp-size-guide-btn"
            onClick={() => setSizeGuideOpen(true)}
          >
            {selectedCategory
              ? currentCategory === 'phu-kien'
                ? 'Hướng dẫn chọn phụ kiện'
                : `Bảng size ${selectedCategory.name}`
              : 'Hướng dẫn chọn size'}
          </button>
          <button
            type="button"
            className="plp-mobile-filter-btn"
            onClick={() => setFilterOpen(!filterOpen)}
            aria-label="Mở bộ lọc"
            title="Mở bộ lọc"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>
          <select
            className="form-select plp-sort"
            value={currentSort}
            onChange={e => updateParam('sort', e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      <div className="plp-body container">
        {/* Sidebar filters */}
        <aside className={`plp-filters${filterOpen ? ' open' : ''}`}>
          <div className="plp-filters__header">
            <h6>Bộ lọc</h6>
            <button onClick={() => setFilterOpen(false)} className="plp-filters__close">✕</button>
          </div>

          {/* Search */}
          <div className="filter-group">
            <label className="filter-label">Tìm kiếm</label>
            <form onSubmit={handleSearch} className="filter-search">
              <input
                type="text"
                className="form-input"
                placeholder="Tên sản phẩm..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '8px', width: '100%' }}>
                Tìm
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="filter-group">
            <label className="filter-label">Danh mục</label>
            <ul className="filter-list">
              <li>
                <button
                  className={`filter-item${!currentCategory ? ' active' : ''}`}
                  onClick={() => updateParam('category', '')}
                >
                  Tất cả
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    className={`filter-item${currentCategory === cat.slug ? ' active' : ''}`}
                    onClick={() => updateParam('category', cat.slug)}
                  >
                    {cat.name}
                    {cat._count && <span>{cat._count.products}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className="filter-group">
            <label className="filter-label">Khoảng giá</label>
            <div className="filter-price">
              <input
                type="number"
                className="form-input"
                placeholder="Từ"
                value={currentMinPrice}
                onChange={e => updateParam('minPrice', e.target.value)}
              />
              <span>—</span>
              <input
                type="number"
                className="form-input"
                placeholder="Đến"
                value={currentMaxPrice}
                onChange={e => updateParam('maxPrice', e.target.value)}
              />
            </div>
          </div>

          {/* Quick prices */}
          <div className="filter-group">
            <div className="filter-price-chips">
              {[
                { label: 'Dưới 300K', max: '300000' },
                { label: '300K–500K', min: '300000', max: '500000' },
                { label: 'Trên 500K', min: '500000' },
              ].map(chip => (
                <button
                  key={chip.label}
                  className="filter-chip"
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    if (chip.min) p.set('minPrice', chip.min); else p.delete('minPrice');
                    if (chip.max) p.set('maxPrice', chip.max); else p.delete('maxPrice');
                    p.delete('page');
                    setSearchParams(p);
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Size</label>
            <div className="filter-chip-grid">
              {SIZE_OPTIONS.map(size => (
                <button
                  key={size}
                  type="button"
                  className={`filter-chip${currentSize === size ? ' active' : ''}`}
                  onClick={() => updateParam('size', currentSize === size ? '' : size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Màu sắc</label>
            <div className="filter-chip-grid">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  className={`filter-chip${currentColor === color.value ? ' active' : ''}`}
                  onClick={() => updateParam('color', currentColor === color.value ? '' : color.value)}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            className="btn btn-outline w-full"
            onClick={() => { setSearchParams({}); setSearchInput(''); }}
          >
            Xóa bộ lọc
          </button>
        </aside>

        {/* Overlay for mobile */}
        {filterOpen && (
          <div className="plp-overlay" onClick={() => setFilterOpen(false)} />
        )}

        {/* Product grid */}
        <div className="plp-products">
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="plp-empty">
              <p>Không tìm thấy sản phẩm phù hợp.</p>
              <button className="btn btn-outline mt-md" onClick={() => setSearchParams({})}>
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {currentPage > 1 && (
                <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)}>←</button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`pagination-btn${p === currentPage ? ' active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
              {currentPage < totalPages && (
                <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)}>→</button>
              )}
            </div>
          )}
        </div>
      </div>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        categorySlug={currentCategory}
        categoryName={selectedCategory?.name}
      />
    </div>
  );
}
