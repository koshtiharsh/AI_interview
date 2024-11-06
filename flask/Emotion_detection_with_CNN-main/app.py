# from flask import Flask, render_template, request
# from flask_socketio import SocketIO, emit
# from flask_cors import CORS
# from flask_pymongo import PyMongo
# import cv2
# import numpy as np
# import base64
# from keras.models import model_from_json
# import random
# import difflib

# # Initialize app and configure CORS and SocketIO
# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})
# socketio = SocketIO(app, cors_allowed_origins="*")

# # MongoDB setup
# app.config["MONGO_URI"] = "mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti"
# mongo = PyMongo(app)
# user_collection = mongo.db.userData

# # Emotion detection model setup
# emotion_dict = {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}
# with open('model/emotion_model.json', 'r') as json_file:
#     emotion_model = model_from_json(json_file.read())
# emotion_model.load_weights("model/emotion_model.h5")

# face_detector = cv2.CascadeClassifier('haarcascades/haarcascade_frontalface_default.xml')

# @socketio.on('image_frame')
# def handle_image_frame(data):
#     img_data = base64.b64decode(data.split(',')[1])
#     frame = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_COLOR)
#     gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#     num_faces = face_detector.detectMultiScale(gray_frame, scaleFactor=1.3, minNeighbors=5)
#     results = []

#     for (x, y, w, h) in num_faces:
#         cropped_img = np.expand_dims(np.expand_dims(cv2.resize(gray_frame[y:y + h, x:x + w], (48, 48)), -1), 0)
#         emotion_prediction = emotion_model.predict(cropped_img)
#         maxindex = int(np.argmax(emotion_prediction))
#         emotion = emotion_dict[maxindex]
#         results.append(emotion)
        
#         if maxindex > 0:
#             user_collection.find_one_and_update({"name": 'harsh'}, {'$inc': {f'emotion.{emotion}': 1}})

#     emit('emotion_result', {"detected_faces": len(num_faces), "emotions": results})

# # HR Interview QA Setup
# predefined_answers = {
#     "Where do you see yourself in five years?": "In five years, I see myself in a leadership position...",
#     "What are your greatest strengths?": "My greatest strengths are my problem-solving ability...",
#     "What is your greatest weakness?": "One of my weaknesses is over-committing...",
#     "Why do you want to work here?": "I want to work here because this company’s mission aligns...",
#     "Tell me about yourself.": "I am a dedicated professional with experience in X and Y..."
# }

# @socketio.on('send_transcript')
# def handle_transcript(data):
#     question = data['question']
#     user_answer = data['transcript']
#     correct_answer = predefined_answers.get(question)

#     print(f"User Answer: {user_answer}")
#     print(f"Correct Answer: {correct_answer}")
#     feedback = compare_answers(user_answer, correct_answer) if correct_answer else "No predefined answer available."

#     print(f"Feedback: {feedback}")
#     socketio.emit('transcript_feedback', {"feedback": feedback})

# def compare_answers(user_answer, correct_answer):
#     similarity = difflib.SequenceMatcher(None, user_answer, correct_answer).ratio() * 100
#     return f"Your answer is good but can be improved. Suggested response: {correct_answer}" if similarity < 90 else "Your answer is well-formed and relevant."

# @socketio.on('request_question')
# def send_random_question():
#     question = random.choice(list(predefined_answers.keys()))
#     socketio.emit('new_question', {'question': question})

# @app.route('/')
# def run():
#     return render_template('index.html')

# if __name__ == '__main__':
#     socketio.run(app, host='0.0.0.0', port=5000)

# from flask import Flask, render_template, request
# from flask_socketio import SocketIO, emit
# from flask_cors import CORS
# from flask_pymongo import PyMongo
# import cv2
# import numpy as np
# import base64
# from keras.models import model_from_json
# import random
# import difflib

# # Initialize app and configure CORS and SocketIO
# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})
# socketio = SocketIO(app, cors_allowed_origins="*")

# # MongoDB setup
# app.config["MONGO_URI"] = "mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti"
# mongo = PyMongo(app)
# user_collection = mongo.db.userData

# # Emotion detection model setup
# emotion_dict = {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}
# with open('model/emotion_model.json', 'r') as json_file:
#     emotion_model = model_from_json(json_file.read())
# emotion_model.load_weights("model/emotion_model.h5")

# face_detector = cv2.CascadeClassifier('haarcascades/haarcascade_frontalface_default.xml')

