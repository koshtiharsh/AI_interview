# # # # # # # # # # # # # # # from flask import Flask, request, jsonify
# # # # # # # # # # # # # # # from flask_cors import CORS
# # # # # # # # # # # # # # # from utils.resume_parser import parse_resume

# # # # # # # # # # # # # # # app = Flask(__name__)
# # # # # # # # # # # # # # # CORS(app)

# # # # # # # # # # # # # # # @app.route('/upload_resume', methods=['POST'])
# # # # # # # # # # # # # # # def upload_resume():
# # # # # # # # # # # # # # #     if 'resume' not in request.files:
# # # # # # # # # # # # # # #         return jsonify({'error': 'No resume file uploaded'}), 400

# # # # # # # # # # # # # # #     file = request.files['resume']
# # # # # # # # # # # # # # #     file_path = f'uploads/{file.filename}'
# # # # # # # # # # # # # # #     file.save(file_path)

# # # # # # # # # # # # # # #     try:
# # # # # # # # # # # # # # #         parsed_data = parse_resume(file_path)
# # # # # # # # # # # # # # #         return jsonify(parsed_data), 200
# # # # # # # # # # # # # # #     except Exception as e:
# # # # # # # # # # # # # # #         return jsonify({'error': str(e)}), 500

# # # # # # # # # # # # # # # if __name__ == '__main__':
# # # # # # # # # # # # # # #     app.run(debug=True)
# # # # # # # # # # # # # # from flask import Flask, request, jsonify
# # # # # # # # # # # # # # from flask_cors import CORS
# # # # # # # # # # # # # # from pdfminer.high_level import extract_text
# # # # # # # # # # # # # # import spacy

# # # # # # # # # # # # # # app = Flask(__name__)
# # # # # # # # # # # # # # CORS(app)

# # # # # # # # # # # # # # # Load the NLP model (spaCy)
# # # # # # # # # # # # # # nlp = spacy.load("en_core_web_sm")

# # # # # # # # # # # # # # def parse_resume(resume_text):
# # # # # # # # # # # # # #     """
# # # # # # # # # # # # # #     Parse the resume text and extract skills, experience, certifications, etc.
# # # # # # # # # # # # # #     """
# # # # # # # # # # # # # #     # Example static list of skills for demo purposes
# # # # # # # # # # # # # #     skills_db = ["Python", "Java", "JavaScript", "React", "Flask", "SQL", "Machine Learning", "Data Science" "Git","PowerBI", "Data Structures"]
# # # # # # # # # # # # # #     parsed_skills = []

# # # # # # # # # # # # # #     # Extract skills by checking case-insensitively in the raw text
# # # # # # # # # # # # # #     for skill in skills_db:
# # # # # # # # # # # # # #         if skill.lower() in resume_text.lower():
# # # # # # # # # # # # # #             parsed_skills.append(skill)
    
# # # # # # # # # # # # # #     # Static example for other details
# # # # # # # # # # # # # #     experience = "2+ years of experience in software development (example)"
# # # # # # # # # # # # # #     certifications = ["Certified Python Developer", "Google Data Analytics Certificate"]

# # # # # # # # # # # # # #     # Print parsed details
# # # # # # # # # # # # # #     print("Parsed Skills:")
# # # # # # # # # # # # # #     print(parsed_skills)
# # # # # # # # # # # # # #     print("\nOther Parsed Details:")
# # # # # # # # # # # # # #     print(f"Experience: {experience}")
# # # # # # # # # # # # # #     print(f"Certifications: {certifications}")
    
# # # # # # # # # # # # # #     return {
# # # # # # # # # # # # # #         "skills": parsed_skills,
# # # # # # # # # # # # # #         "experience": experience,
# # # # # # # # # # # # # #         "certifications": certifications
# # # # # # # # # # # # # #     }

# # # # # # # # # # # # # # @app.route('/upload_resume', methods=['POST'])
# # # # # # # # # # # # # # def upload_resume():
# # # # # # # # # # # # # #     """
# # # # # # # # # # # # # #     Handle resume upload and parsing.
# # # # # # # # # # # # # #     """
# # # # # # # # # # # # # #     if 'resume' not in request.files:
# # # # # # # # # # # # # #         return jsonify({"error": "No file uploaded"}), 400
    
# # # # # # # # # # # # # #     resume_file = request.files['resume']
    
# # # # # # # # # # # # # #     try:
# # # # # # # # # # # # # #         # Read the file content
# # # # # # # # # # # # # #         resume_content = resume_file.read()
        
# # # # # # # # # # # # # #         # Save the content to a temporary file (required by pdfminer)
# # # # # # # # # # # # # #         with open('temp_resume.pdf', 'wb') as temp_file:
# # # # # # # # # # # # # #             temp_file.write(resume_content)
        
# # # # # # # # # # # # # #         # Extract text from the temporary file
# # # # # # # # # # # # # #         resume_text = extract_text('temp_resume.pdf')
        
