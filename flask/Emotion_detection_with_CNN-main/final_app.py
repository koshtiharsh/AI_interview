
from flask import Flask, request, jsonify, render_template, redirect
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, emit
import google.generativeai as genai
import random
import json
import datetime
from typing import Dict, List, Tuple
import os
import re
from flask_cors import CORS
import ats
import cv2
import numpy as np
import base64
from keras.models import model_from_json

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, resources={r"/*": {"origins": "*"}})
# MongoDB setup
app.config["MONGO_URI"] = "mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti"
mongo = PyMongo(app)
user_collection = mongo.db.userData




# emotion detection setpu

# Emotion detection model setup
emotion_dict = {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}
# Initialize as None
emotion_model = None
face_detector = None

def load_models():
    global emotion_model, face_detector
    # Only load if not already loaded
    if emotion_model is None:
        print("Loading emotion model...")
        with open('model/emotion_model.json', 'r') as json_file:
            emotion_model = model_from_json(json_file.read())
        emotion_model.load_weights("model/emotion_model.h5")
        
    if face_detector is None:
        print("Loading face detector...")
        face_detector = cv2.CascadeClassifier('haarcascades/haarcascade_frontalface_default.xml')

@socketio.on('image_frame')
def handle_image_frame(data):
    # Load models on first request
    load_models()
    
    # Extract image data and email from received data
    img_data = data.get('imgData')  # Image data in base64 format
    email = data.get('email')  # User email

    if not img_data or not email:
        emit('emotion_result', {"error": "Missing image data or email"})
        return

    # Decode the image
    img_data = base64.b64decode(img_data.split(',')[1])
    frame = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_COLOR)
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    num_faces = face_detector.detectMultiScale(gray_frame, scaleFactor=1.3, minNeighbors=5)

    results = []

    for (x, y, w, h) in num_faces:
        cropped_img = np.expand_dims(np.expand_dims(cv2.resize(gray_frame[y:y + h, x:x + w], (48, 48)), -1), 0)
        emotion_prediction = emotion_model.predict(cropped_img)
        maxindex = int(np.argmax(emotion_prediction))
        emotion = emotion_dict[maxindex]
        results.append(emotion)
        
        # Update the emotion count in the database based on the user's email
        if maxindex > 0:
            user_collection.find_one_and_update(
                {"email": email},  # Find the user by email
                {'$inc': {f'emotion.{emotion}': 1}}  # Increment the detected emotion count
            )

    # Emit result with detected emotions
    emit('emotion_result', {
        "detected_faces": len(num_faces),
        "emotions": results,
        "email": email  # Include email in response for tracking
    })
# Gemini API setup
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAkc9L05OE3Nnlvkk15QxfwT7EDoFSzWug")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model
model = genai.GenerativeModel('gemini-1.5-flash')

# Cache to store dynamically generated questions per user
# Structure: {email: {question_count: int, questions: []}}
# Cache to store dynamically generated questions per user
# Structure: {email: {question_count: int, questions: []}}
user_questions_cache = {}

def extract_json_from_text(text):
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
        return None

def generate_hr_questions(num_questions=5, job_role="Software Engineer"):
    """Generate HR interview questions using Gemini API"""
    prompt = f"""Generate {num_questions} unique HR interview questions for a {job_role} position. 
    For each question, provide:
    1. The question text (first question should be tell me about your self)
    2. A list of 5-7 key points that should be covered in an ideal answer
    3. An example ideal answer (150-200 words)
    
    Format your response as a valid JSON object with the following structure:
    ```json
    {{
      "questions": [
        {{
          "question": "Question text here",
          "key_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
          "ideal_answer": "Ideal answer text here"
        }},
        // more questions...
      ]
    }}
    ```
    
    Ensure your response can be directly parsed as JSON. Do not include any explanatory text before or after the JSON.
    """
    
    try:
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Try to parse the response as JSON
        parsed_data = extract_json_from_text(response_text)
        
        if parsed_data and "questions" in parsed_data:
            return parsed_data["questions"]
        else:
            print(f"Invalid response format. Response: {response_text[:200]}...")
            raise ValueError("Invalid response format from Gemini API")
            
    except Exception as e:
        print(f"Error generating questions: {e}")
        print(f"Response received: {response.text[:200] if 'response' in locals() else 'No response'}")
        
        # Fallback to default questions if API fails
        return [
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
                "ideal_answer": "I am a software engineer with 5 years of experience in full-stack development, specializing in cloud-native applications. My expertise includes React, Node.js, and AWS services. In my current role at XYZ Tech, I've led the development of a microservices architecture that reduced deployment time by 60% and improved scalability during peak traffic periods. Previously, I contributed to an open-source project that simplifies API integration for small businesses. I have a computer science degree from State University and recently completed a machine learning certification. Outside work, I enjoy contributing to tech communities through mentorship and occasional technical blogging. I'm looking for opportunities to apply my backend expertise to solve complex problems while continuing to grow as a technical leader."
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
                "ideal_answer": "My greatest strengths include problem-solving, adaptability, and technical expertise in full-stack development. I excel at breaking down complex problems into manageable components, which helped me redesign a critical payment system that reduced processing errors by 35% in my previous role. I adapt quickly to new technologies and methodologies, having successfully transitioned our team from a traditional development approach to an agile framework in just two months. My technical proficiency in React and Node.js allowed me to optimize our client application, improving load times by 40%. I believe these strengths would be particularly valuable for this role, as they align with your needs for someone who can tackle challenging technical problems while collaborating effectively with cross-functional teams."
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
                "ideal_answer": "In five years, I see myself having grown into a technical leadership role where I can guide development teams while maintaining hands-on involvement with cutting-edge technologies. I plan to deepen my expertise in cloud architecture and AI integration, becoming a subject matter expert who can bridge technical solutions with business needs. I hope to have contributed significantly to product innovation, perhaps having led the development of features that become core to your platform's competitive advantage. I'm also committed to mentoring junior developers, as I believe building strong teams is essential for long-term success. While I have these aspirations, I understand that career paths evolve, and I'm open to opportunities that might arise as both my skills and the company's needs develop."
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
                "ideal_answer": "One area I've been actively working to improve is my tendency to dive deep into technical details before fully communicating the high-level plan to stakeholders. Earlier in my career, this sometimes led to misaligned expectations. I recognized this weakness after receiving feedback during a project retrospective last year. Since then, I've implemented a structured approach where I create a brief overview document before starting complex tasks, which I review with relevant team members. I've also joined a communication workshop and practice explaining technical concepts to non-technical friends. These steps have already yielded positive results—in my last project, our product manager specifically noted how clear my implementation plan was, and how it helped align everyone's expectations from the start. It's still something I consciously monitor, but I've seen significant improvement."
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
                "ideal_answer": "You should hire me because I bring a unique combination of technical expertise and proven experience that aligns perfectly with what you're looking for. My five years of experience with the exact tech stack you use—React, Node.js, and AWS—means I can contribute immediately without a steep learning curve. In my current role, I improved application performance by 40% and reduced infrastructure costs by 25% through cloud optimization techniques similar to what you'd need here. Beyond technical skills, I thrive in collaborative environments and have experience mentoring junior developers, which I understand is important for your growing team. What sets me apart is my track record of translating business requirements into technical solutions, as evidenced by the customer portal I developed that increased user engagement by 60%. I'm excited about your company's mission to revolutionize healthcare technology, and I'm confident I can help you achieve your goals."
            }
        ]