# @socketio.on('image_frame')
# def handle_image_frame(data):
#     img_data = base64.b64decode(data.split(',')[1])
#     frame = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_COLOR)
#     gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#     num_faces = face_detector.detectMultiScale(gray_frame, scaleFactor=1.3, minNeighbors=5)
#     results = []

#     for (x, y, w, h) in num_faces:
#         cropped_img = np.expand_dims(np.expand_dims(cv2.resize(gray_frame[y:y + h, x:x + w], (48, 48)), -1), 0)
#         emotion_prediction = emotion_model.predict(cropped_img)
#         maxindex = int(np.argmax(emotion_prediction))
#         emotion = emotion_dict[maxindex]
#         results.append(emotion)
        
#         if maxindex > 0:
#             user_collection.find_one_and_update({"name": 'harsh'}, {'$inc': {f'emotion.{emotion}': 1}})

#     emit('emotion_result', {"detected_faces": len(num_faces), "emotions": results})

# # HR Interview QA Setup
# predefined_answers = {
#     "Where do you see yourself in five years?": "In five years, I see myself in a leadership position, contributing significantly to the growth of the organization...",
#     "What are your greatest strengths?": "My greatest strengths are my problem-solving ability, leadership skills, and being a great team player...",
#     "What is your greatest weakness?": "One of my weaknesses is over-committing, but I've been working on time management...",
#     "Why do you want to work here?": "I want to work here because this company’s mission aligns with my values and career goals...",
#     "Tell me about yourself.": "I am a dedicated professional with experience in X and Y, always seeking opportunities for growth..."
# }

# # Function to compare answers and provide feedback
# def compare_answers(user_answer, correct_answer):
#     # Calculate the similarity ratio between user answer and correct answer
#     similarity = difflib.SequenceMatcher(None, user_answer, correct_answer).ratio() * 100

#     # If similarity is below the threshold, suggest an improvement
#     if similarity < 90:
#         return f"Your answer is good but can be improved. Here's a suggested response: {correct_answer}"
#     else:
#         return "Your answer is well-formed and relevant."

# @socketio.on('send_transcript')
# def handle_transcript(data):
#     """
#     Handle the transcript sent from the client.
#     Compare the user's answer with the predefined correct answer.
#     """
#     question = data['question']
#     user_answer = data['transcript']

#     print(f"Received transcript for question '{question}': {user_answer}")

#     # Get the predefined correct answer for the question
#     correct_answer = predefined_answers.get(question)

#     if correct_answer:
#         # Compare user's answer with the predefined answer
#         feedback = compare_answers(user_answer, correct_answer)
#     else:
#         feedback = "No predefined answer available for this question."

#     # Send feedback back to the client
#     socketio.emit('transcript_feedback', {"feedback": feedback})

# @socketio.on('request_question')
# def send_random_question():
#     # Select a random HR question
#     question = random.choice(list(predefined_answers.keys()))
#     socketio.emit('new_question', {'question': question})

    
# # New handler to send combined feedback (HR + Emotion)
# @socketio.on('request_combined_feedback')
# def handle_combined_feedback(data):
#     question = data.get('question', 'No question provided')
#     user_answer = data.get('transcript', '')
#     correct_answer = predefined_answers.get(question)
#     hr_feedback = compare_answers(user_answer, correct_answer) if correct_answer else "No predefined answer available."

#     # Adding emotion data to feedback
#     emotion = data.get('emotion', 'Neutral')
#     combined_feedback = {
#         "hr_feedback": hr_feedback,
#         "emotion_feedback": f"Emotion detected during answer: {emotion}"
#     }

#     print(f"Combined Feedback: {combined_feedback}")
#     socketio.emit('combined_feedback', combined_feedback)

# @app.route('/')
# def run():
#     return render_template('index.html')

# if __name__ == '__main__':
#     socketio.run(app, host='0.0.0.0', port=5000)
from flask import Flask, render_template, request ,redirect

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
# Initialize app and configure CORS and SocketIO
app = Flask(__name__, static_url_path="/static")
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# MongoDB setup
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

