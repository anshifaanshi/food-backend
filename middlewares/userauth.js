const jwt = require("jsonwebtoken");

const userauth = (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ success: false, message: "please login" });
        }

        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!tokenVerified) {
            return res.status(401).json({ success: false, message: "User not verified" });
        }

        req.user = tokenVerified;
        next(); 

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { userauth };