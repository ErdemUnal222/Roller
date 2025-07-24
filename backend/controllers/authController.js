const bcrypt = require("bcryptjs");            // Used to hash passwords securely
const jwt = require("jsonwebtoken");           // Used to generate JWT tokens for user authentication
const dotenv = require("dotenv");              // Loads environment variables from .env file
dotenv.config();

module.exports = (UserModel) => {
    
    // Registers a new user
    const saveUser = async (req, res, next) => {
        try {
            const { firstName, lastName, email, password, address, zip, city } = req.body;

            // Ensure all required fields are provided
            if (!firstName || !lastName || !email || !password || !address || !zip || !city) {
                return next({ status: 400, message: "All required fields must be filled out." });
            }

            // Check if the email is already registered
            const existing = await UserModel.getUserByEmail(email);
            if (existing.code) {
                return next({ status: 500, message: "Error while checking email." });
            }
            if (existing.length > 0) {
                return next({ status: 409, message: "Email already in use." });
            }
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(req.body.password)) {
              return next({
                status: 400,
                message: "Password must be at least 8 characters long and include uppercase, lowercase, and a number.",
              });
            }

            // Hash the password before storing it in the database
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData = { ...req.body, password: hashedPassword };

            // Save the new user to the database
            const user = await UserModel.saveOneUser(userData);
            if (user.code) {
                return next({ status: 500, message: "Error while saving user." });
            }

            res.status(201).json({ status: 201, msg: "User registered successfully!" });
        } catch (err) {
            next(err);
        }
    };

    // Authenticates a user and returns a JWT token
    const connectUser = async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // Check that credentials are provided
            if (!email || !password) {
                return next({ status: 400, message: "Email and password are required." });
            }

            // Look up user by email
            const check = await UserModel.getUserByEmail(email);
            if (check.code) return next({ status: 500, message: "Error checking email." });
            if (check.length === 0) return next({ status: 404, message: "User not found." });

            // Compare entered password with hashed password in DB
            const isValid = await bcrypt.compare(password, check[0].password);
            if (!isValid) return next({ status: 401, message: "Invalid email or password." });

            // Create JWT payload and sign token
            const payload = { id: check[0].id, role: check[0].role };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            // Update last login timestamp
            const update = await UserModel.updateConnexion(check[0].id);
            if (update.code) return next({ status: 500, message: "Error updating connection." });

            // Prepare safe user data to return (without password)
            const user = {
                id: check[0].id,
                firstName: check[0].firstName,
                lastName: check[0].lastName,
                email: check[0].email,
                address: check[0].address,
                complement: check[0].complement,
                zip: check[0].zip,
                city: check[0].city,
                phone: check[0].phone,
                role: check[0].role
            };

            res.status(200).json({ status: 200, token, user });
        } catch (err) {
            next(err);
        }
    };

    // Updates user information
    const updateUser = async (req, res, next) => {
        try {
            // Validate request body
            if (!req.body || typeof req.body !== 'object') {
                return next({ status: 400, message: "Invalid or missing body" });
            }

            // Perform update
            const user = await UserModel.updateUser(req.body, req.params.id);
            if (user.code) return next({ status: 500, message: "Error updating user!" });

            // Fetch updated user from DB
            const newUser = await UserModel.getOneUser(req.params.id);
            if (newUser.code || newUser.length === 0) {
                return next({ status: 404, message: "Updated user not found!" });
            }

            // Prepare updated user data to return
            const myUser = {
                id: newUser[0].id,
                firstName: newUser[0].firstName,
                lastName: newUser[0].lastName,
                email: newUser[0].email,
                address: newUser[0].address,
                zip: newUser[0].zip,
                city: newUser[0].city,
                phone: newUser[0].phone,
                role: newUser[0].role
            };

            res.status(200).json({ status: 200, newUser: myUser });
        } catch (err) {
            next(err);
        }
    };

    // Deletes a user based on ID
    const deleteUser = async (req, res, next) => {
        try {
            const deletion = await UserModel.deleteOneUser(req.params.id);
            if (deletion.code) return next({ status: 500, message: "Error while deleting user." });

            res.status(200).json({ status: 200, msg: "User deleted successfully." });
        } catch (err) {
            next(err);
        }
    };

    // Verifies the identity of the authenticated user (JWT)
    const checkToken = async (req, res, next) => {
        try {
            // Fetch user using ID extracted from decoded token
            const user = await UserModel.getOneUser(req.user.id);
            if (user.code) return next({ status: 500, message: "Error retrieving user." });

            // Prepare user data to return
            const myUser = {
                id: user[0].id,
                firstName: user[0].firstName,
                lastName: user[0].lastName,
                email: user[0].email,
                address: user[0].address,
                complement: user[0].complement,
                zip: user[0].zip,
                city: user[0].city,
                phone: user[0].phone,
                role: user[0].role
            };

            res.status(200).json({ status: 200, user: myUser });
        } catch (err) {
            next(err);
        }
    };

    // Expose all controller methods
    return {
        saveUser,
        connectUser,
        updateUser,
        deleteUser,
        checkToken
    };
};
