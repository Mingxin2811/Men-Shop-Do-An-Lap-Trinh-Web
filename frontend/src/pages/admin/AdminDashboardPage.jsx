import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/order.service';
import './AdminDashboardPage.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const formatDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

const formatDayShort = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(d));

const formatCompact = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n || 0);
};

const STATUS_COLORS = {
  PENDING: '#d97706', CONFIRMED: '#2563eb', SHIPPING: '#7c3aed',
  COMPLETED: '#16a34a', CANCELLED: '#dc2626'
};
const STATUS_LABELS = {
  PENDING: 'Chờ xử lý', CONFIRMED: 'Xác nhận', SHIPPING: 'Giao hàng',
  COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy'
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then(res => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  const revenueByDay = stats?.revenueByDay || [];
  const maxRevenue = Math.max(1, ...revenueByDay.map(d => d.revenue));
  const ordersByStatus = stats?.ordersByStatus || [];
  const maxStatus = Math.max(1, ...ordersByStatus.map(s => s.count));
  const topProducts = stats?.topProducts || [];

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="admin-stats">
        {[
          { label: 'Sản phẩm', value: stats?.totalProducts || 0 },
          { label: 'Đơn hàng', value: stats?.totalOrders || 0 },
          { label: 'Khách hàng', value: stats?.totalUsers || 0 },
          { label: 'Doanh thu', value: formatPrice(stats?.totalRevenue), isRevenue: true },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-card__label">{s.label}</p>
            <p className="stat-card__value" style={{ fontSize: s.isRevenue ? '1.5rem' : undefined }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="dash-charts">
        {/* Doanh thu 7 ngày */}
        <div className="dash-card">
          <p className="dash-card__title">Doanh thu 7 ngày gần nhất</p>
          <div className="dash-bars">
            {revenueByDay.map(d => (
              <div key={d.date} className="dash-bar-col">
                <span className="dash-bar-col__value">{d.revenue > 0 ? formatCompact(d.revenue) : ''}</span>
                <div
                  className="dash-bar"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  title={formatPrice(d.revenue)}
                />
                <span className="dash-bar-col__label">{formatDayShort(d.date)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Đơn theo trạng thái */}
        <div className="dash-card">
          <p className="dash-card__title">Đơn hàng theo trạng thái</p>
          {ordersByStatus.length === 0 ? (
            <p style={{ color: 'var(--mid-gray)', fontSize: '0.8rem' }}>Chưa có đơn hàng.</p>
          ) : (
            ordersByStatus.map(s => (
              <div key={s.status} className="dash-status-row">
                <span className="dash-status-row__label">{STATUS_LABELS[s.status] || s.status}</span>
                <span className="dash-status-row__track">
                  <span
                    className="dash-status-row__fill"
                    style={{ width: `${(s.count / maxStatus) * 100}%`, background: STATUS_COLORS[s.status] || '#999' }}
                  />
                </span>
                <span className="dash-status-row__count">{s.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top sản phẩm bán chạy */}
      {topProducts.length > 0 && (
        <div className="dash-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <p className="dash-card__title">Top sản phẩm bán chạy</p>
          {topProducts.map((p, i) => (
            <div key={p.name} className="dash-top-item">
              <span className="dash-top-item__rank">{i + 1}</span>
              <span className="dash-top-item__name">{p.name}</span>
              <span className="dash-top-item__qty">{p.quantity} đã bán</span>
            </div>
          ))}
        </div>
      )}

      {/* Latest orders */}
      <div style={{ background: 'white', border: '1px solid var(--border)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.7rem', letterSpacing: '0.12em' }}>Đơn hàng mới nhất</h4>
          <Link to="/admin/orders" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Xem tất cả →
          </Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {stats?.latestOrders?.map(order => (
              <tr key={order.id}>
                <td>
                  <Link to={`/admin/orders`} style={{ fontWeight: 500, fontSize: '0.8rem' }}>
                    #{order.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td style={{ fontSize: '16px' }}>{order.user?.name}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--mid-gray)' }}>{formatDate(order.createdAt)}</td>
                <td style={{ fontSize: '16px', fontWeight: 600 }}>{formatPrice(order.totalAmount)}</td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    color: STATUS_COLORS[order.status],
                    border: `1px solid ${STATUS_COLORS[order.status]}`,
                  }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
