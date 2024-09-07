const jwt = require("jsonwebtoken");

const adminauth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Authorization header missing" });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: "Token missing from Authorization header" });
        }

        // Verify token
        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Check if user is admin
        if (tokenVerified.role !== "admin") {
            return res.status(403).json({ success: false, message: "User not authorized" });
        }

        req.user = tokenVerified; // Pass token data to the request object
        next(); // Continue to the next middleware
    } catch (error) {
        console.error("Error verifying JWT:", error);

        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ success: false, message: "Invalid token" });
        } else {
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
};

module.exports = { adminauth };
