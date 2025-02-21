# from typing import List
# import spacy
# import en_core_web_sm
# from PyPDF2 import PdfReader
# import docx2txt
# import nltk
# import string
# import re
# import os
# from nltk.corpus import stopwords
# from sklearn.metrics.pairwise import cosine_similarity
# from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
# from nltk.tokenize import word_tokenize
# from grammarcheck.ats_grammar_check import check_and_correct_pdf
# from collections import defaultdict

# # Load spaCy model
# nlp = en_core_web_sm.load()

# # Original job description dictionary
# jobDesc = { 'mern': '''We are seeking a passionate and motivated Junior MERN Stack Developer to join our dynamic development team. This entry-level position is perfect for fresh graduates or early-career developers who are eager to learn and grow in a supportive environment.
# Required Technical Skills

# Basic proficiency in MongoDB, Express.js, React.js, and Node.js
# Understanding of JavaScript/ES6+ fundamentals
# Knowledge of HTML5 and CSS3
# Basic understanding of RESTful APIs
# Version control using Git
# Basic command line familiarity

# Nice to Have

# Understanding of TypeScript basics
# Familiarity with responsive design principles
# Knowledge of testing frameworks (Jest, React Testing Library)
# Basic understanding of AWS or similar cloud platforms
# Experience with Agile methodologies

# Responsibilities

# Assist in developing and maintaining web applications using the MERN stack
# Write clean, maintainable code following team standards
# Collaborate with senior developers to learn best practices
# Participate in code reviews to enhance learning
# Help with basic debugging and troubleshooting
# Document code and maintain technical documentation
# Assist in testing and quality assurance

# Required Education & Experience

# Bachelor's degree in Computer Science, Software Engineering, or related field
# OR equivalent practical experience through bootcamps/self-learning
# Portfolio demonstrating basic MERN stack projects
# 0-1 year of professional experience

# Soft Skills

# Strong eagerness to learn and grow
# Good problem-solving abilities
# Excellent communication skills
# Ability to work well in a team
# Open to feedback and coaching
# Self-motivated and proactive

# What We Offer

# Structured mentorship program
# Regular training and learning opportunities
# Collaborative and supportive work environment
# Opportunity to work on real projects from day one
# Competitive salary for entry-level position
# Health insurance and other benefits
# Flexible work arrangements'''}

# class IntegratedResumeAnalyzer:
#     def __init__(self):
#         self.skills_list = [
#     # HTML & CSS
#     "HTML",
#     "Semantic HTML",
#     "CSS",
#     "CSS Grid",
#     "Flexbox",
#     "Responsive Design",
#     "Media Queries",
#     "CSS Variables",
#     "CSS Animations",
#     "Tailwind CSS",
#     "Bootstrap",
#     "SASS/SCSS",
#     "Material UI",
#     "Chakra UI",
    
#     # JavaScript & Frontend Frameworks
#     "JavaScript",
#     "ES6+ Features",
#     "DOM Manipulation",
#     "Event Handling",
#     "Async/Await",
#     "Promises",
#     "Fetch API",
#     "Local Storage",
#     "Session Storage",
#     "IndexedDB",
#     "Service Workers",
#     "Web Components",
#     "TypeScript",
#     "React.js",
#     "Next.js",
#     "Vue.js",
#     "Nuxt.js",
#     "Svelte",
#     "Angular",
#     "Redux",
#     "Zustand",
#     "Context API",
#     "React Query",
#     "React Router",
    
#     # Backend Development
#     "Node.js",
#     "Express.js",
#     "NestJS",
#     "Fastify",
#     "Hapi.js",
#     "Koa.js",
#     "Django",
#     "Flask",
#     "Spring Boot",
#     "Ruby on Rails",
#     "Laravel",
    
#     # Databases
#     "MongoDB",
#     "MySQL",
#     "PostgreSQL",
#     "SQLite",
#     "Redis",
#     "Firebase Firestore",
#     "DynamoDB",
#     "PlanetScale",
#     "Prisma ORM",
#     "Sequelize ORM",
    
#     # APIs & Authentication
#     "REST API",
#     "GraphQL",
#     "gRPC",
#     "WebSockets",
#     "Socket.io",
#     "OAuth",
#     "JWT Authentication",
#     "Session-based Authentication",
#     "Firebase Authentication",
    
