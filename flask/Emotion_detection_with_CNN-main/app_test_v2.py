from flask import Flask, request, jsonify, render_template, redirect, session, url_for
from flask_pymongo import PyMongo
from flask_socketio import SocketIO
import google.generativeai as genai
import random
import json
import datetime
from typing import Dict, List, Tuple, Optional, Any
import os
import re
import logging
from flask_cors import CORS
from bson import json_util
import hashlib
import time
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("interview_app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "interview-app-secret-key")
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, resources={r"/*": {"origins": "*"}})

# Rate limiter to prevent abuse
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# MongoDB setup
MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti")
app.config["MONGO_URI"] = MONGO_URI
mongo = PyMongo(app)
user_collection = mongo.db.userData
feedback_collection = mongo.db.feedbackData  # New collection for system feedback

# Gemini API setup
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAkc9L05OE3Nnlvkk15QxfwT7EDoFSzWug")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

# Cache with TTL (time-to-live)
class TimedCache:
    def __init__(self, ttl=3600):  # Default TTL: 1 hour
        self.cache = {}
        self.ttl = ttl
    
    def get(self, key):
        if key in self.cache:
            data, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return data
            else:
                # Expired
                del self.cache[key]
        return None
    
    def set(self, key, value):
        self.cache[key] = (value, time.time())
    
    def delete(self, key):
        if key in self.cache:
            del self.cache[key]

# Initialize cache
user_questions_cache = TimedCache(ttl=7200)  # 2 hour TTL

