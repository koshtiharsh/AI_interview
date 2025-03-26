
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

import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re
import string
from collections import Counter
from pymongo import MongoClient
import os

try:
    nltk.data.find('vader_lexicon')
    nltk.data.find('punkt')
    nltk.data.find('stopwords')
except LookupError:
    nltk.download('vader_lexicon')
    nltk.download('punkt')
    nltk.download('stopwords')

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

class InterviewEvaluator:
    """Advanced system for evaluating interview responses with comprehensive feedback"""
    
    def __init__(self):
        self.questions_db = self.initialize_questions_db()
        self.users = {}
        
    def initialize_questions_db(self):
        """Initialize comprehensive question database with detailed evaluation criteria"""
        # This will be populated by the user as mentioned in the requirements
        return {

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
        
    def evaluate_answer(self, question, transcript, user_id):
        """Comprehensive evaluation of interview answers with detailed feedback"""
        if question not in self.questions_db:
            return {
                "error": "Question not found in database",
                "score": 0,
                "feedback": "Unable to evaluate answer for unknown question"
            }
        
        # Handle minimal or empty responses
        if len(transcript.strip()) < 20 or transcript.lower() in ["hello", "hi", "yes", "no", "ok"]:
            return {
                "score": 1,
                "feedback": "Your response is too brief. Please provide a complete answer to the question.",
                "areas_to_improve": ["Response length", "Content depth", "Question engagement"],
                "strengths": [],
                "ideal_answer": self.questions_db[question]["ideal_answer"]
            }
        
        question_data = self.questions_db[question]
        results = {}
        
        # Calculate scores for each evaluation criterion
        results = self._evaluate_content(question_data, transcript)
        
        # Add linguistic analysis
        linguistic_scores = self._analyze_language(question_data, transcript)
        results.update(linguistic_scores)
        
        # Calculate final weighted score
        total_score = self._calculate_weighted_score(question_data, results)
        
        # Generate comprehensive feedback
        feedback = self._generate_feedback(question_data, results, total_score, transcript)
        
        # Update user progress
        self._update_user_progress(user_id, question, total_score, feedback)
        
        return feedback
    
    def _evaluate_content(self, question_data, transcript):
        """Evaluate answer content against ideal answer and key points"""
        results = {}
        transcript_lower = transcript.lower()
        
        # Check for key points coverage
        key_points_score = self._evaluate_key_points(question_data["key_points"], transcript_lower)
        results["key_points_score"] = key_points_score
        
        # Check for ideal structure adherence
        structure_score = self._evaluate_structure(question_data["ideal_structure"], transcript_lower)
        results["structure_score"] = structure_score
        
        # Check for red flags
        red_flag_count = self._check_red_flags(question_data["red_flags"], transcript_lower)
        results["red_flag_count"] = red_flag_count
        
        # Evaluate based on question type
        question_type = question_data["question_type"]
        if question_type == "behavioral_star":
            star_scores = self._evaluate_star_method(transcript_lower)
            results["star_scores"] = star_scores
        
        # Evaluate based on section weights
        section_scores = {}
        for section, criteria in question_data["evaluation_criteria"].items():
            section_score = self._evaluate_section(criteria, transcript_lower)
            section_scores[section] = section_score
        
        results["section_scores"] = section_scores
        
        # Check answer length against guidelines
        time_guideline = question_data["time_guideline"]
        min_time, max_time = self._parse_time_guideline(time_guideline)
        word_count = len(transcript.split())
        estimated_seconds = word_count / 2.5  # Average speaking rate
        
        results["estimated_time"] = estimated_seconds
        results["time_appropriateness"] = self._evaluate_time_appropriateness(estimated_seconds, min_time, max_time)
        
        return results
    
    def _evaluate_key_points(self, key_points, transcript_lower):
        """Evaluate how many key points are covered in the answer"""
        covered_points = 0
        key_point_details = {}
        
        for point in key_points:
            point_lower = point.lower()
            # Check if the key point or its synonyms are mentioned
            synonyms = self._get_key_point_synonyms(point_lower)
            
            is_covered = False
            evidence = ""
            
            # Check for direct inclusion
            if point_lower in transcript_lower:
                is_covered = True
                start_idx = transcript_lower.find(point_lower)
                end_idx = min(start_idx + len(point_lower) + 50, len(transcript_lower))
                evidence = transcript_lower[start_idx:end_idx] + "..."
            
            # Check for synonyms or related concepts
            if not is_covered:
                for synonym in synonyms:
                    if synonym in transcript_lower:
                        is_covered = True
                        start_idx = transcript_lower.find(synonym)
                        end_idx = min(start_idx + len(synonym) + 50, len(transcript_lower))
                        evidence = transcript_lower[start_idx:end_idx] + "..."
                        break
            
            # Check for conceptual coverage using NLP techniques
            if not is_covered:
                is_covered, evidence = self._check_conceptual_coverage(point_lower, transcript_lower)
            
            key_point_details[point] = {
                "covered": is_covered,
                "evidence": evidence if is_covered else ""
            }
            
            if is_covered:
                covered_points += 1
        
        coverage_ratio = covered_points / len(key_points)
        score = min(int(coverage_ratio * 10) + 1, 10)  # Score from 1-10
        
        return {
            "score": score,
            "coverage_ratio": coverage_ratio,
            "covered_points": covered_points,
            "total_points": len(key_points),
            "point_details": key_point_details
        }
    
    def _get_key_point_synonyms(self, key_point):
        """Get synonyms for key point keywords"""
        # Dictionary of common synonyms for interview key points
        synonym_dict = {
            "professional background": ["work history", "career history", "work experience", "professional experience"],
            "technical skills": ["hard skills", "technical expertise", "technical abilities", "technical competencies"],
            "achievements": ["accomplishments", "successes", "results", "impact"],
            "educational background": ["education", "academic history", "qualifications", "degrees"],
            "leadership": ["management", "team leading", "directing", "guiding"],
            "communication": ["interpersonal skills", "articulation", "expression", "verbal skills"],
            "problem solving": ["troubleshooting", "issue resolution", "analytical thinking", "critical thinking"],
            # Add more synonyms for common key points
        }
        
        synonyms = []
        for term, syn_list in synonym_dict.items():
            if term in key_point:
                synonyms.extend(syn_list)
        
        # Add word-level synonyms
        key_words = key_point.split()
        for word in key_words:
            if len(word) > 3:  # Only consider substantive words
                word_synonyms = self._get_word_synonyms(word)
                synonyms.extend(word_synonyms)
        
        return synonyms
    
    def _get_word_synonyms(self, word):
        """Get synonyms for a single word"""
        # Simplified synonym dictionary for common terms in interviews
        word_synonyms = {
            "challenge": ["problem", "obstacle", "difficulty", "hurdle"],
            "improve": ["enhance", "optimize", "upgrade", "refine"],
            "create": ["develop", "build", "establish", "implement"],
            "team": ["group", "department", "colleagues", "coworkers"],
            "lead": ["manage", "direct", "guide", "oversee"],
            "goal": ["objective", "target", "aim", "purpose"],
            # Add more word-level synonyms
        }
        
        return word_synonyms.get(word.lower(), [])
    
    def _check_conceptual_coverage(self, key_point, transcript_lower):
        """Check if the concept of a key point is covered even if specific terms aren't used"""
        # This would ideally use NLP techniques like semantic similarity
        # Simplified implementation for now
        
        key_concepts = {
            "technical skills": ["programming", "coding", "software", "development", "engineering"],
            "leadership": ["directed", "guided", "managed", "organized", "coordinated", "responsibility"],
            "teamwork": ["collaborated", "partnered", "worked together", "cooperation", "jointly"],
            # Add more concept mappings
        }
        
        for concept, indicators in key_concepts.items():
            if concept in key_point:
                for indicator in indicators:
                    if indicator in transcript_lower:
                        start_idx = transcript_lower.find(indicator)
                        end_idx = min(start_idx + len(indicator) + 50, len(transcript_lower))
                        return True, transcript_lower[start_idx:end_idx] + "..."
        
        return False, ""
    
    def _evaluate_structure(self, ideal_structure, transcript_lower):
        """Evaluate how well the answer follows the ideal structure"""
        structure_score = 0
        structure_details = {}
        
        # Check for sequential coverage of structure elements
        last_found_idx = -1
        sequential_bonus = 0
        
        for idx, element in enumerate(ideal_structure):
            element_lower = element.lower()
            element_found = False
            element_idx = -1
            
            # Check direct inclusion
            if element_lower in transcript_lower:
                element_found = True
                element_idx = transcript_lower.find(element_lower)
            else:
                # Check for synonyms or related phrases
                synonyms = self._get_structure_element_synonyms(element_lower)
                for synonym in synonyms:
                    if synonym in transcript_lower:
                        element_found = True
                        element_idx = transcript_lower.find(synonym)
                        break
            
            structure_details[element] = {
                "present": element_found,
                "position": element_idx if element_found else -1
            }
            
            if element_found:
                structure_score += 1
                # Check if elements appear in the expected sequence
                if element_idx > last_found_idx:
                    sequential_bonus += 0.5
                last_found_idx = element_idx
        
        # Calculate final structure score
        base_score = (structure_score / len(ideal_structure)) * 7  # Base score out of 7
        final_score = min(base_score + sequential_bonus, 10)  # Add bonus for proper sequencing
        
        return {
            "score": final_score,
            "elements_present": structure_score,
            "total_elements": len(ideal_structure),
            "sequential_flow": sequential_bonus > 0,
            "element_details": structure_details
        }
    
    def _get_structure_element_synonyms(self, element):
        """Get synonyms for structure elements"""
        structure_synonyms = {
            "brief introduction": ["introduction", "short overview", "about me", "background summary"],
            "professional background": ["work history", "career summary", "employment background"],
            "key skills": ["technical skills", "core competencies", "skill set", "expertise"],
            "notable achievements": ["accomplishments", "successes", "key results", "major wins"],
            "future aspirations": ["career goals", "objectives", "future plans", "ambitions"],
            # Add more structure element synonyms
        }
        
        return structure_synonyms.get(element, [])
    
    def _check_red_flags(self, red_flags, transcript_lower):
        """Check for presence of red flags in the answer"""
        red_flag_details = {}
        
        for flag in red_flags:
            flag_lower = flag.lower()
            is_present = False
            evidence = ""
            
            # Direct match check
            if flag_lower in transcript_lower:
                is_present = True
                start_idx = transcript_lower.find(flag_lower)
                end_idx = min(start_idx + len(flag_lower) + 30, len(transcript_lower))
                evidence = transcript_lower[start_idx:end_idx] + "..."
            
            # Check for red flag indicators
            if not is_present:
                indicators = self._get_red_flag_indicators(flag_lower)
                for indicator in indicators:
                    if indicator in transcript_lower:
                        is_present = True
                        start_idx = transcript_lower.find(indicator)
                        end_idx = min(start_idx + len(indicator) + 30, len(transcript_lower))
                        evidence = transcript_lower[start_idx:end_idx] + "..."
                        break
            
            red_flag_details[flag] = {
                "present": is_present,
                "evidence": evidence if is_present else ""
            }
        
        # Count total red flags found
        red_flag_count = sum(1 for flag in red_flag_details.values() if flag["present"])
        
        return {
            "count": red_flag_count,
            "total_flags": len(red_flags),
            "flag_details": red_flag_details
        }
    
    def _get_red_flag_indicators(self, red_flag):
        """Get phrases that indicate specific red flags"""
        red_flag_indicators = {
            "excessive personal details": ["my family", "my children", "my spouse", "my hobbies", "personal life"],
            "negativity about past employers": ["terrible manager", "hated my job", "awful company", "worst experience", "complained"],
            "generic answers": ["hard worker", "team player", "people person", "fast learner", "detail-oriented"],
            "lack of specific examples": ["usually", "typically", "generally", "always", "never"],
            # Add more indicators for red flags
        }
        
        return red_flag_indicators.get(red_flag, [])
    
    def _evaluate_star_method(self, transcript_lower):
        """Evaluate use of STAR method (Situation, Task, Action, Result) for behavioral questions"""
        star_components = {
            "situation": ["situation", "context", "background", "setting", "scenario", "when"],
            "task": ["task", "challenge", "objective", "goal", "responsible for", "needed to"],
            "action": ["action", "steps", "approach", "implemented", "executed", "did", "took", "developed"],
            "result": ["result", "outcome", "impact", "achievement", "accomplishment", "success", "learned"]
        }
        
        star_scores = {}
        
        for component, indicators in star_components.items():
            component_score = 0
            evidence = ""
            
            for indicator in indicators:
                if indicator in transcript_lower:
                    component_score += 1
                    if not evidence:
                        start_idx = transcript_lower.find(indicator)
                        end_idx = min(start_idx + len(indicator) + 50, len(transcript_lower))
                        evidence = transcript_lower[start_idx:end_idx] + "..."
            
            # Normalize score to be between 0-10
            normalized_score = min(component_score * 2.5, 10)
            
            star_scores[component] = {
                "score": normalized_score,
                "evidence": evidence if component_score > 0 else ""
            }
        
        # Calculate overall STAR score
        overall_star_score = sum(comp["score"] for comp in star_scores.values()) / 4
        
        return {
            "overall_score": overall_star_score,
            "components": star_scores
        }
    
    def _evaluate_section(self, criteria, transcript_lower):
        """Evaluate a specific section based on its criteria"""
        section_scores = {}
        
        for criterion, description in criteria.items():
            criterion_score = self._evaluate_criterion(criterion, description, transcript_lower)
            section_scores[criterion] = criterion_score
        
        # Calculate average section score
        avg_section_score = sum(score["score"] for score in section_scores.values()) / len(section_scores)
        
        return {
            "score": avg_section_score,
            "criteria_scores": section_scores
        }
    
    def _evaluate_criterion(self, criterion, description, transcript_lower):
        """Evaluate a specific criterion"""
        # This would ideally use more sophisticated NLP for semantic understanding
        # Simplified implementation for now
        
        # Generate keywords from criterion and description
        keywords = self._extract_criterion_keywords(criterion, description)
        
        # Check for keyword presence
        keyword_count = 0
        evidence = ""
        
        for keyword in keywords:
            if keyword in transcript_lower:
                keyword_count += 1
                if not evidence:
                    start_idx = transcript_lower.find(keyword)
                    end_idx = min(start_idx + len(keyword) + 50, len(transcript_lower))
                    evidence = transcript_lower[start_idx:end_idx] + "..."
        
        # Calculate score based on keyword coverage
        coverage_ratio = keyword_count / len(keywords) if keywords else 0
        score = min(int(coverage_ratio * 10) + 1, 10)  # Score from 1-10
        
        return {
            "score": score,
            "description": description,
            "evidence": evidence if keyword_count > 0 else ""
        }
    
    def _extract_criterion_keywords(self, criterion, description):
        """Extract keywords from criterion and description"""
        # Convert criterion and description to keywords
        words = criterion.lower().split() + description.lower().split()
        
        # Filter out common stop words
        stop_words = ["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "is", "are", "was", "were"]
        keywords = [word for word in words if word not in stop_words and len(word) > 3]
        
        return list(set(keywords))  # Remove duplicates
    
    def _parse_time_guideline(self, time_guideline):
        """Parse time guideline to get min and max seconds"""
        if "-" in time_guideline:
            parts = time_guideline.split("-")
            min_seconds = int(parts[0]) if parts[0].isdigit() else int(parts[0].split()[0])
            max_seconds = int(parts[1].split()[0])
        else:
            min_seconds = int(time_guideline.split()[0]) * 0.8  # 80% of guideline
            max_seconds = int(time_guideline.split()[0]) * 1.2  # 120% of guideline
        
        return min_seconds, max_seconds
    
    def _evaluate_time_appropriateness(self, estimated_seconds, min_seconds, max_seconds):
        """Evaluate if the answer length is appropriate"""
        if min_seconds <= estimated_seconds <= max_seconds:
            return {
                "appropriate": True,
                "score": 10,
                "feedback": "Answer length is appropriate."
            }
        elif estimated_seconds < min_seconds:
            shortfall = min_seconds - estimated_seconds
            severity = shortfall / min_seconds
            score = max(10 - int(severity * 10), 1)
            return {
                "appropriate": False,
                "score": score,
                "feedback": f"Answer is too brief. Consider adding more details to meet the expected {min_seconds}-{max_seconds} second response time."
            }
        else:  # estimated_seconds > max_seconds
            excess = estimated_seconds - max_seconds
            severity = excess / max_seconds
            score = max(10 - int(severity * 5), 1)  # Less severe penalty for being too long
            return {
                "appropriate": False,
                "score": score,
                "feedback": f"Answer is too lengthy. Consider being more concise to meet the expected {min_seconds}-{max_seconds} second response time."
            }
    
    def _analyze_language(self, question_data, transcript):
        """Analyze language usage in the transcript"""
        transcript_lower = transcript.lower()
        linguistic_markers = question_data.get("linguistic_markers", {})
        
        # Analyze positive markers
        positive_markers = linguistic_markers.get("positive", [])
        positive_count = 0
        positive_examples = []
        
        for marker in positive_markers:
            if marker in transcript_lower:
                positive_count += 1
                context = self._get_marker_context(transcript_lower, marker)
                positive_examples.append({"marker": marker, "context": context})
        
        positive_ratio = positive_count / len(positive_markers) if positive_markers else 0
        
        # Analyze negative markers
        negative_markers = linguistic_markers.get("negative", [])
        negative_count = 0
        negative_examples = []
        
        for marker in negative_markers:
            if marker in transcript_lower:
                negative_count += 1
                context = self._get_marker_context(transcript_lower, marker)
                negative_examples.append({"marker": marker, "context": context})
        
        negative_ratio = negative_count / len(negative_markers) if negative_markers else 0
        
        # Check for weak phrases if available
        weak_phrases = linguistic_markers.get("weak_phrases", [])
        weak_phrase_count = 0
        weak_phrase_examples = []
        
        for phrase in weak_phrases:
            if phrase.lower() in transcript_lower:
                weak_phrase_count += 1
                context = self._get_marker_context(transcript_lower, phrase.lower())
                weak_phrase_examples.append({"phrase": phrase, "context": context})
        
        weak_phrase_ratio = weak_phrase_count / len(weak_phrases) if weak_phrases else 0
        
        # Calculate linguistic score
        # Higher positive ratio, lower negative ratio, and lower weak phrase ratio is better
        linguistic_score = (positive_ratio * 10) - (negative_ratio * 5) - (weak_phrase_ratio * 3)
        linguistic_score = max(min(linguistic_score, 10), 1)  # Clamp between 1-10
        
        return {
            "linguistic_score": linguistic_score,
            "positive_markers": {
                "count": positive_count,
                "total": len(positive_markers),
                "examples": positive_examples[:3]  # Limit to top 3 examples
            },
            "negative_markers": {
                "count": negative_count,
                "total": len(negative_markers),
                "examples": negative_examples[:3]  # Limit to top 3 examples
            },
            "weak_phrases": {
                "count": weak_phrase_count,
                "total": len(weak_phrases),
                "examples": weak_phrase_examples[:3]  # Limit to top 3 examples
            }
        }
    
    def _get_marker_context(self, text, marker):
        """Get the context around a specific marker in text"""
        marker_idx = text.find(marker)
        start_idx = max(0, marker_idx - 20)
        end_idx = min(len(text), marker_idx + len(marker) + 20)
        
        # Find start of sentence
        if start_idx > 0:
            sentence_start = text.rfind(".", 0, start_idx)
            if sentence_start != -1:
                start_idx = sentence_start + 1
        
        # Find end of sentence
        sentence_end = text.find(".", end_idx)
        if sentence_end != -1:
            end_idx = sentence_end + 1
        
        context = text[start_idx:end_idx].strip()
        return f"...{context}..." if start_idx > 0 or end_idx < len(text) else context
    
    def _calculate_weighted_score(self, question_data, results):
        """Calculate final weighted score based on section weights"""
        section_weights = question_data.get("section_weights", {})
        weighted_sum = 0
        
        # Apply weights to section scores
        for section, weight in section_weights.items():
            if section in results.get("section_scores", {}):
                weighted_sum += results["section_scores"][section]["score"] * weight
        
        # Factor in key points score
        key_points_weight = 0.2 if "key_points_score" in results else 0
        if key_points_weight > 0:
            weighted_sum += results["key_points_score"]["score"] * key_points_weight
        
        # Factor in structure score
        structure_weight = 0.1 if "structure_score" in results else 0
        if structure_weight > 0:
            weighted_sum += results["structure_score"]["score"] * structure_weight
        
        # Factor in linguistic score
        linguistic_weight = 0.1 if "linguistic_score" in results else 0
        if linguistic_weight > 0:
            weighted_sum += results["linguistic_score"] * linguistic_weight
        
        # Adjust for red flags
        red_flag_penalty = 0
        if "red_flag_count" in results:
            red_flag_ratio = min(results["red_flag_count"]["count"] / 5, 1)  # Cap at 5 red flags for max penalty
            red_flag_penalty = red_flag_ratio * 2  # Maximum 2-point penalty
        
        # Adjust for STAR method for behavioral questions
        star_bonus = 0
        if question_data.get("question_type") == "behavioral_star" and "star_scores" in results:
            star_score = results["star_scores"]["overall_score"]
            star_bonus = (star_score / 10) * 0.5  # Maximum 0.5-point bonus
        
        # Calculate final score
        raw_score = weighted_sum - red_flag_penalty + star_bonus
        final_score = max(min(round(raw_score), 10), 1)  # Clamp between 1-10
        
        return final_score
    
    def _generate_feedback(self, question_data, results, score, transcript):
        """Generate comprehensive feedback based on evaluation results"""
        feedback_dict = {
            "score": score,
            "question_type": question_data["question_type"],
            "feedback": self._generate_summary_feedback(score, results),
            "strengths": self._identify_strengths(results),
            "areas_to_improve": self._identify_improvement_areas(results),
            "detailed_analysis": results
        }
        
        # Include ideal answer for scores below 7
        if score < 7:
            feedback_dict["ideal_answer"] = question_data["ideal_answer"]
        
        # Include specific guidance based on question type
        feedback_dict["specific_guidance"] = self._generate_specific_guidance(question_data, results)
        
        return feedback_dict
    
    def _generate_summary_feedback(self, score, results):
        """Generate summary feedback based on score"""
        if score >= 9:
            return "Excellent response! Your answer was comprehensive, well-structured, and demonstrated strong qualifications for the position."
        elif score >= 7:
            return "Good response. Your answer covered most key points and was generally well-structured, though there are some areas for improvement."
        elif score >= 5:
            return "Satisfactory response. Your answer addressed the question but missed several key points and opportunities to showcase your qualifications."
        elif score >= 3:
            return "Your response needs significant improvement. Important aspects of the question were not addressed, and your answer lacked structure and specificity."
        else:
            return "Your response was inadequate. Please review the ideal answer and address the areas for improvement before your next interview."
    
    def _identify_strengths(self, results):
        """Identify strengths based on evaluation results"""
        strengths = []
        
        # Check key points coverage
        if "key_points_score" in results and results["key_points_score"]["score"] >= 7:
            strengths.append("Good coverage of key points")
        
        # Check structure
        if "structure_score" in results and results["structure_score"]["score"] >= 7:
            if results["structure_score"].get("sequential_flow", False):
                strengths.append("Well-structured response with logical flow")
            else:
                strengths.append("Included important structural elements")
        
        # Check for positive linguistic markers
        if "linguistic_score" in results and results["linguistic_score"] >= 7:
            strengths.append("Strong use of impactful language")
        
        # Check for STAR method usage
        if "star_scores" in results:
            star_scores = results["star_scores"]
            high_components = []
            
            for component, data in star_scores["components"].items():
                if data["score"] >= 7:
                    high_components.append(component.capitalize())
            
            if len(high_components) >= 3:
                strengths.append(f"Strong STAR method application (particularly in {', '.join(high_components)})")
        
        # Check section scores
        if "section_scores" in results:
            for section, data in results["section_scores"].items():
                if data["score"] >= 8:
                    strengths.append(f"Excellent {section.replace('_', ' ')}")
        
        # Check answer length
        if "time_appropriateness" in results and results["time_appropriateness"]["appropriate"]:
            strengths.append("Appropriate answer length")
        
        # Ensure we have at least one strength
        if not strengths and "key_points_score" in results:
            # Find best-covered key points
            covered_points = [
                point for point, data in results["key_points_score"]["point_details"].items() 
                if data["covered"]
            ]
            
            if covered_points:
                strengths.append(f"Effectively addressed: {', '.join(covered_points[:2])}")
        
        # If still no strengths, add a generic positive comment
        if not strengths:
            strengths.append("Attempted to address the question")
        
        return strengths[:3]  # Limit to top 3 strengths
    
    def _identify_improvement_areas(self, results):
        """Identify areas for improvement based on evaluation results"""
        improvement_areas = []
        
        # Check key points coverage
        if "key_points_score" in results and results["key_points_score"]["score"] < 7:
            missed_points = [
                point for point, data in results["key_points_score"]["point_details"].items() 
                if not data["covered"]
            ]
            
            if len(missed_points) > 2:
                improvement_areas.append(f"Include key points: {', '.join(missed_points[:3])}")
            elif missed_points:
                improvement_areas.append(f"Address missing points: {', '.join(missed_points)}")
        
        # Check structure
        if "structure_score" in results and results["structure_score"]["score"] < 7:
            missing_elements = [
                element for element, data in results["structure_score"]["element_details"].items() 
                if not data["present"]
            ]
            
            if missing_elements:
                improvement_areas.append(f"Include missing structural elements: {', '.join(missing_elements[:2])}")
            else:
                improvement_areas.append("Improve logical flow of your response")
        
        # Check for red flags
        if "red_flag_count" in results and results["red_flag_count"]["count"] > 0:
            present_flags = [
                flag for flag, data in results["red_flag_count"]["flag_details"].items() 
                if data["present"]
            ]
            
            if present_flags:
                improvement_areas.append(f"Avoid: {', '.join(present_flags[:2])}")
        
        # Check for negative linguistic markers
        if "linguistic_score" in results and results["linguistic_score"] < 5:
            negative_examples = results.get("negative_markers", {}).get("examples", [])
            weak_examples = results.get("weak_phrases", {}).get("examples", [])
            
            language_issues = []
            if negative_examples:
                language_issues.extend([example["marker"] for example in negative_examples[:2]])
            if weak_examples:
                language_issues.extend([example["phrase"] for example in weak_examples[:2]])
            
            if language_issues:
                improvement_areas.append(f"Strengthen language by avoiding: {', '.join(language_issues)}")
            else:
                improvement_areas.append("Use more impactful language")
        
        # Check for STAR method usage for behavioral questions
        if "star_scores" in results:
            star_scores = results["star_scores"]
            weak_components = []
            
            for component, data in star_scores["components"].items():
                if data["score"] < 5:
                    weak_components.append(component.capitalize())
            
            if weak_components:
                improvement_areas.append(f"Strengthen STAR method - add more detail to: {', '.join(weak_components)}")
        
        # Check section scores
        if "section_scores" in results:
            for section, data in results["section_scores"].items():
                if data["score"] < 5:
                    improvement_areas.append(f"Improve {section.replace('_', ' ')}")
        
        # Check answer length
        if "time_appropriateness" in results and not results["time_appropriateness"]["appropriate"]:
            improvement_areas.append(results["time_appropriateness"]["feedback"])
        
        # Ensure we have at least one improvement area
        if not improvement_areas:
            improvement_areas.append("Add more specific examples to strengthen your response")
        
        return improvement_areas[:4]  # Limit to top 4 improvement areas
    
    def _generate_specific_guidance(self, question_data, results):
        """Generate specific guidance based on question type and evaluation results"""
        question_type = question_data["question_type"]
        guidance = []
        
        if question_type == "behavioral_star":
            # Check which STAR components need improvement
            if "star_scores" in results:
                weak_components = {}
                for component, data in results["star_scores"]["components"].items():
                    if data["score"] < 6:
                        weak_components[component] = data["score"]
                
                if "situation" in weak_components:
                    guidance.append("Provide more context about the specific situation you encountered")
                if "task" in weak_components:
                    guidance.append("Clearly define what your responsibility or objective was")
                if "action" in weak_components:
                    guidance.append("Detail the specific steps you took to address the situation")
                if "result" in weak_components:
                    guidance.append("Quantify the outcomes and explain what you learned")
        
        elif question_type == "technical":
            # Check for technical depth and specificity
            if "section_scores" in results:
                for section, data in results["section_scores"].items():
                    if "technical_depth" in section and data["score"] < 6:
                        guidance.append("Provide more technical details and specific examples of technologies used")
                    if "problem_solving" in section and data["score"] < 6:
                        guidance.append("Explain your problem-solving approach step by step")
                    if "technical_skills" in section and data["score"] < 6:
                        guidance.append("Highlight relevant technical skills with concrete examples")
        
        elif question_type == "strengths_weaknesses":
            # Check if both strengths and growth areas were covered
            if "section_scores" in results:
                for section, data in results["section_scores"].items():
                    if "strengths" in section and data["score"] < 6:
                        guidance.append("Provide specific examples that demonstrate your key strengths")
                    if "weaknesses" in section and data["score"] < 6:
                        guidance.append("Frame weaknesses as growth areas and explain steps taken to improve")
                    if "self_awareness" in section and data["score"] < 6:
                        guidance.append("Show more self-awareness by connecting strengths/weaknesses to the role")
        
        elif question_type == "why_company":
            # Check for company knowledge and alignment
            if "section_scores" in results:
                for section, data in results["section_scores"].items():
                    if "company_knowledge" in section and data["score"] < 6:
                        guidance.append("Research the company more thoroughly and mention specific values, products, or initiatives")
                    if "alignment" in section and data["score"] < 6:
                        guidance.append("Clearly connect your skills and goals with the company's mission and needs")
        
        # Generic guidance for all question types
        if not guidance:
            low_key_points = ("key_points_score" in results and results["key_points_score"]["score"] < 6)
            poor_structure = ("structure_score" in results and results["structure_score"]["score"] < 6)
            
            if low_key_points and poor_structure:
                guidance.append("Prepare a structured response that covers all key points before your interview")
            elif low_key_points:
                guidance.append("Review the key points expected in this type of question")
            elif poor_structure:
                guidance.append("Practice organizing your thoughts in a logical structure")
        
        return guidance
    
    def _update_user_progress(self, user_id, question, score, feedback):
        """Update user progress for the given question"""
        if user_id not in self.users:
            self.users[user_id] = {
                "completed_questions": {},
                "average_score": 0,
                "total_questions_attempted": 0,
                "improvement_areas": {}
            }
        
        # Update completed questions
        self.users[user_id]["completed_questions"][question] = {
            "latest_score": score,
            "attempts": self.users[user_id]["completed_questions"].get(question, {}).get("attempts", 0) + 1,
            "timestamp": self._get_current_timestamp()
        }
        
        # Update average score
        total_score = sum(q["latest_score"] for q in self.users[user_id]["completed_questions"].values())
        total_questions = len(self.users[user_id]["completed_questions"])
        self.users[user_id]["average_score"] = total_score / total_questions
        self.users[user_id]["total_questions_attempted"] = total_questions
        
        # Track improvement areas
        for area in feedback["areas_to_improve"]:
            area_key = self._normalize_improvement_area(area)
            if area_key in self.users[user_id]["improvement_areas"]:
                self.users[user_id]["improvement_areas"][area_key] += 1
            else:
                self.users[user_id]["improvement_areas"][area_key] = 1
        
        # Additional analytics could be added here
        
        return self.users[user_id]
    
    def _normalize_improvement_area(self, area):
        """Normalize improvement area text to group similar feedback"""
        area_lower = area.lower()
        
        # Map common patterns to standardized keys
        if "star" in area_lower:
            return "star_method_application"
        elif "key point" in area_lower or "missing point" in area_lower:
            return "key_points_coverage"
        elif "structure" in area_lower or "flow" in area_lower:
            return "response_structure"
        elif "language" in area_lower:
            return "language_improvement"
        elif "specific" in area_lower or "example" in area_lower:
            return "specific_examples"
        elif "brief" in area_lower or "length" in area_lower or "concise" in area_lower:
            return "response_length"
        else:
            # Create a simplified key from the area
            words = area_lower.split()
            key_words = [w for w in words if len(w) > 3 and w not in ["include", "improve", "avoid", "address", "more", "less"]]
            return "_".join(key_words[:2]) if key_words else "general_improvement"
    
    def _get_current_timestamp(self):
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def get_recommended_questions(self, user_id):
        """Get recommended questions based on user's improvement areas"""
        if user_id not in self.users:
            # Return random questions if user has no history
            return list(self.questions_db.keys())[:3]
        
        # Get top improvement areas
        improvement_areas = self.users[user_id]["improvement_areas"]
        top_areas = sorted(improvement_areas.items(), key=lambda x: x[1], reverse=True)[:2]
        
        # Find questions that target these improvement areas
        recommended_questions = []
        
        for area, _ in top_areas:
            matching_questions = []
            for question, data in self.questions_db.items():
                # Skip questions already attempted
                if question in self.users[user_id]["completed_questions"]:
                    continue
                
                # Check if question targets the improvement area
                if self._question_targets_area(data, area):
                    matching_questions.append(question)
            
            # Add top 2 matching questions
            recommended_questions.extend(matching_questions[:2])
        
        # If not enough recommendations, add random unattempted questions
        if len(recommended_questions) < 3:
            attempted = set(self.users[user_id]["completed_questions"].keys())
            unattempted = [q for q in self.questions_db.keys() if q not in attempted and q not in recommended_questions]
            recommended_questions.extend(unattempted[:3 - len(recommended_questions)])
        
        return recommended_questions[:3]
    
    def _question_targets_area(self, question_data, area):
        """Check if a question targets a specific improvement area"""
        area_mappings = {
            "star_method_application": {"question_type": "behavioral_star"},
            "key_points_coverage": {"has_key_points": True},
            "response_structure": {"has_structure": True},
            "specific_examples": {"requires_examples": True},
            "technical_knowledge": {"question_type": "technical"},
            "company_knowledge": {"question_type": "why_company"}
        }
        
        # Check if area has specific mapping
        if area in area_mappings:
            criteria = area_mappings[area]
            for key, value in criteria.items():
                if key == "question_type":
                    if question_data.get(key) != value:
                        return False
                elif key == "has_key_points":
                    if not question_data.get("key_points"):
                        return False
                elif key == "has_structure":
                    if not question_data.get("ideal_structure"):
                        return False
                elif key == "requires_examples":
                    # Check if evaluation criteria mention examples
                    evaluation_criteria = question_data.get("evaluation_criteria", {})
                    has_example_criteria = False
                    for section_criteria in evaluation_criteria.values():
                        for criterion in section_criteria.keys():
                            if "example" in criterion.lower() or "specific" in criterion.lower():
                                has_example_criteria = True
                                break
                    if not has_example_criteria:
                        return False
            return True
        
        # Generic matching for other areas
        question_str = str(question_data).lower()
        return area.replace("_", " ") in question_str
    
    def get_user_stats(self, user_id):
        """Get comprehensive stats for a user"""
        if user_id not in self.users:
            return {"error": "User not found"}
        
        user_data = self.users[user_id]
        
        # Calculate performance by question type
        question_type_performance = {}
        for question, data in user_data["completed_questions"].items():
            if question in self.questions_db:
                question_type = self.questions_db[question]["question_type"]
                if question_type not in question_type_performance:
                    question_type_performance[question_type] = {"total_score": 0, "count": 0}
                
                question_type_performance[question_type]["total_score"] += data["latest_score"]
                question_type_performance[question_type]["count"] += 1
        
        # Calculate average score by question type
        for question_type, data in question_type_performance.items():
            data["average_score"] = data["total_score"] / data["count"]
        
        # Get top strengths and weaknesses
        strengths = []
        weaknesses = []
        
        for question, data in user_data["completed_questions"].items():
            if question in self.questions_db:
                score = data["latest_score"]
                if score >= 8:  # High scores indicate strengths
                    question_type = self.questions_db[question]["question_type"]
                    strengths.append(question_type)
                elif score <= 5:  # Low scores indicate weaknesses
                    question_type = self.questions_db[question]["question_type"]
                    weaknesses.append(question_type)
        
        # Count occurrences
        strength_counts = {}
        for item in strengths:
            strength_counts[item] = strength_counts.get(item, 0) + 1
        
        weakness_counts = {}
        for item in weaknesses:
            weakness_counts[item] = weakness_counts.get(item, 0) + 1
        
        # Get top 3 strengths and weaknesses
        top_strengths = sorted(strength_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        top_weaknesses = sorted(weakness_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Format stats
        stats = {
            "user_id": user_id,
            "total_questions_attempted": user_data["total_questions_attempted"],
            "average_score": user_data["average_score"],
            "question_type_performance": question_type_performance,
            "top_strengths": [item[0] for item in top_strengths],
            "top_weaknesses": [item[0] for item in top_weaknesses],
            "top_improvement_areas": [area for area, _ in sorted(user_data["improvement_areas"].items(), key=lambda x: x[1], reverse=True)[:5]],
            "recommended_questions": self.get_recommended_questions(user_id)
        }
        
        return stats
    
    def add_question(self, question_text, question_data):
        """Add a new question to the database"""
        # Validate required fields
        required_fields = ["question_type", "ideal_answer", "key_points", "ideal_structure", 
                           "red_flags", "time_guideline", "evaluation_criteria", "section_weights"]
        
        for field in required_fields:
            if field not in question_data:
                return {"error": f"Missing required field: {field}"}
        
        # Validate question_type
        valid_types = ["behavioral_star", "technical", "strengths_weaknesses", "why_company", "general"]
        if question_data["question_type"] not in valid_types:
            return {"error": f"Invalid question_type. Must be one of: {', '.join(valid_types)}"}
        
        # Add question to database
        self.questions_db[question_text] = question_data
        
        return {"success": True, "message": "Question added successfully"}
    
    def bulk_import_questions(self, questions_data):
        """Import multiple questions at once"""
        results = {
            "success": [],
            "errors": []
        }
        
        for question_text, question_data in questions_data.items():
            result = self.add_question(question_text, question_data)
            if "error" in result:
                results["errors"].append({
                    "question": question_text,
                    "error": result["error"]
                })
            else:
                results["success"].append(question_text)
        
        return results
    
    def export_questions(self):
        """Export all questions in the database"""
        return self.questions_db
    
    def export_user_data(self, user_id=None):
        """Export user data for analysis"""
        if user_id:
            if user_id in self.users:
                return {user_id: self.users[user_id]}
            else:
                return {"error": "User not found"}
        else:
            return self.users
    
    def reset_user_progress(self, user_id):
        """Reset progress for a specific user"""
        if user_id in self.users:
            self.users[user_id] = {
                "completed_questions": {},
                "average_score": 0,
                "total_questions_attempted": 0,
                "improvement_areas": {}
            }
            return {"success": True, "message": f"Progress reset for user {user_id}"}
        else:
            return {"error": "User not found"}
    
    def get_detailed_question_analysis(self, question):
        """Get detailed analysis of a specific question performance across users"""
        if question not in self.questions_db:
            return {"error": "Question not found"}
        
        scores = []
        attempts = 0
        
        for user_id, user_data in self.users.items():
            if question in user_data["completed_questions"]:
                scores.append(user_data["completed_questions"][question]["latest_score"])
                attempts += user_data["completed_questions"][question]["attempts"]
        
        if not scores:
            return {
                "question": question,
                "attempts": 0,
                "message": "No data available for this question"
            }
        
        avg_score = sum(scores) / len(scores)
        
        analysis = {
            "question": question,
            "question_type": self.questions_db[question]["question_type"],
            "attempts": attempts,
            "unique_users": len(scores),
            "average_score": avg_score,
            "score_distribution": {
                "excellent (9-10)": sum(1 for s in scores if s >= 9),
                "good (7-8)": sum(1 for s in scores if 7 <= s < 9),
                "average (5-6)": sum(1 for s in scores if 5 <= s < 7),
                "below_average (3-4)": sum(1 for s in scores if 3 <= s < 5),
                "poor (1-2)": sum(1 for s in scores if s < 3)
            },
            "difficulty_rating": self._calculate_difficulty_rating(scores)
        }
        
        return analysis
    
    def _calculate_difficulty_rating(self, scores):
        """Calculate difficulty rating based on score distribution"""
        avg_score = sum(scores) / len(scores)
        
        if avg_score >= 8:
            return "Easy"
        elif avg_score >= 6:
            return "Moderate"
        elif avg_score >= 4:
            return "Difficult"
        else:
            return "Very Difficult"




evaluator = InterviewEvaluator()

# Dictionary to track user question indices (using email as key)
users = {}

@socketio.on('request_question')
def send_random_question(data):
    """Send a recommended question to the user based on their progress"""
    try:
        email = data['email']
        
        # Get recommended questions based on user progress
        recommended_questions = evaluator.get_recommended_questions(email)
        
        if not recommended_questions:
            socketio.emit('new_question', {
                'error': 'No questions available',
                'message': 'Please add questions to the database first'
            })
            return
        
        # Initialize or update user's question index
        if email not in users:
            users[email] = 0
        else:
            users[email] = (users[email] + 1) % len(recommended_questions)
        
        # Get the next recommended question
        question_index = users[email]
        question = recommended_questions[question_index]
        
        # Emit the question to the user
        socketio.emit('new_question', {
            'question': question,
            'question_type': evaluator.questions_db[question]['question_type']
        })
    
    except KeyError:
        print("Error: 'email' not found in data.")
        socketio.emit('new_question', {'error': 'Email is required'})
    except Exception as e:
        print(f"Unexpected error: {e}")
        socketio.emit('new_question', {'error': 'An error occurred while fetching a question'})

@socketio.on('send_transcript')
def handle_transcript(data):
    """Process user's answer and provide feedback"""
    try:
        question = data['hrQuestion']
        user_answer = data['transcript']
        email = data['email']
        
        # Evaluate the answer using InterviewEvaluator
        feedback_data = evaluator.evaluate_answer(question, user_answer, email)
        
        if 'error' in feedback_data:
            socketio.emit('transcript_feedback', {
                'error': feedback_data['error'],
                'feedback': feedback_data['feedback']
            })
            return
        
        # Send feedback to the user
        socketio.emit('transcript_feedback', {
            'score': feedback_data['score'],
            'feedback': feedback_data['feedback'],
            'strengths': feedback_data['strengths'],
            'areas_to_improve': feedback_data['areas_to_improve'],
            'specific_guidance': feedback_data['specific_guidance']
        })
        
        # Prepare data for database
        new_data = {
            'question': question,
            'user_answer': user_answer,
            'feedback': feedback_data['feedback'],
            'score': feedback_data['score'],
            'strengths': feedback_data['strengths'],
            'improvement_areas': feedback_data['areas_to_improve'],
            'detailed_analysis': feedback_data['detailed_analysis'],
            'timestamp': datetime.now()
        }
        
        # Update database
        user = user_collection.find_one({'email': email})
        
        if user and 'hrQuestions' in user:
            question_exists = any(q['question'] == question for q in user['hrQuestions'])
            if question_exists:
                # Update existing question entry
                result = user_collection.update_one(
                    {'email': email, 'hrQuestions.question': question},
                    {'$set': {
                        'hrQuestions.$.user_answer': user_answer,
                        'hrQuestions.$.feedback': feedback_data['feedback'],
                        'hrQuestions.$.score': feedback_data['score'],
                        'hrQuestions.$.strengths': feedback_data['strengths'],
                        'hrQuestions.$.improvement_areas': feedback_data['areas_to_improve'],
                        'hrQuestions.$.detailed_analysis': feedback_data['detailed_analysis'],
                        'hrQuestions.$.timestamp': datetime.now()
                    }}
                )
            else:
                # Add new question entry
                result = user_collection.update_one(
                    {'email': email},
                    {'$push': {'hrQuestions': new_data}}
                )
        else:
            # Initialize user with first question
            result = user_collection.update_one(
                {'email': email},
                {'$set': {'hrQuestions': [new_data]}},
                upsert=True
            )
        
        if result.modified_count or result.upserted_id:
            print(f"Updated user {email} record successfully.")
        else:
            print(f"Update for user {email} had no effect.")
            
    except Exception as e:
        print(f"Error processing transcript: {e}")
        socketio.emit('transcript_feedback', {
            'error': 'An error occurred while processing your answer'
        })

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/questions', methods=['GET'])
def get_questions():
    """API endpoint to get all questions"""
    questions_list = [{
        'id': i,
        'question': q,
        'type': evaluator.questions_db[q]['question_type']
    } for i, q in enumerate(evaluator.questions_db.keys())]
    return jsonify(questions_list)

@app.route('/api/user_progress/<email>', methods=['GET'])
def get_user_progress(email):
    """API endpoint to get user's progress"""
    try:
        stats = evaluator.get_user_stats(email)
        
        if 'error' in stats:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({
            'completed': stats['total_questions_attempted'],
            'total': len(evaluator.questions_db),
            'average_score': round(stats['average_score'], 1),
            'question_type_performance': stats['question_type_performance'],
            'top_strengths': stats['top_strengths'],
            'top_weaknesses': stats['top_weaknesses'],
            'top_improvement_areas': stats['top_improvement_areas'],
            'recommended_questions': stats['recommended_questions']
        })
    except Exception as e:
        print(f"Error fetching user progress: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/user_feedback/<email>', methods=['GET'])
def get_user_feedback(email):
    """API endpoint to get structured feedback for a user"""
    try:
        question = request.args.get('question', None)
        
        user = user_collection.find_one({'email': email})
        if not user or 'hrQuestions' not in user:
            return jsonify({'error': 'User not found or no feedback available'}), 404
        
        hr_questions = user.get('hrQuestions', [])
        
        if question:
            question_feedback = next((q for q in hr_questions if q.get('question') == question), None)
            if not question_feedback:
                return jsonify({'error': 'Question not found for this user'}), 404
            
            return jsonify({
                'question': question_feedback.get('question', ''),
                'user_answer': question_feedback.get('user_answer', ''),
                'score': question_feedback.get('score', 0),
                'feedback': question_feedback.get('feedback', ''),
                'strengths': question_feedback.get('strengths', []),
                'improvement_areas': question_feedback.get('improvement_areas', []),
                'detailed_analysis': question_feedback.get('detailed_analysis', {}),
                'timestamp': question_feedback.get('timestamp', '').isoformat()
            })
        
        # Return all feedback
        feedback_list = [{
            'question': q.get('question', ''),
            'user_answer': q.get('user_answer', ''),
            'score': q.get('score', 0),
            'feedback': q.get('feedback', ''),
            'strengths': q.get('strengths', []),
            'improvement_areas': q.get('improvement_areas', []),
            'detailed_analysis': q.get('detailed_analysis', {}),
            'timestamp': q.get('timestamp', '').isoformat()
        } for q in hr_questions]
        
        return jsonify({'feedback': feedback_list})
        
    except Exception as e:
        print(f"Error fetching user feedback: {e}")
        return jsonify({'error': 'Internal server error'}), 500
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
            corrections
        ) = ats.processing(file.filename, 1, role)

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
    socketio.run(app, host='0.0.0.0', port=5000,debug=True)
