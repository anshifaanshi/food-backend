const jwt = require("jsonwebtoken");

const adminauth = (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        // Verify the token
        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = tokenVerified; // Store verified user information

        // Check user role
        if (tokenVerified.role !== "admin" && tokenVerified.role !== "user") {
            return res.status(403).json({ success: false, message: "Unauthorized: Insufficient permissions" });
        }

        // Proceed to the next middleware
        next();
    } catch (error) {
        console.error("Error in adminauth:", error); // Log error details for debugging
        res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};

module.exports = { adminauth };
