import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import '../../styles/main.scss';

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;
/**
 * EditProduct Component
 * Allows an admin to edit an existing product's details and optionally update the product image.
 */
function EditProduct() {
  const { id } = useParams(); // Get product ID from the URL
  const navigate = useNavigate(); // For programmatic navigation

  // State for the product's editable fields
  const [product, setProduct] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    alt: '',
  });

  // State for the uploaded image file and preview
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Loading and feedback states
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Fetch the existing product data on component mount
   */
useEffect(() => {
  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`, {
        withCredentials: true,
      });
      const result = response.data?.result; // ✅ Fixed here
      if (result) {
        setProduct(result); // Fill form with existing product data
        if (result.picture) {
          setPreviewUrl(`${BASE_URL}/uploads/${result.picture}`);        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setMessage('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);


  /**
   * Handle changes in the text inputs
   */
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  /**
   * Handle file input changes (image)
   * Shows image preview and stores the file
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file)); // Temporary preview URL
    }
  };

  /**
   * Handle form submission to update the product
   */
const handleSubmit = async (e) => {
  e.preventDefault();

  // Defensive conversion and ensure all fields are present
  const sanitizedProduct = {
    title: product.title || '',
    description: product.description || '',
    price: parseFloat(product.price) || 0,
    stock: parseInt(product.stock) || 0,
    alt: product.alt || '',
  };

  const formData = new FormData();

  // Append all fields, even if empty strings (to overwrite)
  for (let key in sanitizedProduct) {
    formData.append(key, sanitizedProduct[key]);
  }

  if (imageFile) {
    formData.append('picture', imageFile);
  }

  try {
    await api.put(`/products/edit/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    setSuccess('Product updated successfully!');
    setTimeout(() => navigate(`/admin/products/edit/${id}`), 1000);  } catch (err) {
    console.error('Error updating product:', err);
    setMessage('Error updating product');
  }
};



  // Show loading spinner or text while fetching product
  if (loading) return <div className="form-loading">Loading product...</div>;

  return (
    <div className="edit-product-container">
      <h1 className="edit-product-title">Edit Product</h1>

      {/* Error or success messages */}
      {message && <p className="form-error">{message}</p>}
      {success && <p className="form-success">{success}</p>}

      {/* Preview image if available */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt={product.alt || 'Product Preview'}
          className="product-image"
        />
      )}

      {/* Product edit form */}
      <form onSubmit={handleSubmit} className="edit-product-form">
        <input
          type="text"
          name="title"
          value={product.title}
          onChange={handleChange}
          placeholder="Title"
          className="form-input"
        />

        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          placeholder="Description"
          className="form-input"
        />

        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          placeholder="Price"
          className="form-input"
        />

        <input
          type="number"
          name="stock"
          value={product.stock}
          onChange={handleChange}
          placeholder="Stock"
          className="form-input"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="form-input"
        />

        <button type="submit" className="form-button">
          Update Product
        </button>
      </form>
    </div>
  );
}

export default EditProduct;