def evaluate_response(question, user_answer, question_details):
    """Evaluate the user's answer to a question using Gemini API"""
    prompt = f"""Evaluate this interview response for the following HR question:
    
    Question: "{question}"
    
    Expected key points: {json.dumps(question_details['key_points'])}
    
    User's answer: "{user_answer}"
    
    Ideal answer reference: "{question_details['ideal_answer']}"
    
    Provide a comprehensive evaluation with:
    1. 5-7 pieces of specific feedback (bullet points)
    2. A numerical score from 0-100
    3. Which key points were addressed (matching_points)
    4. Which key points were missed (missing_points)
    5. 2-3 strengths of the answer
    6. 2-3 areas for improvement
    7. Any red flags noticed in the response
    
    Format your response as a valid JSON object with the following structure:
    ```json
    {{
      "feedback": ["Feedback point 1", "Feedback point 2", ...],
      "score": 75,
      "matching_points": ["Point 1", "Point 2", ...],
      "missing_points": ["Point 3", "Point 4", ...],
      "strengths": ["strength 1", "strength 2"],
      "improvement_areas": ["area 1", "area 2"],
      "red_flags_triggered": ["red flag 1", "red flag 2"]
    }}
    ```
    
    Ensure your response can be directly parsed as JSON. Do not include any explanatory text before or after the JSON.
    """
    
    try:
        response = model.generate_content(prompt)
        parsed_data = extract_json_from_text(response.text)
        
        if parsed_data:
            return parsed_data
        else:
            print(f"Invalid evaluation format. Response: {response.text[:200]}...")
            raise ValueError("Invalid evaluation format from Gemini API")
            
    except Exception as e:
        print(f"Error evaluating response: {e}")
        # Fallback basic evaluation
        return {
            "feedback": ["Unable to generate detailed feedback due to API error."],
            "score": 50,
            "matching_points": [],
            "missing_points": question_details['key_points'],
            "strengths": ["Unable to determine"],
            "improvement_areas": ["Unable to determine"],
            "red_flags_triggered": []
        }

def get_user_questions(email, job_role="Software Engineer"):
    """Get or generate questions for a specific user"""
    if email not in user_questions_cache:
        # Generate new questions for this user
        questions = generate_hr_questions(num_questions=5, job_role=job_role)
        user_questions_cache[email] = {
            "question_count": 0,
            "questions": questions
        }
    
    return user_questions_cache[email]

@socketio.on('request_question')
def send_next_question(data):
    """Send the next question to the user or notify completion"""
    try:
        email = data['email']
        job_role = data.get('job_role', 'Software Engineer')
        
        # Get the user's questions or generate new ones
        user_data = get_user_questions(email, job_role)
        
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
            'totalQuestions': total_questions
        })
        
        # Update question count in the cache
        user_questions_cache[email]["question_count"] = question_count + 1
    
    except KeyError as e:
        print(f"Key error: {e}")
        socketio.emit('error', {'message': 'Required information missing.'})
    except Exception as e:
        print(f"Unexpected error: {e}")
        socketio.emit('error', {'message': f'An error occurred: {str(e)}'})
        
@socketio.on('send_transcript')
def process_answer(data):
    """Process the user's answer and provide feedback"""
    try:
        print(data)
        question = data.get('hrQuestion')
        user_answer = data.get('transcript')
        email = data.get('email')
        overAllEmotion = data.get('overAllEmotion')
            
        # Validate required data
        if not (email and question and user_answer):
            print(f"Missing required fields for user {email}")
            socketio.emit('error', {'message': 'Missing required fields: email, question, or answer'})
            return

        print(f"Processing answer for user {email}")

        # Get the question details from cache
        user_data = user_questions_cache.get(email, None)
        if not user_data:
            print(f"Session expired for user {email}")
            socketio.emit('error', {'message': 'Session expired. Please refresh the page.'})
            return

        # Find the question in the user's session data
        question_details = next((q for q in user_data.get("questions", []) if q.get("question") == question), None)
        if not question_details:
            print(f"Question not found for user {email}")
            socketio.emit('error', {'message': 'Question not found in session.'})
            return

        print(f"Evaluating answer for user {email}")
        # Evaluate the answer
        evaluation = evaluate_response(question, user_answer, question_details)
        print("Full evaluation:", evaluation)
        
        # Store the score for adaptive question selection
        score = evaluation.get("score", 50)
        user_data["performance_scores"] = user_data.get("performance_scores", [])
        user_data["performance_scores"].append(score)
        
        # Update the difficulty for next questions based on performance
        current_difficulty = question_details.get("difficulty", "Medium")
        next_difficulty = determine_next_question_difficulty(score, current_difficulty)
        user_data["current_difficulty"] = next_difficulty
        
        print(f"User {email} score: {score}, next difficulty: {next_difficulty}")
        
        # If there are remaining questions, potentially adjust their difficulty
        remaining_q_count = len(user_data["questions"]) - user_data.get("question_count", 0)
        if remaining_q_count > 0:
            # Find appropriate difficulty questions for next selection
            difficulty_questions = [q for q in user_data["questions"] 
                                   if q.get("difficulty") == next_difficulty and 
                                   user_data["questions"].index(q) >= user_data.get("question_count", 0)]
            
            if difficulty_questions:
                # Reorder remaining questions to prioritize new difficulty level
                current_index = user_data.get("question_count", 0)
                next_questions = user_data["questions"][current_index:]
                next_questions.sort(key=lambda q: 0 if q.get("difficulty") == next_difficulty else 1)
                user_data["questions"] = user_data["questions"][:current_index] + next_questions

        # Add metadata to the evaluation
        evaluation.update({
            "question": question,
            "user_answer": user_answer,
            "difficulty": question_details.get("difficulty", "Medium"),
            "ideal_answer": question_details.get("ideal_answer", ""),
            "timestamp": datetime.datetime.utcnow(),
            "verified": False  # Initial verification status
        })

        print(f"Storing evaluation data for user {email}")
        # Store the evaluation in the database without waiting for verification
        store_hr_evaluation_in_db(email, question, evaluation, user_answer, overAllEmotion, question_details)

        print(f"Sending feedback to user {email}")
        # Send feedback to the user using the same structure
        socketio.emit('answer_feedback', {
            'feedback': evaluation.get("feedback", []),
            'score': evaluation.get("score", 0),
            'strengths': evaluation.get("strengths", []),
            'improvement_areas': evaluation.get("improvement_areas", []),
            'red_flags_triggered': evaluation.get("red_flags_triggered", []),
            'next_difficulty': next_difficulty
        })

        # Start asynchronous verification process
        # This runs in the background without blocking the main flow
        socketio.start_background_task(
            verify_hr_evaluation, 
            email, 
            question, 
            evaluation
        )

    except Exception as e:
        print(f"Error processing answer: {e}")
        traceback.print_exc()  # Add full stack trace for debugging
        socketio.emit('error', {'message': f'An error occurred processing your answer: {str(e)}'})