# # # # # # # # # # # # # #         # Parse the extracted text
# # # # # # # # # # # # # #         parsed_data = parse_resume(resume_text)
        
# # # # # # # # # # # # # #         return jsonify(parsed_data)
# # # # # # # # # # # # # #     except Exception as e:
# # # # # # # # # # # # # #         print(f"Error parsing resume: {e}")
# # # # # # # # # # # # # #         return jsonify({"error": "Failed to parse resume"}), 500

# # # # # # # # # # # # # # if __name__ == '__main__':
# # # # # # # # # # # # # #     app.run(debug=True)
# # # # # # # # # # # # # import os
# # # # # # # # # # # # # from flask import Flask, request, jsonify
# # # # # # # # # # # # # from flask_cors import CORS
# # # # # # # # # # # # # from pdfminer.high_level import extract_text
# # # # # # # # # # # # # from utils.resume_parser import parse_resume
# # # # # # # # # # # # # from utils.question_generator import generate_questions

# # # # # # # # # # # # # app = Flask(__name__)
# # # # # # # # # # # # # CORS(app)

# # # # # # # # # # # # # UPLOAD_FOLDER = "uploads"
# # # # # # # # # # # # # if not os.path.exists(UPLOAD_FOLDER):
# # # # # # # # # # # # #     os.makedirs(UPLOAD_FOLDER)


# # # # # # # # # # # # # @app.route('/upload_resume', methods=['POST'])
# # # # # # # # # # # # # def upload_resume():
# # # # # # # # # # # # #     """
# # # # # # # # # # # # #     Handle resume upload and parsing.
# # # # # # # # # # # # #     """
# # # # # # # # # # # # #     if 'resume' not in request.files:
# # # # # # # # # # # # #         return jsonify({"error": "No file uploaded"}), 400

# # # # # # # # # # # # #     resume_file = request.files['resume']
# # # # # # # # # # # # #     try:
# # # # # # # # # # # # #         # Save the file to a temporary location
# # # # # # # # # # # # #         file_path = os.path.join(UPLOAD_FOLDER, resume_file.filename)
# # # # # # # # # # # # #         resume_file.save(file_path)

# # # # # # # # # # # # #         # Parse the resume directly from the file path
# # # # # # # # # # # # #         parsed_data = parse_resume(file_path)

# # # # # # # # # # # # #         # Delete the temporary file after processing
# # # # # # # # # # # # #         os.remove(file_path)

# # # # # # # # # # # # #         return jsonify(parsed_data)
# # # # # # # # # # # # #     except Exception as e:
# # # # # # # # # # # # #         print(f"Error parsing resume: {e}")
# # # # # # # # # # # # #         return jsonify({"error": "Failed to parse resume"}), 500


# # # # # # # # # # # # # @app.route('/generate_questions', methods=['POST'])
# # # # # # # # # # # # # def generate_questions_api():
# # # # # # # # # # # # #     """
# # # # # # # # # # # # #     Generate technical questions based on parsed resume data.
# # # # # # # # # # # # #     """
# # # # # # # # # # # # #     try:
# # # # # # # # # # # # #         resume_data = request.get_json()
# # # # # # # # # # # # #         questions = generate_questions(resume_data)
# # # # # # # # # # # # #         return jsonify({"questions": questions})
# # # # # # # # # # # # #     except Exception as e:
# # # # # # # # # # # # #         print(f"Error generating questions: {e}")
# # # # # # # # # # # # #         return jsonify({"error": "Failed to generate questions"}), 500


# # # # # # # # # # # # # if __name__ == '__main__':
# # # # # # # # # # # # #     app.run(debug=True)

# # # # # # # # # # # # from flask import Flask, request, jsonify
# # # # # # # # # # # # from utils.resume_parser import parse_resume  # Ensure this module exists and works
# # # # # # # # # # # # import os

# # # # # # # # # # # # app = Flask(__name__)

# # # # # # # # # # # # # Directory to save uploaded files
# # # # # # # # # # # # UPLOAD_FOLDER = './uploads'
# # # # # # # # # # # # app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# # # # # # # # # # # # @app.route('/upload_resume', methods=['POST'])
# # # # # # # # # # # # def upload_resume():
# # # # # # # # # # # #     try:
# # # # # # # # # # # #         # Ensure the uploads directory exists
# # # # # # # # # # # #         if not os.path.exists(UPLOAD_FOLDER):
# # # # # # # # # # # #             os.makedirs(UPLOAD_FOLDER)

# # # # # # # # # # # #         # Validate if a file is included in the request
# # # # # # # # # # # #         if 'resume' not in request.files:
# # # # # # # # # # # #             return jsonify({"error": "No file part in the request"}), 400
# # # # # # # # # # # #         file = request.files['resume']
# # # # # # # # # # # #         if file.filename == '':
# # # # # # # # # # # #             return jsonify({"error": "No file selected"}), 400

