// /src/features/cart/Success.jsx
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '/src/redux/cartSlice';
import '/src/styles/main.scss';

export default function Success() {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id'); // optional: ?session_id=cs_test_...

  useEffect(() => {
    // Clear the cart once when we land here
    dispatch(clearCart());

    // If you later add a backend confirm endpoint, you could call it here:
    // api.get(`/orders/confirm?session_id=${sessionId}`)
    //   .catch(() => {/* ignore; webhook will finalize anyway */});
  }, [dispatch, sessionId]);

  return (
    <main className="success-container" role="main" aria-labelledby="success-title">
      <h1 id="success-title" className="success-title">Payment successful 🎉</h1>

      <p className="success-message">
        Thank you for your purchase. Your order is being processed.
        {sessionId ? (
          <><br /><small className="success-note">Ref: {sessionId.slice(-8)}</small></>
        ) : null}
      </p>

      <div className="success-actions">
        <Link to="/shop" className="button button--primary">Back to shop</Link>
        <Link to="/orders" className="button button--ghost">View my orders</Link>
      </div>
    </main>
  );
}
