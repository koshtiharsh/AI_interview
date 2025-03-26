import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from flask import Flask, render_template, request ,redirect,jsonify
from datetime import datetime
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from flask_pymongo import PyMongo
import cv2
import numpy as np
import base64
from keras.models import model_from_json
import random
import difflib
import os
import ats
import spacy
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re
import string
from collections import Counter
from pymongo import MongoClient
import os
from textblob import TextBlob
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_md")
except:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_md"])
    nlp = spacy.load("en_core_web_md")
# try:
#     nltk.data.find('vader_lexicon')
#     nltk.data.find('punkt')
#     nltk.data.find('stopwords')
# except LookupError:
#     nltk.download('vader_lexicon')
#     nltk.download('punkt')
#     nltk.download('stopwords')

# Initialize app and configure CORS and SocketIO
app = Flask(__name__, static_url_path="/static")
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# # MongoDB setup
app.config["MONGO_URI"] = "mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti"
mongo = PyMongo(app)
user_collection = mongo.db.userData

# Emotion detection model setup
emotion_dict = {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}
with open('model/emotion_model.json', 'r') as json_file:
    emotion_model = model_from_json(json_file.read())
emotion_model.load_weights("model/emotion_model.h5")

face_detector = cv2.CascadeClassifier('haarcascades/haarcascade_frontalface_default.xml')

@socketio.on('image_frame')
def handle_image_frame(data):
    img_data = base64.b64decode(data.split(',')[1])
    frame = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_COLOR)
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    num_faces = face_detector.detectMultiScale(gray_frame, scaleFactor=1.3, minNeighbors=5)
    results = []

    for (x, y, w, h) in num_faces:
        cropped_img = np.expand_dims(np.expand_dims(cv2.resize(gray_frame[y:y + h, x:x + w], (48, 48)), -1), 0)
        emotion_prediction = emotion_model.predict(cropped_img)
        maxindex = int(np.argmax(emotion_prediction))
        emotion = emotion_dict[maxindex]
        results.append(emotion)
        
        if maxindex > 0:
            user_collection.find_one_and_update({"name": 'harsh'}, {'$inc': {f'emotion.{emotion}': 1}})

    emit('emotion_result', {"detected_faces": len(num_faces), "emotions": results})



