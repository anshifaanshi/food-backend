const jwt = require("jsonwebtoken");

const adminauth = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Authorization header missing" });
        }

        // Extract Bearer token and remove 'Bearer ' part, trim extra spaces
        const token = authHeader.replace('Bearer ', '').trim();
        if (!token) {
            return res.status(401).json({ success: false, message: "Token missing from Authorization header" });
        }

        // Verify the token
        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Check if user has an admin role
        if (!tokenVerified.role || tokenVerified.role !== "admin") {
            return res.status(403).json({ success: false, message: "User not authorized" });
        }

        // Attach user data from token to request object for further use
        req.user = tokenVerified;
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
