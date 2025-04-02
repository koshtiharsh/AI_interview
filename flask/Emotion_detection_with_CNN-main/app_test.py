
from flask import Flask, request, jsonify, render_template, redirect
from flask_pymongo import PyMongo
from flask_socketio import SocketIO
import google.generativeai as genai
import random
import json
import datetime
from typing import Dict, List, Tuple
import os
import re
from flask_cors import CORS
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, resources={r"/*": {"origins": "*"}})
# MongoDB setup
app.config["MONGO_URI"] = "mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti"
mongo = PyMongo(app)
user_collection = mongo.db.userData

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

        # Validate required data
        if not (email and question and user_answer):
            socketio.emit('error', {'message': 'Missing required fields: email, question, or answer'})
            return

        # Get the question details from cache
        user_data = user_questions_cache.get(email, None)
        if not user_data:
            socketio.emit('error', {'message': 'Session expired. Please refresh the page.'})
            return

        # Find the question in the user's session data
        question_details = next((q for q in user_data.get("questions", []) if q.get("question") == question), None)
        if not question_details:
            socketio.emit('error', {'message': 'Question not found in session.'})
            return

        # Evaluate the answer
        evaluation = evaluate_response(question, user_answer, question_details)
        print(evaluation)

        # Add metadata to the evaluation
        evaluation.update({
            "question": question,
            "user_answer": user_answer,
            "ideal_answer": question_details.get("ideal_answer", ""),
            "timestamp": datetime.datetime.utcnow()
        })

        # Ensure evaluation["details"] exists to prevent KeyErrors
        evaluation_details = evaluation.get("details", {})

        # Check if the user exists and if the question is already present
        user = user_collection.find_one({'email': email, 'hrQuestions.question': question})

        if user and any(q.get('question') == question for q in user.get('hrQuestions', [])):
            # If question exists, update only the existing entry
            user_collection.update_one(
                {'email': email, 'hrQuestions.question': question},
                {"$set": {
                    "hrQuestions.$.user_answer": user_answer,
                    "hrQuestions.$.feedback": evaluation.get("feedback", ""),
                    "hrQuestions.$.score": evaluation.get("score", 0),
                    "hrQuestions.$.matching_points": evaluation_details.get("key_points_found", []),
                    "hrQuestions.$.missing_points": evaluation_details.get("missing_points", []),
                    "hrQuestions.$.strengths": evaluation_details.get("strengths", []),
                    "hrQuestions.$.improvement_areas": evaluation_details.get("improvement_areas", []),
                    "hrQuestions.$.red_flags_triggered": evaluation_details.get("red_flags", []),
                    "hrQuestions.$.ideal_answer": question_details.get('ideal_answer', ''),
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

        # Send feedback to the user
        socketio.emit('answer_feedback', {
            'feedback': evaluation.get("feedback", ""),
            'score': evaluation.get("score", 0),
            'strengths': evaluation_details.get("strengths", []),
            'improvement_areas': evaluation_details.get("improvement_areas", [])
        })

    except Exception as e:
        print(f"Error processing answer: {e}")
        socketio.emit('error', {'message': f'An error occurred processing your answer: {str(e)}'})


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

if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0', port=5000, debug=True)