# # # # # # # # # # # #         # Save the file
# # # # # # # # # # # #         file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
# # # # # # # # # # # #         file.save(file_path)

# # # # # # # # # # # #         # Parse the resume
# # # # # # # # # # # #         parsed_data = parse_resume(file_path)

# # # # # # # # # # # #         # Return parsed data
# # # # # # # # # # # #         return jsonify(parsed_data), 200

# # # # # # # # # # # #     except Exception as e:
# # # # # # # # # # # #         # Log the error and return a failure response
# # # # # # # # # # # #         print(f"Error: {e}")
# # # # # # # # # # # #         return jsonify({"error": "Failed to parse resume", "details": str(e)}), 500

# # # # # # # # # # # # if __name__ == '__main__':
# # # # # # # # # # # #     app.run(debug=True)  # Enable debugging for development
# # # # # # # # # # # from flask import Flask, request, jsonify
# # # # # # # # # # # from flask_cors import CORS
# # # # # # # # # # # from utils.question_generator import generate_questions
# # # # # # # # # # # import os
# # # # # # # # # # # import PyPDF2  # Library to extract text from PDF files

# # # # # # # # # # # app = Flask(__name__)
# # # # # # # # # # # CORS(app)  # This allows requests from any origin


# # # # # # # # # # # # Directory to save uploaded resumes
# # # # # # # # # # # UPLOAD_FOLDER = './uploads'
# # # # # # # # # # # app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# # # # # # # # # # # @app.route('/upload_resume', methods=['POST'])
# # # # # # # # # # # def upload_resume():
# # # # # # # # # # #     try:
# # # # # # # # # # #         # Ensure the uploads directory exists
# # # # # # # # # # #         if not os.path.exists(UPLOAD_FOLDER):
# # # # # # # # # # #             os.makedirs(UPLOAD_FOLDER)

# # # # # # # # # # #         # Check if a file is included in the request
# # # # # # # # # # #         if 'resume' not in request.files:
# # # # # # # # # # #             return jsonify({"error": "No file part in the request"}), 400
# # # # # # # # # # #         file = request.files['resume']
# # # # # # # # # # #         if file.filename == '':
# # # # # # # # # # #             return jsonify({"error": "No file selected"}), 400

# # # # # # # # # # #         # Save the uploaded resume
# # # # # # # # # # #         file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
# # # # # # # # # # #         file.save(file_path)

# # # # # # # # # # #         # Parse the resume (extract text)
# # # # # # # # # # #         with open(file_path, 'rb') as f:
# # # # # # # # # # #             pdf_reader = PyPDF2.PdfReader(f)
# # # # # # # # # # #             extracted_text = ''
# # # # # # # # # # #             for page in pdf_reader.pages:
# # # # # # # # # # #                 extracted_text += page.extract_text()

# # # # # # # # # # #         # Convert the text to lowercase for uniformity
# # # # # # # # # # #         parsed_text = extracted_text.lower()

# # # # # # # # # # #         # Log parsed data in the backend console
# # # # # # # # # # #         print("Parsed Resume Data:")
# # # # # # # # # # #         print(parsed_text)

# # # # # # # # # # #         # Generate questions based on the parsed data
# # # # # # # # # # #         questions = generate_questions(parsed_text)

# # # # # # # # # # #         # Return questions to the frontend
# # # # # # # # # # #         return jsonify({"questions": questions}), 200

# # # # # # # # # # #     except Exception as e:
# # # # # # # # # # #         print(f"Error: {e}")  # Log the error in the backend console
# # # # # # # # # # #         return jsonify({"error": "Failed to parse resume", "details": str(e)}), 500

# # # # # # # # # # # if __name__ == '__main__':
# # # # # # # # # # #     app.run(debug=True)
# # # # # # # # # # from flask import Flask, request, jsonify
# # # # # # # # # # from flask_cors import CORS  # Import Flask-CORS for handling CORS
# # # # # # # # # # from utils.question_generator import generate_questions
# # # # # # # # # # import os
# # # # # # # # # # import PyPDF2  # Library to extract text from PDF files

# # # # # # # # # # app = Flask(__name__)
# # # # # # # # # # CORS(app)  # Enable CORS for all origins

# # # # # # # # # # UPLOAD_FOLDER = './uploads'
# # # # # # # # # # app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# # # # # # # # # # @app.route('/upload_resume', methods=['POST'])
# # # # # # # # # # def upload_resume():
# # # # # # # # # #     try:
# # # # # # # # # #         if not os.path.exists(UPLOAD_FOLDER):
# # # # # # # # # #             os.makedirs(UPLOAD_FOLDER)

# # # # # # # # # #         if 'resume' not in request.files:
# # # # # # # # # #             return jsonify({"error": "No file part in the request"}), 400
# # # # # # # # # #         file = request.files['resume']
# # # # # # # # # #         if file.filename == '':
# # # # # # # # # #             return jsonify({"error": "No file selected"}), 400

# # # # # # # # # #         file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
# # # # # # # # # #         file.save(file_path)

