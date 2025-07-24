import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '/src/redux/cartSlice';
import api from '/src/api/axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '/src/styles/main.scss';

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get cart items and user from Redux store
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.user.user);

  // Calculate total price and total quantity from cart items
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalProducts = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Controlled form state for credit card and billing info
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [billingName, setBillingName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  // For displaying validation errors and API errors
  const [error, setError] = useState('');

  // For disabling submit button during "payment processing"
  const [isProcessing, setIsProcessing] = useState(false);

  // Basic client-side validation for form inputs
  const validateForm = () => {
    if (
      cardNumber.trim().length !== 16 ||
      !/^\d+$/.test(cardNumber) ||
      expiryDate.trim().length !== 5 || // format MM/YY
      !/^\d{2}\/\d{2}$/.test(expiryDate) ||
      cvc.trim().length < 3 ||
      !/^\d{3,4}$/.test(cvc) ||
      billingName.trim() === '' ||
      billingAddress.trim() === ''
    ) {
      setError('Please fill out all fields with valid information.');
      return false;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return false;
    }
    setError('');
    return true;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);
    setError('');

    try {
      // Build order payload matching backend expected schema
      const orderPayload = {
        userId: user?.id,
        totalAmount: totalPrice,
        items: cartItems.map(({ id, title, price, quantity }) => ({
          productId: id,    // Note this key must be productId for backend
          name: title,
          price,
          quantity,
        })),
      };

      // POST order to backend checkout route
      const response = await api.post('/orders/checkout', orderPayload);

      if (response.status === 201 && response.data.url) {
        // Redirect user to Stripe checkout page
        window.location.href = response.data.url;
      } else {
        setError('Failed to start payment process.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Order submission failed:', err);
      setError('Failed to process order. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <main className="checkout-container" role="main" aria-labelledby="checkout-title">
      <h1 id="checkout-title" className="checkout-title">Checkout</h1>

      <form onSubmit={handleSubmit} className="checkout-form" noValidate>
        <label htmlFor="cardNumber">Card Number</label>
        <input
          id="cardNumber"
          name="cardNumber"
          type="text"
          inputMode="numeric"
          maxLength={16}
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="1234123412341234"
          required
          aria-required="true"
          aria-describedby="cardNumberHelp"
        />
        <small id="cardNumberHelp">Enter 16 digit card number</small>

        <label htmlFor="expiryDate">Expiry Date (MM/YY)</label>
        <input
          id="expiryDate"
          name="expiryDate"
          type="text"
          maxLength={5}
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          placeholder="MM/YY"
          required
          aria-required="true"
          aria-describedby="expiryDateHelp"
        />
        <small id="expiryDateHelp">Format: MM/YY</small>

        <label htmlFor="cvc">CVC</label>
        <input
          id="cvc"
          name="cvc"
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={cvc}
          onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
          placeholder="123"
          required
          aria-required="true"
          aria-describedby="cvcHelp"
        />
        <small id="cvcHelp">3 or 4 digit security code</small>

        <label htmlFor="billingName">Name on Card</label>
        <input
          id="billingName"
          name="billingName"
          type="text"
          value={billingName}
          onChange={(e) => setBillingName(e.target.value)}
          placeholder="John Doe"
          required
          aria-required="true"
        />

        <label htmlFor="billingAddress">Billing Address</label>
        <textarea
          id="billingAddress"
          name="billingAddress"
          value={billingAddress}
          onChange={(e) => setBillingAddress(e.target.value)}
          placeholder="123 Main St, City, Country"
          required
          aria-required="true"
          rows={3}
        ></textarea>

        {error && (
          <p className="form-error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="checkout-button"
          disabled={isProcessing}
          aria-disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </main>
  );
}

export default Checkout;
