// This middleware disables caching to ensure clients always get fresh data
const noCache = (req, res, next) => {
  // Set HTTP headers to tell the browser and any intermediate proxy
  // not to cache this response at all
  res.setHeader('Cache-Control', 'no-store'); // Most modern browsers respect this: don't cache anything
  res.setHeader('Pragma', 'no-cache');        // For older HTTP/1.0 clients that still use "Pragma"
  res.setHeader('Expires', '0');              // Makes sure the content is already "expired"

  // Move on to the next middleware or route
  next();
};

// Export this function so it can be used globally (in app.js or for specific routes)
module.exports = noCache;
