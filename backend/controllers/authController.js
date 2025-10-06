const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (UserModel) => {
  // --- tiny helpers ---
  const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());
  const norm = (s) => String(s || "").trim();
  const safeStr = (s) => norm(s).length > 0;

  const ensureJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
      // Fail fast in dev; in prod you’d log and 500
      throw new Error("JWT_SECRET is not set");
    }
    return process.env.JWT_SECRET;
  };

  // POST /auth/register
  const saveUser = async (req, res, next) => {
    try {
      const body = req.body || {};
      const firstName = norm(body.firstName);
      const lastName  = norm(body.lastName);
      const email     = norm(body.email).toLowerCase();
      const password  = String(body.password || "");
      const address   = norm(body.address);
      const zip       = norm(body.zip);
      const city      = norm(body.city);
      const phone     = norm(body.phone || "");

      // required fields
      if (![firstName, lastName, email, address, zip, city].every(safeStr) || !safeStr(password)) {
        return next({ status: 400, message: "All required fields must be filled out." });
      }

      // validate email + password policy
      if (!isEmail(email)) {
        return next({ status: 400, message: "Invalid email." });
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return next({
          status: 400,
          message: "Password must be at least 8 chars with upper, lower and a number."
        });
      }

      // enforce role = 'user' (prevent role injection)
      const role = "user";

      // unique email
      const existing = await UserModel.getUserByEmail(email);
      if (existing?.code) return next({ status: 500, message: "Error while checking email." });
      if (Array.isArray(existing) && existing.length > 0) {
        return next({ status: 409, message: "Email already in use." });
      }

      // hash
      const hashedPassword = await bcrypt.hash(password, 10);

      // whitelist insert
      const userData = {
        firstName, lastName, email,
        password: hashedPassword,
        address, zip, city, phone,
        role
      };

      const created = await UserModel.saveOneUser(userData);
      if (created?.code) return next({ status: 500, message: "Error while saving user." });

      return res.status(201).json({ status: 201, msg: "User registered successfully!" });
    } catch (err) {
      next(err);
    }
  };

  // POST /auth/login
  const connectUser = async (req, res, next) => {
    try {
      const email = norm(req.body?.email).toLowerCase();
      const password = String(req.body?.password || "");

      if (!isEmail(email) || !safeStr(password)) {
        return next({ status: 400, message: "Invalid email or password." });
      }

      const found = await UserModel.getUserByEmail(email);
      if (found?.code) return next({ status: 500, message: "Error checking email." });
      if (!Array.isArray(found) || found.length === 0) {
        // do not reveal which part is wrong
        return next({ status: 401, message: "Invalid email or password." });
      }

      const row = found[0];
      const ok = await bcrypt.compare(password, row.password);
      if (!ok) return next({ status: 401, message: "Invalid email or password." });

      const secret = ensureJwtSecret();
      const payload = { id: row.id, role: row.role };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });

      // update last login (best-effort)
      const up = await UserModel.updateConnexion(row.id);
      if (up?.code) return next({ status: 500, message: "Error updating connection." });

      const user = {
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        address: row.address,
        complement: row.complement,
        zip: row.zip,
        city: row.city,
        phone: row.phone,
        role: row.role
      };

      return res.status(200).json({ status: 200, token, user });
    } catch (err) {
      next(err);
    }
  };

  // PUT /users/:id  (owner or admin only)
  const updateUser = async (req, res, next) => {
    try {
      const auth = req.user; // must be set by your JWT middleware
      const targetId = Number(req.params.id);
      if (!auth) return next({ status: 401, message: "Unauthorized" });
      if (!(auth.id === targetId || auth.role === "admin")) {
        return next({ status: 403, message: "Forbidden" });
      }

      // whitelist editable fields
      const allowed = ["firstName","lastName","address","zip","city","phone"];
      const patch = {};
      for (const k of allowed) {
        if (k in req.body && safeStr(req.body[k])) {
          patch[k] = norm(req.body[k]);
        }
      }
      if (!Object.keys(patch).length) {
        return next({ status: 400, message: "Nothing to update." });
      }

      const upd = await UserModel.updateUser(patch, targetId);
      if (upd?.code) return next({ status: 500, message: "Error updating user!" });

      const fresh = await UserModel.getOneUser(targetId);
      if (fresh?.code || !Array.isArray(fresh) || fresh.length === 0) {
        return next({ status: 404, message: "Updated user not found!" });
      }

      const u = fresh[0];
      const myUser = {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        address: u.address,
        zip: u.zip,
        city: u.city,
        phone: u.phone,
        role: u.role
      };

      return res.status(200).json({ status: 200, newUser: myUser });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /users/:id  (owner or admin only)
  const deleteUser = async (req, res, next) => {
    try {
      const auth = req.user;
      const targetId = Number(req.params.id);
      if (!auth) return next({ status: 401, message: "Unauthorized" });
      if (!(auth.id === targetId || auth.role === "admin")) {
        return next({ status: 403, message: "Forbidden" });
      }

      const deletion = await UserModel.deleteOneUser(targetId);
      if (deletion?.code) return next({ status: 500, message: "Error while deleting user." });

      return res.status(200).json({ status: 200, msg: "User deleted successfully." });
    } catch (err) {
      next(err);
    }
  };

  // GET /auth/me  (verify token; req.user set by middleware)
  const checkToken = async (req, res, next) => {
    try {
      if (!req.user?.id) return next({ status: 401, message: "Unauthorized" });

      const user = await UserModel.getOneUser(req.user.id);
      if (user?.code || !Array.isArray(user) || user.length === 0) {
        return next({ status: 404, message: "User not found." });
      }

      const u = user[0];
      const myUser = {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        address: u.address,
        complement: u.complement,
        zip: u.zip,
        city: u.city,
        phone: u.phone,
        role: u.role
      };

      return res.status(200).json({ status: 200, user: myUser });
    } catch (err) {
      next(err);
    }
  };

  return { saveUser, connectUser, updateUser, deleteUser, checkToken };
};
