
from flask import Flask, render_template, request ,redirect
from datetime import datetime
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from flask_pymongo import PyMongo
import cv2
import numpy as np
import base64
from keras.models import model_from_json
import random
import difflib
import os
import ats

import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re
import string
from collections import Counter
from pymongo import MongoClient
import os

try:
    nltk.data.find('vader_lexicon')
    nltk.data.find('punkt')
    nltk.data.find('stopwords')
except LookupError:
    nltk.download('vader_lexicon')
    nltk.download('punkt')
    nltk.download('stopwords')

# Initialize app and configure CORS and SocketIO
app = Flask(__name__, static_url_path="/static")
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# # MongoDB setup
app.config["MONGO_URI"] = "mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti"
mongo = PyMongo(app)
user_collection = mongo.db.userData

# Emotion detection model setup
emotion_dict = {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}
with open('model/emotion_model.json', 'r') as json_file:
    emotion_model = model_from_json(json_file.read())
emotion_model.load_weights("model/emotion_model.h5")

face_detector = cv2.CascadeClassifier('haarcascades/haarcascade_frontalface_default.xml')

@socketio.on('image_frame')
def handle_image_frame(data):
    img_data = base64.b64decode(data.split(',')[1])
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
        
        if maxindex > 0:
            user_collection.find_one_and_update({"name": 'harsh'}, {'$inc': {f'emotion.{emotion}': 1}})

    emit('emotion_result', {"detected_faces": len(num_faces), "emotions": results})

# Enhanced interview questions database with ideal answers and key points
questions_db = {
    "Tell me about yourself.": {
        "ideal_answer": "I am a software engineer with a background in backend and frontend development, and I have hands-on experience with frameworks like React, Node.js, and Django. I'm passionate about creating efficient, scalable systems and enjoy solving complex technical challenges. In my last role at XYZ Company, I led the development of a payment processing system that reduced transaction time by 40% and improved user satisfaction metrics by 25%. Outside of work, I contribute to open-source projects and enjoy outdoor activities like hiking. I'm always eager to expand my knowledge in emerging technologies, and I'm excited about the opportunity to contribute my skills to a team that values innovation and collaboration.",
        "key_points": ["Professional background", "Technical skills", "Achievements", "Personal interests", "Career goals", "Relevant experience"]
    },
    "Where do you see yourself in next five years?": {
        "ideal_answer": "In five years, I see myself taking on a senior role within the tech team, perhaps leading projects that involve emerging technologies like AI or machine learning. My goal is to advance both my technical and leadership skills, becoming someone the team can rely on for innovative solutions and mentorship. I'm committed to continuous learning and plan to deepen my expertise in cloud architecture and data systems. I hope to be someone who not only drives the company's technical success but also inspires and empowers my team to reach new heights.",
        "key_points": ["Leadership aspirations", "Technical growth", "Specific goals", "Continuous learning", "Value contribution", "Realistic timeline"]
    },
    "What are your greatest strengths?": {
        "ideal_answer": "My greatest strengths include a strong aptitude for problem-solving, adaptability to new technologies, and a collaborative approach to teamwork. I excel at breaking down complex issues, developing efficient solutions, and staying updated with the latest industry trends. For example, in my previous role, I identified a performance bottleneck in our application and implemented a caching solution that improved load times by 60%. Being a team player, I actively contribute to group discussions and ensure that we work towards solutions that are both technically sound and aligned with business goals. I'm also known for my ability to explain technical concepts to non-technical stakeholders, which has helped bridge communication gaps in cross-functional teams.",
        "key_points": ["Specific strengths", "Technical skills", "Concrete example", "Measurable impact", "Collaborative mindset", "Communication skills"]
    },
    "What is your greatest weakness?": {
        "ideal_answer": "One of my weaknesses is that I sometimes get deeply focused on perfecting technical details, which can impact time management on larger projects. However, I've been addressing this by prioritizing tasks based on their impact and learning to balance thoroughness with deadlines. I now use a structured approach where I allocate specific time blocks for different aspects of a project and set internal milestones to ensure steady progress. I'm consistently working on improving my time management skills to ensure that I deliver high-quality work efficiently. This approach has already helped me complete my last three projects on schedule while maintaining the quality standards expected.",
        "key_points": ["Genuine weakness", "Self-awareness", "Action taken", "Improvement strategy", "Progress made", "Learning mindset"]
    },
    "Why do you want to work here?": {
        "ideal_answer": "I want to work here because your company is at the forefront of technological innovation and places a high value on continuous learning and growth. I've followed your company's development of AI-powered solutions that address real-world problems, which aligns perfectly with my interest in applying technology to make a meaningful impact. I'm inspired by the projects your team is working on, especially in areas like cloud computing and AI, which align with my career interests. Through my research and conversations with some of your employees, I've learned about your collaborative culture and emphasis on employee development, which are exactly what I'm looking for in my next role. I believe that working here will allow me to apply my skills in a meaningful way while also offering opportunities to deepen my expertise in cutting-edge technology.",
        "key_points": ["Company research", "Alignment with values", "Specific examples", "Cultural fit", "Enthusiasm", "Growth opportunities"]
    }
}

