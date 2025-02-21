# All required imports
from typing import List
from PyPDF2 import PdfReader
import docx2txt
import nltk
import spacy
import string
import re
import os
from nltk.corpus import stopwords
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from nltk.tokenize import word_tokenize
from grammarcheck.ats_grammar_check import check_and_correct_pdf
from collections import defaultdict
import en_core_web_sm

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')
nltk.download('maxent_ne_chunker')
nltk.download('words')
nltk.download('punkt_tab')

# Load spaCy model
nlp = en_core_web_sm.load()

jobDesc = { 'mern':'''We are seeking a passionate and motivated Junior MERN Stack Developer to join our dynamic development team. This entry-level position is perfect for fresh graduates or early-career developers who are eager to learn and grow in a supportive environment.
Required Technical Skills

Basic proficiency in MongoDB, Express.js, React.js, and Node.js
Understanding of JavaScript/ES6+ fundamentals
Knowledge of HTML5 and CSS3
Basic understanding of RESTful APIs
Version control using Git
Basic command line familiarity

Nice to Have

Understanding of TypeScript basics
Familiarity with responsive design principles
Knowledge of testing frameworks (Jest, React Testing Library)
Basic understanding of AWS or similar cloud platforms
Experience with Agile methodologies

Responsibilities

Assist in developing and maintaining web applications using the MERN stack
Write clean, maintainable code following team standards
Collaborate with senior developers to learn best practices
Participate in code reviews to enhance learning
Help with basic debugging and troubleshooting
Document code and maintain technical documentation
Assist in testing and quality assurance

Required Education & Experience

Bachelor's degree in Computer Science, Software Engineering, or related field
OR equivalent practical experience through bootcamps/self-learning
Portfolio demonstrating basic MERN stack projects
0-1 year of professional experience

Soft Skills

Strong eagerness to learn and grow
Good problem-solving abilities
Excellent communication skills
Ability to work well in a team
Open to feedback and coaching
Self-motivated and proactive

What We Offer

Structured mentorship program
Regular training and learning opportunities
Collaborative and supportive work environment
Opportunity to work on real projects from day one
Competitive salary for entry-level position
Health insurance and other benefits
Flexible work arrangements'''}

# ML/NLP Functions
def extract_skills_nlp(text):
    doc = nlp(text.lower())
    
    # Custom skill patterns
    skill_patterns = [
        [{'LOWER': 'machine'}, {'LOWER': 'learning'}],
        [{'LOWER': 'deep'}, {'LOWER': 'learning'}],
        [{'LOWER': 'natural'}, {'LOWER': 'language'}, {'LOWER': 'processing'}],
        [{'LOWER': 'data'}, {'LOWER': 'science'}],
        [{'LOWER': 'artificial'}, {'LOWER': 'intelligence'}],
        [{'LOWER': 'computer'}, {'LOWER': 'vision'}],
        [{'LOWER': 'full'}, {'LOWER': 'stack'}],
        [{'LOWER': 'front'}, {'LOWER': 'end'}],
        [{'LOWER': 'back'}, {'LOWER': 'end'}],
    ]
    
    matcher = spacy.matcher.Matcher(nlp.vocab)
    for i, pattern in enumerate(skill_patterns):
        matcher.add(f"Skill_{i}", [pattern])
    
    matches = matcher(doc)
    pattern_skills = [doc[start:end].text for _, start, end in matches]
    
    technical_terms = []
    for chunk in doc.noun_chunks:
        if any(token.pos_ in ['PROPN', 'NOUN'] for token in chunk):
            technical_terms.append(chunk.text)
    
    return list(set(pattern_skills + technical_terms))

def score_skills_ml(resume_text, job_description):
    tfidf = TfidfVectorizer(stop_words='english')
    documents = [resume_text, job_description]
    tfidf_matrix = tfidf.fit_transform(documents)
    
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    return similarity * 100

