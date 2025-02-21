from transformers import BertTokenizer, BertForSequenceClassification
import torch

# Load pre-trained model
MODEL_PATH = "qa_model/"
tokenizer = BertTokenizer.from_pretrained(MODEL_PATH)
model = BertForSequenceClassification.from_pretrained(MODEL_PATH)

def evaluate_answers(correct_answers, user_answers):
    feedback = []
    for q, ans in zip(correct_answers, user_answers):
        input_text = f"{q['Question text']} {ans}"
        inputs = tokenizer(input_text, return_tensors="pt", truncation=True, padding=True)
        outputs = model(**inputs)
        prediction = torch.argmax(outputs.logits, dim=1).item()

        feedback.append({
            "question": q['Question text'],
            "user_answer": ans,
            "correct": prediction == 1  # Assuming '1' indicates correct
        })
    return feedback