class InterviewQuestionManager:
    """Class to handle interview question generation and management"""
    
    @staticmethod
    def extract_json_from_text(text: str) -> Optional[dict]:
        """Extract JSON from text that might contain markdown or other content"""
        # Try to find JSON content between code blocks
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if json_match:
            json_str = json_match.group(1)
        else:
            # If no code blocks, use the entire text
            json_str = text
        
        # Clean the string to ensure it's valid JSON
        # Remove any non-JSON content at the beginning or end
        json_str = re.sub(r'^[^{]*', '', json_str)
        json_str = re.sub(r'[^}]*$', '', json_str)
        
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            # If still can't parse, return None
            logger.error(f"Failed to parse JSON: {json_str[:200]}...")
            return None

    @staticmethod
    def generate_hr_questions(num_questions=5, job_role="Software Engineer", experience_level="Mid-level"):
        """Generate HR interview questions using Gemini API with improved context"""
        prompt = f"""Generate {num_questions} unique HR interview questions for a {experience_level} {job_role} position. 
        For each question, provide:
        1. The question text (first question should be tell me about yourself)
        2. A list of 5-7 key points that should be covered in an ideal answer
        3. An example ideal answer (150-200 words)
        4. A difficulty rating (1-5 where 5 is most difficult)
        5. Skills being assessed by this question
        
        Include a mix of behavioral, situational, and competency-based questions.
        
        Format your response as a valid JSON object with the following structure:
        ```json
        {{
          "questions": [
            {{
              "question": "Question text here",
              "key_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
              "ideal_answer": "Ideal answer text here",
              "difficulty": 3,
              "skills_assessed": ["Communication", "Self-awareness", "Experience"]
            }},
            // more questions...
          ]
        }}
        ```
        
        Ensure your response can be directly parsed as JSON. Do not include any explanatory text before or after the JSON.
        """
        
        retry_count = 0
        max_retries = 3
        
        while retry_count < max_retries:
            try:
                response = model.generate_content(prompt)
                response_text = response.text
                
                # Try to parse the response as JSON
                parsed_data = InterviewQuestionManager.extract_json_from_text(response_text)
                
                if parsed_data and "questions" in parsed_data:
                    # Ensure we have the right number of questions
                    if len(parsed_data["questions"]) >= num_questions:
                        return parsed_data["questions"][:num_questions]  # Trim if more questions returned
                    else:
                        # Not enough questions, retry
                        logger.warning(f"Not enough questions generated, got {len(parsed_data['questions'])}, expected {num_questions}")
                        retry_count += 1
                        continue
                else:
                    logger.error(f"Invalid response format. Response: {response_text[:200]}...")
                    retry_count += 1
                    continue
                    
            except Exception as e:
                logger.error(f"Error generating questions: {e}")
                if 'response' in locals():
                    logger.error(f"Response received: {response.text[:200]}")
                retry_count += 1
        
        # Fallback to default questions if API fails after retries
        logger.warning("Using fallback questions after API failure")
        return InterviewQuestionManager.get_fallback_questions(job_role, experience_level)
    
    @staticmethod
    def get_fallback_questions(job_role, experience_level):
        """Return fallback questions if the API fails"""
        # Basic template
        questions = [
            {
                "question": "Tell me about yourself.",
                "key_points": [
                    "Professional background",
                    "Educational background",
                    "Technical skills",
                    "Professional development",
                    "Quantifiable achievements",
                    "Personal interests",
                    "Career objectives"
                ],
                "ideal_answer": "I am a software engineer with 5 years of experience in full-stack development, specializing in cloud-native applications. My expertise includes React, Node.js, and AWS services. In my current role at XYZ Tech, I've led the development of a microservices architecture that reduced deployment time by 60% and improved scalability during peak traffic periods. Previously, I contributed to an open-source project that simplifies API integration for small businesses. I have a computer science degree from State University and recently completed a machine learning certification. Outside work, I enjoy contributing to tech communities through mentorship and occasional technical blogging. I'm looking for opportunities to apply my backend expertise to solve complex problems while continuing to grow as a technical leader.",
                "difficulty": 2,
                "skills_assessed": ["Communication", "Self-awareness", "Experience"]
            },
            {
                "question": "What are your strengths?",
                "key_points": [
                    "Technical abilities",
                    "Soft skills",
                    "Specific examples",
                    "Quantifiable results",
                    "Relevance to job"
                ],
                "ideal_answer": "My greatest strengths include problem-solving, adaptability, and technical expertise in full-stack development. I excel at breaking down complex problems into manageable components, which helped me redesign a critical payment system that reduced processing errors by 35% in my previous role. I adapt quickly to new technologies and methodologies, having successfully transitioned our team from a traditional development approach to an agile framework in just two months. My technical proficiency in React and Node.js allowed me to optimize our client application, improving load times by 40%. I believe these strengths would be particularly valuable for this role, as they align with your needs for someone who can tackle challenging technical problems while collaborating effectively with cross-functional teams.",
                "difficulty": 2,
                "skills_assessed": ["Self-awareness", "Confidence", "Job fit"]
            },
            {
                "question": "Where do you see yourself in 5 years?",
                "key_points": [
                    "Career progression",
                    "Skill development",
                    "Alignment with company goals",
                    "Leadership aspirations",
                    "Realistic expectations"
                ],
                "ideal_answer": "In five years, I see myself having grown into a technical leadership role where I can guide development teams while maintaining hands-on involvement with cutting-edge technologies. I plan to deepen my expertise in cloud architecture and AI integration, becoming a subject matter expert who can bridge technical solutions with business needs. I hope to have contributed significantly to product innovation, perhaps having led the development of features that become core to your platform's competitive advantage. I'm also committed to mentoring junior developers, as I believe building strong teams is essential for long-term success. While I have these aspirations, I understand that career paths evolve, and I'm open to opportunities that might arise as both my skills and the company's needs develop.",
                "difficulty": 3,
                "skills_assessed": ["Ambition", "Planning", "Company fit"]
            },
            {
                "question": "What is your greatest weakness?",
                "key_points": [
                    "Genuine weakness",
                    "Self-awareness", 
                    "Improvement efforts",
                    "Professional context",
                    "Growth mindset"
                ],
                "ideal_answer": "One area I've been actively working to improve is my tendency to dive deep into technical details before fully communicating the high-level plan to stakeholders. Earlier in my career, this sometimes led to misaligned expectations. I recognized this weakness after receiving feedback during a project retrospective last year. Since then, I've implemented a structured approach where I create a brief overview document before starting complex tasks, which I review with relevant team members. I've also joined a communication workshop and practice explaining technical concepts to non-technical friends. These steps have already yielded positive results—in my last project, our product manager specifically noted how clear my implementation plan was, and how it helped align everyone's expectations from the start. It's still something I consciously monitor, but I've seen significant improvement.",
                "difficulty": 3,
                "skills_assessed": ["Self-awareness", "Growth mindset", "Honesty"]
            },
            {
                "question": "Why should we hire you?",
                "key_points": [
                    "Technical fit",
                    "Cultural fit",
                    "Unique selling proposition",
                    "Problem-solving ability",
                    "Performance track record"
                ],
                "ideal_answer": "You should hire me because I bring a unique combination of technical expertise and proven experience that aligns perfectly with what you're looking for. My five years of experience with the exact tech stack you use—React, Node.js, and AWS—means I can contribute immediately without a steep learning curve. In my current role, I improved application performance by 40% and reduced infrastructure costs by 25% through cloud optimization techniques similar to what you'd need here. Beyond technical skills, I thrive in collaborative environments and have experience mentoring junior developers, which I understand is important for your growing team. What sets me apart is my track record of translating business requirements into technical solutions, as evidenced by the customer portal I developed that increased user engagement by 60%. I'm excited about your company's mission to revolutionize healthcare technology, and I'm confident I can help you achieve your goals.",
                "difficulty": 4,
                "skills_assessed": ["Value proposition", "Confidence", "Job fit"]
            }
        ]
        
        # Customize based on job role
        if "Data" in job_role:
            questions[2]["question"] = "Describe a complex data analysis project you've worked on."
        elif "Manager" in job_role or "Lead" in job_role:
            questions[2]["question"] = "How do you manage team conflicts?"
        
        # Adjust difficulty based on experience level
        if experience_level == "Senior" or experience_level == "Lead":
            for q in questions:
                q["difficulty"] = min(5, q["difficulty"] + 1)
        elif experience_level == "Junior" or experience_level == "Entry":
            for q in questions:
                q["difficulty"] = max(1, q["difficulty"] - 1)
                
        return questions

    @staticmethod
    def evaluate_response(question, user_answer, question_details):
        """Evaluate the user's answer to a question using Gemini API with enhanced criteria"""
        # Ensure user_answer is not too long (Gemini has context limits)
        max_answer_length = 1000  # Characters
        if len(user_answer) > max_answer_length:
            user_answer = user_answer[:max_answer_length] + "..."
            
        prompt = f"""Evaluate this interview response for the following HR question:
        
        Question: "{question}"
        
        Expected key points: {json.dumps(question_details['key_points'])}
        
        User's answer: "{user_answer}"
        
        Ideal answer reference: "{question_details['ideal_answer']}"
        
        Provide a comprehensive evaluation with:
        1. 5-7 specific pieces of feedback (bullet points)
        2. A numerical score from 0-100
        3. Which key points were addressed (matching_points)
        4. Which key points were missed (missing_points)
        5. 2-3 strengths of the answer
        6. 2-3 areas for improvement
        7. Any red flags noticed in the response
        8. A confidence score (0-100) of how likely this candidate would pass to the next round
        
        Format your response as a valid JSON object with the following structure:
        ```json
        {{
          "feedback": ["Feedback point 1", "Feedback point 2", ...],
          "score": 75,
          "matching_points": ["Point 1", "Point 2", ...],
          "missing_points": ["Point 3", "Point 4", ...],
          "strengths": ["strength 1", "strength 2"],
          "improvement_areas": ["area 1", "area 2"],
          "red_flags": ["red flag 1", "red flag 2"],
          "next_round_confidence": 65
        }}
        ```
        
        Ensure your response can be directly parsed as JSON. Do not include any explanatory text before or after the JSON.
        """
        
        retry_count = 0
        max_retries = 3
        
        while retry_count < max_retries:
            try:
                response = model.generate_content(prompt)
                parsed_data = InterviewQuestionManager.extract_json_from_text(response.text)
                
                if parsed_data:
                    # Add some context
                    parsed_data["question"] = question
                    parsed_data["user_answer"] = user_answer
                    parsed_data["ideal_answer"] = question_details.get("ideal_answer", "")
                    parsed_data["timestamp"] = datetime.datetime.utcnow()
                    
                    # Ensure all fields exist
                    if "feedback" not in parsed_data:
                        parsed_data["feedback"] = ["No specific feedback provided."]
                    if "score" not in parsed_data:
                        parsed_data["score"] = 50
                    if "matching_points" not in parsed_data:
                        parsed_data["matching_points"] = []
                    if "missing_points" not in parsed_data:
                        parsed_data["missing_points"] = question_details['key_points']
                    if "strengths" not in parsed_data:
                        parsed_data["strengths"] = ["Unable to determine"]
                    if "improvement_areas" not in parsed_data:
                        parsed_data["improvement_areas"] = ["Unable to determine"]
                    if "red_flags" not in parsed_data:
                        parsed_data["red_flags"] = []
                    if "next_round_confidence" not in parsed_data:
                        parsed_data["next_round_confidence"] = 50
                        
                    return parsed_data
                else:
                    logger.error(f"Invalid evaluation format. Response: {response.text[:200]}...")
                    retry_count += 1
                    
            except Exception as e:
                logger.error(f"Error evaluating response: {e}")
                retry_count += 1
        
        # Fallback basic evaluation after retries
        logger.warning("Using fallback evaluation after API failure")
        return {
            "feedback": ["Unable to generate detailed feedback due to API error."],
            "score": 50,
            "matching_points": [],
            "missing_points": question_details['key_points'],
            "strengths": ["Unable to determine"],
            "improvement_areas": ["Unable to determine"],
            "red_flags": [],
            "next_round_confidence": 40,
            "question": question,
            "user_answer": user_answer,
            "ideal_answer": question_details.get("ideal_answer", ""),
            "timestamp": datetime.datetime.utcnow()
        }

