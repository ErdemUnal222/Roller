// Entry point of the React application

import React from 'react';
import ReactDOM from 'react-dom/client';

// Main application component
import App from './App.jsx';

// Redux store setup
import { Provider } from 'react-redux';
import store from './redux/store';

// Global styles (SCSS)
import '/src/styles/main.scss';

// Mount the app into the root div in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Provide Redux store to the entire app */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
