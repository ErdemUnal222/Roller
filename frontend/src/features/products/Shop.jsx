import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getShopProducts } from '../../api/productService';
import { Link } from 'react-router-dom';
import { addToCart } from '../../redux/cartSlice';
import '/src/styles/main.scss';

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || '';

function formatPrice(value) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getShopProducts();
        const list = Array.isArray(data?.result) ? data.result : [];
        if (!cancel) setProducts(list);
      } catch (err) {
        console.error('Error fetching shop products:', err);
        if (!cancel) setError('Unable to load products. Please try again later.');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const placeholders = useMemo(() => Array.from({ length: 8 }), []);

  const handleAddToCart = (product) => {
    if (!product?.stock) return;
    dispatch(addToCart(product));
  };

  return (
    <main className="shop-container">
      <h1 className="shop-title">Shop</h1>

      {error && (
        <div className="shop-banner error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="product-grid" aria-live="polite" aria-busy="true">
          {placeholders.map((_, i) => (
            <div className="shop-product-card skeleton" key={`ph-${i}`}>
              <div className="img"></div>
              <div className="line w-70"></div>
              <div className="line w-40"></div>
              <div className="btns">
                <span className="btn shimmer"></span>
                <span className="btn shimmer"></span>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="shop-empty">
          <p>No products available yet.</p>
          <Link to="/" className="button button--ghost">Back to home</Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => {
            const imgSrc = p.picture
              ? (BASE_URL ? `${BASE_URL}/uploads/products/${p.picture}` : `/uploads/products/${p.picture}`)
              : null;
            const isOut = Number(p.stock ?? 0) <= 0;
            const isLow = !isOut && Number(p.stock) <= 5;

            return (
              <article key={p.id} className="shop-product-card" tabIndex={0}>
                <div className="media">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={p.alt || p.title}
                      className="shop-product-img"
                      onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                    />
                  ) : (
                    <div className="img-fallback" aria-hidden="true" />
                  )}

                  {(isOut || isLow) && (
                    <span className={`badge ${isOut ? 'danger' : 'warn'}`}>
                      {isOut ? 'Out of stock' : 'Low stock'}
                    </span>
                  )}
                </div>

                <div className="info">
                  <h2 className="shop-product-title" title={p.title}>{p.title}</h2>
                  <p className="shop-product-price">{formatPrice(p.price)}</p>
                </div>

                <div className="actions">
                  <Link to={`/shop/${p.id}`} className="button button--ghost" aria-label={`View ${p.title}`}>
                    View details
                  </Link>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => handleAddToCart(p)}
                    disabled={isOut}
                    aria-disabled={isOut ? 'true' : 'false'}
                    aria-label={`Add ${p.title} to cart`}
                  >
                    Add to cart
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
