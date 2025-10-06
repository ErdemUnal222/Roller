// /src/features/orders/Orders.jsx (admin-capable)
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import '/src/styles/main.scss';

const ENDPOINTS = {
  // If your backend exposes admin routes like these, keep them:
  adminList: '/orders',              // e.g., GET /orders (but protected by admin middleware)
  adminOne: (id) => `/orders/${id}`, // GET one
  adminUpdateStatus: (id) => `/orders/${id}/status`, // PUT { status }
  adminDelete: (id) => `/orders/${id}`, // DELETE

  // If instead you have a true admin namespace, switch to:
  // adminList: '/admin/orders',
  // adminOne: (id) => `/admin/orders/${id}`,
  // adminUpdateStatus: (id) => `/admin/orders/${id}/status`,
  // adminDelete: (id) => `/admin/orders/${id}`,
};

// Must match your DB ENUM: ('Paid','Processing','Sent','Delivered')
const STATUS_VALUES = ['Processing', 'Paid', 'Sent', 'Delivered'];

export default function Orders() {
  const location = useLocation();
  const isAdminMode = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null); // selected order (details panel)

  // Load list
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');

        if (isAdminMode) {
          const { data } = await api.get(ENDPOINTS.adminList, { withCredentials: true });
          const list = Array.isArray(data?.result) ? data.result : (data?.orders || data || []);
          if (!cancel) setOrders(list);
        } else {
          const { data } = await api.get('/orders', { withCredentials: true });
          const list = Array.isArray(data?.result) ? data.result : (data?.orders || data || []);
          if (!cancel) setOrders(list);
        }
      } catch (e) {
        if (!cancel) setError(e?.response?.data?.message || 'Failed to load orders.');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [isAdminMode]);

  const openOrder = async (id) => {
    try {
      setBusyId(id);
      setError('');
      const url = isAdminMode ? ENDPOINTS.adminOne(id) : `/orders/${id}`;
      const { data } = await api.get(url, { withCredentials: true });
      const order = data?.result || data?.order || data;
      setSelected(order);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load order details.');
    } finally {
      setBusyId(null);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setBusyId(id);
      setError('');
      const url = isAdminMode ? ENDPOINTS.adminUpdateStatus(id) : `/orders/${id}/status`;
      const { data } = await api.put(url, { status }, { withCredentials: true });
      setSuccess(data?.message || 'Status updated.');

      setOrders((prev) => prev.map(o => (o.id === id ? { ...o, status } : o)));
      setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update status.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteOrder = async (id) => {
    const confirm = window.confirm('Delete this order? This cannot be undone.');
    if (!confirm) return;
    try {
      setBusyId(id);
      setError('');
      const url = isAdminMode ? ENDPOINTS.adminDelete(id) : `/orders/${id}`;
      await api.delete(url, { withCredentials: true });
      setSuccess('Order deleted.');
      setOrders((prev) => prev.filter(o => o.id !== id));
      setSelected((prev) => (prev?.id === id ? null : prev));
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete order.');
    } finally {
      setBusyId(null);
    }
  };

  const fallbackStatus = (s) => STATUS_VALUES.includes(s) ? s : 'Processing';

  return (
    <div className="orders-page">
      <div className="admin-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <h1 style={{ margin: 0 }}>{isAdminMode ? 'All Orders' : 'My Orders'}</h1>
        {isAdminMode && <Link to="/admin/products" className="btn">Back to Products</Link>}
      </div>

      {error && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}
      {success && <div className="form-success" style={{ marginBottom: '0.75rem' }}>{success}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">No orders found.</div>
      ) : (
        <div className="table-wrap" style={{ overflowX:'auto' }}>
          <table className="table" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Buyer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Placed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.user_name || o.user?.name || `${o.firstName ?? ''} ${o.lastName ?? ''}`.trim() || '—'}</td>
                  <td>
                    {isAdminMode ? (
                      <select
                        value={fallbackStatus(o.status)}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        disabled={busyId === o.id}
                      >
                        {STATUS_VALUES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      fallbackStatus(o.status)
                    )}
                  </td>
                  <td>{Number(o.total ?? o.total_price ?? o.amount).toFixed(2)} €</td>
                  <td>{o.created_at ? new Date(o.created_at).toLocaleString() : '—'}</td>
                  <td style={{ whiteSpace:'nowrap' }}>
                    <button className="btn" onClick={() => openOrder(o.id)} disabled={busyId === o.id}>Details</button>
                    {isAdminMode && (
                      <button className="btn delete" onClick={() => deleteOrder(o.id)} disabled={busyId === o.id} style={{ marginLeft: 8 }}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details drawer/panel */}
      {selected && (
        <div className="order-details" style={{ marginTop:'1rem', padding:'1rem', border:'1px solid #eee', borderRadius: 8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ margin: 0 }}>Order #{selected.id}</h2>
            <button className="btn" onClick={() => setSelected(null)}>Close</button>
          </div>

          <div style={{ marginTop: '.75rem' }}>
            <p><strong>Status:</strong> {fallbackStatus(selected.status)}</p>
            {selected.user && (
              <p><strong>Buyer:</strong> {selected.user.name || `${selected.user.firstName ?? ''} ${selected.user.lastName ?? ''}`.trim()}</p>
            )}
            {(selected.shipping_address || selected.address) && (
              <p><strong>Shipping:</strong> {selected.shipping_address || selected.address}</p>
            )}
            {(selected.email || selected.user?.email) && (
              <p><strong>Email:</strong> {selected.email || selected.user?.email}</p>
            )}
            {(selected.phone || selected.user?.phone) && (
              <p><strong>Phone:</strong> {selected.phone || selected.user?.phone}</p>
            )}

            {/* Items */}
            {Array.isArray(selected.items || selected.order_items) && (
              <div style={{ marginTop:'1rem' }}>
                <h3 style={{ margin: 0 }}>Items</h3>
                <table className="table" style={{ width:'100%', marginTop:'.5rem' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items || selected.order_items).map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.title || it.product_title || it.product?.title || `#${it.product_id}`}</td>
                        <td>{it.quantity ?? it.qty ?? 1}</td>
                        <td>{Number(it.price ?? it.unit_price).toFixed(2)} €</td>
                        <td>{Number((it.quantity ?? it.qty ?? 1) * (it.price ?? it.unit_price)).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div style={{ marginTop:'1rem' }}>
              <p><strong>Subtotal:</strong> {Number(selected.subtotal ?? selected.total_before_tax ?? selected.total).toFixed(2)} €</p>
              {selected.tax != null && <p><strong>Tax:</strong> {Number(selected.tax).toFixed(2)} €</p>}
              {selected.shipping_cost != null && <p><strong>Shipping:</strong> {Number(selected.shipping_cost).toFixed(2)} €</p>}
              <p><strong>Total:</strong> {Number(selected.total ?? selected.total_price ?? selected.amount).toFixed(2)} €</p>
            </div>

            {/* Admin status controls inside details too */}
            {isAdminMode && (
              <div style={{ marginTop:'1rem' }}>
                <label>
                  Update status:{' '}
                  <select
                    value={fallbackStatus(selected.status)}
                    onChange={(e) => updateStatus(selected.id, e.target.value)}
                    disabled={busyId === selected.id}
                  >
                    {STATUS_VALUES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
