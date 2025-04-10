// server.js - Main Express server file
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// MongoDB connection
mongoose.connect('mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

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

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google Generative AI with hardcoded API key
const genAI = new GoogleGenerativeAI('AIzaSyAkc9L05OE3Nnlvkk15QxfwT7EDoFSzWug');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Chat memory service
const chatMemoryService = {
  // Get chat history for a user
  getChatHistory: async (email) => {
    try {
      const userHistory = await ChatHistory.findOne({ email });
      if (!userHistory) return [];
      
      // Return the last 5 conversations
      return userHistory.conversations.slice(-5);
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
      
      // Keep only the most recent 10 conversations
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
    const { email, message } = req.body;
    
    if (!email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and message are required' 
      });
    }

    // Get chat history for context
    const chatHistory = await chatMemoryService.getChatHistory(email);
    
    // Build context from previous conversations
    let prompt = "You are Career Compass, a career advice chatbot. Be helpful, supportive and provide actionable advice. IMportant: so give me shorter response please";
    
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

// Start server
app.listen(PORT, () => {
  console.log(`Career Compass Chatbot backend running on port ${PORT}`);
});