# User tracking for questions
users = {}

def get_keywords(text):
    """Extract important keywords from text"""
    # Tokenize and lowercase
    tokens = word_tokenize(text.lower())
    
    # Remove stopwords and punctuation
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words and word not in string.punctuation]
    
    # Get most common words
    return Counter(tokens).most_common(10)

def compare_answers(user_answer, ideal_answer, key_points):
    """Compare user answer with ideal answer and provide detailed feedback"""
    comparison = {
        "matching_points": [],
        "missing_points": [],
        "additional_suggestions": [],
        "strengths": [],
        "improvement_areas": []
    }
    
    # Lowercase both answers for comparison
    user_lower = user_answer.lower()
    ideal_lower = ideal_answer.lower()
    
    # Check for key points coverage
    for point in key_points:
        # Create variants of the key point for flexible matching
        point_variants = [point.lower(), point.lower().replace(" ", "")]
        
        # Check if any variant is present in the user's answer
        if any(variant in user_lower for variant in point_variants):
            comparison["matching_points"].append(point)
        else:
            comparison["missing_points"].append(point)
    
    # Get important keywords from ideal answer
    ideal_keywords = get_keywords(ideal_answer)
    user_keywords = get_keywords(user_answer)
    
    # Find missing important keywords
    ideal_words = set([word for word, _ in ideal_keywords])
    user_words = set([word for word, _ in user_keywords])
    missing_keywords = ideal_words - user_words
    
    # Generate additional suggestions
    if len(comparison["missing_points"]) > 0:
        comparison["improvement_areas"].append(f"Include information about: {', '.join(comparison['missing_points'])}")
    
    if len(missing_keywords) > 0:
        significant_missing = list(missing_keywords)[:3]  # Limit to 3 keywords
        comparison["improvement_areas"].append(f"Consider mentioning key terms like: {', '.join(significant_missing)}")
    
    # Check answer length
    ideal_length = len(ideal_answer.split())
    user_length = len(user_answer.split())
    
    if user_length < ideal_length * 0.7:
        comparison["improvement_areas"].append(f"Your answer is shorter than recommended. Consider expanding with more details. (Ideal: ~{ideal_length} words, Yours: {user_length} words)")
    elif user_length > ideal_length * 1.5:
        comparison["improvement_areas"].append(f"Your answer is longer than optimal. Consider being more concise. (Ideal: ~{ideal_length} words, Yours: {user_length} words)")
    else:
        comparison["strengths"].append("Good answer length")
    
    # Check for STAR components in behavioral questions
    if any(term in key_points for term in ["Action taken", "Specific example", "Results achieved", "Concrete example"]):
        star_components = {
            "situation": re.search(r'\b(situation|context|background|challenge|problem)\b', user_lower, re.IGNORECASE),
            "task": re.search(r'\b(task|responsibility|required to|needed to|had to)\b', user_lower, re.IGNORECASE),
            "action": re.search(r'\b(action|implemented|did|took|approached|handled|managed|led|organized|created)\b', user_lower, re.IGNORECASE),
            "result": re.search(r'\b(result|outcome|impact|achievement|success|improved|increased|decreased|reduced|saved|accomplishment)\b', user_lower, re.IGNORECASE)
        }
        
        present_star = [component.upper() for component, found in star_components.items() if found]
        missing_star = [component.upper() for component, found in star_components.items() if not found]
        
        if present_star:
            comparison["strengths"].append(f"Good use of STAR components: {', '.join(present_star)}")
            
        if missing_star:
            comparison["improvement_areas"].append(f"Your answer is missing key STAR components: {', '.join(missing_star)}")
    
    # Check for hesitation words
    hesitation_words = re.findall(r'\b(I think|maybe|probably|possibly|not sure|kind of|sort of)\b', 
                                user_answer, re.IGNORECASE)
    if len(hesitation_words) > 2:
        comparison["improvement_areas"].append(f"Use more confident language (avoid: {', '.join(set(hesitation_words))})")
    else:
        comparison["strengths"].append("Good confidence level in your response")
    
    # Check for specific examples
    example_indicators = re.findall(r'\b(for example|instance|specifically|particular|situation|case study|when I|time I)\b', 
                                user_answer, re.IGNORECASE)
    if example_indicators:
        comparison["strengths"].append("Good use of specific examples")
    else:
        comparison["improvement_areas"].append("Include specific examples to illustrate your points")
    
    # Calculate overall score
    matching_points_ratio = len(comparison["matching_points"]) / len(key_points)
    base_score = matching_points_ratio * 7  # 7 points max for key points coverage
    
    # Add points for strengths, subtract for improvement areas
    adjustment = min(3, len(comparison["strengths"]) * 0.5 - len(comparison["improvement_areas"]) * 0.3)
    
    score = min(10, max(1, base_score + adjustment))
    comparison["score"] = round(score, 1)
    
    return comparison

