import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';            // Step 1: Import useDispatch
import { getShopProducts } from '../../api/productService';
import { Link } from 'react-router-dom';
import { addToCart } from '../../redux/cartSlice';     // Step 2: Import addToCart action
import '/src/styles/main.scss';

/**
 * Shop — Public Product Catalog
 * Displays a list of available products for purchase on the public-facing shop page.
 * Allows users to add products directly to their cart.
 */
function Shop() {
  // State to store products fetched from the backend
  const [products, setProducts] = useState([]);

  // State for error message display
  const [error, setError] = useState('');

  // Loading state to indicate whether data is being fetched
  const [loading, setLoading] = useState(true);

  // Redux dispatch function
  const dispatch = useDispatch();

  /**
   * Fetch product data from the API when the component mounts.
   */
  useEffect(() => {
    async function fetchProducts() {
      try {
        // API call to fetch products visible in the public shop
        const data = await getShopProducts();

        // Only set valid results
        setProducts(Array.isArray(data.result) ? data.result : []);
      } catch (err) {
        console.error('Error fetching shop products:', err);
        setError('Unable to load products. Please try again later.');
      } finally {
        setLoading(false); // Stop loading indicator
      }
    }

    fetchProducts();
  }, []);

  /**
   * Handles adding a product to the cart.
   * Dispatches the addToCart action with the product as payload.
   */
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  return (
    <main className="shop-container">
      <h1 className="shop-title">Shop</h1>

      {/* Loading state */}
      {loading && <p>Loading products...</p>}

      {/* Error message */}
      {error && <p className="form-error">{error}</p>}

      {/* Grid of product cards */}
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="shop-product-card">
            {/* Display product image if available */}
            {product.picture && (
              <img
                src={`/uploads/products/${product.picture}`}
                alt={product.alt || product.title}
                className="shop-product-img"
              />
            )}

            {/* Product title and price */}
            <h2 className="shop-product-title">{product.title}</h2>
            <p className="shop-product-price">€{product.price}</p>

            {/* Link to product detail page */}
            <Link to={`/shop/${product.id}`} className="shop-product-link">
              View Details
            </Link>

            {/* Add to Cart button */}
            <button
              type="button"
              onClick={() => handleAddToCart(product)}
              className="shop-add-to-cart-button"
              aria-label={`Add ${product.title} to cart`}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Shop;