# # # # # # # # # #         with open(file_path, 'rb') as f:
# # # # # # # # # #             pdf_reader = PyPDF2.PdfReader(f)
# # # # # # # # # #             extracted_text = ''
# # # # # # # # # #             for page in pdf_reader.pages:
# # # # # # # # # #                 extracted_text += page.extract_text()

# # # # # # # # # #         parsed_text = extracted_text.lower()

# # # # # # # # # #         # Log parsed resume in backend
# # # # # # # # # #         print("Parsed Resume Data:")
# # # # # # # # # #         print(parsed_text)

# # # # # # # # # #         questions = generate_questions(parsed_text)
# # # # # # # # # #         return jsonify({"questions": questions}), 200

# # # # # # # # # #     except Exception as e:
# # # # # # # # # #         print(f"Error: {e}")
# # # # # # # # # #         return jsonify({"error": "Failed to parse resume", "details": str(e)}), 500

# # # # # # # # # # if __name__ == '__main__':
# # # # # # # # # #     app.run(debug=True)
# # # # # # # # # from flask import Flask, request, jsonify
# # # # # # # # # from flask_socketio import SocketIO, emit
# # # # # # # # # from skill_extractor import extract_skills
# # # # # # # # # from evaluator import evaluate_answers
# # # # # # # # # import json
# # # # # # # # # import os

# # # # # # # # # app = Flask(__name__)
# # # # # # # # # app.config['UPLOAD_FOLDER'] = 'static/resumes'
# # # # # # # # # socketio = SocketIO(app, cors_allowed_origins="*")

# # # # # # # # # # Load predefined questions
# # # # # # # # # with open('questions.json') as f:
# # # # # # # # #     QUESTIONS = json.load(f)

# # # # # # # # # @app.route('/upload', methods=['POST'])
# # # # # # # # # def upload_resume():
# # # # # # # # #     file = request.files['resume']
# # # # # # # # #     if not file:
# # # # # # # # #         return jsonify({"error": "No file uploaded"}), 400

# # # # # # # # #     file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
# # # # # # # # #     file.save(file_path)

# # # # # # # # #     with open(file_path, 'rb') as f:
# # # # # # # # #         resume_text = f.read().decode('utf-8').lower()

# # # # # # # # #     skills = extract_skills(resume_text)
# # # # # # # # #     relevant_questions = [q for q in QUESTIONS if q['Skills'].lower() in skills]

# # # # # # # # #     return jsonify({"skills": skills, "questions": relevant_questions})

# # # # # # # # # @socketio.on('submit_answers')
# # # # # # # # # def handle_answers(data):
# # # # # # # # #     user_answers = data['answers']
# # # # # # # # #     correct_answers = [q['Ideal answer(s)'] for q in QUESTIONS if q['id'] in data['question_ids']]

# # # # # # # # #     feedback = evaluate_answers(user_answers, correct_answers)
# # # # # # # # #     emit('feedback', feedback)

# # # # # # # # # if __name__ == '__main__':
# # # # # # # # #     socketio.run(app, debug=True)
# # # # # # # # from flask import Flask, request, jsonify
# # # # # # # # from flask_cors import CORS
# # # # # # # # from flask_socketio import SocketIO, emit
# # # # # # # # from PyPDF2 import PdfReader
# # # # # # # # from skill_extractor import extract_skills
# # # # # # # # from evaluator import evaluate_answers
# # # # # # # # import os

# # # # # # # # app = Flask(__name__)
# # # # # # # # app.config['UPLOAD_FOLDER'] = 'static/resumes'
# # # # # # # # CORS(app)  # Enable CORS for all routes
# # # # # # # # socketio = SocketIO(app, cors_allowed_origins="*")

# # # # # # # # # Predefined questions
# # # # # # # # QUESTIONS = [
# # # # # # # #     {"id": 1, "Question text": "What is Python used for?", "Ideal answer(s)": "Python is used for web development, data analysis, AI, machine learning, and more.", "Skills": "python", "Difficulty level": "easy"},
# # # # # # # #     {"id": 2, "Question text": "Explain Flask.", "Ideal answer(s)": "Flask is a micro web framework for Python that is lightweight and easy to use.", "Skills": "flask", "Difficulty level": "medium"}
# # # # # # # # ]

# # # # # # # # @app.route('/upload', methods=['POST'])
# # # # # # # # def upload_resume():
# # # # # # # #     file = request.files['resume']
# # # # # # # #     if not file:
# # # # # # # #         return jsonify({"error": "No file uploaded"}), 400

# # # # # # # #     file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
# # # # # # # #     file.save(file_path)

# # # # # # # #     try:
# # # # # # # #         # Extract text from the uploaded PDF
# # # # # # # #         reader = PdfReader(file_path)
# # # # # # # #         resume_text = " ".join([page.extract_text() for page in reader.pages if page.extract_text()]).lower()

