const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');  
const { apirouter } = require('./routes');
const { connectdb } = require('./config.js/db');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Allow multiple origins for CORS
const allowedOrigins = [
    'https://food-frontend-ll4c.vercel.app',
    'https://food-frontend-rust.vercel.app',
       'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

const port = process.env.PORT || 3002;

// Connect to database
connectdb();

// Use the API routes
app.use('/api', apirouter);

// Endpoint to set a token in a cookie
app.get('/set-token', (req, res) => {
    const token = "your_token_here"; 
    res.cookie("token", token, { sameSite: "None", secure: true });
    res.json({ message: "Token set in cookie" });
});

// Handle undefined routes
app.all("*", (req, res) => {
    res.status(404).json({ message: "Endpoint does not exist" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});