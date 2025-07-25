import { useEffect, useState } from 'react';
import { getAllProducts, createProduct, deleteProduct } from '../../api/productService';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '/src/styles/main.scss';
const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;
/**
 * Products (Admin View)
 * This component allows administrators to view, manage, and delete products.
 */
function Products() {
  // Get the logged-in user from Redux
  const user = useSelector((state) => state.user.user);

  // State to store the list of all products
  const [products, setProducts] = useState([]);

  // State for managing the new product form (currently unused)
  const [newProduct, setNewProduct] = useState({ title: '', description: '', price: '' });

  // State for handling loading, success, and error messages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * If the user is not an admin, deny access.
   */
  if (user?.role?.toLowerCase() !== 'admin') {
    return (
      <div className="unauthorized">
        <h2>Unauthorized</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  /**
   * Fetch all products from the backend when the component mounts.
   */
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllProducts();
        // Ensure data is a valid array before updating state
        setProducts(Array.isArray(data.result) ? data.result : []);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  /**
   * Handle input changes for the product creation form (currently unused).
   */
  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission to create a new product (not used in UI).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await createProduct(newProduct);
      setProducts([...products, created]); // Add new product to list
      setNewProduct({ title: '', description: '', price: '' }); // Reset form
      setSuccess('Product created successfully.');
      setError('');
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product.');
    }
  };

  /**
   * Handle deletion of a product after confirmation.
   */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      await deleteProduct(id); // Call API to delete
      setProducts(products.filter((p) => p.id !== id)); // Remove from local state
      setSuccess('Product deleted.');
      setError('');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product.');
    }
  };

  return (
    <div className="admin-products-container">
      {loading ? (
        // Show loading indicator while fetching data
        <div className="admin-loading">Loading products...</div>
      ) : (
        <ul className="admin-product-list">
          {/* Display each product in a list */}
          {products.map((product) => (
            <li key={product.id} className="admin-product-item">
              <div className="admin-product-info">
                {/* Product image preview */}
                {product.picture && (
                 <img
                  src={`${BASE_URL}/uploads/products/${product.picture}`}
                  alt={product.alt || 'Product'}
                  className="admin-product-thumbnail"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
                
                )}

                {/* Product details */}
                <p className="admin-product-name">{product.title}</p>
                <p className="admin-product-price">Price: {product.price} €</p>
                <p className="admin-product-stock">Stock: {product.stock}</p>
                {product.alt && <p className="admin-product-alt">Alt: {product.alt}</p>}
              </div>

              <div className="admin-product-actions">
                {/* Edit link navigates to the edit page */}
                <Link to={`/admin/products/edit/${product.id}`}>Edit</Link>
                {/* Delete button with confirmation */}
                <button onClick={() => handleDelete(product.id)} className="delete">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Products;
