require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

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

const PORT = 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));