# # # # # # # #         # Extract skills and fetch relevant questions
# # # # # # # #         skills = extract_skills(resume_text)
# # # # # # # #         relevant_questions = [q for q in QUESTIONS if q['Skills'].lower() in skills]

# # # # # # # #         return jsonify({"skills": skills, "questions": relevant_questions})
# # # # # # # #     except Exception as e:
# # # # # # # #         return jsonify({"error": "Failed to process the resume", "details": str(e)}), 500


# # # # # # # # @socketio.on('submit_answers')
# # # # # # # # def handle_answers(data):
# # # # # # # #     user_answers = data.get('answers', [])
# # # # # # # #     question_ids = data.get('question_ids', [])

# # # # # # # #     # Fetch correct answers for the given question IDs
# # # # # # # #     correct_answers = [
# # # # # # # #         q['Ideal answer(s)'] for q in QUESTIONS if q['id'] in question_ids
# # # # # # # #     ]
# # # # # # # #     questions = [
# # # # # # # #         q['Question text'] for q in QUESTIONS if q['id'] in question_ids
# # # # # # # #     ]

# # # # # # # #     # Call the evaluation function
# # # # # # # #     feedback = evaluate_answers(questions, user_answers)
# # # # # # # #     emit('feedback', feedback)



# # # # # # # # if __name__ == '__main__':
# # # # # # # #     socketio.run(app, debug=True)
# # # # # # # from flask import Flask, request, jsonify
# # # # # # # from flask_cors import CORS
# # # # # # # from flask_socketio import SocketIO, emit
# # # # # # # from skill_extractor import extract_skills
# # # # # # # from evaluator import evaluate_answers
# # # # # # # import os
# # # # # # # import json

# # # # # # # app = Flask(__name__)
# # # # # # # app.config['UPLOAD_FOLDER'] = 'static/resumes'
# # # # # # # CORS(app)  # Enable CORS
# # # # # # # socketio = SocketIO(app, cors_allowed_origins="*")

# # # # # # # # Load the dataset
# # # # # # # with open('questions_dataset.json') as f:
# # # # # # #     QUESTIONS = json.load(f)

# # # # # # # @app.route('/upload', methods=['POST'])
# # # # # # # def upload_resume():
# # # # # # #     file = request.files.get('resume')
# # # # # # #     if not file:
# # # # # # #         return jsonify({"error": "No file uploaded"}), 400

# # # # # # #     file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
# # # # # # #     file.save(file_path)

# # # # # # #     # Extract skills from the resume
# # # # # # #     with open(file_path, 'rb') as f:
# # # # # # #         resume_text = f.read().decode('utf-8', errors='ignore').lower()
# # # # # # #     skills = extract_skills(resume_text)

# # # # # # #     # Filter questions based on extracted skills
# # # # # # #     relevant_questions = [
# # # # # # #         q for q in QUESTIONS if q['Skills'].lower() in skills
# # # # # # #     ]

# # # # # # #     return jsonify({"skills": skills, "questions": relevant_questions})

# # # # # # # @socketio.on('submit_answers')
# # # # # # # def handle_answers(data):
# # # # # # #     user_answers = data.get('answers', [])
# # # # # # #     question_ids = data.get('question_ids', [])

# # # # # # #     # Filter relevant questions and ideal answers
# # # # # # #     filtered_questions = [
# # # # # # #         q for q in QUESTIONS if q['id'] in question_ids
# # # # # # #     ]
# # # # # # #     correct_answers = [q['Ideal answer(s)'] for q in filtered_questions]
# # # # # # #     questions = [q['Question text'] for q in filtered_questions]

# # # # # # #     # Evaluate answers using the model
# # # # # # #     feedback = evaluate_answers(questions, user_answers)
# # # # # # #     emit('feedback', feedback)

# # # # # # # if __name__ == '__main__':
# # # # # # #     socketio.run(app, debug=True)
# # # # # # from flask import Flask, request, jsonify
# # # # # # from flask_cors import CORS
# # # # # # from flask_socketio import SocketIO, emit
# # # # # # from skill_extractor import extract_skills
# # # # # # from evaluator import evaluate_answers
# # # # # # import os
# # # # # # import json

# # # # # # app = Flask(__name__)
# # # # # # app.config['UPLOAD_FOLDER'] = 'static/resumes'
# # # # # # CORS(app)  # Enable CORS
# # # # # # socketio = SocketIO(app, cors_allowed_origins="*")

# # # # # # # Load the dataset
# # # # # # with open('questions_dataset.json') as f:
# # # # # #     QUESTIONS = json.load(f)

# # # # # # @app.route('/upload', methods=['POST'])
# # # # # # def upload_resume():
# # # # # #     file = request.files.get('resume')
# # # # # #     if not file:
# # # # # #         return jsonify({"error": "No file uploaded"}), 400

# # # # # #     file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
# # # # # #     file.save(file_path)