def get_user_questions(email, job_role="Software Engineer", experience_level="Mid-level"):
    """Get or generate questions for a specific user"""
    # Create a unique cache key that includes job role and experience level
    cache_key = f"{email}_{job_role}_{experience_level}"
    
    # Try to get from cache
    user_data = user_questions_cache.get(cache_key)
    
    if not user_data:
        # Generate new questions for this user
        questions = InterviewQuestionManager.generate_hr_questions(
            num_questions=5, 
            job_role=job_role,
            experience_level=experience_level
        )
        
        user_data = {
            "question_count": 0,
            "questions": questions,
            "job_role": job_role,
            "experience_level": experience_level,
            "start_time": datetime.datetime.utcnow()
        }
        
        # Store in cache
        user_questions_cache.set(cache_key, user_data)
    
    return user_data

@socketio.on('request_question')
@limiter.limit("20/minute")
def send_next_question(data):
    """Send the next question to the user or notify completion"""
    try:
        email = data['email']
        job_role = data.get('job_role', 'Software Engineer')
        experience_level = data.get('experience_level', 'Mid-level')
        
        # Get the user's questions or generate new ones
        user_data = get_user_questions(email, job_role, experience_level)
        
        # Get current question count and questions
        question_count = user_data["question_count"]
        questions = user_data["questions"]
        
        total_questions = 5  # Fixed at 5 questions per interview session
        
        # Check if user has completed all questions
        if question_count >= total_questions:
            socketio.emit('new_question', {
                'question': None,
                'questionNumber': total_questions,
                'totalQuestions': total_questions,
                'message': 'Congratulations! You have completed all interview questions. Check your feedback in the progress section.',
                'interview_finished': True
            })
            return
        
        # Get the next question
        current_question = questions[question_count]
        
        # Emit the question to the user
        socketio.emit('new_question', {
            'question': current_question["question"],
            'questionNumber': question_count + 1,
            'totalQuestions': total_questions,
            'difficulty': current_question.get("difficulty", 3),
            'skills_assessed': current_question.get("skills_assessed", [])
        })
        
        # Update question count in the cache
        cache_key = f"{email}_{job_role}_{experience_level}"
        user_data["question_count"] = question_count + 1
        user_questions_cache.set(cache_key, user_data)
        
        # Log activity
        logger.info(f"Question {question_count + 1} sent to {email} for {job_role} position")
    
    except KeyError as e:
        logger.error(f"Key error in send_next_question: {e}")
        socketio.emit('error', {'message': 'Required information missing.'})
    except Exception as e:
        logger.error(f"Unexpected error in send_next_question: {e}")
        socketio.emit('error', {'message': f'An error occurred: {str(e)}'})

