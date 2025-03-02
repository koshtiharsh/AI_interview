# !pip install docx2txt

# !pip install PyPDF2
# !pip install spacy
# !pip install scikit-learn
# !pip install nltk
# !pip install sentence-transformers
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
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from nltk.tokenize import word_tokenize
from sentence_transformers import SentenceTransformer
import numpy as np
from grammarcheck.ats_grammar_check import check_and_correct_pdf
from fuzzywuzzy import fuzz
# Download necessary NLTK resources
# nltk.download('punkt')
# nltk.download('stopwords')
# nltk.download('averaged_perceptron_tagger')
# nltk.download('maxent_ne_chunker')
# nltk.download('words')
# nltk.download('punkt_tab')

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # If model not found, download it
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Load sentence transformer model for better semantic matching
try:
    sentence_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
except:
    # If there's an error, use a simpler approach
    sentence_model = None

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
Flexible work arrangements'''
      ,

 "Software Engineer": "A Software Engineer is responsible for designing, developing, testing, and maintaining software applications that meet user needs. They work with programming languages like Python, Java, C++, and JavaScript to create scalable, efficient, and high-quality software solutions. Their duties include writing clean and maintainable code, collaborating with cross-functional teams, participating in code reviews, debugging and troubleshooting issues, and ensuring the software meets functional and non-functional requirements. They follow Agile or Scrum methodologies, contribute to software documentation, and may specialize in front-end, back-end, or full-stack development. They also stay updated with emerging technologies and best practices to improve system performance and security.",

    "Data Scientist": "A Data Scientist analyzes complex datasets to extract meaningful insights and support data-driven decision-making. They use statistical techniques, machine learning models, and data visualization tools to identify patterns and trends. Their responsibilities include data cleaning, preprocessing, feature engineering, and model selection. They work closely with stakeholders to understand business problems and provide predictive analytics solutions. They also use programming languages like Python and R, frameworks like TensorFlow and Scikit-Learn, and tools such as SQL, Hadoop, and Spark. Strong analytical skills, problem-solving abilities, and knowledge of artificial intelligence, natural language processing, and big data technologies are essential for this role.",
    "Cloud Architect": "A Cloud Architect designs, implements, and manages cloud computing solutions that support business objectives. They create scalable, secure, and cost-effective cloud architectures using platforms like AWS, Azure, and Google Cloud. Their responsibilities include selecting appropriate cloud services, optimizing workloads, ensuring data security, and managing cloud migrations. They also define cloud governance strategies, establish best practices for cloud computing, and work closely with DevOps and security teams to maintain system resilience. Knowledge of networking, automation, container orchestration, and cloud cost optimization is essential for this role.",

    "AI/ML Engineer": "An AI/ML Engineer develops machine learning models and artificial intelligence systems to solve complex problems. They work with large datasets, preprocess data, and fine-tune algorithms for applications like image recognition, natural language processing, and recommendation systems. They use frameworks such as TensorFlow, PyTorch, and Scikit-Learn, and program in Python, R, or C++. Their responsibilities include designing model architectures, optimizing performance, deploying models in production, and continuously improving AI solutions based on feedback. They collaborate with data scientists, software engineers, and domain experts to build intelligent systems that enhance decision-making and automation.",

    "Business Analyst": "A Business Analyst bridges the gap between business needs and technology solutions by gathering requirements, analyzing processes, and recommending improvements. Their responsibilities include conducting market research, performing SWOT analysis, documenting functional requirements, and creating data-driven reports. They use tools like Excel, SQL, Power BI, and Tableau to visualize data insights. They work closely with stakeholders, project managers, and developers to ensure successful implementation of business solutions. Strong analytical thinking, communication skills, and knowledge of business process modeling, UML diagrams, and agile methodologies are essential for this role.",

    "UI/UX Designer": "A UI/UX Designer focuses on creating user-friendly and visually appealing digital experiences. They conduct user research, develop wireframes and prototypes, and test user interactions to enhance usability. They use tools like Figma, Adobe XD, and Sketch to design intuitive interfaces that improve customer engagement. Their responsibilities include collaborating with developers, implementing accessibility standards, conducting A/B testing, and ensuring a seamless user journey across web and mobile platforms. They follow design thinking principles, stay updated with UI/UX trends, and work to optimize conversion rates through user-centered design strategies.",

    "QA Engineer": "A QA Engineer ensures the quality and reliability of software applications through testing and validation. They create test plans, write automated and manual test cases, and report bugs to developers. They use testing frameworks like Selenium, JUnit, and TestNG to automate test execution. Their responsibilities include performance testing, security testing, regression testing, and user acceptance testing. They work closely with developers to identify defects early in the development lifecycle and improve software robustness. Knowledge of CI/CD pipelines, API testing, and test-driven development (TDD) methodologies is essential for this role."
}

skills_list =  [
    "Python", "Java", "C", "C++", "C#", "JavaScript", "TypeScript", "Swift", "Kotlin", "Go",
    "Rust", "Ruby", "PHP", "Perl", "R", "Scala", "Dart", "Objective-C", "Haskell", "Lua",
    "Shell Scripting", "Bash", "PowerShell", "SQL", "NoSQL", "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis",
    "Cassandra", "Elasticsearch", "GraphQL", "Firebase", "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform",
    "Ansible", "Jenkins", "Git", "GitHub", "GitLab", "Bitbucket", "CI/CD", "Agile Methodology", "Scrum", "Kanban",
    "Linux", "Windows Server", "macOS", "Networking", "Cybersecurity", "Ethical Hacking", "Penetration Testing", "Firewall Management", "Intrusion Detection Systems", "Endpoint Security",
    "Blockchain", "Smart Contracts", "Solidity", "Ethereum", "Hyperledger", "NFT Development", "Cryptography", "Bitcoin", "DApps", "Web3",
    "AI", "Machine Learning", "Deep Learning", "Neural Networks", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Keras", "Scikit-Learn",
    "OpenCV", "Speech Recognition", "Reinforcement Learning", "Data Science", "Data Analysis", "Data Visualization", "Big Data", "Hadoop", "Spark", "Kafka",
    "ETL", "Tableau", "Power BI", "Looker", "Snowflake", "Google BigQuery", "Databricks", "Data Warehousing", "Data Engineering", "Data Governance",
    "Frontend Development", "React.js", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte", "Bootstrap", "Tailwind CSS", "Material UI",
    "HTML", "CSS", "SASS", "LESS", "Responsive Web Design", "Web Performance Optimization", "SEO", "Accessibility", "Progressive Web Apps", "WordPress",
    "Backend Development", "Node.js", "Express.js", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET Core", "Ruby on Rails",
    "Microservices", "Serverless Computing", "REST APIs", "GraphQL APIs", "gRPC", "WebSockets", "OAuth", "JWT", "API Gateway", "Load Balancing",
    "Cloud Computing", "DevOps", "IaC (Infrastructure as Code)", "Monitoring & Logging", "Prometheus", "Grafana", "Splunk", "ELK Stack", "New Relic", "Sentry",
    "Software Testing", "Unit Testing", "Integration Testing", "End-to-End Testing", "Test Automation", "Selenium", "Cypress", "Jest", "Mocha", "JUnit",
    "Mobile Development", "React Native", "Flutter", "SwiftUI", "Jetpack Compose", "Xamarin", "Ionic", "Cordova", "Mobile UI/UX", "App Store Deployment",
    "Game Development", "Unity", "Unreal Engine", "Cocos2d", "Godot", "Game Physics", "3D Modeling", "Augmented Reality (AR)", "Virtual Reality (VR)", "Metaverse Development",
    "Embedded Systems", "IoT (Internet of Things)", "Arduino", "Raspberry Pi", "ESP32", "LoRaWAN", "Edge Computing", "RTOS", "FPGA", "Robotics",
    "AI Ops", "MLOps", "AIOps", "AutoML", "Edge AI", "Explainable AI", "Generative AI", "AI Chatbots", "Conversational AI", "AI Ethics",
    "Quantum Computing", "Qiskit", "D-Wave", "Quantum Cryptography", "Post-Quantum Cryptography", "Quantum Machine Learning", "Quantum Algorithms", "Topological Quantum Computing", "Quantum Networking", "Quantum Error Correction",
    "Software Architecture", "Design Patterns", "Event-Driven Architecture", "Domain-Driven Design (DDD)", "CQRS", "Hexagonal Architecture", "Monolithic vs Microservices", "Distributed Systems", "High Availability", "Scalability",
    "Performance Optimization", "Concurrency", "Multithreading", "Parallel Computing", "Load Testing", "Profiling", "Memory Management", "Garbage Collection", "Code Refactoring", "Technical Debt",
    "Operating Systems", "Windows Administration", "Linux Administration", "MacOS Administration", "Embedded Linux", "Kernel Development", "Shell Programming", "File System Management", "Memory Management", "Process Scheduling",
    "Networking Concepts", "TCP/IP", "HTTP/HTTPS", "DNS", "VPN", "Proxy Servers", "Load Balancers", "CDN (Content Delivery Network)", "WebSockets", "MQTT",
    "Cybersecurity Concepts", "Encryption", "SSL/TLS", "PKI", "Zero Trust Security", "SIEM (Security Information & Event Management)", "SOC (Security Operations Center)", "Vulnerability Assessment", "Incident Response", "Forensics",
    "Cloud Security", "IAM (Identity & Access Management)", "Zero Trust Networking", "Cloud Compliance", "Security Audits", "Penetration Testing", "Malware Analysis", "Reverse Engineering", "Dark Web Monitoring", "Threat Intelligence",
    "IT Support", "Help Desk", "Remote Desktop", "ITSM (IT Service Management)", "Asset Management", "ITIL Framework", "Incident Management", "Change Management", "Disaster Recovery", "Backup & Restore",
    "Version Control", "Git", "SVN", "Mercurial", "Branching Strategies", "Code Review", "Git Hooks", "Git Rebase", "Git Cherry-Pick", "Git Squash",
    "Soft Skills for IT", "Technical Documentation", "Problem Solving", "Debugging", "Code Optimization", "Collaboration Tools", "JIRA", "Confluence", "Trello", "Slack"
]

soft_skills_list =  [
    "Communication", "Public Speaking", "Active Listening", "Presentation Skills", "Negotiation",
    "Leadership", "Teamwork", "Collaboration", "Conflict Resolution", "Empathy",
    "Adaptability", "Flexibility", "Time Management", "Self-Discipline", "Prioritization",
    "Problem-Solving", "Critical Thinking", "Decision Making", "Creativity", "Innovation",
    "Emotional Intelligence", "Self-Awareness", "Resilience", "Patience", "Growth Mindset",
    "Networking", "Interpersonal Skills", "Cultural Awareness", "Diversity and Inclusion", "Customer Service",
    "Work Ethic", "Accountability", "Ownership", "Motivation", "Self-Confidence",
    "Stress Management", "Work-Life Balance", "Open-Mindedness", "Constructive Feedback", "Coaching & Mentoring",
    "Project Management", "Agile Mindset", "Scrum Methodology", "Stakeholder Management", "Business Acumen",
    "Technical Writing", "Attention to Detail", "Presentation Design", "Continuous Learning","Decision-Making"
]
def processing(resume_copy, choice, role):
    # Enhanced preprocessing
    def clean_text(text):
        # More thorough cleaning with better regex pattern
        text = re.sub(r'[^\w\s]|_', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        tokens = text.split()
        stop_words = set(stopwords.words("english"))
        tokens = [word for word in tokens if word.lower() not in stop_words]
        cleaned_text = " ".join(tokens)
        return cleaned_text

    def clean_skills(skills_list):
        stop_words = set(stopwords.words("english"))
        punctuation = set(string.punctuation)
        cleaned_skills = []
        
        for skill in skills_list:
            # Handle multi-word skills better
            if ' ' in skill:
                cleaned_skills.append(skill.lower())  # Keep multi-word skills intact
            else:
                # Process single words
                words = word_tokenize(skill.lower())
                for word in words:
                    if word.isalnum() and word not in stop_words and word not in punctuation:
                        cleaned_skills.append(word)
        
        return cleaned_skills
    
    def extract_entities(text):
        """Extract named entities and technical terms using spaCy with improved pattern matching"""
        doc = nlp(text)
        entities = []
        
        # Extract named entities
        for ent in doc.ents:
            entities.append(ent.text.lower())
            
        # Extract technical terms (noun phrases that might represent skills)
        for chunk in doc.noun_chunks:
            if any(token.pos_ in ["NOUN", "PROPN"] for token in chunk):
                entities.append(chunk.text.lower())
        
        # Extract potential skills with custom patterns (programming languages, tools, etc.)
        skill_patterns = [
            r'\b[A-Za-z]+\+\+\b',  # C++, etc.
            r'\b[A-Za-z]+#\b',      # C#, etc.
            r'\b[A-Za-z]+\.[A-Za-z]+\b',  # .NET, etc.
            r'\b[A-Za-z]+-[A-Za-z]+\b',   # Hyphenated technologies
        ]
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, text)
            entities.extend([match.lower() for match in matches])
                
        return list(set(entities))

    def fuzzy_match_skills(text, skills_list, threshold=90):
        """Use fuzzy matching to find skills that might be spelled differently"""
        matched_skills = []
        text_lower = text.lower()
        
        for skill in skills_list:
            skill_lower = skill.lower()
            
            # Direct matching
            if skill_lower in text_lower:
                matched_skills.append(skill)
                continue
                
            # Fuzzy matching for single-word skills
            if ' ' not in skill_lower:
                # Check with different forms (plural/singular)
                singular = skill_lower
                plural = skill_lower + 's'
                plural_es = skill_lower + 'es'
                plural_ies = skill_lower[:-1] + 'ies' if skill_lower.endswith('y') else ''
                
                if (plural in text_lower or plural_es in text_lower or 
                    (plural_ies and plural_ies in text_lower)):
                    matched_skills.append(skill)
                    continue
                    
                # Try fuzzy matching
                for word in word_tokenize(text_lower):
                    similarity = fuzz.ratio(skill_lower, word)
                    if similarity >= threshold:
                        matched_skills.append(skill)
                        break
            else:
                # For multi-word skills, check if all words are within close proximity
                skill_words = skill_lower.split()
                # Create a window of text segments
                text_segments = [text_lower[i:i+100] for i in range(0, len(text_lower), 50)]
                
                for segment in text_segments:
                    if all(word in segment for word in skill_words):
                        matched_skills.append(skill)
                        break
        
        return matched_skills

    def match_skills_nlp(text, skills_list):
        """Enhanced skill matching using multiple NLP techniques"""
        # 1. Basic keyword matching
        text_lower = text.lower()
        basic_matched = []
        for skill in skills_list:
            skill_lower = skill.lower()
            if skill_lower in text_lower:
                basic_matched.append(skill)
        
        # 2. Entity extraction using spaCy
        entities = extract_entities(text)
        entity_matched = []
        for skill in skills_list:
            if skill.lower() in entities:
                entity_matched.append(skill)
        
        # 3. Fuzzy matching for misspelled or variant forms
        fuzzy_matched = fuzzy_match_skills(text, skills_list)
        
        # 4. Semantic similarity using sentence transformers (if available)
        semantic_matched = []
        if 'sentence_model' in globals() and sentence_model:
            try:
                # Get embeddings for skills and entities from text
                skill_embeddings = sentence_model.encode([skill.lower() for skill in skills_list])
                text_entities_embeddings = sentence_model.encode(entities)
                
                # Calculate similarity
                similarities = cosine_similarity(text_entities_embeddings, skill_embeddings)
                
                # For each entity, check if it's similar to any skill
                for i, entity in enumerate(entities):
                    for j, skill in enumerate(skills_list):
                        if similarities[i][j] > 0.9:  # Threshold for similarity
                            semantic_matched.append(skill)
            except Exception as e:
                # If there's an error with sentence transformers, skip this step
                logger.warning(f"Error in semantic matching: {str(e)}")
                pass
        
        # 5. Skill context matching (skills often appear in lists or certain contexts)
        context_matched = []
        skill_context_patterns = [
            r'skills:?\s(.*?)(?:\n|$)',
            r'technical:?\s(.*?)(?:\n|$)',
            r'technologies:?\s(.*?)(?:\n|$)',
            r'proficient in:?\s(.*?)(?:\n|$)',
            r'experienced with:?\s(.*?)(?:\n|$)',
        ]
        
        for pattern in skill_context_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                for skill in skills_list:
                    if skill.lower() in match.lower():
                        context_matched.append(skill)
        
        # Combine results (removing duplicates)
        combined_matched = list(set(basic_matched + entity_matched + fuzzy_matched + semantic_matched + context_matched))
        
        return combined_matched

    def find_matching_skills_enhanced(text, skills_list):
        """Find matching skills using multiple enhanced methods"""
        # Enhanced method with multiple techniques
        matching_skills_nlp = match_skills_nlp(text, skills_list)
        
        # Combine results (maintaining order from skills_list)
        matching_skills = []
        for skill in skills_list:
            if skill in matching_skills_nlp:
                matching_skills.append(skill)
        
        # Find missing skills
        missing_skills = [
            skill for skill in skills_list if skill not in matching_skills
        ]

        return matching_skills, missing_skills

    def extract_sections(text):
        """Enhanced section identification with multiple common heading patterns"""
        sections = {}
        section_patterns = {
            'experience': [
                r'(?:professional\s)?experience', 
                r'work\s(?:experience|history)',
                r'employment(?:\shistory)?',
                r'career(?:\shistory)?',
                r'projects'
            ],
            'education': [
                r'education(?:al)?(?:\sbackground)?',
                r'academic(?:\sbackground)?',
                r'qualification',
                r'academic\sprofile',
                r'degrees?'
            ],
            'skills': [
                r'technical\sskills',
                r'skills(?:\s&\sabilities)?',
                r'competencies',
                r'proficiencies',
                r'expertise',
                r'core\scompetencies'
            ],
            'achievement': [
                r'achievements?',
                r'accomplishments?',
                r'awards',
                r'honors?',
                r'recognitions?'
            ],
            'summary': [
                r'(?:professional\s)?summary',
                r'profile',
                r'objective',
                r'career\sobjective',
                r'about\sme',
                r'introduction'
            ]
        }
        
        found_sections = []
        
        for section_type, patterns in section_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    found_sections.append(f"{section_type.capitalize()} section found")
                    sections[section_type] = True
                    break
        
        return found_sections, sections

    # Improved text extraction based on file format
    def extract_text(file_path, file_type):
        """Extract text from different file formats with better handling"""
        try:
            if file_type == 1:  # PDF
                with open(file_path, "rb") as pdf:
                    reader = PdfReader(pdf)
                    text = []
                    for page in reader.pages:
                        content = page.extract_text()
                        if content:
                            text.append(content)
                    
                    # Handle PDFs with poor text extraction
                    if not text or all(not t.strip() for t in text):
                        # Try alternative extraction if primary method fails
                        try:
                            # Using PyMuPDF as a fallback if available
                            import fitz
                            doc = fitz.open(file_path)
                            text = []
                            for page in doc:
                                text.append(page.get_text())
                            doc.close()
                        except ImportError:
                            pass
                    
                    return " ".join(text)
                    
            elif file_type == 2:  # DOCX
                return docx2txt.process(file_path)
                
            elif file_type == 3:  # Plain text
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
                    
            elif file_type == 4:  # RTF
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    rtf_text = f.read()
                    try:
                        from striprtf.striprtf import rtf_to_text
                        return rtf_to_text(rtf_text)
                    except ImportError:
                        # Fallback simple RTF stripping
                        return re.sub(r'\\[a-z]+|\{|\}|\\|\n', ' ', rtf_text)
                        
            elif file_type == 5:  # HTML
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    html_content = f.read()
                    try:
                        from bs4 import BeautifulSoup
                        soup = BeautifulSoup(html_content, 'html.parser')
                        return soup.get_text(separator=' ')
                    except ImportError:
                        # Simple HTML tag removal
                        return re.sub(r'<[^>]+>', ' ', html_content)
            
            return ""
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            return ""

    # Main processing begins
    error = False
    ch = choice
    job_des = jobDesc.get(role, "").lower()
    
    # Determine file path
    file_path = os.path.join("./static/uploads/", resume_copy)
    
    # Auto-detect file type if not specified
    if ch == 0:  # Auto-detect
        _, ext = os.path.splitext(resume_copy)
        ext = ext.lower()
        if ext == '.pdf':
            ch = 1
        elif ext in ['.docx', '.doc']:
            ch = 2
        elif ext == '.txt':
            ch = 3
        elif ext == '.rtf':
            ch = 4
        elif ext in ['.html', '.htm']:
            ch = 5
        else:
            ch = 1  # Default to PDF if unknown
    
    # Extract text based on file type
    resume_text = extract_text(file_path, ch)
    
    if not resume_text:
        error = True
        return None
    
    resume_text = resume_text.lower()
    
    # Enhanced section identification
    section_found, sections_dict = extract_sections(resume_text)
    
    # Count words in resume
    resume_length = [word for word in resume_text.split() if word.strip()]
    word_count = len(resume_length)
    
    # Pre-process text for similarity comparison
    cleaned_resume = clean_text(resume_text)
    cleaned_job_des = clean_text(job_des)
    
    # Calculate overall similarity score using TF-IDF
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([cleaned_resume, cleaned_job_des])
        match = cosine_similarity(tfidf_matrix)[0][1] * 100
        match = round(match, 2)
    except:
        # Fallback if TF-IDF fails
        match = 0
    
    # Skills matching with improved algorithms
    cleaned_skills = clean_skills(skills_list)
    
    # Get skills mentioned in job description using better matching
    matched_skills = match_skills_nlp(job_des, skills_list)
    
    # Improved matching between resume and matched skills
    matching_skills, missing_skills = find_matching_skills_enhanced(
        resume_text, matched_skills
    )
    
    # Soft skills matching with similar improvements
    cleaned_soft = clean_skills(soft_skills_list)
    matched_soft = match_skills_nlp(job_des, cleaned_soft)
    matching_soft, missing_soft = find_matching_skills_enhanced(resume_text, matched_soft)
    
    # Calculate scores with improved logic
    # Word count score - more nuanced scoring
    word_count_score = 0
    if 450 <= word_count <= 750:  # Ideal range
        word_count_score = 80
    elif 300 <= word_count < 450:
        word_count_score = 70
    elif 750 < word_count <= 900:
        word_count_score = 70
    elif 200 <= word_count < 300:
        word_count_score = 60
    elif 900 < word_count <= 1100:
        word_count_score = 60
    elif 100 <= word_count < 200:
        word_count_score = 40
    elif word_count > 1100:
        word_count_score = 50
    else:  # Less than 100 words
        word_count_score = 30
    
    # Section score - weighted by importance
    section_score = 0
    section_weights = {
        'experience': 30,
        'skills': 25,
        'education': 20, 
        'summary': 15,
        'achievement': 10
    }
    
    for section, weight in section_weights.items():
        if sections_dict.get(section, False):
            section_score += weight
    
    # Cap at 100
    section_score = min(section_score, 100)
    
    # Technical skills score - improved calculation
    skill_score = 0
    desc_skill = len(matched_skills)
    no_match = len(matching_skills)
    
    if desc_skill > 0:
        # Base score on percentage of matched skills
        raw_score = (no_match / desc_skill) * 100
        
        # Bonus points for matching high-priority skills (if available)
        if 'priority_skills' in globals() and priority_skills:
            priority_matches = sum(1 for skill in matching_skills if skill in priority_skills)
            priority_bonus = min(15, priority_matches * 5)  # Up to 15% bonus
            raw_score = min(100, raw_score + priority_bonus)
            
        skill_score = raw_score
    else:
        skill_score = 20  # Default score when no skills in job description
    
    # Soft skills score - similar improvement
    soft_skill_score = 0
    desc_skill_soft = len(matched_soft)
    no_match_soft = len(matching_soft)
    
    if desc_skill_soft > 0:
        soft_skill_score = (no_match_soft / desc_skill_soft) * 100
    else:
        soft_skill_score = 20  # Default score
    
    # Generate corrected resume
    base_name, extension = os.path.splitext(resume_copy)
    new_file_name = f"{base_name}-1{extension}"
    corrections = check_and_correct_pdf(file_path, f'./static/uploads/{new_file_name}')
    
    # Calculate final score with weighted components
    component_weights = {
        'skill_score': 0.4,  # Technical skills are most important
        'section_score': 0.25,  # Structure is important
        'word_count_score': 0.15,  # Length is less important
        'soft_skill_score': 0.2   # Soft skills are moderately important
    }
    
    final_score = (
        skill_score * component_weights['skill_score'] +
        section_score * component_weights['section_score'] +
        word_count_score * component_weights['word_count_score'] +
        soft_skill_score * component_weights['soft_skill_score']
    )
    
    # Return results in the original format
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