questions_db = {

             "Tell me about yourself.": {
                "ideal_answer": "I am a software engineer with 5 years of experience in full-stack development, specializing in cloud-native applications. My expertise includes React, Node.js, and AWS services. In my current role at XYZ Tech, I've led the development of a microservices architecture that reduced deployment time by 60% and improved scalability during peak traffic periods. Previously, I contributed to an open-source project that simplifies API integration for small businesses. I have a computer science degree from State University and recently completed a machine learning certification. Outside work, I enjoy contributing to tech communities through mentorship and occasional technical blogging. I'm looking for opportunities to apply my backend expertise to solve complex problems while continuing to grow as a technical leader.",
                "key_points": ["Professional background", "Technical skills", "Quantifiable achievements", "Educational background", "Professional development", "Personal interests", "Career objectives"],
                "section_weights": {
                    "content": 0.45,
                    "delivery": 0.25,
                    "structure": 0.15,
                    "relevance": 0.15
                },
                "question_type": "open_ended",
                "evaluation_criteria": {
                    "content": {
                        "completeness": "Addresses all key aspects of professional background",
                        "specificity": "Provides concrete examples and metrics",
                        "relevance": "Information is relevant to the position"
                    },
                    "delivery": {
                        "confidence": "Demonstrates self-assurance without arrogance",
                        "clarity": "Communicates clearly and concisely",
                        "engagement": "Maintains interest through narrative structure"
                    },
                    "structure": {
                        "organization": "Follows logical progression",
                        "conciseness": "Appropriate length (60-90 seconds)",
                        "emphasis": "Highlights most relevant experience"
                    },
                    "authenticity": {
                        "genuineness": "Sounds natural rather than rehearsed",
                        "personality": "Reveals appropriate personality traits"
                    }
                },
                "red_flags": ["Excessive personal details", "Irrelevant information", "Negativity about past employers", "Too brief (<30 seconds)", "Too long (>2 minutes)", "Lack of specific examples", "Generic answers without personalization"],
                "linguistic_markers": {
                    "positive": ["led", "developed", "achieved", "improved", "created", "implemented", "designed", "collaborated", "optimized", "reduced"],
                    "negative": ["um", "uh", "like", "you know", "basically", "sort of", "kind of", "maybe", "i guess", "probably"],
                    "weak_phrases": ["I think", "I believe", "I feel like", "In my opinion", "As far as I know"]
                },
                "ideal_structure": ["Brief introduction", "Professional background", "Key skills/expertise", "Notable achievements", "Brief personal element", "Future aspirations"],
                "time_guideline": "60-90 seconds"
            },
            
            "Where do you see yourself in five years?": {
                "ideal_answer": "In five years, I aim to have grown into a senior technical leadership role where I can leverage both my technical expertise and mentorship abilities. I plan to deepen my knowledge in cloud architecture and AI integration, becoming a trusted authority in these areas within the organization. I see myself leading high-impact projects that align with the company's strategic goals, while nurturing the next generation of developers. I'm committed to continuous learning and plan to complete advanced certifications in cloud architecture and AI engineering during this period. By then, I hope to have contributed significantly to developing innovative solutions that create measurable business value and perhaps even influence industry standards. I'm excited about this career trajectory because it allows me to remain hands-on with technology while taking on greater responsibilities that drive organizational success.",
                "key_points": ["Specific career progression", "Technical growth areas", "Leadership development", "Continuous learning plan", "Value contribution vision", "Realistic timeline", "Alignment with organizational needs"],
                "section_weights": {
                    "content": 0.40,
                    "strategic_alignment": 0.30,
                    "realism": 0.20,
                    "delivery": 0.10
                },
                "question_type": "career_planning",
                "evaluation_criteria": {
                    "content": {
                        "specificity": "Includes concrete roles and responsibilities",
                        "growth_path": "Identifies logical career progression",
                        "skill_development": "Names specific areas for development"
                    },
                    "strategic_alignment": {
                        "company_fit": "Aligns with typical growth paths at the company",
                        "industry_awareness": "Demonstrates understanding of industry trends",
                        "value_creation": "Focuses on creating value, not just personal gain"
                    },
                    "realism": {
                        "timeline_feasibility": "Goals are achievable within five years",
                        "self_awareness": "Recognizes current capabilities and limitations",
                        "flexibility": "Acknowledges potential for adaptation"
                    }
                },
                "red_flags": ["Unrealistic expectations", "Generic responses", "Lack of self-awareness", "Focus solely on titles/compensation", "Vague aspirations", "No mention of skill development", "Incompatible with company growth paths", "Excessive focus on personal gain"],
                "linguistic_markers": {
                    "positive": ["plan to", "intend to", "aim to", "goal is", "develop", "grow", "contribute", "learn", "advance", "build"],
                    "negative": ["hopefully", "maybe", "haven't thought about it", "not sure", "wherever life takes me", "depends on", "if things work out"]
                },
                "ideal_structure": ["Current career trajectory", "Desired role/responsibilities", "Skills to develop", "Value proposition", "Flexibility statement"],
                "time_guideline": "60-90 seconds"
            },
            
            "What are your greatest strengths?": {
                "ideal_answer": "My greatest strength is my ability to solve complex technical problems through analytical thinking and persistence. When faced with challenging issues, I systematically break them down into manageable components, identify patterns, and develop innovative solutions. For example, at my current company, I tackled a persistent performance bottleneck in our payment processing system that had resisted previous resolution attempts. By methodically analyzing transaction logs and system metrics, I identified a database indexing issue that was causing exponential slowdowns during peak volumes. After implementing my solution, transaction processing times improved by 75%, directly increasing our capacity to handle sales during high-traffic periods. Another strength is my collaborative approach to development. I excel at facilitating technical discussions that bridge different perspectives and lead to better outcomes. When our team was divided on the architectural approach for a new microservices implementation, I organized a structured workshop that allowed all voices to be heard while focusing on our core requirements. This resulted in a consensus solution that incorporated the best elements of multiple approaches. I complement these strengths with a commitment to continuous learning, regularly dedicating time to explore emerging technologies and best practices that could benefit our projects.",
                "key_points": ["Specific, relevant strengths", "Technical expertise", "Problem-solving approach", "Concrete examples", "Quantifiable impact", "Collaborative abilities", "Learning mindset"],
                "section_weights": {
                    "relevance": 0.35,
                    "evidence": 0.35,
                    "self_awareness": 0.20,
                    "delivery": 0.10
                },
                "question_type": "competency_based",
                "evaluation_criteria": {
                    "relevance": {
                        "job_alignment": "Strengths align with job requirements",
                        "value_creation": "Strengths create tangible value",
                        "differentiation": "Strengths distinguish from other candidates"
                    },
                    "evidence": {
                        "specific_examples": "Provides concrete situations",
                        "quantifiable_results": "Includes measurable impact",
                        "context": "Explains circumstances clearly"
                    },
                    "self_awareness": {
                        "insight": "Demonstrates understanding of personal capabilities",
                        "balanced_view": "Presents strengths without arrogance",
                        "growth_mindset": "Shows capacity for continued development"
                    }
                },
                "red_flags": ["Generic strengths", "No supporting examples", "Unrelated to job requirements", "Excessive focus on soft skills only", "Strengths presented as weaknesses", "Lack of specificity", "No evidence of impact"],
                "linguistic_markers": {
                    "positive": ["demonstrated", "achieved", "implemented", "improved", "developed", "solved", "created", "led", "optimized", "analyzed"],
                    "negative": ["I think", "people say", "probably", "usually", "sometimes", "kind of", "sort of", "I guess", "maybe", "I've been told"]
                },
                "ideal_structure": ["Specific strength", "Contextual example", "Impact description", "Secondary strength", "Supporting evidence", "Connection to job"],
                "time_guideline": "90-120 seconds"
            },
            
            "What is your greatest weakness?": {
                "ideal_answer": "My greatest weakness has been my tendency to dive too deeply into technical details during project planning, which has sometimes delayed moving from the research phase to actual implementation. I noticed this pattern when I spent nearly three weeks researching optimal database structures for a new analytics system, when we could have started with a viable approach and iteratively improved it. Recognizing this issue, I've developed a systematic approach to balance thoroughness with efficient progress. I now create time-boxed research plans with clear decision points for complex technical decisions. For example, in our recent API redesign project, I allocated three days for evaluating authentication options and set specific evaluation criteria beforehand. This structured approach helped me make a timely decision while still conducting thorough research. I've also started separating 'must-have' from 'nice-to-have' features more explicitly in planning sessions, which helps prevent scope creep driven by my perfectionism. While I'm still working on this balance, my team lead has noted improvement in my ability to move projects forward without sacrificing quality. I've learned that perfect can sometimes be the enemy of good, especially in fast-paced development environments where rapid iteration is valuable.",
                "key_points": ["Authentic professional weakness", "Self-awareness", "Impact recognition", "Specific improvement actions", "Measurable progress", "Ongoing development", "Relevance to position"],
                "section_weights": {
                    "authenticity": 0.35,
                    "self_improvement": 0.35,
                    "relevance": 0.20,
                    "delivery": 0.10
                },
                "question_type": "self_awareness",
                "evaluation_criteria": {
                    "authenticity": {
                        "genuineness": "Presents a real professional weakness",
                        "self_awareness": "Shows understanding of personal limitations",
                        "honesty": "Discusses true areas for growth"
                    },
                    "self_improvement": {
                        "action_steps": "Describes specific improvement strategies",
                        "progress_metrics": "Demonstrates measurable improvement",
                        "ongoing_effort": "Shows commitment to continued growth"
                    },
                    "relevance": {
                        "job_impact": "Weakness doesn't disqualify from core job functions",
                        "context": "Appropriate for the role and seniority level",
                        "significance": "Meaningful rather than trivial weakness"
                    }
                },
                "red_flags": ["Disguised strengths", "Excessive self-criticism", "No improvement plan", "Critical job skill weakness", "Lack of self-awareness", "Blame-shifting", "Unchangeable personality traits", "Generic responses"],
                "linguistic_markers": {
                    "positive": ["recognized", "addressed", "improved", "developed", "learned", "implemented", "structured", "balanced", "prioritized", "monitored"],
                    "negative": ["can't help", "just my personality", "that's just how I am", "people need to accept", "it's impossible for me", "always been a problem", "nothing I can do about it"]
                },
                "ideal_structure": ["Genuine weakness", "Specific example", "Impact recognition", "Improvement actions", "Progress evidence", "Current status"],
                "time_guideline": "60-90 seconds"
            },
            
            "Why do you want to work here?": {
                "ideal_answer": "I'm drawn to your company because of your leadership in developing AI-powered solutions that address meaningful business challenges. After researching your recent projects, particularly the automated compliance monitoring system featured in Tech Quarterly, I was impressed by your approach to balancing advanced technology with practical implementation. This aligns perfectly with my technical philosophy and experience optimizing machine learning models for production environments. I'm particularly excited about your development of industry-specific AI applications, as my background in financial services technology would allow me to contribute domain expertise that complements your technical innovation. Beyond the technical aspects, your company's collaborative culture and commitment to continued learning particularly resonates with me. In speaking with Sarah Chen, one of your senior developers, I learned about your quarterly hackathons and internal knowledge-sharing sessions, which reflect the kind of environment where I thrive. Additionally, your recent expansion into international markets presents exciting challenges that align with my experience in building scalable systems across different regulatory environments. Looking at your company's trajectory and stated mission to democratize AI capabilities for mid-sized businesses, I see a perfect opportunity to apply my skills while growing in the direction I've been working toward throughout my career.",
                "key_points": ["Company-specific research", "Alignment with company values/mission", "Specific projects/products mentioned", "Cultural fit", "Contribution potential", "Growth opportunities", "Authentic enthusiasm"],
                "section_weights": {
                    "research": 0.35,
                    "alignment": 0.35,
                    "contribution": 0.20,
                    "authenticity": 0.10
                },
                "question_type": "motivation",
                "evaluation_criteria": {
                    "research": {
                        "company_knowledge": "Demonstrates thorough research",
                        "industry_understanding": "Shows awareness of company's position in industry",
                        "specific_references": "Mentions specific projects, products, or initiatives"
                    },
                    "alignment": {
                        "values_connection": "Shows connection to company values",
                        "mission_resonance": "Expresses alignment with company mission",
                        "culture_fit": "Demonstrates understanding of company culture"
                    },
                    "contribution": {
                        "value_proposition": "Articulates how they will add value",
                        "skill_relevance": "Connects skills to company needs",
                        "growth_path": "Shows understanding of growth opportunities"
                    }
                },
                "red_flags": ["Generic response applicable to any company", "Focus solely on personal gain", "Minimal research", "Emphasis on compensation/benefits", "No mention of company values/mission", "Incorrect information about company", "No connection between skills and company needs"],
                "linguistic_markers": {
                    "positive": ["researched", "discovered", "admire", "align", "contribute", "value", "excited about", "impressed by", "passionate about", "committed to"],
                    "negative": ["need a job", "heard you're hiring", "convenient location", "great benefits", "big company", "stepping stone", "better than my current job"]
                },
                "ideal_structure": ["Company-specific knowledge", "Value alignment", "Skill relevance", "Contribution potential", "Authentic enthusiasm", "Growth opportunity"],
                "time_guideline": "60-90 seconds"
            },
            
            "Tell me about a time you faced a challenge at work and how you overcame it.": {
                "ideal_answer": "At my previous company, we faced a critical challenge when our primary database server crashed during our peak season, affecting over 2,000 active users. As the lead backend developer, I needed to quickly restore service while minimizing data loss. The situation was complicated by outdated documentation and the recent departure of our database administrator. I immediately assembled a three-person response team and established clear roles: I would lead the technical recovery effort, our junior developer would handle user communications, and our systems analyst would document the process for future reference. After assessing the situation, I discovered that our last full backup was 12 hours old, which would mean significant data loss. Instead of immediately restoring from backup, I first attempted to recover data from the corrupted system. I wrote a script to extract partial transaction logs from the damaged server and successfully recovered 97% of the missing transactions. Throughout the process, I maintained hourly status updates to management and users. The entire system was restored within 8 hours with minimal data loss. Beyond the immediate fix, I implemented several preventative measures: setting up real-time database replication to a backup server, establishing automated testing of backup integrity, and creating comprehensive documentation of recovery procedures. This experience reinforced the importance of both technical problem-solving and clear communication during crisis situations. It also led to my initiative to implement a more robust disaster recovery plan that has since been adopted company-wide.",
                "key_points": ["Specific situation", "Clear challenge", "Leadership role", "Systematic approach", "Actions taken", "Communication strategy", "Measurable outcomes", "Long-term solution", "Lessons learned"],
                "section_weights": {
                    "situation": 0.15,
                    "actions": 0.40,
                    "results": 0.30,
                    "reflection": 0.15
                },
                "question_type": "behavioral_star",
                "evaluation_criteria": {
                    "situation": {
                        "clarity": "Clearly describes the challenge",
                        "specificity": "Provides concrete details",
                        "relevance": "Challenge demonstrates valuable skills"
                    },
                    "actions": {
                        "ownership": "Shows personal responsibility",
                        "problem_solving": "Demonstrates analytical approach",
                        "initiative": "Shows proactive steps taken",
                        "collaboration": "Includes teamwork when appropriate"
                    },
                    "results": {
                        "impact": "Describes measurable outcomes",
                        "learning": "Shares insights gained",
                        "application": "Shows how learning was applied"
                    }
                },
                "red_flags": ["Vague description", "No personal role", "Minimal actions taken", "No measurable results", "Blaming others", "Simple problem with obvious solution", "Unresolved outcome"],
                "linguistic_markers": {
                    "positive": ["I led", "I implemented", "I created", "I analyzed", "I coordinated", "resulting in", "achieved", "improved", "reduced", "increased"],
                    "negative": ["we usually", "typically", "sort of", "kind of", "I guess", "they didn't", "wasn't my fault", "had to deal with", "was forced to"]
                },
                "ideal_structure": ["Situation context", "Specific challenge", "Response approach", "Actions taken", "Results achieved", "Lessons learned"],
                "time_guideline": "90-120 seconds"
            },
            
            "Describe a time when you had to work with a difficult colleague or team member.": {
                "ideal_answer": "I encountered a challenging working relationship with a senior developer when I joined my current team. He had been with the company for eight years and was highly respected for his technical expertise, but he was resistant to adopting new technologies and methodologies that I had been brought in to implement. His initial response to my suggestions was dismissive, often stating, 'We've tried that before' or 'That won't work here.' Rather than escalating the situation or forcing changes, I first sought to understand his perspective. I scheduled one-on-one meetings where I asked about his experience with the existing systems and the history behind certain architectural decisions. This helped me gain valuable context and showed respect for his institutional knowledge. Once I understood his concerns—primarily around system stability and maintenance overhead—I proposed a small pilot project to demonstrate the benefits of the new approach. I carefully documented the process, invited his input throughout, and addressed his specific concerns with concrete examples. When the pilot showed a 40% improvement in processing speed with minimal maintenance issues, he became more receptive. We then established a collaborative approach where he helped identify potential integration challenges while I focused on implementation. Over the next six months, we developed a mutual respect and eventually co-presented our successful system modernization at a company-wide tech talk. This experience taught me the importance of balancing technical innovation with respect for established experience, and how taking time to understand underlying concerns can transform opposition into collaboration. It also reinforced my belief in demonstrating value through results rather than theoretical arguments.",
                "key_points": ["Specific situation", "Nature of difficulty", "Perspective-taking", "Constructive approach", "Communication strategy", "Resolution process", "Positive outcome", "Professional relationship", "Lessons learned"],
                "section_weights": {
                    "situation": 0.15,
                    "approach": 0.40,
                    "resolution": 0.30,
                    "reflection": 0.15
                },
                "question_type": "behavioral_star",
                "evaluation_criteria": {
                    "situation": {
                        "clarity": "Clearly describes the interpersonal challenge",
                        "complexity": "Demonstrates meaningful difficulty",
                        "professionalism": "Avoids inappropriate negativity"
                    },
                    "approach": {
                        "empathy": "Shows understanding of other perspective",
                        "communication": "Demonstrates effective communication",
                        "adaptability": "Shows flexibility in approach",
                        "emotional_intelligence": "Manages emotions effectively"
                    },
                    "resolution": {
                        "outcome": "Achieves positive or improved relationship",
                        "learning": "Demonstrates personal growth",
                        "sustainability": "Creates lasting improvement"
                    }
                },
                "red_flags": ["Blaming", "Refusing to adapt", "Lack of empathy", "Inappropriate criticism", "Unresolved conflict", "Escalation without attempt to resolve", "Unprofessional language", "Personality attacks"],
                "linguistic_markers": {
                    "positive": ["understood", "listened", "collaborated", "compromised", "clarified", "resolved", "improved", "learned", "adapted", "respected"],
                    "negative": ["difficult person", "impossible to work with", "always like that", "their fault", "had to deal with", "couldn't stand", "horrible", "nightmare"]
                },
                "ideal_structure": ["Situation context", "Specific challenge", "Perspective-taking", "Approach taken", "Resolution process", "Outcome", "Lessons learned"],
                "time_guideline": "90-120 seconds"
            },
            
            "How do you handle pressure or stressful situations?": {
                "ideal_answer": "I manage pressure through a combination of proactive planning, methodical execution, and deliberate stress management techniques. When facing high-pressure situations, I first take a step back to assess the full scope of what's needed and break it down into manageable components. For example, when our team was tasked with resolving a critical security vulnerability that affected our entire customer base, I quickly organized a structured response plan that prioritized the most sensitive data systems first. I created a detailed timeline with specific milestones and established clear communication protocols to keep stakeholders informed. To maintain focus during extended periods of high stress, I use time-blocking techniques where I allocate dedicated periods for focused work interspersed with short breaks. During our security incident, I scheduled 90-minute deep work sessions followed by 10-minute breaks to maintain mental clarity over the 16-hour resolution period. I've also developed personal stress management practices that help me maintain perspective and stamina. Daily exercise, even if just a 15-minute walk, helps clear my mind, and I practice mindful breathing techniques between meetings or when feeling overwhelmed. These approaches have measurably improved my performance under pressure—during our last quarterly review, my manager specifically noted my ability to deliver quality work despite aggressive deadlines. I've also learned to communicate proactively about potential challenges, which helps manage expectations and reduces last-minute pressure. While I thrive in dynamic environments, I recognize the importance of sustainable work practices for long-term effectiveness.",
                "key_points": ["Structured methodology", "Prioritization technique", "Specific example", "Time management", "Personal stress management", "Communication strategy", "Self-awareness", "Positive outcome"],
                "section_weights": {
                    "approach": 0.40,
                    "example": 0.30,
                    "techniques": 0.20,
                    "self_awareness": 0.10
                },
                "question_type": "situational",
                "evaluation_criteria": {
                    "approach": {
                        "methodology": "Demonstrates systematic approach",
                        "prioritization": "Shows ability to focus on what matters",
                        "adaptability": "Maintains flexibility under pressure"
                    },
                    "example": {
                        "relevance": "Example demonstrates significant pressure",
                        "actions": "Shows specific steps taken",
                        "outcome": "Describes successful resolution"
                    },
                    "techniques": {
                        "specificity": "Names concrete techniques used",
                        "effectiveness": "Demonstrates techniques work",
                        "sustainability": "Approaches are maintainable long-term"
                    }
                },
                "red_flags": ["Denial of stress", "Unhealthy coping mechanisms", "Displacing stress onto others", "Sacrificing quality", "Performance breakdown", "Avoidance of high-pressure situations", "Lack of self-awareness", "Inappropriate responses"],
                "linguistic_markers": {
                    "positive": ["prioritize", "plan", "organize", "communicate", "manage", "maintain", "balance", "assess", "delegate", "reflect"],
                    "negative": ["panic", "freak out", "lose it", "can't handle", "shut down", "avoid", "procrastinate", "ignore", "push through", "just work harder"]
                },
                "ideal_structure": ["General approach", "Specific example", "Actions taken", "Personal techniques", "Outcome", "Self-awareness"],
                "time_guideline": "60-90 seconds"
            },
            
            "Tell me about a project you're particularly proud of.": {
                "ideal_answer": "I'm particularly proud of leading the development of a real-time analytics dashboard for our e-commerce platform that transformed how our business teams accessed and utilized customer data. When I joined the project, business analysts were waiting up to 24 hours for updated reports, making it difficult to respond quickly to market trends. I identified this as a critical bottleneck and proposed a comprehensive solution that would deliver near real-time insights. As technical lead, I first conducted stakeholder interviews with representatives from marketing, sales, and product teams to understand their specific needs and pain points. Based on this research, I designed a microservices architecture that separated data collection from processing to optimize performance. I led a team of four developers through the implementation, which included developing a streaming data pipeline using Kafka, building a cloud-based data processing system using AWS Lambda functions, and creating a React-based frontend with interactive visualizations. We faced significant challenges, particularly with data consistency across multiple sources and ensuring the system could handle our peak traffic of 200,000 concurrent users. I developed a novel approach to data synchronization that reduced inconsistencies by 95% while maintaining performance. The project was delivered on schedule and under budget after three months of development. The impact was substantial: business teams gained access to insights within 30 seconds instead of 24 hours, which directly contributed to a 15% increase in conversion rates through faster A/B testing and campaign optimization. The project also reduced our cloud infrastructure costs by 20% through more efficient data processing. This achievement stands out to me because it combined technical innovation with tangible business results, and required me to leverage both my technical expertise and leadership skills to align diverse stakeholders around a common goal.",
                "key_points": ["Specific project details", "Leadership role", "Technical challenge", "Problem-solving approach", "Implementation strategy", "Stakeholder management", "Quantifiable impact", "Business value", "Personal contribution", "Technical innovation"],
                "section_weights": {
                    "project_complexity": 0.25,
                    "leadership": 0.25,
                    "impact": 0.30,
                    "innovation": 0.20
                },
                "question_type": "achievement_based",
                "evaluation_criteria": {
                    "project_complexity": {
                        "technical_challenge": "Project involved significant technical complexity",
                        "scale": "Project had meaningful scope/impact",
                        "constraints": "Project had significant constraints to overcome"
                    },
                    "leadership": {
                        "initiative": "Shows proactive problem identification",
                        "management": "Demonstrates effective team leadership",
                        "stakeholder_engagement": "Shows ability to work with diverse stakeholders"
                    },
                    "impact": {
                        "business_value": "Delivered quantifiable business results",
                        "technical_merit": "Achieved technical excellence",
                        "sustainability": "Created lasting improvements"
                    },
                    "innovation": {
                        "creativity": "Demonstrates innovative approach",
                        "problem_solving": "Shows unique solution to complex problem",
                        "learning": "Exhibits personal or team growth"
                    }
                },
                "red_flags": ["Vague description", "Minimal personal contribution", "No measurable impact", "Simple project with obvious solution", "No challenges overcome", "Team achievement with unclear individual role", "Outdated technology without justification"],
                "linguistic_markers": {
                    "positive": ["led", "designed", "developed", "implemented", "achieved", "reduced", "improved", "created", "optimized", "transformed"],
                    "negative": ["helped with", "was part of", "the team did", "we were successful", "was involved in", "kind of", "sort of", "a bit", "somewhat"]
                },
                "ideal_structure": ["Project context", "Challenge description", "Personal role", "Approach taken", "Specific actions", "Measurable results", "Business impact", "Technical innovation", "Personal pride"],
                "time_guideline": "90-120 seconds"
            },
        }

