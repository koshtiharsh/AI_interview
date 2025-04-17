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
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();


// Adzuna API credentials - store these securely in environment variables
const ADZUNA_APP_ID = "97ab8b18";
const ADZUNA_API_KEY = "b014be2f1381a156317dfc4522745740"
// Base URL for Adzuna API
const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs/in/search/1"; // Change 'gb' if needed

app.get("/jobs", async (req, res) => {
    try {
        let { what = "", where = "" } = req.query;

        // Define keywords to try in order if results are empty
        const fallbackKeywords = ["junior", "entry-level", "graduate", "trainee", "internship"];
        let results = [];
        let keywordUsed = "";

        // Try each keyword until we get results
        for (const keyword of fallbackKeywords) {
            const searchTerm = keyword + " " + what;
            console.log(`Trying search term: "${searchTerm}"`);

            const response = await axios.get(ADZUNA_BASE_URL, {
                params: {
                    app_id: ADZUNA_APP_ID,
                    app_key: ADZUNA_API_KEY,
                    what: searchTerm.trim(),
                    where,
                    results_per_page: 100
                }
            });

            results = response.data.results || [];

            console.log(results)

            // If we got results, store which keyword worked and break the loop
            if (results.length > 0) {
                keywordUsed = keyword;
                break;
            }
        }

        // If we still have no results after trying all keywords, try the original query
        if (results.length === 0) {
            console.log(`No results with any keyword, trying original term: "${what}"`);
            const response = await axios.get(ADZUNA_BASE_URL, {
                params: {
                    app_id: ADZUNA_APP_ID,
                    app_key: ADZUNA_API_KEY,
                    what,
                    where,
                    results_per_page: 100
                }
            });
            results = response.data.results || [];
            keywordUsed = "none";
        }

        // Return results along with information about which keyword was used
        res.json({
            keywordUsed,
            count: results.length,
            results
        });


        console.log(results)

        console.log(`Found ${results.length} results using keyword: ${keywordUsed || "none"}`);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: "Error fetching jobs", details: error.message });
    }
});
// Set your Gemini API key
const GEMINI_API_KEY = "AIzaSyAkc9L05OE3Nnlvkk15QxfwT7EDoFSzWug";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);







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
    jobRole: String,

    customJobRole: String,
    projects: {
        type: [String], // Array of strings
        default: [],    // Default to empty array
    },
    resume_text_format: { type: String },
    resumeFile: {
        type: String,   // String to store the PDF file name
        default: '',    // Default to empty string (or null if preferred)
    },

    userProfileSummary: {
        type: String,
        default: ""
    },
    resume_analysis_data: Object,

    recommendationFeedback: [{
        careerTitle: String,
        rating: Number,
        feedback: String,
        timestamp: String,
        recommendationId: String
    }],
    resume_recommendations: [],

}, {
    timestamps: true, // Optional: adds createdAt and updatedAt fields
});

const User = mongoose.model('UserData', userSchema, 'userData');

// JWT Secret (In production, store this in environment variables)
const JWT_SECRET = 'your-secret-key-please-change-this-in-production';
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
        const { name, age, mobile, email, degree, specialization, additionalInfo, password, jobRole, customJobRole } = req.body;
        console.log(req.body)
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
            jobRole,
            customJobRole
            // emotion and hrQuestions will be automatically added with defaults
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
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
            { expiresIn: '24h' }
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
// Middleware to extract email from request
const extractEmail = (req, res, next) => {
    // Get email from request body, query, or headers depending on your implementation
    const email = req.body.email || req.query.email || req.headers['x-user-email'];

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    req.userEmail = email;
    next();
};

