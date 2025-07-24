import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import '/src/styles/main.scss';

/**
 * AddProduct Component
 * Provides a form for admins to add new products, including text inputs and an image upload.
 */
function AddProduct() {
  // State to manage form input values (title, description, price, stock, alt)
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    alt: '',
  });

  // State to store the uploaded image file
  const [image, setImage] = useState(null);

  // State variables for showing error or success messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State to show loading indicator while submitting
  const [loading, setLoading] = useState(false);

  // Hook to programmatically redirect users
  const navigate = useNavigate();

  /**
   * Handle input field changes
   * Updates the `newProduct` state for text fields
   */
  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  /**
   * Handle file input change
   * Stores the selected image file in state
   */
  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  /**
   * Handle form submission
   * Sends form data including the image to the backend using multipart/form-data
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent full page reload

    // Create a FormData object to hold form fields and the image
    const formData = new FormData();
    for (let key in newProduct) {
      formData.append(key, newProduct[key]); // Add each field to FormData
    }

    if (image) {
      formData.append('picture', image); // Add image file if selected
    }

    try {
      setLoading(true);
      setError('');

      // Send POST request to create the new product
      await axios.post('/products/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true, // Ensures cookies (e.g., for auth) are sent
      });

      setSuccess('Product created successfully!');

        // Redirect to the admin product list after a short delay
      setTimeout(() => navigate('/admin/products'), 1000);
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product. Please try again.');
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="add-product-title">Add New Product</h2>

      {/* Display error or success messages if any */}
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      {/* Form with fields for product info and image */}
      <form onSubmit={handleSubmit} className="add-product-form" encType="multipart/form-data">
        <input
          name="title"
          placeholder="Title"
          required
          onChange={handleChange}
          className="form-input"
        />
        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          required
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          required
          onChange={handleChange}
          className="form-input"
        />
        <input
          name="alt"
          placeholder="Alt text"
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="form-input"
        />

        {/* Submit button shows loading state if submitting */}
        <button type="submit" className="form-button" disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
