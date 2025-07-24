// /src/pages/Cart.jsx

import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  incrementItem,
  decrementItem,
  removeItem,
} from '../../redux/cartSlice'; // Redux actions for cart state
import "/src/styles/main.scss"; // Import global styles

/**
 * Cart Component
 * Displays all products added to the user's shopping cart.
 * Allows users to increment, decrement, or remove items, and proceed to checkout.
 */
const Cart = () => {
  const dispatch = useDispatch();

  // Get cart items from Redux store
  const cartItems = useSelector((state) => state.cart.items);

  // Calculate total cart price
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // If the cart is empty, display a message with a link to browse products
  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h1 className="cart-title">Your Cart</h1>
        <p>Your cart is currently empty.</p>
        <Link to="/shop" className="cart-link">
          Browse Products →
        </Link>
      </div>
    );
  }

  return (
    <main className="cart-container" role="main" aria-labelledby="cart-title">
      <h1 id="cart-title" className="cart-title">Your Cart</h1>

      {/* Section displaying all cart items */}
      <section className="cart-items">
        {cartItems.map((item) => (
          <article key={item.id} className="cart-item">
            <div className="cart-item-info">
              {/* Product image if available */}
              {item.image && (
                <img
                  src={`/uploads/${item.image}`}
                  alt={item.title || 'Product image'}
                  className="cart-item-image"
                />
              )}

              <div>
                {/* Product title and price */}
                <h2 className="cart-item-title">{item.title}</h2>
                <p className="cart-item-price">€{item.price.toFixed(2)}</p>
              </div>
            </div>

            {/* Controls to modify cart item quantity or remove it */}
            <div className="cart-controls">
              {/* Decrease quantity button */}
              <button
                className="cart-button"
                onClick={() => dispatch(decrementItem(item.id))}
                aria-label={`Decrease quantity of ${item.title}`}
              >
                −
              </button>

              {/* Display current quantity */}
              <span className="cart-qty">{item.quantity}</span>

              {/* Increase quantity button */}
              <button
                className="cart-button"
                onClick={() => dispatch(incrementItem({ id: item.id, stock: item.stock }))}
                aria-label={`Increase quantity of ${item.title}`}
              >
                +
              </button>

              {/* Remove item from cart */}
              <button
                className="cart-remove"
                onClick={() => dispatch(removeItem(item.id))}
                aria-label={`Remove ${item.title} from cart`}
              >
                ✕
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Order summary and checkout link */}
      <section className="cart-summary">
        <p className="cart-total">
          Total: <strong>€{total.toFixed(2)}</strong>
        </p>
        <Link to="/checkout" className="cart-checkout-button">
          Proceed to Checkout →
        </Link>
      </section>
    </main>
  );
};

export default Cart;