def analyze_answer(user_answer, question):
    """Analyze a candidate's answer and provide comprehensive feedback"""
    if question not in questions_db:
        return {
            "feedback": "No predefined answer available for this question.",
            "score": 5
        }
    
    # Get ideal answer and key points
    ideal_answer = questions_db[question]["ideal_answer"]
    key_points = questions_db[question]["key_points"]
    
    # Get detailed comparison
    comparison = compare_answers(user_answer, ideal_answer, key_points)
    
    # Create feedback summary
    feedback = []
    
    if comparison["score"] >= 8:
        feedback.append("Excellent answer! You've covered most key points effectively.")
    elif comparison["score"] >= 6:
        feedback.append("Good answer with several strengths, but there's room for improvement.")
    else:
        feedback.append("Your answer needs significant improvement to be more effective.")
    
    # # Add strengths
    # if comparison["strengths"]:
    #     feedback.append("\nStrengths:")
    #     for strength in comparison["strengths"]:
    #         feedback.append(f"• {strength}")
    
    # # Add improvement areas
    # if comparison["improvement_areas"]:
    #     feedback.append("\nAreas for improvement:")
    #     for area in comparison["improvement_areas"]:
    #         feedback.append(f"• {area}")
    
    # Add sample answer if score is low
    if comparison["score"] < 6:
        feedback.append("\nHere's how you might improve your answer:")
        feedback.append(ideal_answer)
    
    return {
        "feedback": "\n".join(feedback),
        "score": comparison["score"],
        "matching_points": comparison["matching_points"],
        "missing_points": comparison["missing_points"],
        "strengths": comparison["strengths"],
        "improvement_areas": comparison["improvement_areas"]
    }

@socketio.on('request_question')
def send_random_question(data):
    """Send a question to the user"""
    try:
        userId = data['userId']
        total_questions = len(questions_db)
        
        # Initialize or update user's question index
        if userId in users:
            # Check if the user has reached the total length and reset if necessary
            if users[userId] >= total_questions - 1:
                users[userId] = 0
            else:
                users[userId] += 1
        else:
            # Initialize user's HR questions array in the database
            newObject = {"$set": {"hrQuestions": []}}
            user_collection.find_one_and_update({'userId': userId}, newObject)
            users[userId] = 0
        
        # Get the next question
        question_index = min(users[userId], total_questions - 1)
        keys_list = list(questions_db.keys())
        question = keys_list[question_index]
        
        # Emit the question to the user
        socketio.emit('new_question', {'question': question})
    
    except KeyError:
        print("Error: 'userId' not found in data.")
    except Exception as e:
        print(f"Unexpected error: {e}")

