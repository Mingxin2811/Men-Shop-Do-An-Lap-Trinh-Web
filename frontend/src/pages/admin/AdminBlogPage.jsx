import { useEffect, useState } from 'react';
import { postService } from '../../services/post.service';

const formatDate = (date) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));

const emptyForm = () => ({
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  published: true,
});

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchPosts = async (status = statusFilter, date = dateFilter) => {
    setLoading(true);
    try {
      const response = await postService.getAdminPosts({
        status: status || undefined,
        createdDate: date || undefined,
      });
      setPosts(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(statusFilter, dateFilter);
  }, [statusFilter, dateFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setError('');
    setShowForm(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      coverImage: post.coverImage || '',
      published: Boolean(post.published),
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await postService.updatePost(editing.id, form);
        setNotice('Cập nhật bài viết thành công.');
      } else {
        await postService.createPost(form);
        setNotice('Thêm bài viết thành công.');
      }
      await fetchPosts();
      setShowForm(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu bài viết.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await postService.deletePost(deleteTarget.id);
      await fetchPosts();
      setDeleteTarget(null);
      setNotice('Xóa bài viết thành công.');
    } catch (requestError) {
      setDeleteError(requestError.response?.data?.message || 'Không thể xóa bài viết.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header admin-page-header--blog">
        <h1>Blogs</h1>
        <div className="admin-blog-header-actions">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
          <input
            type="date"
            className="form-input"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            aria-label="Lọc theo ngày tạo"
          />
          {(statusFilter || dateFilter) && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setStatusFilter('');
                setDateFilter('');
              }}
            >
              Xóa lọc
            </button>
          )}
          <button className="btn btn-primary" onClick={openCreate}>+ Thêm bài viết</button>
        </div>
      </div>

      {notice && (
        <div className="alert alert-success admin-page-notice">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Đóng">×</button>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => !saving && setShowForm(false)}>
          <div className="admin-modal admin-blog-form-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{editing ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
              <button type="button" onClick={() => setShowForm(false)} disabled={saving}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tiêu đề *</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả ngắn</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={form.excerpt}
                  onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ảnh bìa (URL)</label>
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={form.coverImage}
                  onChange={(event) => setForm((current) => ({ ...current, coverImage: event.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nội dung *</label>
                <textarea
                  className="form-input"
                  rows={9}
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  required
                />
              </div>
              <div className="form-group admin-blog-published">
                <label>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      published: event.target.checked,
                    }))}
                  />
                  <span>Xuất bản (hiển thị trên website)</span>
                </label>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Lưu bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="admin-modal admin-confirm-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>Xóa bài viết</h3>
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting}>×</button>
            </div>
            <p className="admin-confirm-modal__message">
              Bạn có chắc muốn xóa bài viết “{deleteTarget.title}”? Thao tác này không thể hoàn tác.
            </p>
            {deleteError && <div className="alert alert-error">{deleteError}</div>}
            <div className="admin-confirm-modal__actions">
              <button className="btn btn-outline btn-sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Hủy
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="spinner" /> : 'Xóa bài viết'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="admin-table-card">
          <table className="table">
            <thead>
              <tr><th>Tiêu đề</th><th>Ngày tạo</th><th>Trạng thái</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="admin-blog-title">{post.title}</td>
                  <td className="admin-cell-muted">{formatDate(post.createdAt)}</td>
                  <td>
                    <span className={`admin-blog-status ${post.published ? 'published' : 'draft'}`}>
                      <span />
                      {post.published ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(post)}>Sửa</button>
                      <button className="btn btn-danger-outline btn-sm" onClick={() => setDeleteTarget(post)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && <div className="admin-empty-state">Không có bài viết phù hợp.</div>}
        </div>
      )}
    </div>
  );
}
