import cv2
import numpy as np
from keras.models import model_from_json

emotion_dict = {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}

# Load json and create model
json_file = open('model/emotion_model.json', 'r')
loaded_model_json = json_file.read()
json_file.close()
emotion_model = model_from_json(loaded_model_json)

# Load weights into new model
emotion_model.load_weights("model/emotion_model.h5")
print("Loaded model from disk")

# Load the image from the specified directory
image_path = "image/test.png"  # Path to your image
frame = cv2.imread(image_path)
if frame is None:
    print(f"Error: Could not read the image from {image_path}")
    exit()

# Find haar cascade to draw bounding box around face
face_detector = cv2.CascadeClassifier('haarcascades/haarcascade_frontalface_default.xml')
gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

# Detect faces in the image
num_faces = face_detector.detectMultiScale(gray_frame, scaleFactor=1.3, minNeighbors=5)

# Take each face available in the image and preprocess it
for (x, y, w, h) in num_faces:
    roi_gray_frame = gray_frame[y:y + h, x:x + w]
    cropped_img = np.expand_dims(np.expand_dims(cv2.resize(roi_gray_frame, (48, 48)), -1), 0)

    # Predict the emotions
    emotion_prediction = emotion_model.predict(cropped_img)
    maxindex = int(np.argmax(emotion_prediction))
    
    # Print the predicted emotion
    print(f"Predicted emotion: {emotion_dict[maxindex]}")

# If no faces were detected
if len(num_faces) == 0:
    print("No faces detected.")
