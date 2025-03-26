import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import torch
from transformers import BertTokenizer, BertForSequenceClassification
from random import shuffle
from pymongo import MongoClient
from functools import lru_cache
import time

app = Flask(__name__)
CORS(app)

# Database connection - consider using connection pooling
client = MongoClient('mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti')
db = client["ai_interview"]
answers_collection = db["answer"]

# Load the BERT model and tokenizer only once at startup
print("Loading BERT model...")
start_time = time.time()
model = BertForSequenceClassification.from_pretrained('./qa_model')
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model.eval()
print(f"Model loaded in {time.time() - start_time:.2f} seconds")

# Cache for questions dataset with TTL (time to live) of 1 hour
@lru_cache(maxsize=1)
def load_questions():
    print("Loading questions dataset...")
    start_time = time.time()
    with open('./utils/questions_dataset.json', 'r') as f:
        questions = json.load(f)
    print(f"Questions loaded in {time.time() - start_time:.2f} seconds")
    return questions

# Load questions at startup
QUESTIONS = load_questions()

# Question indexing for faster lookups
question_index = {}

def build_question_index():
    global question_index
    question_index = {q["Question text"]: q for q in QUESTIONS}
    
# Build index at startup
build_question_index()

# Create database indexes
def create_indexes():
    print("Creating database indexes...")
    # Create index on email for faster lookups
    answers_collection.create_index([("email", 1)])
    # Create compound index for the answer lookup
    answers_collection.create_index([("email", 1), ("question", 1)])
    print("Database indexes created")
# Create indexes at startup
create_indexes()

# Track session state
session_state = {}

def get_user_session(user_id):
    if user_id not in session_state:
        session_state[user_id] = {
            "asked_questions": set(),
            "questions_queue": [],
        }
    return session_state[user_id]

@app.route('/get_questions', methods=['POST'])
def get_questions():
    try:
        start_time = time.time()
        data = request.json
        skills = data.get("skills", [])
        
        if not skills:
            return jsonify({"error": "Skills array is required."}), 400

        # More efficient question selection algorithm
        skill_question_map = {}
        for skill in skills:
            skill_lower = skill.lower()
            skill_question_map[skill_lower] = []
            
        # Single pass through questions to categorize by skill
        for q in QUESTIONS:
            q_skill = q['Skills'].lower()
            if q_skill in skill_question_map:
                skill_question_map[q_skill].append(q)
                
        # Shuffle each skill's questions once
        for skill in skill_question_map:
            shuffle(skill_question_map[skill])
            
        # More efficient alternating algorithm
        alternated_questions = []
        skill_indices = {skill: 0 for skill in skill_question_map}
        
        while len(alternated_questions) < 50:
            added = False
            for skill in skills:
                skill_lower = skill.lower()
                questions = skill_question_map[skill_lower]
                idx = skill_indices[skill_lower]
                
                if idx < len(questions):
                    alternated_questions.append(questions[idx])
                    skill_indices[skill_lower] += 1
                    added = True
                    
                    if len(alternated_questions) == 50:
                        break
                        
            if not added:
                break  # Exit if we've exhausted all questions
                
        print(f"Questions generated in {time.time() - start_time:.2f} seconds")
        return jsonify({"questions": alternated_questions}), 200
    except Exception as e:
        print(f"Error in get_questions: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/evaluate_answer', methods=['POST'])
def evaluate_answer():
    try:
        start_time = time.time()
        data = request.json
        question = data.get("question", {})
        user_answer = data.get("user_answer", "").strip().lower()
        email = data.get("email")  # Get email from request data

        if not question or not user_answer:
            return jsonify({"error": "Question and user answer are required."}), 400
            
        if not email:
            return jsonify({"error": "Email is required."}), 400

        question_text = question["Question text"]
        ideal_answer = question["Ideal answer(s)"].strip().lower()
        
        # Use indexed lookup instead of linear search
        current_question = question_index.get(question_text)
        if not current_question:
            return jsonify({"error": "Question not found in database"}), 404
                
        keywords = [kw.lower() for kw in current_question.get("keywords", [])]

        # BERT evaluation - consider batching in production
        model_time_start = time.time()
        input_text = question_text + " " + user_answer
        inputs = tokenizer(input_text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        with torch.no_grad():  # Disable gradient calculation for inference
            outputs = model(**inputs)
        pred_score = torch.softmax(outputs.logits, dim=1)[0][1].item() * 100
        model_time = time.time() - model_time_start
        print(f"BERT inference completed in {model_time:.2f} seconds")

        # Keyword matching
        matched_keywords = [kw for kw in keywords if kw in user_answer]
        keyword_match_percentage = (len(matched_keywords) / len(keywords)) * 100 if keywords else 0

        # Final evaluation
        is_correct = pred_score >= 50 and keyword_match_percentage >= 40

        feedback = {
            "evaluation": "correct" if is_correct else "incorrect",
            "score": pred_score if is_correct else None,
        }

        if not is_correct:
            feedback.update({
                "missing_keywords": [kw for kw in keywords if kw not in user_answer],
                "correct_answer": ideal_answer,
            })

        answer_record = {
            "email": email,  # Use email instead of userID
            "question": question_text,
            "user_answer": user_answer,
            "feedback": feedback,
            "improvement": "Try to include more keywords next time." if "missing_keywords" in feedback else "Well done!"
        }

        # More efficient upsert operation - single DB call instead of two
        db_time_start = time.time()
        answers_collection.update_one(
            {"email": email, "question": question_text},  # Use email in the query
            {"$set": {
                "user_answer": user_answer, 
                "feedback": feedback, 
                "improvement": answer_record["improvement"]
            }},
            upsert=True
        )
        db_time = time.time() - db_time_start
        print(f"Database operation completed in {db_time:.2f} seconds")

        total_time = time.time() - start_time
        print(f"Total evaluation time: {total_time:.2f} seconds")
        return jsonify(feedback), 200
    except Exception as e:
        print(f"Error in evaluate_answer: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get_feedback', methods=['GET'])
def get_feedback():
    try:
        email = request.args.get("email")  # Get email from query params
        
        if not email:
            return jsonify({"error": "Email parameter is required"}), 400
            
        # Add a try block for the index hint approach
        try:
            # Check if index exists before using hint
            if "email_1" in answers_collection.index_information():
                user_answers = list(answers_collection.find(
                    {"email": email}, 
                    {"_id": 0}
                ).hint([("email", 1)]))
            else:
                user_answers = list(answers_collection.find(
                    {"email": email}, 
                    {"_id": 0}
                ))
        except Exception as db_error:
            # Fallback to standard query if hint fails
            print(f"Index hint failed: {str(db_error)}")
            user_answers = list(answers_collection.find(
                {"email": email}, 
                {"_id": 0}
            ))
        
        return jsonify({"feedback": user_answers}), 200
    except Exception as e:
        print(f"Error in get_feedback: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Optionally use gunicorn or uwsgi in production instead of the Flask dev server
    app.run(debug=True, port=5001, threaded=True)