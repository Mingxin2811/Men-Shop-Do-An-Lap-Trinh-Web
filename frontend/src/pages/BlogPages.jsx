import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { postService } from '../services/post.service';
import './BlogPages.css';

const formatDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200';

export function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService.getPosts()
      .then((res) => setPosts(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="blog-page container">
      <div className="blog-head">
        <p className="blog-label">BLOGS</p>
        <h1 className="blog-title">Tin tức &amp; phối đồ</h1>
        <p className="blog-sub">Cập nhật xu hướng, mẹo phối đồ và câu chuyện thời trang nam.</p>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : posts.length === 0 ? (
        <p className="blog-empty">Chưa có bài viết nào.</p>
      ) : (
        <div className="blog-grid">
          {posts.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="blog-card">
              <div className="blog-card__image">
                <img
                  src={p.coverImage || FALLBACK_COVER}
                  alt={p.title}
                  loading="lazy"
                  onError={(e) => { e.target.src = FALLBACK_COVER; }}
                />
              </div>
              <div className="blog-card__body">
                <span className="blog-card__date">{formatDate(p.createdAt)}</span>
                <h3 className="blog-card__title">{p.title}</h3>
                {p.excerpt && <p className="blog-card__excerpt">{p.excerpt}</p>}
                <span className="blog-card__more">Đọc tiếp →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    postService.getPost(slug)
      .then((res) => setPost(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  if (notFound || !post) {
    return (
      <div className="blog-page container">
        <p className="blog-empty">Không tìm thấy bài viết.</p>
        <Link to="/blog" className="btn btn-outline">← Về trang Blogs</Link>
      </div>
    );
  }

  return (
    <article className="blog-detail container">
      <div className="blog-detail__nav">
        <Link to="/blog" className="blog-detail__back">← Quay lại Blogs</Link>
      </div>
      <div className="blog-detail__head">
        <p className="blog-label">BLOGS</p>
        <span className="blog-card__date blog-detail__date">{formatDate(post.createdAt)}</span>
        <h1 className="blog-detail__title">{post.title}</h1>
      </div>
      {post.coverImage && (
        <div className="blog-detail__cover">
          <img src={post.coverImage} alt={post.title} onError={(e) => { e.target.src = FALLBACK_COVER; }} />
        </div>
      )}
      <div className="blog-detail__content">
        {post.content.split('\n').map((line, i) => (
          line.trim() ? <p key={i}>{line}</p> : <br key={i} />
        ))}
      </div>
    </article>
  );
}
