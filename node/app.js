require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(express.json());
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Adzuna API credentials - store these securely in environment variables
const ADZUNA_APP_ID = "97ab8b18";
const ADZUNA_API_KEY = "b014be2f1381a156317dfc4522745740"
// Base URL for Adzuna API
const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs/in/search/1"; // Change 'gb' if needed

app.get("/jobs", async (req, res) => {
    try {
        const { what = "", where = "" } = req.query;

        const response = await axios.get(ADZUNA_BASE_URL, {
            params: {
                app_id: ADZUNA_APP_ID,
                app_key: ADZUNA_API_KEY,
                what,
                where,
                results_per_page: 100
            }
        });

        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: "Error fetching jobs", details: error.message });
    }
});

// Set your Gemini API key
const GEMINI_API_KEY = "AIzaSyAkc9L05OE3Nnlvkk15QxfwT7EDoFSzWug";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function getCareerPath(resumeText) {
    const prompt = `
    Based on the following resume text, extract key skills and recommend suitable career paths salary should in indian rs
    and description of each should be in 100 words minimum.
    Resume: ${resumeText}
    
    Provide the response in JSON format with fields: 
    'careerPaths' (list of objects), where each object contains:
    'title', 'description', 'skills' (list), and 'salary'.
    
    Important: Return only the raw JSON data without any markdown formatting, code blocks, or backticks.
  `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = responseText;

    // Check if the response is wrapped in markdown code blocks (```json ... ```)
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = responseText.match(jsonBlockRegex);

    if (match && match[1]) {
        // Extract only the JSON content from between the code blocks
        cleanedResponse = match[1];
    }

    try {
        return JSON.parse(cleanedResponse);
    } catch (error) {
        throw new Error(`Failed to parse JSON response: ${error.message}. Response was: ${responseText}`);
    }
}

app.post("/api/career-path", async (req, res) => {
    const { resumeText } = req.body;

    if (!resumeText) {
        return res.status(400).json({ error: "No resume text provided" });
    }

    try {
        const careerPaths = await getCareerPath(resumeText);
        res.json({ careerPaths });
    } catch (error) {
        console.error("Error processing career path:", error);
        res.status(500).json({
            error: error.message,
            details: "There was an issue processing your request with the AI model"
        });
    }
});






// user authtentication ********************************************************************************************

// MongoDB Connection
const mongoURI = 'mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },

    emotion: {
        type: Object,
        default: {
            Neutral: 0,
            Angry: 0,
            Happy: 0,
            Surprised: 0,
            Fearful: 0,
            Sad: 0,
            Disgusted: 0
        }
    }
    ,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    degree: {
        type: String,
        required: true,
    },
    specialization: {
        type: String,
        required: true,
    },
    additionalInfo: {
        type: String,
        default: '',
    },
    password: {
        type: String,
        required: true,
    },
    technicalSkills: {
        type: [String], // Array of strings
        default: [],    // Default to empty array
    },
    projects: {
        type: [String], // Array of strings
        default: [],    // Default to empty array
    },
    resume_text_format: { type: String },
    resumeFile: {
        type: String,   // String to store the PDF file name
        default: '',    // Default to empty string (or null if preferred)
    },
}, {
    timestamps: true, // Optional: adds createdAt and updatedAt fields
});

const User = mongoose.model('UserData', userSchema, 'userData');

// JWT Secret (In production, store this in environment variables)
const JWT_SECRET = 'your-secret-key-please-change-this-in-production';

// Validation Middleware
const validateSignup = (req, res, next) => {
    const { name, age, mobile, email, degree, specialization, password } = req.body;

    if (!name || !age || !mobile || !email || !degree || !specialization || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/^\d{10}$/.test(mobile)) {
        return res.status(400).json({ message: 'Invalid mobile number' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    if (age < 16 || age > 100) {
        return res.status(400).json({ message: 'Age must be between 16 and 100' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    next();
};

// Signup Route
app.post('/api/signup', validateSignup, async (req, res) => {
    try {
        const { name, age, mobile, email, degree, specialization, additionalInfo, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with default emotion and hrQuestions
        const user = new User({
            name,
            age,
            mobile,
            email,
            degree,
            specialization,
            additionalInfo,
            password: hashedPassword,
            // emotion and hrQuestions will be automatically added with defaults
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                emotion: user.emotion,
                hrQuestions: user.hrQuestions
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                emotion: user.emotion,
                hrQuestions: user.hrQuestions
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Protected Route Example
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/skills/:email', async (req, res) => {

    try {
        const user = await User.findOne({ email: req.params.email })

        if (user) {

            return res.status(200).json({ skills: user.technicalSkills })
        }
    } catch (error) {

    }
})


// user authtentication end ********************************************************************************************




app.get('/api/resume/:email', async (req, res) => {

    const { email } = req.params;

    const user = await User.findOne({ email: email })

    if (user.resume_text_format && user.resume_text_format.length > 0) {
        res.json({ resume: user.resume_text_format, success: true });
    }
    else {
        res.json({ resume: user.resume_text_format, success: false });
    }


});


const PORT = 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));