// GET user profile using email
app.get('/user', extractEmail, async (req, res) => {
    try {
        const user = await User.findOne(
            { email: req.userEmail },
            'name age mobile email degree specialization additionalInfo technicalSkills jobRole customJobRole '
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/resumereport/:email', async (req, res) => {

    try {

        const { email } = req.params;

        const data = await User.findOne({ email: email },
            "resume_analysis_data"
        )


        if (data.resume_analysis_data) {
            res.status(200).json({ success: true, data: data.resume_analysis_data })
        } else {
            res.status(200).json({ success: false })
        }

    } catch (error) {
        console.log("error at resumeerpot get api", error)
    }
})

// PUT update user profile using email
app.put('/user', extractEmail, async (req, res) => {
    try {
        const {
            name,
            age,
            mobile,
            degree,
            specialization,
            additionalInfo,
            technicalSkills,
            customJobRole,
            jobRole
        } = req.body;

        // Find the user by email
        let user = await User.findOne({ email: req.userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only update the fields that are allowed to be updated
        // Note: We're not updating the email as it's being used as an identifier
        if (name !== undefined) user.name = name;
        if (age !== undefined) user.age = age;
        if (mobile !== undefined) user.mobile = mobile;
        if (degree !== undefined) user.degree = degree;
        if (specialization !== undefined) user.specialization = specialization;
        if (additionalInfo !== undefined) user.additionalInfo = additionalInfo;
        if (technicalSkills !== undefined) user.technicalSkills = technicalSkills;
        if (customJobRole !== undefined) user.customJobRole = customJobRole;
        if (jobRole !== undefined) user.jobRole = jobRole;

        // Save the updated user
        await user.save();

        // Return the updated user without sensitive information
        res.status(200).json({
            name: user.name,
            age: user.age,
            mobile: user.mobile,
            email: user.email,
            degree: user.degree,
            specialization: user.specialization,
            additionalInfo: user.additionalInfo,
            technicalSkills: user.technicalSkills
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



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


// for taking feedback from frontend 
app.post('/api/recommendation-feedback', async (req, res) => {
    try {
        const { email, careerTitle, rating, feedback = '', recommendationId } = req.body;
        if (!email || !careerTitle || rating === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const timestamp = new Date().toISOString();
        const recommendationFeedback = { careerTitle, rating, feedback, timestamp, recommendationId };

        const user = await User.findOneAndUpdate(
            { email },
            { $push: { recommendationFeedback } },
            { upsert: true, new: true }
        );

        return res.status(200).json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error storing feedback:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});



// function to aggregate user information from db to chatbot prompt 



async function addSummarizeDataToDB(email, careerData) {

    try {
        const user = await User.findOne({ email: email });



        if (user) {
            let skillList = ""
            user.technicalSkills.map((item) => {
                skillList += item;
                skillList += ','
            })
            let data = `User's Name is ${user.name}  Degree ${user.degree} Specialization in ${user.specialization} technical skill of user ${skillList}`;

            let prompt = `
        this is the career path data 
        ${careerData}

      Important:  i want you to summaize it in 150 words i want res as plain text no additional * or anything just a plain text important to note start the summarization with Like This is the career recommendation given by our system and at end write recommendation ended like this 
        `
            const result = await model.generateContent(prompt);
            const response = result.response.text();

            data += response;

            console.log(data)

            const newData = await User.findOneAndUpdate({ email: email }, { userProfileSummary: data })

        }
    } catch (error) {
        console.error("Error in getCareerPath:", error);
        throw new Error(`Failed to process career path: ${error.message}`);
    }
}






/// Enhanced aggregation pipeline for feedback with guardrails
async function getCareerPath(resumeText, email) {
    try {
        // Sanitize resume text to remove personal information
        const sanitizedResumeText = sanitizeResumeText(resumeText);

        // First, retrieve user data including feedback
        const user = await User.findOne({ email });

        // Process user feedback to extract insights
        let feedbackSummary = "";
        let likedCareers = [];
        let dislikedCareers = [];

        if (user && user.recommendationFeedback && user.recommendationFeedback.length > 0) {
            // Extract liked and disliked careers based on ratings
            user.recommendationFeedback.forEach(item => {
                if (item.rating >= 4) {
                    likedCareers.push({
                        title: item.careerTitle,
                        feedback: item.feedback
                    });
                } else if (item.rating <= 2) {
                    dislikedCareers.push({
                        title: item.careerTitle,
                        feedback: item.feedback
                    });
                }
            });

            // Create a summary of feedback trends instead of sending raw feedback
            feedbackSummary = `
                Previous career preferences:
                - Liked careers: ${likedCareers.map(c => c.title).join(', ')}
                - Disliked careers: ${dislikedCareers.map(c => c.title).join(', ')}
                - Common feedback themes for liked careers: ${summarizeFeedbackThemes(likedCareers)}
                - Common feedback themes for disliked careers: ${summarizeFeedbackThemes(dislikedCareers)}
            `;
        }

        const prompt = `
        Based on the following resume text, extract key skills and recommend suitable career paths. Salary should be in Indian Rupees
        and description of each should be in 100 words minimum. The Number of careers should be 5 five not less not more please.
        
        Resume: ${sanitizedResumeText}
        
        ${feedbackSummary ? `User Feedback Context: ${feedbackSummary}` : ''}
        
        ${likedCareers.length > 0 ?
                `Please recommend careers similar to these positively rated careers: ${likedCareers.map(c => c.title).join(', ')}` : ''}
        
        ${dislikedCareers.length > 0 ?
                `Please avoid recommending careers similar to these negatively rated careers: ${dislikedCareers.map(c => c.title).join(', ')}` : ''}
        
        For each career path, include multiple career progression paths. Each should be described with stages from entry-level (mention the job role) to leadership, including timelines, skills required, and salary progression in Indian Rupees give it randomly 3-5 number of progressions. Give me different paths like some traditional, some specialization and one more anything you think is important.
        
        CONTENT GUIDELINES:
        1. All information must be professional and factually accurate regarding Indian job market
        2. Salary ranges must be realistic for the Indian market as of 2024
        3. Do not include any potentially discriminatory information related to age, gender, religion, or ethnicity
        4. Focus on skills and qualifications only
        5. Keep all language professional and constructive
        6. Do not recommend illegal, unethical, or harmful career paths
        7. Do not include personal opinions or biases in recommendations
        
        VERY IMPORTANT: You must provide the response in valid JSON format. Follow the exact structure below and ensure all arrays and objects have proper brackets and commas.
        
        Provide the response in this strict JSON format:
        {
          "careerPaths": [
            {
              "title": "Career Title",
              "description": "Detailed description (min 100 words)",
              "skills": ["skill1", "skill2", "skill3"],
              "salary": "Salary range in INR",
              "progressionPaths": [ 
                {
                  "pathName": "Career Progression Path Name",
                  "stages": [
                    {
                      "level": "Job Role/Level",
                      "timeframe": "1-2 years",
                      "requiredSkills": ["skill1", "skill2"],
                      "salary": "Salary range in INR",
                      "responsibilities": ["responsibility1", "responsibility2"]
                    }
                  ]
                }
              ]
            }
          ]
        }
        
        Important: Return only the raw JSON data without any markdown formatting, code blocks, or backticks. Ensure the JSON is valid and properly formatted.
        `;

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

        // Validate the JSON structure and apply guardrails to content
        const parsedResponse = JSON.parse(cleanedResponse);
        const validatedData = validateAndCleanseOutput(parsedResponse);

        addSummarizeDataToDB(email, JSON.stringify(validatedData))
            .catch(err => console.error("Background summary process failed:", err));

        return validatedData;
    } catch (error) {
        console.error("Error in getCareerPath:", error);

        // Return a fallback response instead of throwing an error
        if (error.message.includes("JSON")) {
            return {
                careerPaths: [],
                error: "Failed to generate career recommendations. Please try again later."
            };
        }

        throw new Error(`Failed to process career path: ${error.message}`);
    }
}

// Helper function to sanitize resume text - remove personal information
function sanitizeResumeText(text) {
    if (!text) return "";

    // Remove email addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let sanitized = text.replace(emailRegex, "[EMAIL REDACTED]");

    // Remove URLs/links
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
    sanitized = sanitized.replace(urlRegex, "[URL REDACTED]");

    // Remove phone numbers (various formats)
    const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
    sanitized = sanitized.replace(phoneRegex, "[PHONE REDACTED]");

    // Remove social media handles
    const socialHandleRegex = /(@[a-zA-Z0-9_]{1,15})/g;
    sanitized = sanitized.replace(socialHandleRegex, "[SOCIAL HANDLE REDACTED]");

    // Remove physical addresses (basic pattern)
    const addressRegex = /\d+\s+[a-zA-Z\s,]+\s+(?:Road|Rd|Street|St|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Plaza|Plz|Square|Sq)\s*,\s*[a-zA-Z\s]+\s*,\s*[A-Z]{2}\s+\d{5,6}(-\d{4})?/gi;
    sanitized = sanitized.replace(addressRegex, "[ADDRESS REDACTED]");

    return sanitized;
}

// Helper function to extract common themes from feedback
function summarizeFeedbackThemes(careerFeedback) {
    if (!careerFeedback || careerFeedback.length === 0) return "No data available";

    // Extract common keywords or phrases from feedback
    // This is a simplified approach - in production you might use NLP
    const feedbackText = careerFeedback.map(item => item.feedback).join(' ').toLowerCase();

    const positiveKeywords = ['like', 'good', 'excellent', 'interested', 'passion', 'enjoy', 'love', 'satisfying'];
    const negativeKeywords = ['dislike', 'bad', 'not interested', 'boring', 'difficult', 'hate', 'avoid', 'challenging'];

    const foundPositive = positiveKeywords.filter(word => feedbackText.includes(word));
    const foundNegative = negativeKeywords.filter(word => feedbackText.includes(word));

    return foundPositive.length > 0 ?
        `Positive mentions of ${foundPositive.join(', ')}` :
        foundNegative.length > 0 ?
            `Negative mentions of ${foundNegative.join(', ')}` :
            "Mixed feedback";
}

// New function to validate and apply guardrails to LLM output
function validateAndCleanseOutput(data) {
    try {
        // Validate overall structure
        if (!data || !data.careerPaths || !Array.isArray(data.careerPaths)) {
            throw new Error("Invalid response structure");
        }

        // Ensure we have exactly 5 career paths
        const careerPaths = data.careerPaths.slice(0, 5);
        while (careerPaths.length < 5) {
            careerPaths.push({
                title: "General Career Option",
                description: "This is a placeholder for a career option. Our system was unable to generate a complete recommendation. Please try again or consult with a career counselor for more personalized advice.",
                skills: ["communication", "problem-solving", "adaptability"],
                salary: "Varies based on experience and qualification",
                progressionPaths: [{
                    pathName: "Standard Progression",
                    stages: [{
                        level: "Entry Level",
                        timeframe: "1-2 years",
                        requiredSkills: ["basic skills"],
                        salary: "Entry level salary",
                        responsibilities: ["Basic responsibilities"]
                    }]
                }]
            });
        }

        // Process each career path
        const cleanCareerPaths = careerPaths.map(career => {
            // Validate and cleanse career title
            const title = typeof career.title === 'string' ?
                career.title.substring(0, 100) : "Career Option";

            // Ensure description has minimum length
            let description = typeof career.description === 'string' ?
                career.description : "No description provided";
            if (description.length < 100) {
                description += " This career path requires strong analytical skills and continuous learning. Professionals in this field need to stay updated with industry trends and develop expertise in specialized areas. Success depends on both technical proficiency and soft skills like communication and problem-solving.";
            }

            // Validate skills array
            const skills = Array.isArray(career.skills) ?
                career.skills.filter(skill => typeof skill === 'string').slice(0, 10) :
                ["analytical skills", "communication", "problem-solving"];

            // Validate salary format for Indian Rupees
            let salary = typeof career.salary === 'string' ? career.salary : "Varies based on experience";
            if (!salary.includes("INR") && !salary.includes("₹")) {
                salary = salary + " INR per annum";
            }

            // Validate progression paths
            const progressionPaths = Array.isArray(career.progressionPaths) ?
                career.progressionPaths.map(path => {
                    // Validate path name
                    const pathName = typeof path.pathName === 'string' ?
                        path.pathName : "Career Progression";

                    // Validate stages
                    const stages = Array.isArray(path.stages) ?
                        path.stages.map(stage => {
                            return {
                                level: typeof stage.level === 'string' ? stage.level : "Career Level",
                                timeframe: typeof stage.timeframe === 'string' ? stage.timeframe : "1-2 years",
                                requiredSkills: Array.isArray(stage.requiredSkills) ?
                                    stage.requiredSkills.filter(skill => typeof skill === 'string') :
                                    ["relevant skills"],
                                salary: typeof stage.salary === 'string' ? stage.salary : "Competitive salary",
                                responsibilities: Array.isArray(stage.responsibilities) ?
                                    stage.responsibilities.filter(resp => typeof resp === 'string') :
                                    ["Key responsibilities"]
                            };
                        }) :
                        [{
                            level: "Entry Level",
                            timeframe: "1-2 years",
                            requiredSkills: ["basic skills"],
                            salary: "Entry level salary",
                            responsibilities: ["Basic responsibilities"]
                        }];

                    return { pathName, stages };
                }) :
                [{
                    pathName: "Standard Progression",
                    stages: [{
                        level: "Entry Level",
                        timeframe: "1-2 years",
                        requiredSkills: ["basic skills"],
                        salary: "Entry level salary",
                        responsibilities: ["Basic responsibilities"]
                    }]
                }];

            return {
                title,
                description,
                skills,
                salary,
                progressionPaths
            };
        });

        return { careerPaths: cleanCareerPaths };
    } catch (error) {
        console.error("Error validating output:", error);
        // Return fallback data structure
        return {
            careerPaths: [{
                title: "Technical Professional",
                description: "A technical professional role involves applying specialized knowledge in fields like IT, engineering, or science. This path requires continuous learning and adaptation to new technologies and methodologies. Success depends on both technical expertise and soft skills like problem-solving and communication. This career offers opportunities to work across various industries and often provides good work-life balance with competitive compensation.",
                skills: ["technical knowledge", "problem-solving", "analytical thinking", "communication"],
                salary: "₹4,00,000 - ₹25,00,000 per annum depending on experience",
                progressionPaths: [{
                    pathName: "Standard Progression",
                    stages: [{
                        level: "Entry Level Professional",
                        timeframe: "1-3 years",
                        requiredSkills: ["foundational skills", "technical knowledge"],
                        salary: "₹4,00,000 - ₹7,00,000 per annum",
                        responsibilities: ["Learning core processes", "Supporting senior team members"]
                    }]
                }]
            }]
        };
    }
}

app.post("/api/career-path", async (req, res) => {
    const { resumeText, email } = req.body;
    if (!resumeText) {
        return res.status(400).json({ error: "No resume text provided" });
    }

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const careerPaths = await getCareerPath(resumeText, email);
        res.json({ careerPaths });
    } catch (error) {
        console.error("Error processing career path:", error);
        res.status(500).json({
            error: "There was an issue processing your request",
            details: "Our career recommendation system is currently experiencing difficulties. Please try again later."
        });
    }
});

//**********************************************************chatbot code for career compass****************************** */



// Create Chat History Schema and Model
const chatSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    conversations: [{
        timestamp: { type: Date, default: Date.now },
        userMessage: String,
        botResponse: String
    }]
});

const ChatHistory = mongoose.model('ChatHistory', chatSchema);

// Chat memory service
const chatMemoryService = {
    // Get chat history for a user
    getChatHistory: async (email) => {
        try {
            const userHistory = await ChatHistory.findOne({ email });
            if (!userHistory) return [];

            // Return all conversations (up to 10 max)
            return userHistory.conversations.slice(-10);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }
    },

    // Save a conversation to the user's history
    saveConversation: async (email, userMessage, botResponse) => {
        try {
            // Find user history or create if doesn't exist
            let userHistory = await ChatHistory.findOne({ email });

            if (!userHistory) {
                userHistory = new ChatHistory({
                    email,
                    conversations: []
                });
            }

            // Add new conversation
            userHistory.conversations.push({
                timestamp: new Date(),
                userMessage,
                botResponse
            });

            // Keep only the most recent 10 conversations in storage
            if (userHistory.conversations.length > 10) {
                userHistory.conversations = userHistory.conversations.slice(-10);
            }

            await userHistory.save();
            return userHistory.conversations;
        } catch (error) {
            console.error('Error saving conversation:', error);
            throw error;
        }
    }
};

// Routes
app.post('/api/chat', async (req, res) => {
    try {
        const { email, message, summary } = req.body;

        if (!email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Email and message are required'
            });
        }

        // Get chat history for context - will return up to 10 most recent conversations
        const chatHistory = await chatMemoryService.getChatHistory(email);

        // Build context from previous conversations - using all available (up to 10)
        let prompt = `You are Career Compass, a career advice chatbot.This is just for your refernce asumme this paths is reccomended by you to user ####${summary}#### Be helpful, supportive and provide actionable advice. Important: give shorter responses please`;

        if (chatHistory.length > 0) {
            prompt += "\n\nPrevious conversation:\n" +
                chatHistory.map(entry =>
                    `User: ${entry.userMessage}\nCareer Compass: ${entry.botResponse}`
                ).join('\n\n');
        }

        prompt += `\n\nCurrent user (${email}) message: ${message}\n\nCareer Compass:`;

        // Generate response from Gemini
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Store the conversation
        await chatMemoryService.saveConversation(email, message, response);

        console.log(prompt)

        res.json({
            success: true,
            response: response
        });
    } catch (error) {
        console.error('Error processing chat request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process your request',
            details: error.message
        });
    }
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});


app.get('/api/summary/:email', async (req, res) => {

    const { email } = req.params;
    const user = await User.findOne({ email: email })

    return res.json({ summary: user.userProfileSummary })
})
//**********************************************************chatbot end for career compass****************************** */




/*                    ***************************LLm response verifier*///////////////////////////////////////////////////////////
const GROQ_API_KEY = "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"; // Store API Key in .env
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.post("/chat", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        // First, get the evaluation from the model
        const response = await axios.post(
            API_URL,
            {
                model: "llama3-70b-8192", // Using a different model that may follow instructions better
                messages: [
                    {
                        role: "system",
                        content: "You are evaluating interview feedback. Respond with ONLY the word 'Yes' or 'No' without any additional text, quotes, or explanation."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 10, // We only need a short response
                temperature: 0.1, // Very low temperature for consistent output
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const aiResponse = response.data.choices[0].message.content.trim();

        // Extract just "Yes" or "No" from the response
        let result = "Unknown";
        if (aiResponse.toLowerCase().includes("yes")) {
            result = "Yes";
        } else if (aiResponse.toLowerCase().includes("no")) {
            result = "No";
        }

        // Create our own JSON response
        const jsonResponse = { response: result, raw: aiResponse };
        res.json(jsonResponse);

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});
/*                    ***************************LLm response verifier*///////////////////////////////////////////////////////////

// start *******************************************llama versatile 70b model LLM 


app.post("/prompt", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        // First, get the evaluation from the model
        const response = await axios.post(
            API_URL,
            {
                model: "llama-3.3-70b-versatile", // Using a different model that may follow instructions better
                messages: [
                    {
                        role: "system",
                        content: ""
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                // We only need a short response
                temperature: 0.8, // Very low temperature for consistent output
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const aiResponse = response.data.choices[0].message.content.trim();



        // Create our own JSON response
        const jsonResponse = { response: aiResponse, raw: aiResponse };
        console.log(jsonResponse)
        res.json(jsonResponse);

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// end *******************************************end llama versatile 70b model LLM 




////// resume recomendations using llm start 

app.post('/recommendations', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find the resume analysis data for the given email
        const resumeData = await User.findOne({ email }).sort({ createdAt: -1 });

        if (!resumeData) {
            return res.status(404).json({ error: 'No resume analysis found for this email' });
        }

        // Prepare the prompt for the LLM
        const promptData = {
            prompt: `Generate 7-8 actionable recommendations for improving a resume based on the following analysis:
        
  Overall Score: ${resumeData.resume_analysis_data.final}/100
  Hard Skills Match: ${resumeData.resume_analysis_data.hsp}/100
  Soft Skills Match: ${resumeData.resume_analysis_data.ssp}/100
  Word Count: ${resumeData.resume_analysis_data.word_count} (Word Count Score: ${resumeData.resume_analysis_data.wcp}/100)
  
  Present Skills: ${resumeData.resume_analysis_data.match_hard.join(', ')}
  Missing Skills: ${resumeData.resume_analysis_data.missing_hard.join(', ')}
  Present Soft Skills: ${resumeData.resume_analysis_data.match_soft.join(', ')}
  Missing Soft Skills: ${resumeData.resume_analysis_data.missing_soft.length > 0 ? resumeData.resume_analysis_data.missing_soft.join(', ') : 'None'}
  
  Sections Found: ${resumeData.resume_analysis_data.sections.join(', ')}
  Spelling/Grammar Corrections Needed: ${resumeData.resume_analysis_data.corrections.length}
  Important : dont mention anything about the structure of resume because i am just sharing the extracted information 
  Please return your response in JSON format with an array of recommendation statements. Each statement should be specific, actionable, and directly tied to improving the resume based on the analysis. Focus on the missing skills, any low scores, and potential improvements to structure and content.
  
  Format your response like this:
  {
    "recommendations": [
      "Recommendation 1",
      "Recommendation 2",
      ...
    ]
  }
  `
        };

        // Call the LLM API
        const llmResponse = await axios.post('http://localhost:2000/prompt', promptData);

        // Extract the actual response content
        let responseContent = llmResponse.data.response || llmResponse.data;

        // Handle code blocks in the response (remove markdown formatting)
        if (typeof responseContent === 'string') {
            responseContent = responseContent.replace(/```(?:json)?\n|\n```/g, '');
        }

        // Parse the JSON response
        let recommendations;
        try {
            if (typeof responseContent === 'string') {
                recommendations = JSON.parse(responseContent);
            } else {
                recommendations = responseContent;
            }

            // Save recommendations to the database
            resumeData.resume_recommendations = recommendations.recommendations;
            await resumeData.save();

            return res.status(200).json({
                message: 'Recommendations generated and saved successfully',
                recommendations: recommendations.recommendations
            });
        } catch (e) {
            console.error('Error parsing LLM response:', e);
            return res.status(500).json({
                error: 'Invalid response format from LLM API',
                rawResponse: responseContent
            });
        }
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return res.status(500).json({ error: 'Error generating recommendations', details: error.message });
    }
});
// Route to get all resume analyses for an email
app.get('/analyses/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const analyses = await User.findOne({ email }, "resume_recommendations")
        res.json({ data: analyses.resume_recommendations, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
////// resume recomendations using llm end





/////extra

const NEW_GEMINI_API_KEY = "AIzaSyCpOz987KQ6EHbEuhmiLzPi28XkTMzT02Q";
const newgenAI = new GoogleGenerativeAI(NEW_GEMINI_API_KEY);
const new_model = newgenAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.post("/gemini-prompt", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const result = await new_model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        const jsonResponse = { response: text, raw: text };
        console.log(jsonResponse);
        res.json(jsonResponse);

    } catch (error) {
        console.error("Error:", error?.message || error);
        res.status(500).json({ error: "Something went wrong" });
    }
});


const PORT = 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));