# # # # # #     try:
# # # # # #         # Extract skills from the resume
# # # # # #         with open(file_path, 'rb') as f:
# # # # # #             resume_text = f.read().decode('utf-8', errors='ignore').lower()
# # # # # #         skills = extract_skills(resume_text)
# # # # # #         print(f"Extracted Skills: {skills}")  # Debugging

# # # # # #         # Filter questions based on all extracted skills
# # # # # #         relevant_questions = [
# # # # # #             q for q in QUESTIONS if q['Skills'].lower() in skills
# # # # # #         ]
# # # # # #         print(f"Relevant Questions: {relevant_questions}")  # Debugging

# # # # # #         return jsonify({"skills": skills, "questions": relevant_questions})
# # # # # #     except Exception as e:
# # # # # #         return jsonify({"error": "Failed to process the resume", "details": str(e)}), 500

# # # # # # @socketio.on('submit_answers')
# # # # # # def handle_answers(data):
# # # # # #     user_answers = data.get('answers', [])
# # # # # #     question_ids = data.get('question_ids', [])

# # # # # #     # Filter relevant questions and ideal answers
# # # # # #     filtered_questions = [
# # # # # #         q for q in QUESTIONS if q['id'] in question_ids
# # # # # #     ]
# # # # # #     correct_answers = [q['Ideal answer(s)'] for q in filtered_questions]
# # # # # #     questions = [q['Question text'] for q in filtered_questions]

# # # # # #     # Evaluate answers using the model
# # # # # #     feedback = evaluate_answers(questions, user_answers)
# # # # # #     emit('feedback', feedback)

# # # # # # if __name__ == '__main__':
# # # # # #     socketio.run(app, debug=True)
# # # # # from flask import Flask, request, jsonify
# # # # # from flask_cors import CORS
# # # # # from flask_socketio import SocketIO, emit
# # # # # from skill_extractor import extract_skills
# # # # # import os
# # # # # import json

# # # # # app = Flask(__name__)
# # # # # app.config['UPLOAD_FOLDER'] = 'static/resumes'
# # # # # CORS(app)
# # # # # socketio = SocketIO(app, cors_allowed_origins="*")

# # # # # # Load questions dataset
# # # # # with open('questions_dataset.json') as f:
# # # # #     QUESTIONS = json.load(f)

# # # # # @app.route('/upload', methods=['POST'])
# # # # # def upload_resume():
# # # # #     file = request.files.get('resume')
# # # # #     if not file:
# # # # #         return jsonify({"error": "No file uploaded"}), 400

# # # # #     file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
# # # # #     file.save(file_path)

# # # # #     try:
# # # # #         # Read and convert PDF to text
# # # # #         with open(file_path, 'rb') as f:
# # # # #             resume_text = f.read().decode('utf-8', errors='ignore')
# # # # #             print(f"Raw Resume Content:\n{resume_text}")  # Debugging output
            
# # # # #             # Extract skills
# # # # #             skills = extract_skills(resume_text)
            
# # # # #             # Fetch relevant questions from dataset
# # # # #             relevant_questions = [
# # # # #                 q for q in QUESTIONS if any(skill in q['Skills'].lower() for skill in skills)
# # # # #             ]
# # # # #             print(f"Relevant Questions: {relevant_questions}")

# # # # #             return jsonify({"skills": skills, "questions": relevant_questions})
# # # # #     except Exception as e:
# # # # #         print(f"Error processing resume: {e}")
# # # # #         return jsonify({"error": str(e)}), 500



# # # # # if __name__ == '__main__':
# # # # #     socketio.run(app, debug=True)
# # # # from flask import Flask, request, jsonify
# # # # from flask_socketio import SocketIO
# # # # from skill_extractor import extract_skills
# # # # from evaluator import evaluate_answers
# # # # import os
# # # # import json
# # # # from flask_cors import CORS

# # # # app = Flask(__name__)
# # # # CORS(app)  # Enable CORS for all routes
# # # # socketio = SocketIO(app, cors_allowed_origins="*")
# # # # app.config['UPLOAD_FOLDER'] = 'uploads/'

# # # # # Load questions dataset
# # # # with open("questions_dataset.json", "r") as f:
# # # #     QUESTIONS = json.load(f)

# # # # @app.route('/upload', methods=['POST'])
# # # # def upload_resume():
# # # #     file = request.files.get('resume')
# # # #     if not file:
# # # #         return jsonify({"error": "No file uploaded"}), 400

# # # #     # Save file
# # # #     file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
# # # #     file.save(file_path)

# # # #     try:
# # # #         # Read the resume content
# # # #         with open(file_path, 'r', encoding='utf-8') as f:
# # # #             resume_text = f.read().lower()

# # # #         # Extract skills
# # # #         skills = extract_skills(resume_text)

# # # #         # Fetch relevant questions
# # # #         relevant_questions = [
# # # #             q for q in QUESTIONS if any(skill in q['Skills'].lower() for skill in skills)
# # # #         ]

# # # #         return jsonify({"skills": skills, "questions": relevant_questions})

