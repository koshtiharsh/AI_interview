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

    userProfileSummary: {
        type: String,
        default: ""
    },

    recommendationFeedback: [{
        careerTitle: String,
        rating: Number,
        feedback: String,
        timestamp: String,
        recommendationId: String
    }],
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






/// aggreation pipeline for feedback
async function getCareerPath(resumeText, email) {
    try {
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
        and description of each should be in 100 words minimum. The Nubmer of careers should be 5 five not less not more please .
        
        Resume: ${resumeText}
        
        ${feedbackSummary ? `User Feedback Context: ${feedbackSummary}` : ''}
        
        ${likedCareers.length > 0 ?
                `Please recommend careers similar to these positively rated careers: ${likedCareers.map(c => c.title).join(', ')}` : ''}
        
        ${dislikedCareers.length > 0 ?
                `Please avoid recommending careers similar to these negatively rated careers: ${dislikedCareers.map(c => c.title).join(', ')}` : ''}
        
        For each career path, include multiple career progression paths. Each should be described with stages from entry-level (mention the job role) to leadership, including timelines, skills required, and salary progression in Indian Rupees give it randomly 3 -5 number of progressions. Give me different paths like some traditional , some specialization and one more anything you thing is imp .
        
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
                  "pathName": "Career Progression Paths",
                  "stages": [
                    {
                      "level": "or can have job role",
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
        console.log(prompt)

        // Clean up the response - remove markdown code blocks if present
        let cleanedResponse = responseText;
        // Check if the response is wrapped in markdown code blocks (```json ... ```)
        const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const match = responseText.match(jsonBlockRegex);
        if (match && match[1]) {
            // Extract only the JSON content from between the code blocks
            cleanedResponse = match[1];
        }


        addSummarizeDataToDB(email, JSON.stringify(JSON.parse(cleanedResponse)))
            .catch(err => console.error("Background summary process failed:", err));

        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error("Error in getCareerPath:", error);
        throw new Error(`Failed to process career path: ${error.message}`);
    }
}

// Helper function to extract common themes from feedback
function summarizeFeedbackThemes(careerFeedback) {
    if (!careerFeedback || careerFeedback.length === 0) return "No data available";

    // Extract common keywords or phrases from feedback
    // This is a simplified approach - in production you might use NLP
    const feedbackText = careerFeedback.map(item => item.feedback).join(' ').toLowerCase();

    const positiveKeywords = ['like', 'good', 'excellent', 'interested', 'passion'];
    const negativeKeywords = ['dislike', 'bad', 'not interested', 'boring', 'difficult'];

    const foundPositive = positiveKeywords.filter(word => feedbackText.includes(word));
    const foundNegative = negativeKeywords.filter(word => feedbackText.includes(word));

    return foundPositive.length > 0 ?
        `Positive mentions of ${foundPositive.join(', ')}` :
        foundNegative.length > 0 ?
            `Negative mentions of ${foundNegative.join(', ')}` :
            "Mixed feedback";
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
            error: error.message,
            details: "There was an issue processing your request with the AI model"
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



const PORT = 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));