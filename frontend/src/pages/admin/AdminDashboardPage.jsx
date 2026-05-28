import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/order.service';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

const formatDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

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
                <td style={{ fontSize: '0.875rem' }}>{order.user?.name}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--mid-gray)' }}>{formatDate(order.createdAt)}</td>
                <td style={{ fontSize: '0.875rem', fontWeight: 500 }}>{formatPrice(order.totalAmount)}</td>
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
