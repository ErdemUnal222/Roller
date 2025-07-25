import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOneProduct } from '../../api/productService';
import '/src/styles/main.scss';
const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;
/**
 * ProductDetail Component
 * Displays detailed information about a single product.
 */
function ProductDetail() {
  const { id } = useParams(); // Retrieve the product ID from the URL
  const [product, setProduct] = useState(null); // Holds the product data
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [error, setError] = useState(''); // Stores any error messages

  /**
   * Fetch product data when the component mounts or when ID changes
   */
  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getOneProduct(id); // API call to get product by ID
        if (data && data.result) {
          setProduct(data.result); // Update state with product details
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false); // Hide loader whether success or failure
      }
    }

    fetchProduct();
  }, [id]);

  // Show loader if still loading
  if (loading) return <div className="loading">Loading product...</div>;

  // Show error message if there was an issue
  if (error) return <div className="form-error">{error}</div>;

  // Safety check (shouldn't happen if logic is correct)
  if (!product) return null;

  // Format the creation date for display (British format: dd/mm/yyyy)
  const formattedDate = new Date(product.created_at).toLocaleDateString('en-GB');

  // Construct the full image URL if one exists
 const imageUrl = product.picture
  ? `${BASE_URL}/uploads/products/${product.picture}`
  : null;


  return (
    <div className="product-detail-container">
      {/* Product title */}
      <h2 className="product-detail-title">{product.title}</h2>

      {/* Display image if available */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={product.alt || 'Product image'}
          className="product-detail-image"
        />
      )}

      {/* Product description */}
      <p className="product-detail-description">{product.description}</p>

      {/* Product price */}
      <p className="product-detail-price">
        <strong>Price:</strong> {product.price} €
      </p>

      {/* Product stock availability */}
      <p className="product-detail-stock">
        <strong>Availability:</strong>{' '}
        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
      </p>

      {/* Creation date */}
      <p className="product-detail-date">
        <strong>Added on:</strong> {formattedDate}
      </p>
    </div>
  );
}

export default ProductDetail;
