const { user: UserModel } = require('../models/usermodels.js'); 
const bcrypt = require('bcrypt');
const { generatetoken } = require('../utils/token.js');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();


const usersignup = async (req, res, next) => {
    try {
        const { name, email, password, phone, profilepic, hotels } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user already exists
        const isUserExist = await UserModel.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            profilepic,
            hotels
        });

        // Generate token
        const token = generatetoken(newUser._id);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true, // Helps prevent client-side scripts from accessing the cookie
            secure: true, // Ensure cookie is sent over HTTPS in production
            sameSite: 'None', // Helps prevent CSRF attacks
             // Ensure path is set correctly
        });

        return res.status(201).json({ success: true, message: "User created successfully", user: newUser });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

// User Login Controller

const userlogin = async (req, res, next) => {
    try {
        const { password, email } = req.body;

        if (!password || !email) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const userexist = await UserModel.findOne({ email });
        if (!userexist) {
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        const passwordmatch = await bcrypt.compare(password, userexist.password);
        if (!passwordmatch) {
            return res.status(401).json({ message: "User not authorized" });
        }

        const token = generatetoken(userexist._id);

        // Set cookie correctly
        res.cookie("token", token, {
            sameSite: "None", // Required for cross-site cookies in production
            secure: true,     // Ensure secure transmission over HTTPS
            httpOnly: true,   // Helps prevent JavaScript access on the client
        });
        

        return res.status(200).json({ success: true, message: "User logged in successfully", user: userexist });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};


// User Logout Controller
const userlogout = async (req, res, next) => {
    try {
        // Clear the cookie
        res.clearCookie('token', {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        res.status(200).json({ message: "User logged out successfully", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

// User Profile Controller
const userProfile = async (req, res, next) => {
    try {
        const { user } = req;
        console.log(user, "=========user");

        // Use .select() to exclude the password field
        const userData = await UserModel.findOne({ _id: user.id }).select('-password');

        res.json({ success: true, message: "User data fetched", data: userData });
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};


// Check User Authorization Middleware
const checkuser = async (req, res, next) => {
    try {
        const { user } = req;
        if (!user) {
            return res.status(401).json({ success: false, message: "User not authorized" });
        }

        // Fetch full user data from the database using the ID
        const fullUserData = await UserModel.findById(user.id).select('name email role'); // Fetch name, email, and role

        if (!fullUserData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, message: "User authorized", data: fullUserData });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "An error occurred", error: err.message });
    }
};

// User Authorization Middleware
const userauth = (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ success: false, message: "User not authorized, token missing" });
        }

        // Verify the token and extract user data
        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // If the token verification fails, an error will be thrown, so we don't need to check for null
        req.user = {
            id: tokenVerified.id,  // Ensure your token contains the user ID
            role: tokenVerified.role  // Example: if the token contains user's role
        };

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ success: false, message: "User not verified" });
    }
};

const userUpdate = async (req, res, next) => {
    const { email, password, name } = req.body;

    try {
        // Check if the new email already exists in the database, excluding the current user's email
        if (email) {
            const existingUser = await UserModel.findOne({ email, _id: { $ne: req.user.id } }); 
            if (existingUser) {
                return res.status(400).json({ message: "Email ID already exists" });
            }
        }

        const updates = {};

        // Check if the email is provided and update
        if (email && email !== '') {
            updates.email = email;
        }
        // Check if password is provided and hash it before saving
        if (password && password !== '') {
            // Ideally, hash the password here before saving
            updates.password = password; 
        }
        // Check if name is provided and update
        if (name && name !== '') {
            updates.name = name;
        }

        // Here, we are assuming the user ID or another unique identifier to update their info
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user.id, // Assuming you have the user ID in req.user.id from authentication middleware
            { $set: updates },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


const UsersCollections = async (req, res) => {
    try {
      const users = await UserModel.find();  // Fetch users from the database
      res.status(200).json(users);  // Send users as JSON
    } catch (err) {
      res.status(500).json({ error: 'Unable to fetch users' });
    }
  };
const DeleteUser =async(req, res) => {
    const { id } = req.params;
    try {
      const user = await UserModel.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  };
  
 
  
  

  const BlockUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle the blocked status
        user.blocked = !user.blocked;

        // Save the updated user
        await user.save();

        console.log('Updated User:', user); // Debug log to verify update

        res.status(200).json({ message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully`, user });
    } catch (error) {
        console.error('Error blocking/unblocking user:', error);
        
        // Provide more detailed error feedback
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error: ' + error.message });
        }

        if (error instanceof mongoose.Error) {
            return res.status(500).json({ message: 'Database Error: ' + error.message });
        }

        res.status(500).json({ message: 'Internal Server Error' });
    }
};





  
  
  const UnblockUser=async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { blocked: false }, { new: true });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ message: 'User unblocked successfully', user });
    } catch (error) {
        console.error('Error unblocking user:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

  
module.exports = { usersignup, userlogin, userlogout, userProfile, userauth, checkuser ,userUpdate, UsersCollections,DeleteUser,BlockUser,UnblockUser};