#     # DevOps & Cloud
#     "Docker",
#     "Kubernetes",
#     "CI/CD (GitHub Actions, Jenkins)",
#     "AWS (S3, EC2, Lambda)",
#     "Google Cloud Platform (GCP)",
#     "Azure",
#     "Vercel",
#     "Netlify",
#     "Cloudflare",
    
#     # Performance & Security
#     "Frontend Performance Optimization",
#     "Backend Optimization",
#     "SEO Basics",
#     "Web Accessibility (a11y)",
#     "Lazy Loading",
#     "Image Optimization",
#     "Code Splitting",
#     "CORS",
#     "CSRF Protection",
#     "XSS Prevention",
#     "SQL Injection Prevention",
#     "Rate Limiting",
#     "Web Security Best Practices",
    
#     # Testing
#     "Unit Testing (Jest, Mocha, Chai)",
#     "End-to-End Testing (Cypress, Playwright)",
#     "Integration Testing",
#     "Load Testing",
    
#     # Version Control & Collaboration
#     "Git",
#     "GitHub",
   
    
#     # Other Tools & Skills
#     "Figma",
#     "Adobe XD",
#     "Framer Motion",
#     "Markdown",
#     "Nginx",
#     "Apache",
#     "Headless CMS (Strapi, Contentful)",
#     "PWA (Progressive Web Apps)",
#     "Serverless Functions",
#     "WebAssembly",
#     "Microservices Architecture"
# ]
        
#         self.soft_skills_list = [
#             "Communication", "Problem-solving", "Teamwork", "Learning",
#             "Adaptability", "Self-motivated", "Proactive", "Collaboration",
#             "Leadership", "Time management", "Critical thinking"
#         ]

#     def extract_text(self, file_path, choice):
#         """Extract text from PDF or DOCX"""
#         try:
#             if choice == 1:  # PDF
#                 with open(file_path, "rb") as pdf:
#                     reader = PdfReader(pdf)
#                     text = " ".join([page.extract_text() for page in reader.pages])
#             elif choice == 2:  # DOCX
#                 text = docx2txt.process(file_path)
#             return text.lower()
#         except Exception as e:
#             print(f"Error extracting text: {e}")
#             return None

#     def clean_text(self, text):
#         """Clean and preprocess text"""
#         text = re.sub(r"[^a-zA-Z\s]", "", text)
#         tokens = text.split()
#         stop_words = set(stopwords.words("english"))
#         tokens = [word for word in tokens if word.lower() not in stop_words]
#         return " ".join(tokens)

#     def extract_job_skills(self, job_desc):
#         """Extract skills from job description using both traditional and NLP methods"""
#         # Traditional method
#         job_skills = set()
#         for skill in self.skills_list:
#             if skill.lower() in job_desc.lower():
#                 job_skills.add(skill)

#         # NLP method
#         doc = nlp(job_desc)
#         for ent in doc.ents:
#             if ent.label_ in ["PRODUCT", "ORG"]:
#                 if any(skill.lower() in ent.text.lower() for skill in self.skills_list):
#                     job_skills.add(ent.text)

#         # Extract technical terms using noun phrases
#         for chunk in doc.noun_chunks:
#             if any(skill.lower() in chunk.text.lower() for skill in self.skills_list):
#                 job_skills.add(chunk.text)

#         return list(job_skills)

#     def extract_resume_skills(self, text, job_skills):
#         """Extract skills from resume and match against job skills"""
#         # Traditional method
#         resume_skills = set()
#         for skill in job_skills:
#             if skill.lower() in text.lower():
#                 resume_skills.add(skill)

#         # NLP method
#         doc = nlp(text)
        
#         # Use similarity to match skills
#         for sent in doc.sents:
#             for job_skill in job_skills:
#                 skill_doc = nlp(job_skill)
#                 if sent.similarity(skill_doc) > 0.85:
#                     resume_skills.add(job_skill)

#         return list(resume_skills)

#     def extract_soft_skills(self, text, job_desc):
#         """Extract soft skills using both traditional and NLP methods"""
#         # Extract soft skills from job description first
#         job_soft_skills = set()
#         for skill in self.soft_skills_list:
#             if skill.lower() in job_desc.lower():
#                 job_soft_skills.add(skill)

#         # Match resume soft skills against job description soft skills
#         matching_soft = set()
#         doc = nlp(text)
        