@socketio.on('send_transcript')
def handle_transcript(data):
    """Process user's answer and provide feedback"""
    try:
        question = data['hrQuestion']
        user_answer = data['transcript']
        email = data['email']
        
        # Analyze the answer
        feedback_data = analyze_answer(user_answer, question)
        
        # Send feedback to the user
        socketio.emit('transcript_feedback', {"feedback": feedback_data["feedback"]})
        
        # Prepare data for database
        new_data = {
            "question": question,
            "user_answer": user_answer,
            "feedback": feedback_data["feedback"],
            "score": feedback_data["score"],
            "strengths": feedback_data["strengths"],
            "improvement_areas": feedback_data["improvement_areas"],
            "timestamp": datetime.now()
        }
        
        # Update database
        user = user_collection.find_one({'email': email, 'hrQuestions.question': question})
        
        if user:
            # If question exists, update only that question's answer and feedback
            result = user_collection.update_one(
                {'email': email, 'hrQuestions.question': question},
                {"$set": {
                    "hrQuestions.$.user_answer": user_answer,
                    "hrQuestions.$.feedback": feedback_data["feedback"],
                    "hrQuestions.$.score": feedback_data["score"],
                    "hrQuestions.$.strengths": feedback_data["strengths"],
                    "hrQuestions.$.improvement_areas": feedback_data["improvement_areas"],
                    "hrQuestions.$.timestamp": datetime.now()
                }}
            )
        else:
            # If question does not exist, add new entry to hrQuestions array
            result = user_collection.update_one(
                {'email': email},
                {"$push": {"hrQuestions": new_data}}
            )
        
        if result:
            print(f"Updated user {email} record successfully.")
        else:
            print(f"User {email} not found or update failed.")
            
    except Exception as e:
        print(f"Error processing transcript: {e}")
        socketio.emit('transcript_feedback', {"feedback": "An error occurred while processing your answer."})

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/questions', methods=['GET'])
def get_questions():
    """API endpoint to get all questions"""
    questions_list = [{"id": i, "question": q} for i, q in enumerate(questions_db.keys())]
    return jsonify(questions_list)

@app.route('/api/user_progress/<email>', methods=['GET'])
def get_user_progress(email):
    """API endpoint to get user's progress"""
    user = user_collection.find_one({'email': email})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Extract relevant data
    progress = {
        "completed": len(user.get('hrQuestions', [])),
        "total": len(questions_db),
        "average_score": 0,
        "questions": []
    }
    
    # Calculate average score and format questions
    hr_questions = user.get('hrQuestions', [])
    if hr_questions:
        total_score = sum(q.get('score', 0) for q in hr_questions)
        progress["average_score"] = round(total_score / len(hr_questions), 1)
        
        for q in hr_questions:
            progress["questions"].append({
                "question": q.get('question', ''),
                "score": q.get('score', 0),
                "timestamp": q.get('timestamp', '')
            })
    
    return jsonify(progress)

from flask import jsonify, request
@app.route('/api/user_feedback/<email>', methods=['GET'])
def get_user_feedback(email):
    """API endpoint to get structured feedback for a user"""
    # Optional query parameter for a specific question
    question = request.args.get('question', None)
    
    user = user_collection.find_one({'email': email})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    hr_questions = user.get('hrQuestions', [])
    
    # If a specific question is requested
    if question:
        question_feedback = next((q for q in hr_questions if q.get('question') == question), None)
        if not question_feedback:
            return jsonify({"error": "Question not found for this user"}), 404
        
        # Format the response for a single question
        response = {
            "question": question_feedback.get('question', ''),
            "user_answer": question_feedback.get('user_answer', ''),
            "score": question_feedback.get('score', 0),
            "feedback": question_feedback.get('feedback', ''),
            "strengths": question_feedback.get('strengths', []),
            "improvement_areas": question_feedback.get('improvement_areas', []),
            "timestamp": question_feedback.get('timestamp', '')
        }
        
        return jsonify(response)
    
    # If all questions are requested
    feedback_list = []
    for question_feedback in hr_questions:
        feedback_list.append({
            "question": question_feedback.get('question', ''),
            "user_answer": question_feedback.get('user_answer', ''),
            "score": question_feedback.get('score', 0),
            "feedback": question_feedback.get('feedback', ''),
            "strengths": question_feedback.get('strengths', []),
            "improvement_areas": question_feedback.get('improvement_areas', []),
            "timestamp": question_feedback.get('timestamp', '')
        })
    
    return jsonify({"feedback": feedback_list})


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
            corrections
        ) = ats.processing(file.filename, 1, role)

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
    socketio.run(app, host='0.0.0.0', port=5000,debug=True)
