import os
import re
import string
from typing import List
from PyPDF2 import PdfReader
import docx2txt
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize
from grammarcheck.ats_grammar_check import check_and_correct_pdf
from transformers import pipeline  # For skill extraction and soft skill matching




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


# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

# Initialize ML pipelines
skill_extractor = pipeline("ner", grouped_entities=True)
soft_skill_matcher = pipeline("zero-shot-classification")

def processing(resume_copy, choice, role):
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

    def extract_skills(text):
        results = skill_extractor(text)
        skills = [entity["word"] for entity in results if entity["entity_group"] == "SKILL"]
        return skills

    def match_soft_skills(text, soft_skills_list):
        results = soft_skill_matcher(text, candidate_labels=soft_skills_list)
        matched_skills = [label for label, score in zip(results["labels"], results["scores"]) if score > 0.5]
        return matched_skills

    def find_matching_skills_web(text, skills_list):
        text_keywords = set(word_tokenize(text.lower()))
        matching_skills = [skill for skill in skills_list if skill.lower() in text_keywords]
        missing_skills = [skill for skill in skills_list if skill not in matching_skills]
        return matching_skills, missing_skills

    def extract_text_from_pdf(pdf_file: str) -> List[str]:
        try:
            with open(pdf_file, "rb") as pdf:
                reader = PdfReader(pdf)
                pdf_text = []
                for page in reader.pages:
                    content = page.extract_text()
                    pdf_text.append(content)
                return pdf_text
        except FileNotFoundError:
            return []

    # Input processing
    ch = choice
    job_des = jobDesc.get(role).lower()
    error = False

    if ch == 1:
        extract_txt = extract_text_from_pdf("./static/uploads/" + resume_copy)
        fin_txt = []
        for txt in extract_txt:
            txt = txt.lower()
            fin_txt.append(txt)
        ok = " ".join(fin_txt)
    elif ch == 2:
        resume = docx2txt.process("./static/uploads/" + resume_copy).lower()
        ok = resume
    else:
        error = True

    # Resume length scoring
    resume_length = ok.split()
    word_count = len(resume_length)
    word_count_score = 0
    if 500 < word_count < 700:
        word_count_score = 80
    elif 300 < word_count < 500:
        word_count_score = 60
    elif 200 < word_count < 300:
        word_count_score = 50
    elif 100 < word_count < 200:
        word_count_score = 35
    elif 701 < word_count < 800:
        word_count_score = 70
    elif 800 < word_count < 1000:
        word_count_score = 65
    elif word_count > 1000:
        word_count_score = 60

    # Section detection
    section_found = []
    section_score = 0
    if ch == 1:
        if "professional experience" in ok or "projects" in ok or "experience" in ok:
            section_found.append("Professional experience section found")
        if "education" in ok or "qualification" in ok:
            section_found.append("Education section found")
        if "skills" in ok:
            section_found.append("Skills section found")
        if "achievement" in ok:
            section_found.append("Achievement section found")
        if "summary" in ok:
            section_found.append("Summary section Found")
    elif ch == 2:
        if "professional experience" in resume or "projects" in resume or "experience" in resume:
            section_found.append("Professional experience section found")
        if "education" in resume or "qualification" in resume:
            section_found.append("Education section found")
        if "skills" in resume:
            section_found.append("Skills section found")
        if "achievement" in resume:
            section_found.append("Achievement section found")
        if "summary" in resume:
            section_found.append("Summary section Found")

    section_count = len(section_found)
    if section_count == 5:
        section_score = 70
    elif section_count == 4:
        section_score = 60
    elif section_count == 3:
        section_score = 50
    elif section_count < 3:
        section_score = 45

    # Skill matching
    skills_list = [
        "Flask", "Django", "FastAPI", "Jinja", "SQLAlchemy", "Gunicorn", "Celery", "HTML", "CSS",
        "JavaScript", "REST", "API", "WebSockets", "Postgres", "SQLite", "Redis", "Bootstrap",
        "React", "Webpack", "Nginx", "JSON", "ORM", "MVC", "Templating", "AJAX", "XML", "Docker",
        "Kubernetes", "JQuery", "Python", "Unix", "Git", "Linux", "Vagrant", "Pipenv", "Virtualenv",
        "MySQL", "MongoDB", "OAuth", "JWT", "JWT Authentication", "TDD", "UnitTest", "Pytest",
        "pytest-django", "WebRTC", "HTML5", "CSS3", "SASS", "LESS", "NPM", "Yarn", "ES6", "Babel",
        "Webpack", "API Testing", "Pandas", "NumPy", "Asyncio", "Async", "Socket.IO", "OAuth2",
        "APIs", "Swagger", "JSON Schema", "RESTful", "CI/CD", "Postman", "Apache", "AWS", "Google Cloud",
        "Azure", "Heroku", "S3", "Cloud Functions", "Lambda", "Serverless", "Cloud Storage", "Redis Queue",
        "Flask-Login", "Flask-WTF", "Flask-SQLAlchemy", "Flask-Mail", "Flask-Admin", "Celery-Beat",
        "Flask-RESTful", "Flask-CORS", "Flask-User", "Docker Compose", "Django REST", "Django Channels",
        "Django ORM", "Django Forms", "Django Signals", "Django Migrations", "Django Celery", "Django Admin",
        "Django Templates", "Django Authentication", "Django Middleware", "Django Views", "Django Filters",
        "Django Caching", "Django Templating", "Uvicorn", "Selenium", "Scrapy", "BeautifulSoup",
        "Requests", "HTML Parsing", "Web Scraping", "Flask-RESTPlus", "Flask-Caching", "Flask-Uploads",
        "Flask-HTTPAuth", "Flask-Mail", "PythonAnywhere", "Gunicorn", "Pytest-Django", "Pytest-FactoryBoy",
        "GitHub Actions", "Jenkins", "Travis CI", "GitLab CI", "Jira", "Confluence", "Slack", "Trello"
    ]

    cleaned_skills = clean_skills(skills_list)
    matched_skills = extract_skills(ok)  # Using NER for skill extraction
    matching_skills, missing_skills = find_matching_skills_web(ok, matched_skills)

    skill_score = 0
    desc_skill = len(matched_skills)
    no_match = len(matching_skills)
    no_miss = len(missing_skills)
    if no_match == 0:
        skill_score = 20
    else:
        skill_score = no_match / desc_skill * 100

    # Soft skill matching
    soft_skills_list = [
        "Communication", "Adaptability", "Teamwork", "Problem-solving", "Time-management",
        "Creativity", "Collaboration", "Critical-thinking", "Resilience", "Accountability",
        "Self-motivation", "Discipline", "Attention-to-detail", "Work-ethic", "Flexibility",
        "Emotional-intelligence", "Decision-making", "Conflict-resolution", "Patience", "Networking",
        "Active-listening", "Reliability", "Leadership", "Openness", "Self-discipline"
    ]

    cleaned_soft = clean_skills(soft_skills_list)
    matched_soft = match_soft_skills(ok, cleaned_soft)  # Using zero-shot classification
    matching_soft, missing_soft = find_matching_skills_web(ok, matched_soft)

    soft_skill_score = 0
    desc_skill_soft = len(matched_soft)
    no_match_soft = len(matching_soft)
    no_miss_soft = len(missing_soft)
    if no_match_soft == 0:
        soft_skill_score = 20
    else:
        soft_skill_score = no_match_soft / desc_skill_soft * 100

    # Grammar correction
    base_name, extension = os.path.splitext(resume_copy)
    new_file_name = f"{base_name}-1{extension}"
    corrections = check_and_correct_pdf("./static/uploads/" + resume_copy, './static/uploads/' + new_file_name)

    # Final score calculation
    final_score = (skill_score + section_score + word_count_score + soft_skill_score) / 4

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
        corrections
    )