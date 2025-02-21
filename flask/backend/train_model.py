import pandas as pd
from sklearn.model_selection import train_test_split
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments
import torch

# Load the dataset
df = pd.read_json('questions_dataset.json')  # Assume your dataset is in JSON format
df['label'] = 1  # Label all as correct for now; for mismatched answers, use 0

# Split into training and validation sets
train_texts, val_texts, train_labels, val_labels = train_test_split(
    df['Question text'] + ' ' + df['Ideal answer(s)'],
    df['label'],
    test_size=0.2
)

# Tokenize data
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
train_encodings = tokenizer(list(train_texts), truncation=True, padding=True, max_length=512)
val_encodings = tokenizer(list(val_texts), truncation=True, padding=True, max_length=512)

# Convert to PyTorch datasets
class QADataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        # Return a dictionary with the expected keys
        return {
            'input_ids': torch.tensor(self.encodings['input_ids'][idx]),
            'attention_mask': torch.tensor(self.encodings['attention_mask'][idx]),
            'labels': torch.tensor(self.labels[idx], dtype=torch.long),
        }

    def __len__(self):
        return len(self.labels)


train_dataset = QADataset(train_encodings, train_labels.tolist())
val_dataset = QADataset(val_encodings, val_labels.tolist())

# Load pre-trained model
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=2)

# Set up training arguments
training_args = TrainingArguments(
    output_dir='./results',
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
    save_total_limit=1
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset
)

# Train the model
trainer.train()

# Save the model
model.save_pretrained('./qa_model')
tokenizer.save_pretrained('./qa_model')
