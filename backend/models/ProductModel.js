// The ProductModel class encapsulates all SQL operations related to product management
class ProductModel {
  constructor(db) {
    // Store the database connection instance (injected when model is initialized)
    this.db = db;
  }

  /**
   * CREATE: Insert a new product into the database.
   * - Uses values from productData (title, price, description, etc.)
   * - Adds a creation timestamp using NOW()
   */
  async saveOneProduct(productData) {
    try {
      const result = await this.db.query(
        `INSERT INTO products (title, price, description, stock, picture, alt, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          productData.title,
          productData.price,
          productData.description,
          productData.stock,
          productData.picture,
          productData.alt
        ]
      );

      // Return the newly inserted product's ID
      return { id: result.insertId };
    } catch (err) {
      console.error("Error in saveOneProduct:", err);
      throw { code: 500, message: "Error saving product" };
    }
  }

  /**
   * READ: Get a list of all products in the database.
   * - Useful for product listing pages or admin dashboards.
   * - Products are returned in ascending order by ID.
   */
  async getAllProducts() {
    try {
      const rows = await this.db.query('SELECT * FROM products ORDER BY id ASC');
      return rows;
    } catch (err) {
      console.error("Error in getAllProducts:", err);
      throw { code: 500, message: "Error retrieving products" };
    }
  }

  /**
   * READ: Fetch a single product by its ID.
   * - Useful for product detail pages or editing a product.
   */
  async getOneProduct(id) {
    try {
      const rows = await this.db.query('SELECT * FROM products WHERE id = ?', [id]);

      // If no product found with the given ID, return null
      if (!rows || rows.length === 0) {
        return null;
      }

      // Return the first (and only) result
      return rows[0];
    } catch (err) {
      console.error("Error in getOneProduct:", err);
      throw { code: 500, message: "Error retrieving product" };
    }
  }

  /**
   * UPDATE: Modify a product’s fields using its ID.
   * - Dynamically updates only the fields provided in productData.
   * - Supports updating title, description, price, stock, picture, and alt.
   */
  async updateProduct(id, productData) {
    try {
      // Build the SQL update statement dynamically based on provided fields
      const fields = [];
      const values = [];

      if (productData.title !== undefined) {
        fields.push('title = ?');
        values.push(productData.title);
      }
      if (productData.description !== undefined) {
        fields.push('description = ?');
        values.push(productData.description);
      }
      if (productData.price !== undefined) {
        fields.push('price = ?');
        values.push(productData.price);
      }
      if (productData.stock !== undefined) {
        fields.push('stock = ?');
        values.push(productData.stock);
      }
      if (productData.picture !== undefined) {
        fields.push('picture = ?');
        values.push(productData.picture);
      }
      if (productData.alt !== undefined) {
        fields.push('alt = ?');
        values.push(productData.alt);
      }

      // Append product ID at the end for WHERE clause
      values.push(id);

      if (fields.length === 0) {
        throw new Error("No valid fields provided for update");
      }

      // Construct the full UPDATE SQL query string
      const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;

      // Execute the update query with values
      const result = await this.db.query(sql, values);
      return result;
    } catch (err) {
      console.error("Error in updateProduct:", err);
      throw { code: 500, message: "Error updating product" };
    }
  }

  /**
   * DELETE: Permanently remove a product from the database using its ID.
   * - This action is irreversible.
   * - Used by the admin interface.
   */
  async deleteOneProduct(id) {
    try {
      const result = await this.db.query(
        `DELETE FROM products WHERE id = ?`,
        [id]
      );
      return result;
    } catch (err) {
      console.error("Error in deleteOneProduct:", err);
      throw { code: 500, message: "Error deleting product" };
    }
  }

  /**
   * Decrement the stock of a product by a certain quantity.
   * Ensures stock never goes below zero.
   */
async decrementStock(productId, quantity) {
  try {
    const [result] = await this.db.query(
      `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
      [quantity, productId, quantity]
    );
    if (result.affectedRows === 0) {
      throw new Error("Not enough stock or product not found");
    }
    return result;
  } catch (err) {
    console.error("Error decrementing stock:", err);
    throw err;
  }
}

}

// Export the ProductModel using a factory function with injected DB connection
module.exports = (db) => new ProductModel(db);
