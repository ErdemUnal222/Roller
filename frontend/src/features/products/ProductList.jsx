import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import api from '../../api/axios';
import '/src/styles/main.scss';

/**
 * ProductList Component
 * Displays a list of all products. Admins can add new products,
 * and users can add products to their cart.
 */
const ProductList = () => {
  // State to store fetched products
  const [products, setProducts] = useState([]);
  // State to handle loading and errors
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Access the current user from Redux store
  const user = useSelector((state) => state.user.user);
  // Initialize dispatch function for Redux actions
  const dispatch = useDispatch();

  /**
   * Fetch all products from backend when component mounts
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        // Ensure data is an array before updating state
        setProducts(Array.isArray(response.data.result) ? response.data.result : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /**
   * Handle adding a product to the shopping cart
   */
  const handleAddToCart = (product) => {
    dispatch(addToCart(product)); // Add product to Redux cart state
  };

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h1 className="product-list-title">All Products</h1>

        {/* Admins see this button to add new products */}
        {user?.isAdmin && (
          <Link to="/products/add" className="btn-add-product">
            Add New Product
          </Link>
        )}
      </div>

      {/* Display error message if any */}
      {error && <p className="form-error">{error}</p>}

      {/* Show loading indicator or product grid */}
      {loading ? (
        <p className="admin-loading">Loading products...</p>
      ) : (
        <div className="product-grid">
          {/* Show message if no products found */}
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            // Loop through and display product cards
            products.map((product) => {
              const imageUrl = product.picture
                ? `/uploads/products/${product.picture}`
                : '/default-product.jpg'; // fallback if no image

              return (
                <div key={product.id} className="product-card">
                  <Link to={`/shop/${product.id}`}>
                    <img
                      src={imageUrl}
                      alt={product.alt || product.title}
                      className="product-image"
                    />
                    <h2 className="product-title">{product.title}</h2>
                    <p className="product-description">
                      {product.description?.slice(0, 60)}...
                    </p>
                    <p className="product-price">€{product.price}</p>
                  </Link>

                  {/* Add to Cart button */}
                  <button
                    className="product-detail-button"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