# Helper function to store HR evaluation in DB
def store_hr_evaluation_in_db(email, question, evaluation, user_answer, overAllEmotion, question_details):
    # Check if the user exists and if the question is already present
    user = user_collection.find_one({'email': email, 'hrQuestions.question': question})

    if user and any(q.get('question') == question for q in user.get('hrQuestions', [])):
        # If question exists, update only the existing entry
        user_collection.update_one(
            {'email': email, 'hrQuestions.question': question},
            {"$set": {
                "hrQuestions.$.user_answer": user_answer,
                "hrQuestions.$.overAllEmotion": overAllEmotion,
                "hrQuestions.$.feedback": evaluation.get("feedback", []),
                "hrQuestions.$.score": evaluation.get("score", 0),
                "hrQuestions.$.matching_points": evaluation.get("matching_points", []),
                "hrQuestions.$.missing_points": evaluation.get("missing_points", []),
                "hrQuestions.$.strengths": evaluation.get("strengths", []),
                "hrQuestions.$.improvement_areas": evaluation.get("improvement_areas", []),
                "hrQuestions.$.red_flags_triggered": evaluation.get("red_flags_triggered", []),
                "hrQuestions.$.difficulty": question_details.get('difficulty', 'Medium'),
                "hrQuestions.$.ideal_answer": question_details.get('ideal_answer', ''),
                "hrQuestions.$.timestamp": evaluation["timestamp"],
                "hrQuestions.$.verified": evaluation.get("verified", False)
            }}
        )
    else:
        # For new questions, we need to ensure the document structure is consistent
        question_document = {
            "question": question,
            "overAllEmotion": overAllEmotion,
            "user_answer": user_answer,
            "feedback": evaluation.get("feedback", []),
            "score": evaluation.get("score", 0),
            "matching_points": evaluation.get("matching_points", []),
            "missing_points": evaluation.get("missing_points", []),
            "strengths": evaluation.get("strengths", []),
            "improvement_areas": evaluation.get("improvement_areas", []),
            "red_flags_triggered": evaluation.get("red_flags_triggered", []),
            "difficulty": question_details.get('difficulty', 'Medium'),
            "ideal_answer": question_details.get('ideal_answer', ''),
            "timestamp": evaluation["timestamp"],
            "verified": evaluation.get("verified", False)
        }

        # If the question doesn't exist, insert the structured document
        user_collection.update_one(
            {'email': email},
            {'$push': {'hrQuestions': question_document}},
            upsert=True  # Ensures a new document is created if the user doesn't exist
        )

