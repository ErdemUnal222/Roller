import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import '/src/styles/main.scss';

function AddProduct() {
  const navigate = useNavigate();

  // Adjust these to match your backend:
  const ENDPOINT = '/products/add';       // try '/products' if your route is POST /products
  const FILE_FIELD = 'picture';             // try 'picture' if your middleware uses upload.single('picture')

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    alt: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview('');
  };

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.price || Number(form.price) <= 0) return 'Price must be > 0.';
    if (!form.stock || Number(form.stock) < 0) return 'Stock must be ≥ 0.';
    // Optional: enforce image presence
    // if (!file) return 'Please select an image.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    const v = validate();
    if (v) {
      setMsg({ type: 'error', text: v });
      return;
    }

    const fd = new FormData();
    // Keep keys exactly as your backend expects
    fd.append('title', form.title.trim());
    fd.append('description', form.description || '');
    fd.append('price', String(form.price)); // backend can Number() it
    fd.append('stock', String(form.stock));
    fd.append('alt', form.alt || '');
    if (file) fd.append(FILE_FIELD, file);  // 'image' or 'picture'

    try {
      setLoading(true);

      // If you use cookies-based auth, withCredentials is correct.
      // If you use Bearer tokens, add: headers: { Authorization: `Bearer ${token}` }
      await axios.post(ENDPOINT, fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsg({ type: 'success', text: 'Product created successfully!' });
      // Small delay for UX, then go back to products
      setTimeout(() => navigate('/admin/products'), 800);
    } catch (err) {
      console.error('Create product failed:', err);
      // Try to surface server validation messages if present
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.msg ||
        'Failed to create product. Please try again.';
      setMsg({ type: 'error', text: serverMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2 className="add-product-title">Add New Product</h2>

      {msg.text ? (
        <div className={msg.type === 'error' ? 'form-error' : 'form-success'}>
          {msg.text}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="add-product-form" encType="multipart/form-data">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
          required
          className="form-input"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={onChange}
          className="form-input"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={onChange}
          min="0"
          step="0.01"
          required
          className="form-input"
        />
        <input
          type="number" 
          name="stock"
          placeholder="Stock"
          value={form.stock}
          onChange={onChange}
          min="0"
          step="1"
          required
          className="form-input"
        />
        <input
          name="alt"
          placeholder="Alt text" 
          value={form.alt}
          onChange={onChange}
          className="form-input"
        />

        <div className="file-input-group">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="form-input"
          />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}
        </div>

        <button type="submit" className="form-button" disabled={loading}>
          {loading ? 'Creating…' : 'Create Product'}
        </button>
      </form>

      {/* Dev helpers (remove in prod) */}
      <div className="hint">
        <small>
          Using <code>{ENDPOINT}</code> with file field <code>{FILE_FIELD}</code>.
          If your backend uses <code>upload.single('picture')</code>, set <code>FILE_FIELD = 'picture'</code>.
        </small>
      </div>
    </div>
  );
}

export default AddProduct;
