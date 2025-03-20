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

app.get('/api/resume', async (req, res) => {
    const resumetext = ` Harsh ulhas koshti 
harsh0801004@gmail.com 
 
Nashik 
PROFILE SUMMARY 
Linkedin 
Dynamic and ambitious IT professional pursuing a career in web development. Demonstrated proficiency in 
various languages and tools, with a solid foundation in data structures and algorithms. Excellent 
communication, leadership, and decision-making abilities. Seeking an internship to leverage my skills and 
experiences while contributing to the success of a forward-thinking company. 
SKILLS 
Web Development: 
HTML, CSS, PHP, AJAX, Jquery, Bootstrap, Node.js, Express.js 
Databases: 
MySQL , MongoDB 
Testing Tools: 
Selenium WebDriver , Software Testing 
Languages: 
JavaScript, PHP, C, C++, Java, Python 
Tools/Frameworks: 
Bootstrap 
PROJECTS 
API Based News Application 
Developed and launched an API-based News Aggregator Website using HTML, CSS, 
JavaScript, Node.js, and Express.js. This platform integrates thousands of reputable 
news sources into a single. 
College Event Management System 
Tools/Technologies used: Java, MySQL, Spring Boot, HTML/CSS, JavaScript, 
Bootstrap Developed a comprehensive Event Management System to streamline the 
organization of college events. 
E-commerce Website Development 
Tools/Technologies used: PHP, MySQL, HTML5, CSS3, JavaScript, Bootstrap 
.Designed and developed a responsive e-commerce website to provide a platform for 
local artisans to sell their handmade products. 
Portfolio Website  
Designed and developed a professional portfolio website to showcase my skills, 
experiences, and projects. 
Used HTML, CSS, JavaScript, and Bootstrap to create an engaging and responsive 
user interface. 
PROFESSIONAL EXPERIENCE 
08/2023 
03/2023 – 05/2023 
08/2022 – 12/2022 
12/2021 – 01/2022 
PHP Developer 
FILIUMS ENTERPRISES 
Engaged in a remote internship with Filium Enterprises Pvt. Ltd., a leading software 
and hi-tech firm based in Dehradun, UK. Diligently executed programming tasks 
using PHP, AJAX, JS, jQuery, Bootstrap, and JS. 
Web Developer 
Raise Digital 
08/2023 – 10/2023 
Dehradun, India 
Wrote frontend for building websites – HTML , CSS , Javascript , php , Bootstrap 
EDUCATION 
BE - INFORMATION TECHNOLOGY 
MVPS KBTCOE 
12 HSC 
KTHM COLLEGE 
90% 
10 SSC 
SHRIMAN TJC NASHIK 
87% 
CERTIFICATES 
 Data Analysis by Microsoft and 
LinkedIn  
SOFT SKILLS 
Communication 
Leadership 
LANGUAGES 
English 
Hindi 
INTERESTS 
 
 
NASHIK, INDIA 
NASHIK, INDIA 
 
NASHIK 
 
 
 
 
React.js Essential Training   Test Automation Foundations 
 
 
 
 
 
Decision Making 
Adaptive 
 
 
Marathi 
 
 
Programming | Reading Book | Sports | Designing Web 
`;

    res.json({ resume: resumetext });
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

const PORT = 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));