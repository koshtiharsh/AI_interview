from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
from flask_cors import CORS
import base64
from keras.models import model_from_json
from flask_pymongo import PyMongo
import random

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# Set up MongoDB URI
app.config["MONGO_URI"] = "mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti"
mongo = PyMongo(app)

# Access the 'userData' collection in the 'ai_interview' database
user_collection = mongo.db.userData

# Load the emotion detection model
emotion_dict = {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}

# Load JSON and create model
with open('model/emotion_model.json', 'r') as json_file:
    loaded_model_json = json_file.read()
emotion_model = model_from_json(loaded_model_json)
emotion_model.load_weights("model/emotion_model.h5")
print("Loaded model from disk")

# Haarcascade for face detection
face_detector = cv2.CascadeClassifier('haarcascades/haarcascade_frontalface_default.xml')

@socketio.on('image_frame')
def handle_image_frame(data):
    # Decode the base64-encoded image from the frontend
    img_data = base64.b64decode(data.split(',')[1])  # Remove 'data:image/png;base64,' part
    nparr = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert to grayscale and detect faces
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    num_faces = face_detector.detectMultiScale(gray_frame, scaleFactor=1.3, minNeighbors=5)

    results = []
    for (x, y, w, h) in num_faces:
        roi_gray_frame = gray_frame[y:y + h, x:x + w]
        cropped_img = np.expand_dims(np.expand_dims(cv2.resize(roi_gray_frame, (48, 48)), -1), 0)

        # Predict emotion
        emotion_prediction = emotion_model.predict(cropped_img)
        maxindex = int(np.argmax(emotion_prediction))
        emotion = emotion_dict[maxindex]
        results.append(emotion)
        
        if maxindex > 0:
            user_collection.find_one_and_update(
                {"name": 'harsh'},
                {'$inc': {f'emotion.{emotion}': 1}}
            )

    # Prepare the final output with detected emotions
    final_output = {
        "detected_faces": len(num_faces),
        "emotions": results
    }

    # Send the result back to the client
    emit('emotion_result', final_output)

@app.route('/')
def run():
    return render_template('index.html')





# gosavi code*************************************************************************************************
# gosavi code*************************************************************************************************
# gosavi code*************************************************************************************************
# gosavi code*************************************************************************************************
# gosavi code*************************************************************************************************

# List of words to avoid
avoid_words = {
    "actually", "honestly", "like", "basically", "very", "you know", "um",
    "uh", "I think", "always", "never", "perfect", "best", "crazy", "silly",
    "really", "good", "bad", "should", "could", "might", "maybe", "just",
    "probably", "hopefully", "essentially", "absolutely", "literally",
    "quite", "sort of", "kind of", "things", "stuff", "anything", "everything",
    "nothing", "anyway", "obviously", "seriously", "totally"
}

# List of must-use words
must_use_words = [
    "achieve", "adaptable", "communicate", "collaboration", "commitment",
    "competence", "creativity", "dependable", "development", "driven",
    "efficiency", "empathy", "enthusiastic", "flexible", "goals",
    "initiative", "innovate", "integrity", "leadership", "motivation",
    "objective", "open-minded", "performance", "problem-solving", "proactive",
    "professionalism", "quality", "resilience", "results-oriented", "strategic",
    "teamwork", "time-management", "trustworthy", "value", "vision",
    "work ethic", "customer-focused", "detail-oriented", "decision-making",
    "networking", "negotiation", "productivity", "relationship-building",
    "accountability", "initiative", "conflict resolution", "coaching",
    "feedback", "resourceful", "adaptability"
]

# Define a set of common HR interview questions
hr_questions = [
    "Where do you see yourself in five years?",
    "What are your greatest strengths?",
    "What is your greatest weakness?",
    "Why do you want to work here?",
    "Tell me about yourself." 
    
]

# Flag to track if it's the first question
first_question_sent = False

@socketio.on('send_transcript')
def handle_transcript(data):
    """
    Handle the transcript sent from the client.
    Analyze the received transcript for avoid words and must-use words.
    """
    transcript = data['transcript']
    print("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*")
    print(f"Received transcript: {transcript}")

    # Split the transcript into words
    words = transcript.lower().split()

    # Check for avoid words
    found_avoid_words = set(avoid_words).intersection(words)
    if found_avoid_words:
        print("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*")
        print(f"Avoid words found: {found_avoid_words}")

    # Check for must-use words
    found_must_use_words = set(must_use_words).intersection(words)
    if found_must_use_words:
        print("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*")
        print(f"Must-use words found: {found_must_use_words}")
    else:
        print("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*")
        print("Warning: No must-use words found in the transcript.")

    # Additional analysis can be done here (e.g., length of the transcript, feedback, etc.)
    transcript_length = len(words)
    print("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*")
    print(f"Transcript length (word count): {transcript_length}")

    # Prepare feedback for the client
    feedback = {
        "avoid_words": list(found_avoid_words),
        "must_use_words": list(found_must_use_words),
        "transcript_length": transcript_length
    }
    
    # Send feedback back to the client
    socketio.emit('transcript_feedback', feedback)


@socketio.on('request_question')
def send_random_question():
    global first_question_sent

    if not first_question_sent:
        question = hr_questions[0]  # Always send the first question
        first_question_sent = True  # Set the flag to True after sending the first question
    else:
        question = random.choice(hr_questions[1:])  # Send random question from the rest

    socketio.emit('new_question', {'question': question})



if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