class InterviewEvaluator:
    def __init__(self, questions_db):
        self.questions_db = questions_db
        self.stop_words = set(stopwords.words('english'))
    
    def preprocess_text(self, text):
        """Clean and preprocess text for analysis"""
        # Convert to lowercase
        text = text.lower()
        # Remove punctuation
        text = re.sub(r'[^\w\s]', ' ', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def count_filler_words(self, text):
        """Count filler words and weak phrases in response"""
        text_lower = text.lower()
        filler_words = ['um', 'uh', 'like', 'you know', 'basically', 'sort of', 'kind of', 'maybe', 'i guess', 'probably']
        weak_phrases = ['i think', 'i believe', 'i feel like', 'in my opinion', 'as far as I know']
        
        filler_count = sum([text_lower.count(word) for word in filler_words])
        weak_phrase_count = sum([text_lower.count(phrase) for phrase in weak_phrases])
        
        return filler_count, weak_phrase_count
    
    def assess_linguistics(self, response, question):
        """Assess linguistic markers in response"""
        response_lower = response.lower()
        question_data = self.questions_db[question]
        
        positive_markers = question_data.get('linguistic_markers', {}).get('positive', [])
        negative_markers = question_data.get('linguistic_markers', {}).get('negative', [])
        weak_phrases = question_data.get('linguistic_markers', {}).get('weak_phrases', [])
        
        positive_count = sum([response_lower.count(marker.lower()) for marker in positive_markers])
        negative_count = sum([response_lower.count(marker.lower()) for marker in negative_markers])
        weak_phrases_count = sum([response_lower.count(phrase.lower()) for phrase in weak_phrases])
        
        total_markers = len(positive_markers) + len(negative_markers) + len(weak_phrases)
        if total_markers == 0:
            return 0.5  # Neutral score if no markers defined
        
        # Calculate weighted score
        positive_weight = 1.0 if positive_count > 0 else 0.0
        negative_weight = -1.0 if negative_count > 0 else 0.0
        weak_weight = -0.5 if weak_phrases_count > 0 else 0.0
        
        linguistic_score = (positive_count * positive_weight + 
                           negative_count * negative_weight + 
                           weak_phrases_count * weak_weight) / total_markers
        
        # Normalize to 0-1 range
        normalized_score = (linguistic_score + 1) / 2
        return min(max(normalized_score, 0), 1)  # Ensure score is between 0 and 1
    
    def check_red_flags(self, response, question):
        """Check for red flags in response"""
        response_lower = response.lower()
        red_flags = self.questions_db[question].get('red_flags', [])
        
        detected_flags = []
        for flag in red_flags:
            flag_lower = flag.lower()
            # Check if the flag phrase is in the response
            if flag_lower in response_lower:
                detected_flags.append(flag)
            # For more complex flags that need pattern matching
            elif flag_lower == "too brief (<30 seconds)" and len(response.split()) < 75:  # ~75 words for 30 seconds
                detected_flags.append(flag)
            elif flag_lower == "too long (>2 minutes)" and len(response.split()) > 300:  # ~300 words for 2 minutes
                detected_flags.append(flag)
            elif flag_lower == "lack of specific examples" and not re.search(r'\b(for example|such as|instance|specifically)\b', response_lower):
                detected_flags.append(flag)
            elif flag_lower == "generic answers without personalization" and not re.search(r'\b(I|my|me|mine)\b', response_lower):
                detected_flags.append(flag)
        
        return detected_flags
    
    def calculate_similarity(self, text1, text2):
        """Calculate semantic similarity between two texts using spaCy"""
        doc1 = nlp(text1)
        doc2 = nlp(text2)
        return doc1.similarity(doc2)
    
    def calculate_content_score(self, response, question):
        """Calculate content score based on key points coverage and ideal answer similarity"""
        key_points = self.questions_db[question].get('key_points', [])
        ideal_answer = self.questions_db[question].get('ideal_answer', '')
        
        # Check key points coverage
        response_lower = response.lower()
        key_points_score = 0
        key_points_found = []
        
        for point in key_points:
            point_doc = nlp(point.lower())
            max_similarity = 0
            
            # Split response into sentences for better matching
            sentences = [sent.text for sent in nlp(response_lower).sents]
            for sentence in sentences:
                sent_doc = nlp(sentence)
                similarity = point_doc.similarity(sent_doc)
                max_similarity = max(max_similarity, similarity)
            
            # If similarity is above threshold, consider the point addressed
            if max_similarity > 0.5:
                key_points_found.append(point)
                key_points_score += 1
        
        key_points_coverage = key_points_score / len(key_points) if key_points else 0
        
        # Calculate overall similarity to ideal answer
        overall_similarity = self.calculate_similarity(response, ideal_answer)
        
        # Combined content score (70% key points, 30% overall similarity)
        content_score = (0.7 * key_points_coverage) + (0.3 * overall_similarity)
        
        return content_score, key_points_found
    
    def evaluate_structure(self, response, question):
        """Evaluate structure of response based on ideal structure"""
        ideal_structure = self.questions_db[question].get('ideal_structure', [])
        if not ideal_structure:
            return 0.5, []  # Neutral score if no structure defined
        
        structure_score = 0
        structure_elements_found = []
        
        # Split response into sentences
        sentences = [sent.text for sent in nlp(response).sents]
        
        for element in ideal_structure:
            element_doc = nlp(element.lower())
            element_found = False
            
            for i, sentence in enumerate(sentences):
                sentence_doc = nlp(sentence.lower())
                similarity = element_doc.similarity(sentence_doc)
                
                # If similarity is above threshold, consider the element present
                if similarity > 0.4:
                    structure_elements_found.append((element, i))
                    element_found = True
                    break
            
            if element_found:
                structure_score += 1
        
        # Check if elements appear in correct order
        structure_elements_found.sort(key=lambda x: x[1])  # Sort by position in response
        ordered_elements = [elem[0] for elem in structure_elements_found]
        
        # Calculate order score - how well the found elements match the ideal order
        order_score = 0
        if ordered_elements:
            # Check each pair of adjacent elements
            for i in range(len(ordered_elements) - 1):
                ideal_idx1 = ideal_structure.index(ordered_elements[i]) if ordered_elements[i] in ideal_structure else -1
                ideal_idx2 = ideal_structure.index(ordered_elements[i + 1]) if ordered_elements[i + 1] in ideal_structure else -1
                
                if ideal_idx1 != -1 and ideal_idx2 != -1 and ideal_idx1 < ideal_idx2:
                    order_score += 1
            
            order_score = order_score / (len(ordered_elements) - 1) if len(ordered_elements) > 1 else 1
        
        # Combined structure score (70% elements present, 30% correct order)
        elements_score = structure_score / len(ideal_structure)
        final_structure_score = (0.7 * elements_score) + (0.3 * order_score)
        
        return final_structure_score, ordered_elements
    
    def analyze_sentiment(self, text):
        """Analyze sentiment of response for positivity/negativity"""
        sentiment = TextBlob(text).sentiment
        return sentiment.polarity, sentiment.subjectivity
    
    def estimate_delivery_time(self, response):
        """Estimate delivery time in seconds based on word count"""
        # Average speaking rate is approximately 150 words per minute
        word_count = len(response.split())
        estimated_seconds = (word_count / 150) * 60
        return estimated_seconds
    
    def evaluate_response(self, response, question):
        """Main method to evaluate a response to a given question"""
        if question not in self.questions_db:
            return {"error": "Question not found in database"}
        
        question_data = self.questions_db[question]
        section_weights = question_data.get('section_weights', {})
        
        # Basic metrics
        word_count = len(response.split())
        estimated_time = self.estimate_delivery_time(response)
        time_guideline = question_data.get('time_guideline', '')
        
        # Extract time range from guideline (e.g., "60-90 seconds")
        time_range = re.findall(r'(\d+)-(\d+)\s*seconds', time_guideline)
        time_appropriate = True
        time_message = "Time within guidelines"
        
        if time_range:
            min_time, max_time = int(time_range[0][0]), int(time_range[0][1])
            if estimated_time < min_time:
                time_appropriate = False
                time_message = f"Response too brief (estimated {estimated_time:.1f}s, guideline minimum {min_time}s)"
            elif estimated_time > max_time:
                time_appropriate = False
                time_message = f"Response too long (estimated {estimated_time:.1f}s, guideline maximum {max_time}s)"
        
        # Content analysis
        content_score, key_points_found = self.calculate_content_score(response, question)
        
        # Structure analysis
        structure_score, structure_elements = self.evaluate_structure(response, question)
        
        # Linguistic analysis
        linguistic_score = self.assess_linguistics(response, question)
        
        # Sentiment analysis
        sentiment_polarity, sentiment_subjectivity = self.analyze_sentiment(response)
        
        # Red flags check
        red_flags = self.check_red_flags(response, question)
        
        # Calculate overall score based on section weights
        overall_score = 0
        score_breakdown = {}
        
        for section, weight in section_weights.items():
            if section == "content":
                section_score = content_score
            elif section == "structure":
                section_score = structure_score
            elif section == "delivery":
                # Delivery combines linguistic score and time appropriateness
                section_score = linguistic_score * (1 if time_appropriate else 0.7)
            elif section == "relevance":
                # Relevance to the question (similarity to ideal answer)
                section_score = self.calculate_similarity(response, question_data.get('ideal_answer', ''))
            elif section == "strategic_alignment":
                # For career questions, how well aligned with organizational needs
                section_score = content_score * 0.8 + sentiment_polarity * 0.2
            elif section == "realism":
                # For future/goals questions, how realistic the aspirations are
                section_score = 0.7  # Default moderate score for realism
                if "unrealistic expectations" in red_flags:
                    section_score = 0.3
            elif section == "authenticity":
                # How genuine the response feels
                section_score = (1 - sentiment_subjectivity) * 0.7 + linguistic_score * 0.3
            elif section == "self_improvement" or section == "self_awareness":
                # For weakness/improvement questions
                section_score = content_score * 0.6 + sentiment_polarity * 0.4
            else:
                # Default for any other sections
                section_score = 0.5
            
            score_breakdown[section] = round(section_score * 100)
            overall_score += section_score * weight
        
        # Apply red flag penalties
        red_flag_penalty = len(red_flags) * 0.05
        overall_score = max(0, overall_score - red_flag_penalty)
        
        # Final score as percentage
        final_score = round(overall_score * 100)
        
        # Generate feedback
        feedback = self.generate_feedback(response, question, final_score, key_points_found, 
                                         structure_elements, red_flags, time_appropriate,
                                         time_message, score_breakdown)
        
        # Compile results
        evaluation = {
            "question": question,
            "final_score": final_score,
            "grade": self.score_to_grade(final_score),
            "score_breakdown": score_breakdown,
            "metrics": {
                "word_count": word_count,
                "estimated_time": f"{estimated_time:.1f} seconds",
                "time_appropriate": time_appropriate,
                "key_points_covered": len(key_points_found),
                "key_points_total": len(question_data.get('key_points', [])),
                "structure_elements_found": len(structure_elements),
                "structure_elements_total": len(question_data.get('ideal_structure', [])),
                "sentiment_polarity": round(sentiment_polarity, 2),
                "red_flags_detected": len(red_flags)
            },
            "details": {
                "key_points_found": key_points_found,
                "missing_points": list(set(question_data.get('key_points', [])) - set(key_points_found)),
                "structure_elements": structure_elements,
                "red_flags": red_flags,
                "strengths": self.identify_strengths(score_breakdown),
                "improvement_areas": self.identify_weaknesses(score_breakdown)
            },
            "feedback": feedback
        }
        
        return evaluation
    
    def identify_strengths(self, score_breakdown):
        """Identify top strengths based on section scores"""
        if not score_breakdown:
            return []
        
        # Get top 2 highest scoring sections
        strengths = sorted(score_breakdown.items(), key=lambda x: x[1], reverse=True)[:2]
        return [section for section, score in strengths if score >= 70]
    
    def identify_weaknesses(self, score_breakdown):
        """Identify areas for improvement based on section scores"""
        if not score_breakdown:
            return []
        
        # Get bottom 2 lowest scoring sections
        weaknesses = sorted(score_breakdown.items(), key=lambda x: x[1])[:2]
        return [section for section, score in weaknesses if score < 70]
    
    def score_to_grade(self, score):
        """Convert numeric score to letter grade"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    def generate_feedback(self, response, question, score, key_points, structure, 
                         red_flags, time_appropriate, time_message, score_breakdown):
        """Generate detailed feedback based on evaluation"""
        question_data = self.questions_db[question]
        feedback = []
        
        # Overall assessment
        if score >= 90:
            feedback.append("Excellent response that addresses the question comprehensively and effectively.")
        elif score >= 80:
            feedback.append("Strong response with good coverage of key points and effective delivery.")
        elif score >= 70:
            feedback.append("Satisfactory response that meets basic requirements but has room for improvement.")
        elif score >= 60:
            feedback.append("Adequate response but lacks depth or contains significant issues that need addressing.")
        else:
            feedback.append("Response needs substantial improvement in multiple areas.")
        
        # Content feedback
        key_points_total = len(question_data.get('key_points', []))
        key_points_covered = len(key_points)
        key_points_percentage = (key_points_covered / key_points_total * 100) if key_points_total > 0 else 0
        
        if key_points_percentage >= 80:
            feedback.append(f"Content: Excellent coverage of {key_points_covered}/{key_points_total} key points.")
        elif key_points_percentage >= 60:
            feedback.append(f"Content: Good coverage of {key_points_covered}/{key_points_total} key points.")
            # Suggest missing key points
            missing_points = set(question_data.get('key_points', [])) - set(key_points)
            if missing_points:
                missing_str = ", ".join(list(missing_points)[:3])
                feedback.append(f"Consider addressing: {missing_str}.")
        else:
            feedback.append(f"Content: Limited coverage of only {key_points_covered}/{key_points_total} key points.")
            # Suggest missing key points
            missing_points = set(question_data.get('key_points', [])) - set(key_points)
            if missing_points:
                missing_str = ", ".join(list(missing_points)[:3])
                feedback.append(f"Important missing elements: {missing_str}.")
        
        # Structure feedback
        if structure:
            if len(structure) >= len(question_data.get('ideal_structure', [])) * 0.8:
                feedback.append("Structure: Well-organized response with logical flow.")
            else:
                feedback.append("Structure: Some organizational elements present, but flow could be improved.")
        else:
            feedback.append("Structure: Response lacks clear organization and logical flow.")
        
        # Time feedback
        if not time_appropriate:
            feedback.append(f"Timing: {time_message}")
        
        # Red flags feedback
        if red_flags:
            feedback.append(f"Areas of concern: {', '.join(red_flags[:3])}")
        
        # Specific improvement areas based on lowest scoring section
        if score_breakdown:
            lowest_section = min(score_breakdown, key=score_breakdown.get)
            lowest_score = score_breakdown[lowest_section]
            
            if lowest_score < 70:
                if lowest_section == "content":
                    feedback.append("Improvement needed in content completeness and specificity.")
                elif lowest_section == "structure":
                    feedback.append("Improvement needed in organization and logical flow.")
                elif lowest_section == "delivery":
                    feedback.append("Improvement needed in communication clarity and confidence.")
                elif lowest_section == "relevance":
                    feedback.append("Response could be more tailored to the specific question.")
                elif lowest_section == "strategic_alignment":
                    feedback.append("Better align your goals with organizational needs and growth paths.")
                elif lowest_section == "realism":
                    feedback.append("Goals mentioned could be more realistic and achievable.")
                elif lowest_section == "authenticity":
                    feedback.append("Response could benefit from more genuineness and personality.")
                elif lowest_section == "self_improvement" or lowest_section == "self_awareness":
                    feedback.append("Demonstrate more self-awareness and concrete improvement steps.")
        
        return feedback


# Initialize the evaluator
evaluator = InterviewEvaluator(questions_db)


# SocketIO event handlers
@socketio.on('send_transcript')
def handle_transcript(data):
    """Process user's answer and provide feedback"""
    try:
        question = data['hrQuestion']
        user_answer = data['transcript']
        email = data['email']
        
        # Input validation
        if not user_answer or not question or not email:
            socketio.emit('transcript_feedback', {
                "feedback": "Error: Missing required information.",
                "success": False
            })
            return
            
        # Process the answer using the new evaluator
        result = evaluator.evaluate_response(user_answer, question)
        
        # Send feedback to the user
        socketio.emit('transcript_feedback', {
            "feedback": result["feedback"],
            "score": result["final_score"],
            "success": True
        })
        
        # Prepare data for database
        new_data = {
            "question": question,
            "user_answer": user_answer,
            "feedback": result["feedback"],
            "score": result["final_score"],
            "matching_points": result["details"]["key_points_found"],
            "missing_points": result["details"]["missing_points"],
            "strengths": result["details"]["strengths"],
            "improvement_areas": result["details"]["improvement_areas"],
            "ideal_answer":questions_db[question].get('ideal_answer', ''),
            "red_flags_triggered": result["details"]["red_flags"],
            "timestamp": datetime.now()
        }
        print(new_data)
        # Update database
        user = user_collection.find_one({'email': email, 'hrQuestions.question': question})
        
        if user and any(q.get('question') == question for q in user.get('hrQuestions', [])):
            # If question exists, update only that question's answer and feedback
            result = user_collection.update_one(
                {'email': email, 'hrQuestions.question': question},
                {"$set": {
                    "hrQuestions.$.user_answer": user_answer,
                    "hrQuestions.$.feedback": result["feedback"],
                    "hrQuestions.$.score": result["final_score"],
                    "hrQuestions.$.matching_points": result["details"]["key_points_found"],
                    "hrQuestions.$.missing_points": result["details"]["missing_points"],
                    "hrQuestions.$.strengths": result["details"]["strengths"],
                    "hrQuestions.$.improvement_areas": result["details"]["improvement_areas"],
                    "hrQuestions.$.red_flags_triggered": result["details"]["red_flags"],
                    "hrQuestions.$.ideal_answer":questions_db[question].get('ideal_answer', ''),
                    "hrQuestions.$.timestamp": datetime.now()
                }}
            )
            
        else:
            # If question does not exist, add new entry to hrQuestions array
            result = user_collection.update_one(
                {'email': email},
                {"$push": {"hrQuestions": new_data}}
            )
        
        if not result or result.modified_count == 0:
            print(f"Warning: User {email} not found or update failed.")
            
    except Exception as e:
        print(f"Error processing transcript: {e}")
        socketio.emit('transcript_feedback', {
            "feedback": f"An error occurred while processing your answer: {str(e)}",
            "success": False
        })


users = {}
@socketio.on('request_question')
def send_random_question(data):
    """Send a question to the user or notify completion if all questions are done"""
    try:
        email = data['email']
        total_questions = len(questions_db)
        
        # Initialize or update user's question index
        if email in users:
            # Check if the user has reached the total length
            if users[email] >= total_questions - 1:
                # Send completion message
                socketio.emit('new_question', {
                    'question': None,  # No new question
                    'questionNumber': total_questions,
                    'totalQuestions': total_questions,
                    'message': 'Congratulations! You have completed all interview questions. Check your feedback in the progress section.',
                    'interview_finished': True  # Flag indicating completion
                })
                
                # Set index to -1 so next request will start at 0
                users[email] = -1
                return
            else:
                users[email] += 1
        else:
            # Initialize user's HR questions array in the database if not exists
            user = user_collection.find_one({'email': email})
            if user and 'hrQuestions' not in user:
                newObject = {"$set": {"hrQuestions": []}}
                user_collection.find_one_and_update({'email': email}, newObject)
            users[email] = 0
        
        # Get the next question
        question_index = users[email]
        keys_list = list(questions_db.keys())
        question = keys_list[question_index]
        
        # Emit the question to the user
        socketio.emit('new_question', {
            'question': question, 
            'questionNumber': users[email] + 1,
            'totalQuestions': total_questions
        })
    
    except KeyError:
        print("Error: 'email' not found in data.")
        socketio.emit('error', {'message': 'Email information missing.'})
    except Exception as e:
        print(f"Unexpected error: {e}")
        socketio.emit('error', {'message': f'An error occurred: {str(e)}'})
# Add a new route to check if all questions are completed
@app.route('/api/interview_status/<email>', methods=['GET'])
def get_interview_status(email):
    """Check if a user has completed all interview questions"""
    user = user_collection.find_one({'email': email})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    total_questions = len(questions_db)
    completed_questions = len(user.get('hrQuestions', []))
    
    return jsonify({
        "completed": completed_questions,
        "total": total_questions,
        "is_complete": completed_questions >= total_questions,
        "remaining": max(0, total_questions - completed_questions)
    })


# Add a frontend endpoint for interview completion
@app.route('/interview_complete')
def interview_complete_page():
    """Show interview completion page"""
    email = request.args.get('email')
    if not email:
        return redirect('/')
    
    return render_template('interview_complete.html', email=email)


@app.route('/')
def homepage():
    return render_template('index.html')


@app.route('/api/user_feedback/<email>', methods=['GET'])
def get_user_feedback(email):
    """Fetch all HR question feedback for a given user by email"""
    try:
        # Find the user by email
        user = user_collection.find_one({'email': email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Extract hrQuestions from the user document
        hr_questions = user.get('hrQuestions', [])
        
        if not hr_questions:
            return jsonify({"feedback": []}), 200
        
        # Ensure timestamps are in ISO format for JSON serialization
        for question in hr_questions:
            if isinstance(question['timestamp'], datetime):
                question['timestamp'] = question['timestamp'].isoformat()
        
        # Return the feedback data
        return jsonify({"feedback": hr_questions}), 200
    
    except Exception as e:
        print(f"Error fetching feedback: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# ********************************************************** ats Start    ******************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************
UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"pdf", "docx"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS



@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return redirect(request.url)

    file = request.files["file"]
    role = request.form["role"]
    email = request.form["email"]

    if file.filename == "":
        return redirect(request.url)

    if file and allowed_file(file.filename):
        filename = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(filename)

        # Resume Processing
        (
            score,
            match_hard,
            missing_hard,
            match_soft,
            missing_soft,
            word_count,
            sections,
            hs,
            ss,
            wc,
            sc,
            corrections,
            resume_text_format 
        ) = ats.processing(file.filename, 1, role)
        user_collection.find_one_and_update({'email':email},{'$set':{"resume_text_format":resume_text_format}})

        struct = f"{int(sc)}%"
        hsp = f"{int(hs)}%"
        ssp = f"{int(ss)}%"
        wcp = f"{int(wc)}%"

        # Generate new filename with "-1" appended
        base_name, extension = os.path.splitext(file.filename)
        pdfFileName = f"{base_name}-1{extension}"

        # Convert skills to a unique list
        unique_skills = list(set(match_hard))

        # Update user record in MongoDB
        user_collection.update_one(
            {"email": email},
            {
                "$set": {"resumeFile": pdfFileName},  # Update resume filename
                "$addToSet": {"technicalSkills": {"$each": unique_skills}}  # Add skills without duplicates
            }
        )

        return render_template(
            "result.html",
            final=int(score),
            struct=struct,
            hsp=hsp,
            ssp=ssp,
            wcp=wcp,
            sections=sections,
            match_hard=unique_skills,
            missing_hard=missing_hard,
            match_soft=list(set(match_soft)),
            missing_soft=missing_soft,
            word_count=word_count,
            pdfFileName=pdfFileName,
            corrections=corrections
        )

    return "Invalid file format! Allowed formats: pdf, docx"
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# ********************************************************** ats end    ******************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************




if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000,debug=False)