#         for skill in job_soft_skills:
#             if skill.lower() in text.lower():
#                 matching_soft.add(skill)
            
#             # NLP matching
#             skill_doc = nlp(skill)
#             for sent in doc.sents:
#                 if sent.similarity(skill_doc) > 0.85:
#                     matching_soft.add(skill)

#         return list(matching_soft), list(job_soft_skills - matching_soft)

#     def analyze_sections(self, text):
#         """Analyze document sections"""
#         sections = {
#             "experience": ["professional experience", "work experience", "projects"],
#             "education": ["education", "academic", "qualification"],
#             "skills": ["skills", "technical skills", "competencies"],
#             "achievements": ["achievements", "accomplishments", "awards"],
#             "summary": ["summary", "profile", "objective"]
#         }
        
#         found_sections = []
#         doc = nlp(text)
        
#         for section_type, keywords in sections.items():
#             if any(keyword in text.lower() for keyword in keywords):
#                 found_sections.append(f"{section_type.title()} section found")
        
#         return found_sections

#     def calculate_scores(self, matching_skills, job_skills, matching_soft, job_soft_skills, sections_found, word_count):
#         """Calculate comprehensive scores"""
#         # Skill match score
#         skill_score = (len(matching_skills) / len(job_skills) if job_skills else 0) * 100
        
#         # Soft skill score
#         soft_skill_score = (len(matching_soft) / len(job_soft_skills) if job_soft_skills else 0) * 100
        
#         # Section score
#         section_score = min(100, (len(sections_found) / 5) * 100)
        
#         # Word count score
#         word_count_score = (
#             80 if 500 < word_count <= 700 else
#             60 if 300 < word_count <= 500 else
#             50 if 200 < word_count <= 300 else
#             35 if 100 < word_count <= 200 else
#             70 if 701 < word_count <= 800 else
#             65 if 800 < word_count <= 1000 else
#             60 if word_count > 1000 else 30
#         )
        
#         # Final score
#         final_score = (skill_score + soft_skill_score + section_score + word_count_score) / 4
        
#         return final_score, skill_score, soft_skill_score, section_score, word_count_score

#     def process_resume(self, resume_copy, choice, role):
#         """Main processing function"""
#         file_path = f"./static/uploads/{resume_copy}"
        
#         # Extract and clean text
#         resume_text = self.extract_text(file_path, choice)
#         if not resume_text:
#             return None
        
#         job_desc = jobDesc.get(role, "").lower()
        
#         # Extract skills from job description
#         job_skills = self.extract_job_skills(job_desc)
        
#         # Extract and match skills from resume
#         matching_skills = self.extract_resume_skills(resume_text, job_skills)
#         missing_skills = list(set(job_skills) - set(matching_skills))
        
#         # Extract and match soft skills
#         matching_soft, missing_soft = self.extract_soft_skills(resume_text, job_desc)
        
#         # Analyze sections and calculate word count
#         sections_found = self.analyze_sections(resume_text)
#         word_count = len(resume_text.split())
        
#         # Calculate scores
#         final_score, skill_score, soft_skill_score, section_score, word_count_score = self.calculate_scores(
#             matching_skills, job_skills, matching_soft, self.soft_skills_list, sections_found, word_count
#         )
        
#         # Grammar check
#         base_name, extension = os.path.splitext(resume_copy)
#         new_file_name = f"{base_name}-1{extension}"
#         corrections = check_and_correct_pdf(file_path, f'./static/uploads/{new_file_name}')
        
#         return (
#             final_score,
#             matching_skills,
#             missing_skills,
#             matching_soft,
#             missing_soft,
#             word_count,
#             sections_found,
#             skill_score,
#             soft_skill_score,
#             word_count_score,
#             section_score,
#             corrections
#         )

# # Usage
# def processing(resume_copy, choice, role):
#     analyzer = IntegratedResumeAnalyzer()
#     return analyzer.process_resume(resume_copy, choice, role)


from typing import List
import spacy
import en_core_web_sm
from PyPDF2 import PdfReader
import docx2txt
import nltk
import string
import re
import os
from nltk.corpus import stopwords
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from nltk.tokenize import word_tokenize
from grammarcheck.ats_grammar_check import check_and_correct_pdf
from collections import defaultdict

# Load spaCy model
nlp = en_core_web_sm.load()

