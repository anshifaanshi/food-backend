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

        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!tokenVerified) {
            return res.status(401).json({ success: false, message: "User not authorized" });
        }

        if (tokenVerified.role !== "admin") {
            return res.status(401).json({ success: false, message: "User not authorized" });
        }

        req.user = tokenVerified;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

module.exports = { adminauth };