# Asynchronous verification function for HR questions
def verify_hr_evaluation(email, question, evaluation):
    try:
        print(f"Starting HR verification process for user {email}, question: {question}")
        
        # Prepare the prompt for verification
        verification_prompt = f"""
        Review this HR interview feedback for accuracy and fairness:
        
        Question: {evaluation.get('question')}
        User Answer: {evaluation.get('user_answer')}
        
        Feedback given:
        - Feedback: {evaluation.get('feedback', [])}
        - Score: {evaluation.get('score', 0)}
        - Strengths: {evaluation.get('strengths', [])}
        - Improvement areas: {evaluation.get('improvement_areas', [])}
        - Red flags triggered: {evaluation.get('red_flags_triggered', [])}
        
        Ideal answer: {evaluation.get('ideal_answer', 'Not specified')}
        
        Is this feedback accurate, fair, and helpful? Respond with ONLY 'Yes' or 'No'.
        """
        
        # Call your verification API with the prompt
        import requests
        response = requests.post(
            "http://localhost:2000/chat",  # Replace with your actual endpoint
            json={"prompt": verification_prompt},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            verification_result = response.json()
            is_verified = verification_result.get("response") == "Yes"
            
            print(f"HR verification result for user {email}: {is_verified}")
            
            # Update the database with verification result
            user_collection.update_one(
                {'email': email, 'hrQuestions.question': question},
                {"$set": {"hrQuestions.$.verified": is_verified}}
            )
            
            # Optionally notify the user of verification completion
            socketio.emit('hr_evaluation_verified', {
                'email': email,
                'question': question,
                'verified': is_verified
            })
        else:
            print(f"Verification API error: {response.status_code}, {response.text}")
    
    except Exception as e:
        print(f"Error in HR verification process: {e}")
        traceback.print_exc()

@app.route('/api/interview_status/<email>', methods=['GET'])
def get_interview_status(email):
    """Check if a user has completed all interview questions"""
    user = user_collection.find_one({'email': email})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    completed_questions = len(user.get('hrQuestions', []))
    total_questions = 5  # Fixed at 5 questions
    
    return jsonify({
        "completed": completed_questions,
        "total": total_questions,
        "is_complete": completed_questions >= total_questions,
        "remaining": max(0, total_questions - completed_questions)
    })

@app.route('/api/user_feedback/<email>', methods=['GET'])
def get_user_feedback(email):
    """Fetch all HR question feedback for a given user by email"""
    try:
        # Find the user by email
        user = user_collection.find_one({'email': email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Extract hrQuestions from the user document
        hr_questions = user.get('hrQuestions', [])
        
        if not hr_questions:
            return jsonify({"feedback": []}), 200
        
        # Ensure timestamps are in ISO format for JSON serialization
        for question in hr_questions:
            if isinstance(question.get('timestamp'), datetime.datetime):
                question['timestamp'] = question['timestamp'].isoformat()
        
        # Return the feedback data
        return jsonify({
            "feedback": hr_questions,
            "emotion": user.get("emotion", {})
        }), 200
    
    except Exception as e:
        print(f"Error fetching feedback: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/reset_interview/<email>', methods=['POST'])
def reset_interview(email):
    """Reset the interview progress for a user"""
    try:
        # Remove the user from the cache to generate new questions next time
        if email in user_questions_cache:
            del user_questions_cache[email]
        
        # Option to clear existing HR questions from the database
        clear_existing = request.args.get('clear_existing', 'false').lower() == 'true'
        if clear_existing:
            user_collection.update_one(
                {'email': email},
                {'$set': {'hrQuestions': []}}
            )
        
        return jsonify({"success": True, "message": "Interview reset successfully"}), 200
    
    except Exception as e:
        print(f"Error resetting interview: {e}")
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





##***************************************************************************************************************************************************
##***************************************************************************************************************************************************
##***************************************************************************************************************************************************
##**********************************************************technical model backend*******************************************************************
#  *****************************************************************************************
##***************************************************************************************************************************************************
##***************************************************************************************************************************************************
##***************************************************************************************************************************************************

##**************************************************************************************************************************************************




# Cache to store dynamically generated technical questions per user
# Structure: {email: {question_count: int, questions: [], difficulty_level: str, performance_scores: []}}
user_tech_questions_cache = {}

def extract_json_from_text(text):
    """
    Extract JSON from text that might contain markdown or other content
    This function handles multiple extraction methods and includes detailed error logging
    """
    if not text:
        print("Error: Empty response received")
        return None
        
    # Method 1: Try direct JSON parsing
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"Direct JSON parsing failed: {e}")
        
    # Method 2: Extract JSON from code blocks
    try:
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
        if json_match:
            json_str = json_match.group(1).strip()
            return json.loads(json_str)
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"Code block extraction failed: {e}")
        
    # Method 3: Find JSON object boundaries
    try:
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        if start_idx != -1 and end_idx > start_idx:
            json_str = text[start_idx:end_idx + 1]
            return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON boundary extraction failed: {e}")
    
    # Method 4: Extra cleanup - try to handle escaped characters and other issues
    try:
        # Remove any non-JSON content at the beginning or end
        cleaned_text = re.sub(r'^[^{]*', '', text)
        cleaned_text = re.sub(r'[^}]*$', '', cleaned_text)
        
        # Replace common issues
        cleaned_text = cleaned_text.replace('\\"', '"')  # Fix escaped quotes
        cleaned_text = cleaned_text.replace('\n', ' ')   # Remove newlines
        
        return json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        print(f"Extra cleanup extraction failed: {e}")
    
    # If all methods fail, print out the problematic text for debugging
    print(f"JSON extraction failed for text (preview): {text[:200]}...")
    return None

def get_default_questions():
    """Return default questions when API fails"""
    return [
        {
            "question": "Explain the difference between HTTP and HTTPS.",
            "key_concepts": [
                "Encryption",
                "SSL/TLS",
                "Port differences",
                "Security",
                "Authentication",
                "Man-in-the-middle attacks"
            ],
            "ideal_answer": "HTTP (Hypertext Transfer Protocol) and HTTPS (HTTP Secure) are protocols used for transmitting data over the web. The main difference is that HTTPS encrypts data using SSL/TLS, while HTTP transmits in plaintext. HTTPS operates on port 443, while HTTP uses port 80. HTTPS provides three key layers of protection: encryption (preventing eavesdropping), data integrity (preventing data tampering), and authentication (proving the server is who it claims to be). These protections help mitigate various attacks including man-in-the-middle attacks where attackers intercept communications. When a connection is established via HTTPS, the server provides a certificate verified by a trusted Certificate Authority, establishing a secure connection before any data is transmitted. This certificate exchange uses asymmetric encryption, while the subsequent data transfer uses faster symmetric encryption.",
            "difficulty": "Easy",
            "code_snippet": ""
        },
        {
            "question": "Explain how Python's garbage collection works.",
            "key_concepts": [
                "Reference counting",
                "Cyclic references",
                "Generational collection",
                "Memory management",
                "Automatic garbage collection",
                "Memory leaks"
            ],
            "ideal_answer": "Python manages memory through automatic garbage collection using two main mechanisms: reference counting and generational garbage collection. Reference counting tracks how many references point to each object. When this count drops to zero, Python immediately deallocates the object. However, this approach struggles with cyclic references (objects referencing each other), which is where the generational garbage collector comes in. This collector operates on the assumption that most objects die young. It divides objects into three generations (0, 1, and 2) based on how many collection cycles they've survived. New objects start in generation 0. If they survive a collection, they're promoted to generation 1, and eventually to generation 2. Python collects younger generations more frequently than older ones. The garbage collector can be controlled using the 'gc' module, allowing developers to disable it for performance-critical sections or trigger collection manually. Understanding this behavior is important for optimizing memory-intensive applications.",
            "difficulty": "Medium",
            "code_snippet": """
import gc

# Get current thresholds
print(gc.get_threshold())  # (700, 10, 10) by default

# Manually trigger collection
gc.collect()

# Find objects that can't be collected (cycles)
print(gc.garbage)
"""
        },
        {
            "question": "Design a scalable microservice architecture for an e-commerce platform that can handle millions of daily users.",
            "key_concepts": [
                "Microservices",
                "Load balancing",
                "Database sharding",
                "Caching strategies",
                "API gateway",
                "Service discovery",
                "Fault tolerance"
            ],
            "ideal_answer": "For an e-commerce platform serving millions of users, I'd design a microservice architecture with these components: 1) API Gateway - Acts as the entry point handling authentication, routing, and rate limiting. 2) User Service - Manages user accounts, preferences, and authentication. 3) Product Catalog Service - Handles product information and search functionality using ElasticSearch for efficient querying. 4) Inventory Service - Tracks stock levels in real-time. 5) Order Service - Processes orders with a saga pattern for distributed transactions. 6) Payment Service - Integrates with payment processors and handles financial transactions. 7) Notification Service - Manages email, SMS, and push notifications. For data storage, I'd use a mix of technologies: PostgreSQL for user and transaction data with read replicas and sharding by user ID; Redis for caching and session management; MongoDB for product catalog with a focus on read performance. I'd implement circuit breakers (using Hystrix) for fault tolerance and deploy on Kubernetes for orchestration with horizontal auto-scaling based on load metrics.",
            "difficulty": "Hard",
            "code_snippet": ""
        },
        {
            "question": "What is the time and space complexity of a Quick Sort algorithm? How does it compare to Merge Sort?",
            "key_concepts": [
                "Time complexity analysis",
                "Space complexity",
                "Partitioning",
                "Divide and conquer",
                "Best/worst/average cases",
                "In-place sorting"
            ],
            "ideal_answer": "Quick Sort has an average time complexity of O(n log n), but a worst-case time complexity of O(n²) when the pivot selection consistently results in unbalanced partitions, such as when the array is already sorted. Its space complexity is O(log n) for the recursion stack in the average case, although worst case can be O(n). In comparison, Merge Sort has a consistent O(n log n) time complexity regardless of the input data distribution. However, Merge Sort requires O(n) auxiliary space for the merging operation, making it less memory-efficient than Quick Sort. Quick Sort is typically faster in practice due to its in-place partitioning and good cache locality, despite its worse theoretical worst-case. Quick Sort can be optimized by using techniques like random pivot selection or median-of-three to avoid the worst-case scenario. In situations where stable sorting is required (preserving order of equal elements), Merge Sort is preferred as Quick Sort is not stable by default.",
            "difficulty": "Medium",
            "code_snippet": """
def quicksort(arr, low, high):
    if low < high:
        pivot_index = partition(arr, low, high)
        quicksort(arr, low, pivot_index - 1)
        quicksort(arr, pivot_index + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
"""
        },
        {
            "question": "What are promises in JavaScript and how do they differ from callbacks?",
            "key_concepts": [
                "Asynchronous programming",
                "Promise states",
                "Chaining",
                "Error handling",
                "Callback hell",
                "ES6 features"
            ],
            "ideal_answer": "Promises in JavaScript are objects representing the eventual completion or failure of an asynchronous operation. Unlike callbacks, which are functions passed to other functions to be executed later, promises provide a more structured approach to handling asynchronous code. A promise exists in one of three states: pending (initial state), fulfilled (operation completed successfully), or rejected (operation failed). Promises allow for cleaner code through methods like .then() and .catch() which enable chaining multiple asynchronous operations without deeply nested callbacks (avoiding 'callback hell'). Error handling is also more streamlined with promises, as errors propagate through the chain until caught by a .catch() handler. Promises also offer useful methods like Promise.all() for parallel execution and Promise.race() for selecting the first resolved promise. While callbacks can accomplish similar functionality, promises provide better readability, composability, and error propagation. In modern JavaScript, promises have been further improved with async/await syntax, which allows asynchronous code to be written in a more synchronous style.",
            "difficulty": "Easy",
            "code_snippet": """
// Callback approach
function fetchDataCallback(callback, errorCallback) {
  setTimeout(() => {
    if (Math.random() > 0.5) {
      callback('Data received');
    } else {
      errorCallback('Error fetching data');
    }
  }, 1000);
}

// Promise approach
function fetchDataPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve('Data received');
      } else {
        reject('Error fetching data');
      }
    }, 1000);
  });
}

// Using the promise with chaining
fetchDataPromise()
  .then(data => {
    console.log(data);
    return processData(data);
  })
  .then(processedData => {
    console.log(processedData);
  })
  .catch(error => {
    console.error(error);
  });
"""
        }
    ]
print(user_tech_questions_cache)
def generate_tech_questions(num_questions=5, tech_role="Software Engineer", tech_stack="Python"):
    """Generate technical interview questions using Gemini API with improved prompt structure"""
    prompt = f"""Generate {num_questions} unique technical interview questions for a {tech_role} position with focus on {tech_stack}.
    Include a mix of concept-based questions, coding problems, and system design questions.
    
    IMPORTANT: Your response MUST be a valid JSON object with NO additional text before or after the JSON.
    The ideal answer should be 100-150 words maximum. Code snippets should be under 15 lines.
    
    For each question, provide:
    1. The question text (increasing difficulty: #1 Easy, #2-3 Medium, #4-5 Hard)
    2. A list of 4-5 key concepts (not long phrases)
    3. A brief ideal answer (100-150 words max)
    4. A difficulty rating (Easy, Medium, Hard)
    5. A short code snippet if relevant (under 15 lines)
    
    Return ONLY the JSON below with no additional text before or after:
    {{
      "questions": [
        {{
          "question": "Brief question",
          "key_concepts": ["Concept1", "Concept2", "Concept3", "Concept4"],
          "ideal_answer": "Brief answer",
          "difficulty": "Medium",
          "code_snippet": "Short code"
        }},
        {{
          "question": "Next question",
          "key_concepts": ["Concept1", "Concept2", "Concept3", "Concept4"],
          "ideal_answer": "Brief answer",
          "difficulty": "Easy",
          "code_snippet": ""
        }}
        // continue for remaining questions
      ]
    }}
    """
    
    try:
        # Configure to optimize for complete responses and structured output
        generation_config = {
            "max_output_tokens": 8192,  # Increased for more complete output
            "temperature": 0.7,         # Lower temperature for more predictable formatting
            "top_p": 0.95,
            "top_k": 40,
            "response_mime_type": "application/json",  # Request JSON response
        }
        
        response = model.generate_content(prompt, generation_config=generation_config)
        response_text = response.text
        
        # Log response for debugging
        print(f"Response length: {len(response_text)} chars")
        print(f"Response preview: {response_text[:100]}...")
        
        # Try to parse the response as JSON using our more robust extraction function
        parsed_data = extract_json_from_text(response_text)
        
        # Check if we have valid data
        if parsed_data and "questions" in parsed_data and len(parsed_data["questions"]) > 0:
            # Validate each question has required fields
            validated_questions = []
            for q in parsed_data["questions"]:
                if "question" in q and "key_concepts" in q and "difficulty" in q:
                    # Ensure all fields exist with defaults if missing
                    q["ideal_answer"] = q.get("ideal_answer", "No ideal answer provided")
                    q["code_snippet"] = q.get("code_snippet", "")
                    validated_questions.append(q)
            
            if validated_questions:
                print(f"Successfully generated {len(validated_questions)} questions")
                return validated_questions
        
        # If we reached here, something went wrong with the response format
        print("Invalid response format or empty questions. Returning default questions.")
        return get_default_questions()
            
    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        traceback.print_exc()  # Print full stack trace
        return get_default_questions()

def evaluate_tech_response(question, user_answer, question_details):
    print(user_tech_questions_cache)
    """Evaluate the user's answer to a technical question using Gemini API with enhanced prompt"""
    prompt = f"""Evaluate this technical interview response:
    
    Question: "{question}"
    
    Expected key concepts: {json.dumps(question_details['key_concepts'])}
    
    User's answer: "{user_answer}"
    
    IMPORTANT: Return ONLY a valid JSON object with NO additional text before or after.
    
    Provide a brief technical evaluation with:
    1. 3-4 specific technical feedback points
    2. A numerical score from 0-100
    3. 2-3 matching concepts from the expected list
    4. 2-3 missing concepts
    5. 1-2 strengths
    6. 1-2 improvement areas
    7. 1-2 misconceptions (if any)
    8. 1-2 learning resources
    
    Return ONLY the JSON below with no additional text before or after:
    {{
      "technical_feedback": ["Short feedback 1", "Short feedback 2", "Short feedback 3"],
      "score": 75,
      "matching_concepts": ["Concept1", "Concept2"],
      "missing_concepts": ["Concept3", "Concept4"],
      "strengths": ["Strength1", "Strength2"],
      "improvement_areas": ["Area1", "Area2"],
      "misconceptions": ["Issue1", "Issue2"],
      "learning_resources": ["Resource1", "Resource2"]
    }}
    """
    
    try:
        generation_config = {
            "max_output_tokens": 4096,
            "temperature": 0.1,
            "top_p": 0.95,
            "top_k": 40,
            "response_mime_type": "application/json",  # Request JSON response
        }
        
        response = model.generate_content(prompt, generation_config=generation_config)
        print(f"Evaluation response preview: {response.text[:100]}...")
        
        parsed_data = extract_json_from_text(response.text)
        
        if parsed_data and "technical_feedback" in parsed_data and "score" in parsed_data:
            print("Successfully parsed evaluation response")
            return parsed_data
        else:
            print(f"Invalid evaluation format. Response: {response.text[:200]}...")
            raise ValueError("Invalid evaluation format from Gemini API")
            
    except Exception as e:
        print(f"Error evaluating response: {str(e)}")
        traceback.print_exc()
        
        # Fallback basic evaluation
        return {
            "technical_feedback": ["Unable to generate detailed feedback due to API error."],
            "score": 50,
            "matching_concepts": [],
            "missing_concepts": question_details['key_concepts'][:2],  # Take just first 2
            "strengths": ["Unable to determine"],
            "improvement_areas": ["Unable to determine"],
            "misconceptions": [],
            "learning_resources": ["Documentation related to the topic"]
        }

def determine_next_question_difficulty(current_score, current_difficulty):
    """Determine the next question difficulty based on performance"""
    # Current difficulty conversion
    difficulty_levels = {"Easy": 1, "Medium": 2, "Hard": 3}
    current_level = difficulty_levels.get(current_difficulty, 2)  # Default to Medium
    
    # Adjust based on score
    if current_score < 40:
        # Poor performance - stay at same level or go easier
        next_level = max(1, current_level - 1)
    elif current_score > 70:
        # Good performance - increase difficulty
        next_level = min(3, current_level + 1)
    else:
        # Average performance - stay at same level
        next_level = current_level
    
    # Convert level back to string
    reverse_difficulty = {1: "Easy", 2: "Medium", 3: "Hard"}
    return reverse_difficulty[next_level]

def get_user_tech_questions(email, tech_role="Software Engineer", tech_stack="Python"):
    """Get or generate technical questions for a specific user"""
    if email not in user_tech_questions_cache:
        # Generate new questions for this user
        questions = generate_tech_questions(num_questions=5, tech_role=tech_role, tech_stack=tech_stack)
        
        # Sort questions by difficulty for adaptive progression
        difficulty_order = {"Easy": 0, "Medium": 1, "Hard": 2}
        questions.sort(key=lambda q: difficulty_order.get(q.get("difficulty", "Medium"), 1))
        
        user_tech_questions_cache[email] = {
            "question_count": 0,
            "questions": questions,
            "current_difficulty": "Easy", # Start with Easy questions
            "performance_scores": []
        }
    
    return user_tech_questions_cache[email]

@socketio.on('request_tech_question')
def send_next_tech_question(data):
    """Send the next technical question to the user or notify completion"""
    try:
        email = data['email']
        tech_role = data.get('tech_role')
        tech_stack = data.get('tech_stack')
        
        print(f"Processing tech question request for {email}")
        
        # Get the user's questions or generate new ones
        user_data = get_user_tech_questions(email, tech_role, tech_stack)
        
        # Get current question count and questions
        question_count = user_data["question_count"]
        questions = user_data["questions"]
        
        total_questions = 5  # Fixed at 5 questions per interview session
        
        # Check if user has completed all questions
        if question_count >= total_questions:
            print(f"User {email} has completed all questions")
            socketio.emit('new_tech_question', {
                'question': None,
                'questionNumber': total_questions,
                'totalQuestions': total_questions,
                'message': 'Congratulations! You have completed all technical interview questions. Check your feedback in the progress section.',
                'tech_interview_finished': True
            })
            return
        
        # Get the next question
        current_question = questions[question_count]
        print(f"Sending question {question_count + 1} to user {email}")
        
        # Emit the question to the user
        socketio.emit('new_tech_question', {
            'question': current_question["question"],
            'difficulty': current_question.get("difficulty", "Medium"),
            'code_snippet': current_question.get("code_snippet", ""),
            'questionNumber': question_count + 1,
            'totalQuestions': total_questions
        })
        
        # Update question count in the cache
        user_tech_questions_cache[email]["question_count"] = question_count + 1
    
    except KeyError as e:
        print(f"Key error in request_tech_question: {e}")
        socketio.emit('tech_error', {'message': f'Required information missing: {str(e)}'})
    except Exception as e:
        print(f"Unexpected error in request_tech_question: {e}")
        traceback.print_exc()
        socketio.emit('tech_error', {'message': f'An error occurred: {str(e)}'})
        

@socketio.on('send_tech_answer')
def process_tech_answer(data):
    """Process the user's answer to a technical question and provide feedback"""
    try:
        question = data.get('techQuestion')
        user_answer = data.get('answer')
        email = data.get('email')
        code_solution = data.get('codeSolution', '')  # Optional code solution
        overAllEmotion = data.get('overAllEmotion')
            
        # Validate required data
        if not (email and question and user_answer):
            print(f"Missing required fields for user {email}")
            socketio.emit('tech_error', {'message': 'Missing required fields: email, question, or answer'})
            return

        print(f"Processing answer for user {email}")

        # Get the question details from cache
        user_data = user_tech_questions_cache.get(email, None)
        if not user_data:
            print(f"Session expired for user {email}")
            socketio.emit('tech_error', {'message': 'Session expired. Please refresh the page.'})
            return

        # Find the question in the user's session data
        question_details = next((q for q in user_data.get("questions", []) if q.get("question") == question), None)
        if not question_details:
            print(f"Question not found for user {email}")
            socketio.emit('tech_error', {'message': 'Question not found in session.'})
            return

        # Combine user's text answer with any code solution
        full_answer = user_answer
        if code_solution:
            full_answer += f"\n\nCode Solution:\n{code_solution}"

        print(f"Evaluating answer for user {email}")
        # Evaluate the answer
        evaluation = evaluate_tech_response(question, full_answer, question_details)
        
        # Store the score for adaptive question selection
        score = evaluation.get("score", 50)
        user_data["performance_scores"].append(score)
        
        # Update the difficulty for next questions based on performance
        current_difficulty = question_details.get("difficulty", "Medium")
        next_difficulty = determine_next_question_difficulty(score, current_difficulty)
        user_data["current_difficulty"] = next_difficulty
        
        print(f"User {email} score: {score}, next difficulty: {next_difficulty}")
        
        # If there are remaining questions, potentially adjust their difficulty
        remaining_q_count = len(user_data["questions"]) - user_data["question_count"]
        if remaining_q_count > 0:
            # Find appropriate difficulty questions for next selection
            difficulty_questions = [q for q in user_data["questions"] 
                                   if q.get("difficulty") == next_difficulty and 
                                   user_data["questions"].index(q) >= user_data["question_count"]]
            
            if difficulty_questions:
                # Reorder remaining questions to prioritize new difficulty level
                current_index = user_data["question_count"]
                next_questions = user_data["questions"][current_index:]
                next_questions.sort(key=lambda q: 0 if q.get("difficulty") == next_difficulty else 1)
                user_data["questions"] = user_data["questions"][:current_index] + next_questions

        # Add metadata to the evaluation
        evaluation.update({
            "question": question,
            "user_answer": user_answer,
            "code_solution": code_solution,
            "difficulty": question_details.get("difficulty", "Medium"),
            "ideal_answer": question_details.get("ideal_answer", ""),
            "timestamp": datetime.datetime.utcnow(),
            "verified": False  # Initial verification status
        })

        print(f"Storing evaluation data for user {email}")
        # Store the evaluation in the database without waiting for verification
        store_evaluation_in_db(email, question, evaluation, user_answer, code_solution, overAllEmotion, question_details)

        print(f"Sending feedback to user {email}")
        # Send feedback to the user
        socketio.emit('tech_answer_feedback', {
            'technical_feedback': evaluation.get("technical_feedback", []),
            'score': evaluation.get("score", 0),
            'strengths': evaluation.get("strengths", []),
            'improvement_areas': evaluation.get("improvement_areas", []),
            'misconceptions': evaluation.get("misconceptions", []),
            'learning_resources': evaluation.get("learning_resources", []),
            'next_difficulty': next_difficulty
        })

        # Start asynchronous verification process
        # This runs in the background without blocking the main flow
        socketio.start_background_task(
            verify_evaluation, 
            email, 
            question, 
            evaluation
        )

    except Exception as e:
        print(f"Error processing technical answer: {e}")
        traceback.print_exc()  # Add full stack trace for debugging
        socketio.emit('tech_error', {'message': f'An error occurred processing your answer: {str(e)}'})

# Helper function to store evaluation in DB (extracted from the original function)
def store_evaluation_in_db(email, question, evaluation, user_answer, code_solution, overAllEmotion, question_details):
    # Check if the user exists and if the question is already present
    user = user_collection.find_one({'email': email, 'techQuestions.question': question})

    if user and any(q.get('question') == question for q in user.get('techQuestions', [])):
        # If question exists, update only the existing entry
        user_collection.update_one(
            {'email': email, 'techQuestions.question': question},
            {"$set": {
                "techQuestions.$.user_answer": user_answer,
                "techQuestions.$.code_solution": code_solution,
                "techQuestions.$.overAllEmotion": overAllEmotion,
                "techQuestions.$.technical_feedback": evaluation.get("technical_feedback", []),
                "techQuestions.$.score": evaluation.get("score", 0),
                "techQuestions.$.matching_concepts": evaluation.get("matching_concepts", []),
                "techQuestions.$.missing_concepts": evaluation.get("missing_concepts", []),
                "techQuestions.$.strengths": evaluation.get("strengths", []),
                "techQuestions.$.improvement_areas": evaluation.get("improvement_areas", []),
                "techQuestions.$.misconceptions": evaluation.get("misconceptions", []),
                "techQuestions.$.learning_resources": evaluation.get("learning_resources", []),
                "techQuestions.$.difficulty": question_details.get('difficulty', 'Medium'),
                "techQuestions.$.ideal_answer": question_details.get('ideal_answer', ''),
                "techQuestions.$.timestamp": evaluation["timestamp"],
                "techQuestions.$.verified": evaluation.get("verified", False)
            }}
        )
    else:
        # For new questions, we need to ensure the document structure is consistent
        question_document = {
            "question": question,
            "user_answer": user_answer,
            "overAllEmotion": overAllEmotion,
            "code_solution": code_solution,
            "technical_feedback": evaluation.get("technical_feedback", []),
            "score": evaluation.get("score", 0),
            "matching_concepts": evaluation.get("matching_concepts", []),
            "missing_concepts": evaluation.get("missing_concepts", []),
            "strengths": evaluation.get("strengths", []),
            "improvement_areas": evaluation.get("improvement_areas", []),
            "misconceptions": evaluation.get("misconceptions", []),
            "learning_resources": evaluation.get("learning_resources", []),
            "difficulty": question_details.get('difficulty', 'Medium'),
            "ideal_answer": question_details.get('ideal_answer', ''),
            "timestamp": evaluation["timestamp"],
            "verified": evaluation.get("verified", False)
        }

        # If the question doesn't exist, insert the structured document
        user_collection.update_one(
            {'email': email},
            {'$push': {'techQuestions': question_document}},
            upsert=True  # Ensures a new document is created if the user doesn't exist
        )

# Asynchronous verification function
def verify_evaluation(email, question, evaluation):
    try:
        print(f"Starting verification process for user {email}, question: {question}")
        
        # Prepare the prompt for verification
        verification_prompt = f"""
        Review this technical interview feedback for accuracy and fairness:
        
        Question: {evaluation.get('question')}
        User Answer: {evaluation.get('user_answer')}
        Code Solution: {evaluation.get('code_solution', 'None provided')}
        
        Feedback given:
        - Technical feedback: {evaluation.get('technical_feedback', [])}
        - Score: {evaluation.get('score', 0)}
        - Strengths: {evaluation.get('strengths', [])}
        - Improvement areas: {evaluation.get('improvement_areas', [])}
        - Misconceptions: {evaluation.get('misconceptions', [])}
        
        Ideal answer: {evaluation.get('ideal_answer', 'Not specified')}
        
        Is this feedback accurate, fair, and helpful? Respond with ONLY 'Yes' or 'No'.
        """
        
        # Call your verification API with the prompt
        import requests
        response = requests.post(
            "http://localhost:2000/chat",  # Replace with your actual endpoint
            json={"prompt": verification_prompt},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            verification_result = response.json()
            is_verified = verification_result.get("response") == "Yes"
            
            print(f"Verification result for user {email}: {is_verified}")
            
            # Update the database with verification result
            user_collection.update_one(
                {'email': email, 'techQuestions.question': question},
                {"$set": {"techQuestions.$.verified": is_verified}}
            )
            
            # Optionally notify the user of verification completion
            socketio.emit('evaluation_verified', {
                'email': email,
                'question': question,
                'verified': is_verified
            })
        else:
            print(f"Verification API error: {response.status_code}, {response.text}")
    
    except Exception as e:
        print(f"Error in verification process: {e}")
        traceback.print_exc()

@app.route('/api/tech_interview_status/<email>', methods=['GET'])
def get_tech_interview_status(email):
    """Check if a user has completed all technical interview questions"""
    try:
        user = user_collection.find_one({'email': email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        completed_questions = len(user.get('techQuestions', []))
        total_questions = 5  # Fixed at 5 questions
        
        return jsonify({
            "completed": completed_questions,
            "total": total_questions,
            "is_complete": completed_questions >= total_questions,
            "remaining": max(0, total_questions - completed_questions)
        })
    except Exception as e:
        print(f"Error checking interview status: {e}")
        traceback.print_exc()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500



@app.route('/reset_tech_interview/<email>', methods=['POST'])
def reset_tech_interview(email):
    """Reset the technical interview progress for a user"""
    try:
        # Remove the user from the cache to generate new questions next time
        if email in user_tech_questions_cache:
            del user_tech_questions_cache[email]
        
        # Option to clear existing tech questions from the database
        clear_existing = request.args.get('clear_existing', 'false').lower() == 'true'
        if clear_existing:
            user_collection.update_one(
                {'email': email},
                {'$set': {'techQuestions': []}}
            )
        
        return jsonify({"success": True, "message": "Technical interview reset successfully"}), 200
    
    except Exception as e:
        print(f"Error resetting technical interview: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/technical_interview')
def technical_interview_page():
    """Show technical interview page"""
    email = request.args.get('email')
    tech_role = request.args.get('tech_role', 'Software Engineer')
    tech_stack = request.args.get('tech_stack', 'Python')
    
    if not email:
        return redirect('/')
    
    return render_template('technical_interview.html', email=email, tech_role=tech_role, tech_stack=tech_stack)

@app.route('/tech_interview_complete')
def tech_interview_complete_page():
    """Show technical interview completion page"""
    email = request.args.get('email')
    if not email:
        return redirect('/')
    
    return render_template('tech_interview_complete.html', email=email)




@app.route('/api/tech_feedback/<email>', methods=['GET'])
def get_tech_feedback(email):
    """Fetch all technical question feedback for a given user by email"""
    try:
        # Find the user by email
        user = user_collection.find_one({'email': email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Extract techQuestions from the user document
        tech_questions = user.get('techQuestions', [])
        
        if not tech_questions:
            return jsonify({"feedback": []}), 200
        
        # Ensure timestamps are in ISO format for JSON serialization
        for question in tech_questions:
            if isinstance(question.get('timestamp'), datetime.datetime):
                question['timestamp'] = question['timestamp'].isoformat()
        
        # Return the feedback data
        return jsonify({
            "feedback": tech_questions,
             "emotion": user.get("emotion", {}),
            "performance_summary": {
                "average_score": sum(q.get('score', 0) for q in tech_questions) / len(tech_questions),
                "questions_by_difficulty": {
                    "Easy": len([q for q in tech_questions if q.get('difficulty') == 'Easy']),
                    "Medium": len([q for q in tech_questions if q.get('difficulty') == 'Medium']),
                    "Hard": len([q for q in tech_questions if q.get('difficulty') == 'Hard']),
                }
            }
        }), 200
    
    except Exception as e:
        print(f"Error fetching technical feedback: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500



# **********************************************************************************************************************************
# **********************************************************************************************************************************
# ********************************************************** ats Start    ******************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************
UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"pdf", "docx"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS



@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return redirect(request.url)

    file = request.files["file"]
    role = request.form["role"]
    email = request.form["email"]

    if file.filename == "":
        return redirect(request.url)

    if file and allowed_file(file.filename):
        filename = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(filename)

        # Resume Processing
        (
            score,
            match_hard,
            missing_hard,
            match_soft,
            missing_soft,
            word_count,
            sections,
            hs,
            ss,
            wc,
            sc,
            corrections,
            resume_text_format 
        ) = ats.processing(file.filename, 1, role)
        user_collection.find_one_and_update({'email':email},{'$set':{"resume_text_format":resume_text_format}})

        struct = f"{int(sc)}%"
        hsp = f"{int(hs)}%"
        ssp = f"{int(ss)}%"
        wcp = f"{int(wc)}%"

        # Generate new filename with "-1" appended
        base_name, extension = os.path.splitext(file.filename)
        pdfFileName = f"{base_name}-1{extension}"

        # Convert skills to a unique list
        unique_skills = list(set(match_hard))

        # Update user record in MongoDB
        user_collection.update_one(
            {"email": email},
            {
                "$set": {"resumeFile": pdfFileName},  # Update resume filename
                "$addToSet": {"technicalSkills": {"$each": unique_skills}}  # Add skills without duplicates
            }
        )

        return render_template(
            "result.html",
            final=int(score),
            struct=struct,
            hsp=hsp,
            ssp=ssp,
            wcp=wcp,
            sections=sections,
            match_hard=unique_skills,
            missing_hard=missing_hard,
            match_soft=list(set(match_soft)),
            missing_soft=missing_soft,
            word_count=word_count,
            pdfFileName=pdfFileName,
            corrections=corrections
        )

    return "Invalid file format! Allowed formats: pdf, docx"
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# ********************************************************** ats end    ******************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************







if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0', port=5000, debug=False)