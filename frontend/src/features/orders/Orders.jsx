import { useEffect, useState } from 'react';
import { getAllOrders, createOrder } from '../../api/orderService';
import '/src/styles/main.scss';

/**
 * Orders Component
 * Allows users to view their order history and place new orders manually.
 */
function Orders() {
  // State to store the list of all retrieved orders
  const [orders, setOrders] = useState([]);

  // State to manage the form input for creating a new order
  const [newOrder, setNewOrder] = useState({ productId: '', quantity: 1 });

  /**
   * useEffect hook to load all existing orders on component mount.
   * This ensures the UI is populated with current order data.
   */
  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getAllOrders(); // Fetch all orders from backend
        // Support APIs that return either an array or an object with `result`
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.result)
          ? data.result
          : [];
        setOrders(list); // Store them in local state
      } catch (err) {
        console.error('Error fetching orders:', err); // Log any issues
      }
    }

    fetchOrders(); // Invoke on mount
  }, []);

  /**
   * Form submission handler to create a new order.
   * Sends data to the API and updates the UI immediately.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const createdOrder = await createOrder(newOrder); // Call backend API
      setOrders([...orders, createdOrder]); // Add new order to UI
      setNewOrder({ productId: '', quantity: 1 }); // Clear form fields
    } catch (err) {
      console.error('Error creating order:', err); // Handle any errors
    }
  };

  return (
    <div className="orders-container">
      <h2 className="orders-title">My Orders</h2>

      {/* Order Creation Form */}
      <form onSubmit={handleSubmit} className="orders-form">
        <input
          type="text"
          placeholder="Product ID"
          value={newOrder.productId}
          onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
          required
          aria-label="Enter product ID"
        />
        <input
          type="number"
          min="1"
          placeholder="Quantity"
          value={newOrder.quantity}
          onChange={(e) =>
            setNewOrder({ ...newOrder, quantity: parseInt(e.target.value, 10) })
          }
          required
          aria-label="Enter quantity"
        />
        <button type="submit">Place Order</button>
      </form>

      {/* Order History List */}
      <ul className="orders-list">
        {orders.map((order) => (
          <li key={order.id}>
            <strong>Product:</strong> {order.productId} — <strong>Quantity:</strong> {order.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Orders;
