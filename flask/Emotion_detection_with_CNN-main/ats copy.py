# !pip install docx2txt

# !pip install PyPDF2
# All packages required for ats

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
from sklearn.feature_extraction.text import CountVectorizer
from nltk.tokenize import word_tokenize
from grammarcheck.ats_grammar_check import check_and_correct_pdf

# nltk.download('punkt')
# nltk.download('stopwords')
# nltk.download('averaged_perceptron_tagger')
# nltk.download('maxent_ne_chunker')
# nltk.download('words')
# nltk.download('punkt_tab')

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

def processing(resume_copy, choice, role):
    # preprocessing
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
        matched_skills = {skill for skill in skills_list if skill.lower() in job_keywords}  # Using a set to ensure uniqueness
        return list(matched_skills)  # Converting back to a list if needed

    def find_matching_skills_web(text, skills_list):
        text_keywords = set(word_tokenize(text.lower()))
        matching_skills = [
            skill for skill in skills_list if skill.lower() in text_keywords
        ]
        missing_skills = [
            skill for skill in skills_list if skill not in matching_skills
        ]

        return matching_skills, missing_skills

    def find_matching_skills_data(text, skill_for_DS):
        text_keywords = set(word_tokenize(text.lower()))
        matching_skills = [
            skill for skill in skill_for_DS if skill.lower() in text_keywords
        ]
        missing_skills = [
            skill for skill in skill_for_DS if skill not in matching_skills
        ]

        return matching_skills, missing_skills

    # taking the user input and resume #pg
    ch = choice
    # print("Choose Your file format")
    # print("1. PDF")
    # print("2. Docx")
    # ch = int(input("Enter the number: "))
    # job_des = input("Enter Job Description: ")
    job_des = jobDesc.get(role)
    job_des = job_des.lower()
    error = False

    if ch == 1:

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
                # print(f"The file '{pdf_file}' was not found.")
                return []

        extract_txt = extract_text_from_pdf("./static/uploads/" + resume_copy)
        fin_txt = []  # Initialize an empty list outside the loop
        for txt in extract_txt:
            txt = txt.lower()
            # print(txt)
            fin_txt.append(txt)

    elif ch == 2:
        resume = docx2txt.process(".static/uploads/" + resume_copy)
        resume = resume.lower()
        # print(resume)

    else:
        error = True

    # converting the array in string $pg
    ok = " ".join(fin_txt)

    # Checking the sections: #pg

    pdf_sections_found = []
    docx_sections_found = []
    section_found = []
    section_score = 0
    if ch == 1:
        if "professional experience" in ok or "projects" in ok or "experience" in ok:
            pdf_sections_found.append("Professional experience section found")

        if "education" in ok or "qualification" in ok:
            pdf_sections_found.append("Education section found")

        if "skills" in ok:
            pdf_sections_found.append("Skills section found")

        if "achievement" in ok:
            pdf_sections_found.append("Achievement section found")

        if "summary" in ok:
            pdf_sections_found.append("Summary section Found")
        section_found = pdf_sections_found

    elif ch == 2:
        if (
            "professional experience" in resume
            or "projects" in resume
            or "experience" in resume
        ):
            docx_sections_found.append("Professional experience section found")

        if "education" in resume or "qualification" in resume:
            docx_sections_found.append("Education section found")

        if "skills" in resume:
            docx_sections_found.append("Skills section found")

        if "achievement" in resume:
            docx_sections_found.append("Achievement section found")

        if "summary" in resume:
            docx_sections_found.append("Summary section Found")
        section_found = docx_sections_found

    # storing length of resume #hk
    resume_length = 0
    word_count = 0
    if ch == 1:
        resume_length = ok.split()
        word_count = len(resume_length)

    elif ch == 2:
        resume_length = resume.split()
        word_count = len(resume_length)

    # print(word_count)

    nltk.download("stopwords")  # hk

    # using the preprocessing function so that the stop words are removed
    if ch == 1:
        ok = clean_text(ok)

    elif ch == 2:
        resume = clean_text(resume)
        # print(resume)
        doc = [resume, job_des]

    job_des = clean_text(job_des)

    # print(job_des)
    z = [ok, job_des]

    a = CountVectorizer()

    # finding the similar key words

    if ch == 1:
        # print("pdf")
        c_at = a.fit_transform(z)
        # print(cosine_similarity(c_at))
        match = cosine_similarity(c_at)[0][1]
        match = match * 100
        match = round(match, 2)
        # print(match)

    elif ch == 2:
        # print("doc")
        c_mat = a.fit_transform(doc)
        # print(cosine_similarity(c_mat))
        match = cosine_similarity(c_mat)[0][1]
        match = match * 100
        match = round(match, 2)
        # print(match)

    nltk.download("punkt")

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
    # print(cleaned_skills)

    # Example job description
    job_description = job_des

    # Example usage
    matched_skills = match_skills(job_description, cleaned_skills)
    # print("Matched Skills:")
    # print(matched_skills)

    # Example text
    another_text = ok

    # Example usage
    matching_skills, missing_skills = find_matching_skills_web(
        another_text, matched_skills
    )

    # print("Matching Skills:")
    # print(matching_skills)
    # print("\nMissing Skills:")
    # print(missing_skills)

    word_count_score = 0
    if 500 < word_count and word_count < 700:
        word_count_score = 80
    elif 300 < word_count and word_count < 500:
        word_count_score = 60
    elif 200 < word_count and word_count < 300:
        word_count_score = 50
    elif 100 < word_count and word_count < 200:
        word_count_score = 35
    elif 701 < word_count and word_count < 800:
        word_count_score = 70
    elif 800 < word_count and word_count < 100:
        word_count_score = 65
    elif word_count > 1001:
        word_count_score = 60

    # sectionwise scoring
    section_count = len(section_found)
    if section_count == 5:
        section_score = 70
    elif section_count == 4:
        section_score = 60
    elif section_count == 3:
        section_score = 50
    elif section_count < 3:
        section_score = 45
    # scoring for skills

    skill_score = 0
    desc_skill = len(matched_skills)
    no_match = len(matching_skills)
    no_miss = len(missing_skills)

    if no_match == 0:
        skill_score = 20
    else:
        skill_score = no_match / desc_skill * 100
    # print("skill score", skill_score)
    # print("count score", word_count_score)

    # soft skills scoring
    soft_skills_list =  [
    "Communication", "Adaptability", "Teamwork", "Problem-solving", "Time-management",
    "Creativity", "Collaboration", "Critical-thinking", "Resilience", "Accountability",
    "Self-motivation", "Discipline", "Attention-to-detail", "Work-ethic", "Flexibility",
    "Emotional-intelligence", "Decision-making", "Conflict-resolution", "Patience", "Networking",
    "Active-listening", "Reliability", "Leadership", "Openness", "Self-discipline"
    ]
    cleaned_soft = clean_skills(soft_skills_list)

    # Example job description

    # Example usage
    matched_soft = match_skills(job_description, cleaned_soft)
    # print("Matched Skills:")

    # Example text

    # Example usage
    matching_soft, missing_soft = find_matching_skills_web(another_text, matched_soft)
    soft_skill_score = 0
    desc_skill_soft = len(matched_soft)
    no_match_soft = len(matching_soft)
    no_miss_soft = len(missing_soft)

    if no_match_soft == 0:
        soft_skill_score = 20
    else:
        soft_skill_score = no_match_soft / desc_skill_soft * 100
    # print("skill score", soft_skill_score)
    # print("count score", word_count_score)
    base_name, extension = os.path.splitext(resume_copy)

# Append "-1" to the base name

    print("tech_skills ", no_match_soft)
    print("tech_skills ", no_match_soft)
    print("tech_skills ", desc_skill_soft)
    print("tech_skills ", desc_skill_soft)
    print("available ", matched_soft)
    print("tech_skills ", matching_soft)
    print("tech_skills ", soft_skill_score)
    print("tech_skills ", soft_skill_score)
    print("tech_skills ", soft_skill_score)
    print("tech_skills ", soft_skill_score)
    print("tech_skills ", soft_skill_score)
    print("tech_skills ", soft_skill_score)
    print("tech_skills ", soft_skill_score)
    print("tech_skills ", soft_skill_score)
    new_file_name = f"{base_name}-1{extension}"
    # Now you can use the soft_skills_list in your Python code
    corrections= check_and_correct_pdf("./static/uploads/" + resume_copy, './static/uploads/'+new_file_name)


    final_score = (
        skill_score + section_score + word_count_score + soft_skill_score
    ) / 4
    # print("final score", final_score)

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


# processing("pt.pdf", 1, "html ,angular")
