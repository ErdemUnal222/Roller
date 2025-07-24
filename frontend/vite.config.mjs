// Import the helper from Vite to define the configuration
import { defineConfig } from 'vite';

// Import the React plugin so Vite knows how to handle React files
import react from '@vitejs/plugin-react';

// Export the Vite configuration
export default defineConfig({
  // Use the React plugin
  plugins: [react()],

  // Configure the development server
  server: {
    // Set the port for the dev server (http://localhost:3000)
    port: 3000,

    // Ignore source maps for all files except the React DevTools backend file
    // This helps keep the browser debugger cleaner
    sourcemapIgnoreList: (source) =>
      source.includes('react_devtools_backend_compact.js') ? false : true,

    // Allow access to the dev server from any IP (useful when testing from outside localhost)
    host: '0.0.0.0',

    // Only allow this specific domain (for example, in an online IDE)
    allowedHosts: ['ihsanerdemunal.ide.3wa.io'],
  },
});
