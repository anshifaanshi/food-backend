const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { apirouter } = require('./routes');
const { connectdb } = require('./config.js/db');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware to parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
    'https://food-frontend-me.vercel.app',
    'https://food-frontend-rust.vercel.app',
    'http://localhost:5173',
    'https://food-frontend-ten.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
        } else {
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error('Request blocked by CORS policy.'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Handle pre-flight requests
app.options('*', (req, res) => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.sendStatus(200); // Respond with a 200 OK for pre-flight requests
});

// Connect to the database
connectdb()
    .then(() => {
        console.log("Database connected successfully.");
    })
    .catch(err => {
        console.error("Database connection failed:", err);
    });

// API routes
app.use('/api', apirouter);

// Endpoint to set a token in a cookie
app.get('/set-token', (req, res) => {
    const token = "your_token_here"; // Use a real token generation here
    res.cookie("token", token, {
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true
    });
    res.json({ message: "Token set in cookie" });
});

// Handle undefined routes
app.all("*", (req, res) => {
    res.status(404).json({ message: "Endpoint does not exist" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