# # # #     except Exception as e:
# # # #         return jsonify({"error": str(e)}), 500


# # # # @socketio.on('submit_answers')
# # # # def handle_answers(data):
# # # #     user_answers = data.get('answers', [])
# # # #     correct_answers = data.get('questions', [])

# # # #     feedback = evaluate_answers(correct_answers, user_answers)
# # # #     socketio.emit('feedback', feedback)

# # # # if __name__ == '__main__':
# # # #     socketio.run(app, debug=True)
# # # from flask import Flask, request, jsonify
# # # from flask_cors import CORS
# # # import os
# # # from skill_extractor import extract_skills
# # # from utils.pdf_reader import read_pdf  # A utility to extract text from PDFs
# # # import json

# # # app = Flask(__name__)
# # # CORS(app)  # Enable CORS for all origins

# # # UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
# # # app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# # # if not os.path.exists(UPLOAD_FOLDER):
# # #     os.makedirs(UPLOAD_FOLDER)

# # # # Load questions dataset
# # # with open('questions_dataset.json', 'r', encoding='utf-8') as f:
# # #     QUESTIONS = json.load(f)

# # # @app.route('/upload', methods=['POST'])
# # # def upload_resume():
# # #     try:
# # #         # Handle file upload
# # #         file = request.files.get('resume')
# # #         if not file:
# # #             raise ValueError("No file uploaded")

# # #         # Save file
# # #         file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
# # #         file.save(file_path)

# # #         # Read and process the PDF
# # #         resume_text = read_pdf(file_path).lower()

# # #         # Extract skills
# # #         skills = extract_skills(resume_text)

# # #         # Fetch relevant questions
# # #         relevant_questions = [
# # #             q for q in QUESTIONS if any(skill in q['Skills'].lower() for skill in skills)
# # #         ]

# # #         return jsonify({"skills": skills, "questions": relevant_questions}), 200
# # #     except Exception as e:
# # #         print(f"Error: {e}")  # Log error in backend terminal
# # #         return jsonify({"error": str(e)}), 500



# # # if __name__ == '__main__':
# # #     app.run(debug=True)
# # from flask import Flask, request, jsonify
# # from flask_cors import CORS
# # import os
# # import json
# # import torch
# # from transformers import BertTokenizer, BertForSequenceClassification

# # app = Flask(__name__)
# # CORS(app)

# # # Load the BERT model and tokenizer
# # model = BertForSequenceClassification.from_pretrained('./qa_model')
# # tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
# # model.eval()

# # # Load questions dataset
# # with open('questions_dataset.json', 'r') as f:
# #     QUESTIONS = json.load(f)

# # @app.route('/get_questions', methods=['POST'])
# # def get_questions():
# #     try:
# #         data = request.json
# #         skills = data.get("skills", [])
# #         if not skills or len(skills) != 3:
# #             return jsonify({"error": "Please provide exactly three skills."}), 400

# #         # Fetch relevant questions
# #         relevant_questions = [
# #             q for q in QUESTIONS if any(skill.lower() in q['Skills'].lower() for skill in skills)
# #         ]
# #         return jsonify({"questions": relevant_questions}), 200
# #     except Exception as e:
# #         return jsonify({"error": str(e)}), 500

# # @app.route('/evaluate_answer', methods=['POST'])
# # def evaluate_answer():
# #     try:
# #         data = request.json
# #         question = data.get("question", {})
# #         user_answer = data.get("user_answer", "")

# #         if not question or not user_answer:
# #             return jsonify({"error": "Question and user answer are required."}), 400

# #         question_text = question["Question text"]
# #         ideal_answer = question["Ideal answer(s)"]

# #         input_text = question_text + " " + user_answer
# #         inputs = tokenizer(input_text, return_tensors="pt", truncation=True, padding=True, max_length=512)
# #         outputs = model(**inputs)
# #         pred_score = torch.softmax(outputs.logits, dim=1)[0][1].item() * 100  # Probability for 'correct'

# #         feedback = {
# #             "evaluation": "correct" if pred_score >= 50 else "incorrect",
# #             "score": pred_score,
# #         }
# #         if pred_score < 50:
# #             feedback["correct_answer"] = ideal_answer

# #         return jsonify(feedback), 200
# #     except Exception as e:
# #         return jsonify({"error": str(e)}), 500

# # if __name__ == '__main__':
# #     app.run(debug=True)
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import os
# import json
# import torch
# from transformers import BertTokenizer, BertForSequenceClassification

# app = Flask(__name__)
# CORS(app)

# # Load the BERT model and tokenizer
# model = BertForSequenceClassification.from_pretrained('./qa_model')
# tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
# model.eval()

# # Load questions dataset
# with open('./utils/questions_dataset.json', 'r') as f:
#     QUESTIONS = json.load(f)

# # Track session state
# session_state = {"asked_questions": set()}