@socketio.on('send_transcript')
@limiter.limit("20/minute")
def process_answer(data):
    """Process the user's answer and provide feedback"""
    try:
        start_time = time.time()
        logger.info(f"Processing answer from {data.get('email', 'unknown user')}")
        
        question = data.get('hrQuestion')
        user_answer = data.get('transcript')
        email = data.get('email')
        job_role = data.get('job_role', 'Software Engineer')
        experience_level = data.get('experience_level', 'Mid-level')

        # Validate required data
        if not (email and question and user_answer):
            socketio.emit('error', {'message': 'Missing required fields: email, question, or answer'})
            return

        # Get the question details from cache
        cache_key = f"{email}_{job_role}_{experience_level}"
        user_data = user_questions_cache.get(cache_key)
        
        if not user_data:
            socketio.emit('error', {'message': 'Session expired. Please refresh the page.'})
            return

        # Find the question in the user's session data
        question_details = next((q for q in user_data.get("questions", []) if q.get("question") == question), None)
        if not question_details:
            socketio.emit('error', {'message': 'Question not found in session.'})
            return

        # Evaluate the answer
        evaluation = InterviewQuestionManager.evaluate_response(question, user_answer, question_details)
        
        # Add metadata to the evaluation
        evaluation.update({
            "question": question,
            "user_answer": user_answer,
            "ideal_answer": question_details.get("ideal_answer", ""),
            "timestamp": datetime.datetime.utcnow(),
            "job_role": job_role,
            "experience_level": experience_level,
            "difficulty": question_details.get("difficulty", 3),
            "skills_assessed": question_details.get("skills_assessed", [])
        })

        # Check if the user exists and if the question is already present
        user = user_collection.find_one({'email': email, 'hrQuestions.question': question})

        if user and any(q.get('question') == question for q in user.get('hrQuestions', [])):
            # If question exists, update only the existing entry
            user_collection.update_one(
                {'email': email, 'hrQuestions.question': question},
                {"$set": {
                    "hrQuestions.$.user_answer": user_answer,
                    "hrQuestions.$.feedback": evaluation.get("feedback", []),
                    "hrQuestions.$.score": evaluation.get("score", 0),
                    "hrQuestions.$.matching_points": evaluation.get("matching_points", []),
                    "hrQuestions.$.missing_points": evaluation.get("missing_points", []),
                    "hrQuestions.$.strengths": evaluation.get("strengths", []),
                    "hrQuestions.$.improvement_areas": evaluation.get("improvement_areas", []),
                    "hrQuestions.$.red_flags": evaluation.get("red_flags", []),
                    "hrQuestions.$.next_round_confidence": evaluation.get("next_round_confidence", 50),
                    "hrQuestions.$.ideal_answer": question_details.get('ideal_answer', ''),
                    "hrQuestions.$.job_role": job_role,
                    "hrQuestions.$.experience_level": experience_level,
                    "hrQuestions.$.difficulty": question_details.get("difficulty", 3),
                    "hrQuestions.$.skills_assessed": question_details.get("skills_assessed", []),
                    "hrQuestions.$.timestamp": evaluation["timestamp"]
                }}
            )
        else:
            # If the question doesn't exist, insert it
            user_collection.update_one(
                {'email': email},
                {'$push': {'hrQuestions': evaluation}},
                upsert=True  # Ensures a new document is created if the user doesn't exist
            )

        # Calculate processing time and log it
        processing_time = time.time() - start_time
        logger.info(f"Answer processed in {processing_time:.2f} seconds with score {evaluation.get('score', 0)}")
        
        # Store usage metrics
        feedback_collection.insert_one({
            "type": "answer_processing",
            "email": email,
            "processing_time": processing_time,
            "score": evaluation.get("score", 0),
            "timestamp": datetime.datetime.utcnow(),
            "job_role": job_role,
            "question_type": question
        })

        # Send feedback to the user
        socketio.emit('answer_feedback', {
            'feedback': evaluation.get("feedback", []),
            'score': evaluation.get("score", 0),
            'strengths': evaluation.get("strengths", []),
            'improvement_areas': evaluation.get("improvement_areas", []),
            'matching_points': evaluation.get("matching_points", []),
            'missing_points': evaluation.get("missing_points", []),
            'next_round_confidence': evaluation.get("next_round_confidence", 50)
        })

    except Exception as e:
        logger.error(f"Error processing answer: {e}")
        socketio.emit('error', {'message': f'An error occurred processing your answer: {str(e)}'})

