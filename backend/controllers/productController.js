module.exports = (ProductModel) => {
  const path = require("path");
  const fs = require("fs");

  // Creates and saves a new product (including image upload if provided)
  const saveProduct = async (req, res, next) => {
    try {
      // If an image file is uploaded, prepare to store it
      if (req.files && req.files.picture) {
        const image = req.files.picture;
        
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const fileExt = path.extname(image.name).toLowerCase();

        if (!allowedMimeTypes.includes(image.mimetype) || !allowedExtensions.includes(fileExt)) {
          return next({ status: 400, message: 'Invalid file type' });
        }

        if (image.size > 2 * 1024 * 1024) {
          return next({ status: 400, message: 'File too large (max 2MB)' });
        }

        const uploadDir = path.join(__dirname, "..", "public", "uploads", "products");

        // Ensure the upload directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

         const sanitized = image.name.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
        const imageName = `${Date.now()}_${sanitized}`;

        // Move image to the upload directory
        await image.mv(path.join(uploadDir, imageName));

        // Add the filename to the request body to save it in the DB
        req.body.picture = imageName;
      }
      
   if (process.env.NODE_ENV !== 'production') {
            console.log("Creating product with data:", req.body);
          }

      // Save the product to the database
      const product = await ProductModel.saveOneProduct(req.body);
      if (product.code) {
        return next({ status: product.code, message: product.message });
      }

      res.status(201).json({
        status: 201,
        msg: "Product saved successfully!",
        id: product.id,
      });
    } catch (err) {
      next(err);
    }
  };

  // Retrieves all products from the database
  const getAllProducts = async (req, res, next) => {
    try {
      const products = await ProductModel.getAllProducts();
      res.status(200).json({ status: 200, result: products });
    } catch (err) {
      next(err);
    }
  };

  // Retrieves a single product by its ID
  const getOneProduct = async (req, res, next) => {
    try {
      const id = req.params.id;
      const product = await ProductModel.getOneProduct(id);

      if (!product) {
        return res.status(404).json({ status: 404, message: "Product not found" });
      }

      res.status(200).json({ status: 200, result: product });
    } catch (err) {
      next(err);
    }
  };

  // Updates a product and handles image replacement if necessary
  const updateProduct = async (req, res, next) => {
    try {
      // Get the existing product data (to remove old image if needed)
      const currentProduct = await ProductModel.getOneProduct(req.params.id);
      if (!currentProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // If a new image is uploaded, replace the old one
      if (req.files && req.files.picture) {
        const image = req.files.picture;
        
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const fileExt = path.extname(image.name).toLowerCase();

        if (!allowedMimeTypes.includes(image.mimetype) || !allowedExtensions.includes(fileExt)) {
          return next({ status: 400, message: 'Invalid file type' });
        }

        if (image.size > 2 * 1024 * 1024) {
          return next({ status: 400, message: 'File too large (max 2MB)' });
        }

        const uploadDir = path.join(__dirname, "..", "public", "uploads","products");

        // Ensure upload folder exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Delete old image from disk if it exists
        if (currentProduct.picture) {
          const oldImagePath = path.join(uploadDir, currentProduct.picture);
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        // Save the new image file
const sanitized = image.name.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
        const imageName = `${Date.now()}_${sanitized}`;        await image.mv(path.join(uploadDir, imageName));
        req.body.picture = imageName;
      }
  if (process.env.NODE_ENV !== 'production') {
            console.log("Updating product with data:", req.body);
          }
      // Update the product in the database
      const result = await ProductModel.updateProduct(req.params.id, req.body);
      res.status(200).json({ status: 200, msg: "Product updated successfully", result });
    } catch (err) {
      next(err);
    }
  };

  // Deletes a product from the database
  const deleteProduct = async (req, res, next) => {
    try {
      await ProductModel.deleteOneProduct(req.params.id);
      res.status(200).json({ status: 200, msg: "Product deleted successfully!" });
    } catch (err) {
      next(err);
    }
  };

  // Expose controller functions for use in routes
  return {
    saveProduct,
    getAllProducts,
    getOneProduct,
    updateProduct,
    deleteProduct
  };
};