# Original job description dictionary
jobDesc = { 'mern': '''We are seeking a passionate and motivated Junior MERN Stack Developer to join our dynamic development team. This entry-level position is perfect for fresh graduates or early-career developers who are eager to learn and grow in a supportive environment.
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

class IntegratedResumeAnalyzer:
    def __init__(self):
        self.skills_list = [
            "MongoDB",
            "Express.js",
            "React.js",
            "Node.js",
            "JavaScript",
            "ES6+",
            "HTML5",
            "CSS3",
            "REST API",
            "Git",
            "TypeScript",
            "Jest",
            "AWS",
            "Agile",
            "Python",
            "Java",
            "C++",
            "SQL",
            "Docker",
            "Kubernetes",
            "Redux",
            "Angular",
            "Vue.js",
            "PostgreSQL",
            "MySQL",
            "GraphQL",
            "Bootstrap",
            "Sass",
            "WebSocket",
            "Redis"
        ]
        
        self.soft_skills_list = [
            "Communication",
            "Problem-solving",
            "Teamwork",
            "Leadership",
            "Time management",
            "Critical thinking",
            "Adaptability",
            "Collaboration",
            "Self-motivated",
            "Creativity",
            "Organization",
            "Decision making",
            "Analytical",
            "Project management",
            "Attention to detail"
        ]

    def extract_text(self, file_path, choice):
        """Extract text from PDF or DOCX"""
        try:
            if choice == 1:  # PDF
                with open(file_path, "rb") as pdf:
                    reader = PdfReader(pdf)
                    text = " ".join([page.extract_text() for page in reader.pages])
            elif choice == 2:  # DOCX
                text = docx2txt.process(file_path)
            return text
        except Exception as e:
            print(f"Error extracting text: {e}")
            return None

    def extract_job_skills(self, job_desc):
        """Extract skills from job description using both exact matching and ML"""
        job_skills = set()
        job_desc_lower = job_desc.lower()
        
        # 1. Exact matching with word boundaries
        for skill in self.skills_list:
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, job_desc_lower):
                job_skills.add(skill)
        
        # 2. ML-based extraction
        doc = nlp(job_desc)
        
        # Use NLP to identify technical terms
        for ent in doc.ents:
            if ent.label_ in ["PRODUCT", "ORG", "GPE"]:
                skill_text = ent.text.strip()
                if skill_text in self.skills_list:
                    job_skills.add(skill_text)
        
        # 3. Calculate embeddings similarity
        for skill in self.skills_list:
            skill_doc = nlp(skill)
            for sent in doc.sents:
                if skill_doc.vector_norm and sent.vector_norm:
                    similarity = skill_doc.similarity(sent)
                    if similarity > 0.95:
                        job_skills.add(skill)
        
        return list(job_skills)

    def extract_resume_skills(self, text, job_skills):
        """Extract skills from resume using exact matching and ML verification"""
        matching_skills = set()
        text_lower = text.lower()
        
        # 1. Exact matching
        for skill in job_skills:
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                matching_skills.add(skill)
        
        # 2. ML verification
        doc = nlp(text)
        for skill in job_skills:
            skill_doc = nlp(skill)
            for sent in doc.sents:
                if skill.lower() in sent.text.lower():
                    if skill_doc.vector_norm and sent.vector_norm:
                        similarity = skill_doc.similarity(sent)
                        if similarity > 0.90:
                            matching_skills.add(skill)
        
        # 3. TF-IDF analysis
        tfidf = TfidfVectorizer(stop_words='english')
        for skill in job_skills:
            skill_context = f"experience with {skill} development"
            texts = [text_lower, skill_context]
            try:
                tfidf_matrix = tfidf.fit_transform(texts)
                similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
                if similarity > 0.3:
                    matching_skills.add(skill)
            except:
                continue
        
        return list(matching_skills)

    def extract_soft_skills(self, text, job_desc):
        """Extract soft skills using exact matching and ML verification"""
        job_soft_skills = set()
        job_desc_lower = job_desc.lower()
        
        # Extract from job description
        for skill in self.soft_skills_list:
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, job_desc_lower):
                job_soft_skills.add(skill)
        
        # Extract from resume with ML verification
        matching_soft = set()
        doc = nlp(text)
        
        for skill in job_soft_skills:
            # Exact match
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text.lower()):
                matching_soft.add(skill)
            
            # ML verification
            skill_doc = nlp(skill)
            for sent in doc.sents:
                if skill_doc.vector_norm and sent.vector_norm:
                    similarity = skill_doc.similarity(sent)
                    if similarity > 0.90:
                        matching_soft.add(skill)
        
        missing_soft = job_soft_skills - matching_soft
        return list(matching_soft), list(missing_soft)

    def analyze_sections(self, text):
        """Analyze document sections using both pattern matching and ML"""
        sections = {
            "experience": ["professional experience", "work experience", "projects"],
            "education": ["education", "academic", "qualification"],
            "skills": ["skills", "technical skills", "competencies"],
            "achievements": ["achievements", "accomplishments", "awards"],
            "summary": ["summary", "profile", "objective"]
        }
        
        found_sections = []
        doc = nlp(text)
        text_lower = text.lower()
        
        # Pattern matching
        for section_type, keywords in sections.items():
            if any(keyword in text_lower for keyword in keywords):
                found_sections.append(f"{section_type.title()} section found")
        
        # ML-based section detection
        for sent in doc.sents:
            if len(sent.text.split()) <= 5:  # Potential header
                for section_type, keywords in sections.items():
                    for keyword in keywords:
                        keyword_doc = nlp(keyword)
                        if keyword_doc.vector_norm and sent.vector_norm:
                            similarity = keyword_doc.similarity(sent)
                            if similarity > 0.85:
                                section_name = f"{section_type.title()} section found"
                                if section_name not in found_sections:
                                    found_sections.append(section_name)
        
        return found_sections

    def calculate_scores(self, matching_skills, job_skills, matching_soft, job_soft_skills, sections_found, word_count):
        """Calculate comprehensive scores"""
        # Skill match score
        skill_score = (len(matching_skills) / len(job_skills) if job_skills else 0) * 100
        
        # Soft skill score
        soft_skill_score = (len(matching_soft) / len(job_soft_skills) if job_soft_skills else 0) * 100
        
        # Section score
        section_score = min(100, (len(sections_found) / 5) * 100)
        
        # Word count score
        word_count_score = (
            80 if 500 < word_count <= 700 else
            60 if 300 < word_count <= 500 else
            50 if 200 < word_count <= 300 else
            35 if 100 < word_count <= 200 else
            70 if 701 < word_count <= 800 else
            65 if 800 < word_count <= 1000 else
            60 if word_count > 1000 else 30
        )
        
        # Final score
        final_score = (skill_score + soft_skill_score + section_score + word_count_score) / 4
        
        return final_score, skill_score, soft_skill_score, section_score, word_count_score

    def process_resume(self, resume_copy, choice, role):
        """Main processing function"""
        file_path = f"./static/uploads/{resume_copy}"
        
        # Extract text
        resume_text = self.extract_text(file_path, choice)
        if not resume_text:
            return None
        
        job_desc = jobDesc.get(role, "")
        
        # Extract skills from job description
        job_skills = self.extract_job_skills(job_desc)
        
        # Extract and match skills from resume
        matching_skills = self.extract_resume_skills(resume_text, job_skills)
        missing_skills = list(set(job_skills) - set(matching_skills))
        
        # Extract and match soft skills
        matching_soft, missing_soft = self.extract_soft_skills(resume_text, job_desc)
        
        # Analyze sections and calculate word count
        sections_found = self.analyze_sections(resume_text)
        word_count = len(resume_text.split())
        
        # Calculate scores
        final_score, skill_score, soft_skill_score, section_score, word_count_score = self.calculate_scores(
            matching_skills, job_skills, matching_soft, self.soft_skills_list, sections_found, word_count
        )
        
        # Grammar check
        base_name, extension = os.path.splitext(resume_copy)
        new_file_name = f"{base_name}-1{extension}"
        corrections = check_and_correct_pdf(file_path, f'./static/uploads/{new_file_name}')
        
        return (
            final_score,
            matching_skills,
            missing_skills,
            matching_soft,
            missing_soft,
            word_count,
            sections_found,
            skill_score,
            soft_skill_score,
            word_count_score,
            section_score,
            corrections
        )

# Usage
def processing(resume_copy, choice, role):
    analyzer = IntegratedResumeAnalyzer()
    return analyzer.process_resume(resume_copy, choice, role)