# Predefined correct answers for the HR questions
predefined_answers = {
    "Where do you see yourself in five years?": "In five years, I see myself taking on a senior role within the tech team, perhaps leading projects that involve emerging technologies like AI or machine learning. My goal is to advance both my technical and leadership skills, becoming someone the team can rely on for innovative solutions and mentorship. I hope to be someone who not only drives the company’s technical success but also inspires and empowers my team to reach new heights.  NOTE: Aim for 45-60 seconds. Long enough to outline your goals, but brief enough to keep it engaging.",

    "What are your greatest strengths?": "My greatest strengths include a strong aptitude for problem-solving, adaptability to new technologies, and a collaborative approach to teamwork. I excel at breaking down complex issues, developing efficient solutions, and staying updated with the latest industry trends. Being a team player, I actively contribute to group discussions and ensure that we work towards solutions that are both technically sound and aligned with business goals.  NOTE:Around 45-60 seconds. Mention 2-3 key strengths and give a brief example if possible.",

    "What is your greatest weakness?": "One of my weaknesses is that I sometimes get deeply focused on perfecting technical details, which can impact time management on larger projects. However, I've been addressing this by prioritizing tasks based on their impact and learning to balance thoroughness with deadlines. I’m consistently working on improving my time management skills to ensure that I deliver high-quality work efficiently. NOTE: Keep it to 30-45 seconds. Be honest but solution-focused, showing that you’re actively working to improve. ",

    "Why do you want to work here?": "I want to work here because your company is at the forefront of technological innovation and places a high value on continuous learning and growth. I’m inspired by the projects your team is working on, especially in areas like cloud computing and AI, which align with my career interests. I believe that working here will allow me to apply my skills in a meaningful way while also offering opportunities to deepen my expertise in cutting-edge technology.  NOTE: 45-60 seconds. Highlight what excites you about the company and how it aligns with your skills and goals.",

    "Tell me about yourself.": "I am a software engineer with a background in .... and ..... development, and I have hands-on experience with frameworks like .... . I’m passionate about creating efficient, scalable systems and enjoy solving complex technical challenges. In my last role, TELL ABOUT YOUR PROJECTS HERE. I’m always eager to expand my knowledge in emerging technologies, and I’m excited about the opportunity to contribute my skills to a team that values innovation and collaboration.  You can also include your hobbies,some other experiences,etc.  NOTE: Keep a bit longer, around 60-90 seconds. Cover your professional background, relevant skills, and what you’re aiming for in your next role "
}

# Function to compare answers and provide feedback
def compare_answers(user_answer, correct_answer):
    similarity = difflib.SequenceMatcher(None, user_answer, correct_answer).ratio() * 100
    return f"Your answer is good but can be improved. Suggested response: {correct_answer}" if similarity < 90 else "Your answer is well-formed and relevant."

@socketio.on('send_transcript')
def handle_transcript(data):
    question = data['hrQuestion']
    user_answer = data['transcript']
    correct_answer = predefined_answers.get(question)
    feedback = compare_answers(user_answer, correct_answer) if correct_answer else "No predefined answer available."
    print(feedback)
    socketio.emit('transcript_feedback', {"feedback": feedback})

@socketio.on('request_question')
def send_random_question():
    question = random.choice(list(predefined_answers.keys()))
    socketio.emit('new_question', {'question': question})

# Route for testing
@app.route('/')
def run():
    return render_template('index.html')



# **********************************************************************************************************************************
# **********************************************************************************************************************************
# ********************************************************** ATS Start    ******************************************************************
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
    desc = request.form["jobDescription"]
    if file.filename == "":
        return redirect(request.url)
    print(file.filename)
    if file and allowed_file(file.filename):
        filename = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(filename)
        # Call your processing script here with the filename as an argument
        # process_resume(filename)
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
        ) = ats.processing(file.filename, 1, desc)
        struct = str(int(sc)) + "%"
        hsp = str(int(hs)) + "%"
        ssp = str(int(ss)) + "%"
        wcp = str(int(wc)) + "%"
        pdfFileName = file.filename

        print(word_count)
        return render_template(
            "result.html",
            final=int(score),
            struct=struct,
            hsp=hsp,
            ssp=ssp,
            wcp=wcp,
            sections=sections,
            match_hard=list(set(match_hard)),
            missing_hard=missing_hard,
            match_soft=list(set(match_soft)),
            missing_soft=missing_soft,
            word_count=word_count,
            pdfFileName=pdfFileName,
        )
    else:
        return "Invalid file format! Allowed formats: pdf, docx"

# **********************************************************************************************************************************
# **********************************************************************************************************************************
# ********************************************************** ATS end    ******************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************




if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000,debug=True)
