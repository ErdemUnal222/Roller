import { useEffect, useState } from 'react';
import { getAllProducts, deleteProduct } from '../../api/productService';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '/src/styles/main.scss';

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

function Products() {
  const user = useSelector((state) => state.user.user);
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  if (!isAdmin) {
    return (
      <div className="unauthorized">
        <h2>Unauthorized</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAllProducts();
        if (!cancelled) {
          setProducts(Array.isArray(data.result) ? data.result : []);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load products.');
        console.error('Error loading products:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSuccess('Product deleted.');
      setError('');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product.');
    }
  };

  return (
    <div className="admin-products-container">
      {/* Header with Add button */}
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Products</h1>
        <Link to="/admin/products/add" className="btn btn-primary">+ Add product</Link>
      </div>

      {/* Messages */}
      {error && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}
      {success && <div className="form-success" style={{ marginBottom: '0.75rem' }}>{success}</div>}

      {loading ? (
        <div className="admin-loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state" style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
          <p>No products yet.</p>
          <Link to="/admin/products/add" className="btn btn-primary">Create your first product</Link>
        </div>
      ) : (
        <ul className="admin-product-list">
          {products.map((product) => (
            <li key={product.id} className="admin-product-item">
              <div className="admin-product-info">
                {product.picture && (
                  <img
                    src={`${BASE_URL}/uploads/products/${product.picture}`}
                    alt={product.alt || 'Product'}
                    className="admin-product-thumbnail"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                )}

                <p className="admin-product-name">{product.title}</p>
                <p className="admin-product-price">Price: {product.price} €</p>
                <p className="admin-product-stock">Stock: {product.stock}</p>
                {product.alt && <p className="admin-product-alt">Alt: {product.alt}</p>}
              </div>

              <div className="admin-product-actions">
                <Link to={`/admin/products/edit/${product.id}`}>Edit</Link>
                <button onClick={() => handleDelete(product.id)} className="delete">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Products;