@app.route('/api/interview_status/<email>', methods=['GET'])
@limiter.limit("30/minute")
def get_interview_status(email):
    """Check if a user has completed all interview questions"""
    try:
        # Get job role and experience level from query parameters
        job_role = request.args.get('job_role', 'Software Engineer')
        experience_level = request.args.get('experience_level', 'Mid-level')
        
        user = user_collection.find_one({'email': email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get HR questions for this user
        hr_questions = user.get('hrQuestions', [])
        
        # Filter questions by job role and experience level if specified
        if job_role or experience_level:
            filtered_questions = [
                q for q in hr_questions 
                if (not job_role or q.get('job_role') == job_role) and 
                   (not experience_level or q.get('experience_level') == experience_level)
            ]
        else:
            filtered_questions = hr_questions
        
        completed_questions = len(filtered_questions)
        total_questions = 5  # Fixed at 5 questions
        
        # Calculate average score if questions are completed
        avg_score = 0
        if completed_questions > 0:
            avg_score = sum(q.get('score', 0) for q in filtered_questions) / completed_questions
        
        # Get any ongoing interview session
        cache_key = f"{email}_{job_role}_{experience_level}"
        user_data = user_questions_cache.get(cache_key)
        
        # Calculate time spent if session exists
        time_spent = None
        if user_data and 'start_time' in user_data:
            time_spent = (datetime.datetime.utcnow() - user_data['start_time']).total_seconds()
        
        return jsonify({
            "completed": completed_questions,
            "total": total_questions,
            "is_complete": completed_questions >= total_questions,
            "remaining": max(0, total_questions - completed_questions),
            "avg_score": round(avg_score, 1),
            "time_spent": time_spent
        })
    
    except Exception as e:
        logger.error(f"Error getting interview status: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/user_feedback/<email>', methods=['GET'])
@limiter.limit("30/minute")
def get_user_feedback(email):
    """Fetch all HR question feedback for a given user by email with filtering options"""
    try:
        # Get filter parameters
        job_role = request.args.get('job_role')
        experience_level = request.args.get('experience_level')
        min_score = request.args.get('min_score')
        max_score = request.args.get('max_score')
        
        # Find the user by email
        user = user_collection.find_one({'email': email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Extract hrQuestions from the user document
        hr_questions = user.get('hrQuestions', [])
        
        if not hr_questions:
            return jsonify({"feedback": []}), 200
        
        # Apply filters
        filtered_questions = hr_questions
        
        if job_role:
            filtered_questions = [q for q in filtered_questions if q.get('job_role') == job_role]
        
        if experience_level:
            filtered_questions = [q for q in filtered_questions if q.get('experience_level') == experience_level]
        
        if min_score:
            try:
                min_score_val = float(min_score)
                filtered_questions = [q for q in filtered_questions if q.get('score', 0) >= min_score_val]
            except ValueError:
                pass
        
        if max_score:
            try:
                max_score_val = float(max_score)
                filtered_questions = [q for q in filtered_questions if q.get('score', 0) <= max_score_val]
            except ValueError:
                pass
        
        # Ensure timestamps are in ISO format for JSON serialization
        for question in filtered_questions:
            if isinstance(question.get('timestamp'), datetime.datetime):
                question['timestamp'] = question['timestamp'].isoformat()
        
        # Calculate summary statistics
        total_questions = len(filtered_questions)
        avg_score = 0 if total_questions == 0 else sum(q.get('score', 0) for q in filtered_questions) / total_questions
        
        return jsonify({
            "feedback": filtered_questions,
            "summary": {
                "total_questions": total_questions,
                "avg_score": round(avg_score, 1)
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching user feedback: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/reset_interview/<email>', methods=['POST'])
def reset_interview(email):
    """Reset the interview progress for a user"""
    try:
        # Get job role and experience level from query parameters
        job_role = request.args.get('job_role', 'Software Engineer')
        experience_level = request.args.get('experience_level', 'Mid-level')
        
        # Create the cache key
        cache_key = f"{email}_{job_role}_{experience_level}"
        
        # Remove the user from the cache to generate new questions next time
        user_questions_cache.delete(cache_key)
        
        # Option to clear existing HR questions from the database
        clear_existing = request.args.get('clear_existing', 'false').lower() == 'true'
        if clear_existing:
            # Only remove questions matching the job role and experience level if specified
            if job_role and experience_level:
                user_collection.update_one(
                    {'email': email},
                    {'$pull': {'hrQuestions': {
                        'job_role': job_role,
                        'experience_level': experience_level
                    }}}
                )
            else:
                # Remove all questions if no filters specified
                user_collection.update_one(
                    {'email': email},
                    {'$set': {'hrQuestions': []}}
                )
        
        return jsonify({"success": True, "message": "Interview reset successfully"}), 200
    
    except Exception as e:
        logger.error(f"Error resetting interview: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/')
def homepage():
    return render_template('index.html')

@app.route('/interview_complete')
def interview_complete_page():
    """Show interview completion page"""
    email = request.args.get('email')
    if not email:
        return redirect('/')
    return render_template('interview_complete.html', email=email)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)