const express = require('express');
const dotenv=require('dotenv')
const cookieParser = require('cookie-parser');  // Import cookie-parser
const { apirouter } = require('./routes');
const { connectdb } = require('./config.js/db');
const cors=require('cors');


const app = express();

app.use(express.json());
app.use(cookieParser());  
app.use(cors({
    origin:'https://food-frontend-rust.vercel.app',
    credentials:true,
}))
const port = 3002;

connectdb();

app.use('/api', apirouter);

app.all("*",(req,res)=>{
    res.status(404).json({message:"end point does not exist"})
})
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
