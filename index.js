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
app.use(cors({
    origin: 'https://food-frontend-ll4c.vercel.app',
    credentials: true,
}));

const port = process.env.PORT || 3002;


connectdb();


app.use('/api', apirouter);


app.get('/set-token', (req, res) => {
    const token = "your_token_here"; 
    res.cookie("token", token, { sameSite: "None", secure: true });
    res.json({ message: "Token set in cookie" });
});


app.all("*", (req, res) => {
    res.status(404).json({ message: "Endpoint does not exist" });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