def extract_technical_skills(text):
    doc = nlp(text)
    technical_skills = []
    
    for token in doc:
        if token.dep_ in ['compound', 'amod'] and token.head.pos_ == 'NOUN':
            skill = ' '.join([token.text, token.head.text])
            technical_skills.append(skill)
    
    return list(set(technical_skills))

def extract_experience_details(text):
    doc = nlp(text)
    experience = []
    
    for ent in doc.ents:
        if ent.label_ in ['DATE', 'ORG']:
            experience.append((ent.text, ent.label_))
    
    return experience

def calculate_skill_weights(skills, context):
    weights = defaultdict(float)
    doc = nlp(context)
    
    for skill in skills:
        skill_doc = nlp(skill)
        similarity = skill_doc.similarity(doc)
        weights[skill] = similarity
    
    return dict(weights)

# Main Processing Function
def processing(resume_copy, choice, role):
    # Preprocessing functions
    def clean_text(text):
        text = re.sub(r"[^a-zA-Z\s]", "", text)
        tokens = text.split()
        stop_words = set(stopwords.words("english"))
        tokens = [word for word in tokens if word.lower() not in stop_words]
        cleaned_text = " ".join(tokens)
        return cleaned_text

    def clean_skills(skills_list):
        stop_words = set(stopwords.words("english"))
        punctuation = set(string.punctuation)
        cleaned_skills = [
            word
            for skill in skills_list
            for word in word_tokenize(skill.lower())
            if word.isalnum() and word not in stop_words and word not in punctuation
        ]
        return cleaned_skills

    def match_skills(job_description, skills_list):
        job_keywords = set(word_tokenize(job_description.lower()))
        matched_skills = {skill for skill in skills_list if skill.lower() in job_keywords}
        return list(matched_skills)

    def find_matching_skills_web(text, skills_list):
        text_keywords = set(word_tokenize(text.lower()))
        matching_skills = [
            skill for skill in skills_list if skill.lower() in text_keywords
        ]
        missing_skills = [
            skill for skill in skills_list if skill not in matching_skills
        ]
        return matching_skills, missing_skills

    # Initialize variables
    error = False
    resume_text = ""
    
    # Extract text from resume
    if choice == 1:
        try:
            with open("./static/uploads/" + resume_copy, "rb") as pdf:
                reader = PdfReader(pdf)
                resume_text = " ".join([page.extract_text() for page in reader.pages])
                fin_txt = [resume_text.lower()]
                ok = resume_text.lower()
        except FileNotFoundError:
            error = True
            return None
    elif choice == 2:
        resume_text = docx2txt.process("./static/uploads/" + resume_copy)
        resume = resume_text.lower()
        ok = resume
    else:
        error = True
        return None

    # Get job description
    job_des = jobDesc.get(role, "").lower()

    # Section Analysis
    section_found = []
    section_score = 0
    
    sections_to_check = {
        "experience": ["professional experience", "projects", "experience"],
        "education": ["education", "qualification"],
        "skills": ["skills"],
        "achievement": ["achievement"],
        "summary": ["summary"]
    }

    for section_type, keywords in sections_to_check.items():
        if any(keyword in ok for keyword in keywords):
            section_found.append(f"{section_type.title()} section found")

    # Word Count Analysis
    word_count = len(ok.split())
    word_count_score = 0
    
    if 500 < word_count <= 700:
        word_count_score = 80
    elif 300 < word_count <= 500:
        word_count_score = 60
    elif 200 < word_count <= 300:
        word_count_score = 50
    elif 100 < word_count <= 200:
        word_count_score = 35
    elif 701 < word_count <= 800:
        word_count_score = 70
    elif 800 < word_count <= 1000:
        word_count_score = 65
    elif word_count > 1000:
        word_count_score = 60

    # Section Score
    section_count = len(section_found)
    if section_count == 5:
        section_score = 70
    elif section_count == 4:
        section_score = 60
    elif section_count == 3:
        section_score = 50
    elif section_count < 3:
        section_score = 45

    # Skills Analysis
    skills_list = [
        "Flask", "Django", "FastAPI", "Jinja", "SQLAlchemy", "Gunicorn", "Celery", "HTML", "CSS", 
        "JavaScript", "REST", "API", "WebSockets", "Postgres", "SQLite", "Redis", "Bootstrap", 
        "React", "Webpack", "Nginx", "JSON", "ORM", "MVC", "Templating", "AJAX", "XML", "Docker", 
        "Kubernetes", "JQuery", "Python", "Unix", "Git", "Linux", "Vagrant", "Pipenv", "Virtualenv", 
        "MySQL", "MongoDB", "OAuth", "JWT", "JWT Authentication", "TDD", "UnitTest", "Pytest", 
        "pytest-django", "WebRTC", "HTML5", "CSS3", "SASS", "LESS", "NPM", "Yarn", "ES6", "Babel", 
        "Webpack", "API Testing", "Pandas", "NumPy", "Asyncio", "Async", "Socket.IO", "OAuth2", 
        "APIs", "Swagger", "JSON Schema", "RESTful", "CI/CD", "Postman", "Apache", "AWS", "Google Cloud", 
        "Azure", "Heroku", "S3", "Cloud Functions", "Lambda", "Serverless", "Cloud Storage", "Redis Queue"
    ]

    soft_skills_list = [
        "Communication", "Adaptability", "Teamwork", "Problem-solving", "Time-management",
        "Creativity", "Collaboration", "Critical-thinking", "Resilience", "Accountability",
        "Self-motivation", "Discipline", "Attention-to-detail", "Work-ethic", "Flexibility",
        "Emotional-intelligence", "Decision-making", "Conflict-resolution", "Patience", "Networking",
        "Active-listening", "Reliability", "Leadership", "Openness", "Self-discipline"
    ]

    # Clean and match skills
    cleaned_skills = clean_skills(skills_list)
    cleaned_soft = clean_skills(soft_skills_list)
    
    job_description = clean_text(job_des)
    matched_skills = match_skills(job_description, cleaned_skills)
    matched_soft = match_skills(job_description, cleaned_soft)
    
    matching_skills, missing_skills = find_matching_skills_web(ok, matched_skills)
    matching_soft, missing_soft = find_matching_skills_web(ok, matched_soft)

    # Calculate skill scores
    skill_score = (len(matching_skills) / len(matched_skills) * 100) if matched_skills else 20
    soft_skill_score = (len(matching_soft) / len(matched_soft) * 100) if matched_soft else 20

    # Enhanced ML/NLP Analysis
    nlp_skills = extract_skills_nlp(resume_text)
    ml_skill_score = score_skills_ml(resume_text, job_des)
    technical_skills = extract_technical_skills(resume_text)
    experience_details = extract_experience_details(resume_text)
    skill_weights = calculate_skill_weights(matching_skills + nlp_skills, job_des)

    # Calculate enhanced final score
    final_score = (
        skill_score + 
        section_score + 
        word_count_score + 
        soft_skill_score + 
        ml_skill_score
    ) / 5

    # Grammar check
    base_name, extension = os.path.splitext(resume_copy)
    new_file_name = f"{base_name}-1{extension}"
    corrections = check_and_correct_pdf("./static/uploads/" + resume_copy, './static/uploads/'+new_file_name)

    # Prepare enhanced results
    enhanced_results = {
        'nlp_extracted_skills': nlp_skills,
        'technical_skills': technical_skills,
        'experience_details': experience_details,
        'skill_weights': skill_weights,
        'ml_skill_score': ml_skill_score
    }

    return (
        final_score,
        matching_skills,
        missing_skills,
        matching_soft,
        missing_soft,
        word_count,
        section_found,
        skill_score,
        soft_skill_score,
        word_count_score,
        section_score,
        corrections,
        enhanced_results
    )