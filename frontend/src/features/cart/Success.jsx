import { Link } from 'react-router-dom';
import '/src/styles/main.scss';

function Success() {
  return (
     <div className="success-container" role="main" aria-labelledby="success-title">
      <h1 id="success-title" className="success-title">Payment Successful</h1>
      <p className="success-message">Thank you for your purchase.</p>
      <Link to="/shop" className="btn btn-green">Back to Shop</Link>
    </div>
  );
}

export default Success;