# @app.route('/get_questions', methods=['POST'])
# def get_questions():
#     try:
#         data = request.json
#         skills = data.get("skills", [])
#         if not skills or len(skills) != 3:
#             return jsonify({"error": "Please provide exactly three skills."}), 400

#         # Fetch relevant questions, ensuring no repeated questions
#         relevant_questions = [
#             q for q in QUESTIONS
#             if any(skill.lower() in q['Skills'].lower() for skill in skills) and q["id"] not in session_state["asked_questions"]
#         ]
#         if len(relevant_questions) > 5:
#             relevant_questions = relevant_questions[:5]  # Limit to max 5 questions

#         return jsonify({"questions": relevant_questions}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @app.route('/evaluate_answer', methods=['POST'])
# def evaluate_answer():
#     try:
#         data = request.json
#         question = data.get("question", {})
#         user_answer = data.get("user_answer", "").lower()

#         if not question or not user_answer:
#             return jsonify({"error": "Question and user answer are required."}), 400

#         question_text = question["Question text"]
#         ideal_answer = question["Ideal answer(s)"].lower()
#         keywords = question.get("keywords", [])

#         # Check keyword presence
#         matched_keywords = [kw for kw in keywords if kw in user_answer]
#         keyword_coverage = (len(matched_keywords) / len(keywords)) * 100 if keywords else 0

#         # Compute semantic similarity using BERT
#         input_text = question_text + " " + user_answer
#         inputs = tokenizer(input_text, return_tensors="pt", truncation=True, padding=True, max_length=512)
#         outputs = model(**inputs)
#         pred_score = torch.softmax(outputs.logits, dim=1)[0][1].item() * 100  # Probability for 'correct'

#         # Evaluation criteria
#         is_correct = pred_score >= 50 and keyword_coverage >= 40
#         feedback = {
#             "evaluation": "correct" if is_correct else "incorrect",
#             "score": pred_score,
#             "keyword_coverage": keyword_coverage,
#             "matched_keywords": matched_keywords,
#             "total_keywords": len(keywords),
#         }

#         if not is_correct:
#             feedback["missing_keywords"] = list(set(keywords) - set(matched_keywords))
#             feedback["correct_answer"] = ideal_answer

#         # Add question ID to asked_questions to prevent repetition
#         session_state["asked_questions"].add(question["id"])

#         return jsonify(feedback), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# if __name__ == '__main__':
#     app.run(debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import torch
from transformers import BertTokenizer, BertForSequenceClassification
from random import shuffle

app = Flask(__name__)
CORS(app)

# Load the BERT model and tokenizer
model = BertForSequenceClassification.from_pretrained('./qa_model')
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model.eval()

# Load questions dataset
with open('./utils/questions_dataset.json', 'r') as f:
    QUESTIONS = json.load(f)

# Track session state
session_state = {
    "asked_questions": set(),
    "questions_queue": [],
}


def generate_question_queue(skills):
    skill_to_questions = {skill: [] for skill in skills}
    for q in QUESTIONS:
        for skill in skills:
            if skill.lower() in q["Skills"].lower():
                skill_to_questions[skill].append(q)
    for skill in skill_to_questions:
        shuffle(skill_to_questions[skill])  # Randomize questions per skill
    # Interleave questions from all skills
    questions_queue = [q for skill in zip(*skill_to_questions.values()) for q in skill]
    return questions_queue


@app.route('/get_questions', methods=['POST'])
def get_questions():
    try:
        data = request.json
        skills = data.get("skills", [])
        if not skills:
            return jsonify({"error": "Skills array is required."}), 400

        # Fetch relevant questions and ensure they are unique and alternated by skill
        skill_question_map = {skill.lower(): [] for skill in skills}
        for q in QUESTIONS:
            skill = q['Skills'].lower()
            if skill in skill_question_map:
                skill_question_map[skill].append(q)

        # Create a list of questions by alternating between skills
        alternated_questions = []
        while len(alternated_questions) < 5:
            for skill in skills:
                skill_lower = skill.lower()
                if skill_question_map[skill_lower]:
                    alternated_questions.append(skill_question_map[skill_lower].pop(0))
                if len(alternated_questions) == 5:
                    break

        return jsonify({"questions": alternated_questions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/evaluate_answer', methods=['POST'])
def evaluate_answer():
    try:
        data = request.json
        question = data.get("question", {})
        user_answer = data.get("user_answer", "").strip().lower()

        if not question or not user_answer:
            return jsonify({"error": "Question and user answer are required."}), 400

        question_text = question["Question text"]
        ideal_answer = question["Ideal answer(s)"].strip().lower()
        keywords = [kw.lower() for kw in question.get("keywords", [])]

        # BERT model evaluation
        input_text = question_text + " " + user_answer
        inputs = tokenizer(input_text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        outputs = model(**inputs)
        pred_score = torch.softmax(outputs.logits, dim=1)[0][1].item() * 100  # Probability for 'correct'

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

        return jsonify(feedback), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True,port=5001)
