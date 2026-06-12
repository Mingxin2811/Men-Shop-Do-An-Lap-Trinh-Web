import { useState, useEffect } from 'react';
import { postService } from '../../services/post.service';

const formatDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

const emptyForm = () => ({ title: '', excerpt: '', content: '', coverImage: '', published: true });

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postService.getAdminPosts();
      setPosts(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setError(''); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      coverImage: p.coverImage || '',
      published: Boolean(p.published),
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      if (editing) await postService.updatePost(editing.id, form);
      else await postService.createPost(form);
      await fetchPosts();
      setShowForm(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa bài viết này?')) return;
    try { await postService.deletePost(id); await fetchPosts(); }
    catch (e) { alert(e.response?.data?.message || 'Không thể xóa.'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Blog</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm bài viết</button>
      </div>

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{editing ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tiêu đề *</label>
                <input className="form-input" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả ngắn</label>
                <textarea className="form-input" rows={2} value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Ảnh bìa (URL)</label>
                <input className="form-input" placeholder="https://..." value={form.coverImage}
                  onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Nội dung *</label>
                <textarea className="form-input" rows={8} value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={form.published}
                    onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
                  Xuất bản (hiển thị trên website)
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Lưu'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>Tiêu đề</th><th>Slug</th><th>Ngày tạo</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500, maxWidth: 280 }}>{p.title}</td>
                  <td style={{ color: 'var(--mid-gray)', fontSize: '0.8rem' }}>{p.slug}</td>
                  <td style={{ color: 'var(--mid-gray)', fontSize: '0.8rem' }}>{formatDate(p.createdAt)}</td>
                  <td>
                    <span className={`badge ${p.published ? 'badge-dark' : 'badge-light'}`}>
                      {p.published ? 'Đã xuất bản' : 'Nháp'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Sửa</button>
                      <button className="btn btn-sm" style={{ border: '1px solid var(--red)', color: 'var(--red)' }}
                        onClick={() => handleDelete(p.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={5} style={{ color: 'var(--mid-gray)', textAlign: 'center', padding: 24 }}>Chưa có bài viết.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
