from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
from flask_cors import CORS
import base64
from keras.models import model_from_json
from flask_pymongo import PyMongo

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

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

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
