
from flask import Flask, request, jsonify, render_template, redirect
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, emit


import json


import os

from flask_cors import CORS
import ats



import requests
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, resources={r"/*": {"origins": "*"}})
# MongoDB setup
app.config["MONGO_URI"] = "mongodb+srv://harsh0801004:8857090609@harshkoshti.b208der.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=harshkoshti"
mongo = PyMongo(app)
user_collection = mongo.db.userData





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
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    role = request.form["role"]
    email = request.form["email"]
    jobType = request.form["jobType"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(filename)
        
        # Resume Processing from ATS
        (score, match_hard, missing_hard, match_soft, missing_soft, 
         word_count, sections, hs, ss, wc, sc, corrections, resume_text_format) = ats.processing(file.filename, 1, role, jobType)
        
        user_collection.find_one_and_update({'email': email}, {'$set': {"resume_text_format": resume_text_format}})
        
        # Generate new filename with "-1" appended
        base_name, extension = os.path.splitext(file.filename)
        pdfFileName = f"{base_name}-1{extension}"
        
        # Convert skills to a unique list
        unique_skills = list(set(match_hard))
        
        # Create initial response data
        ats_response = {
            "final": int(score),
            "struct": int(sc),
            "hsp": int(hs),
            "ssp": int(ss),
            "wcp": int(wc),
            "sections": sections,
            "match_hard": unique_skills,
            "missing_hard": missing_hard,
            "match_soft": list(set(match_soft)),
            "missing_soft": missing_soft,
            "word_count": word_count,
            "pdfFileName": pdfFileName,
            "corrections": corrections
        }
        
        # Send to LLM for optimization
        llm_optimized = send_to_llm(ats_response, role, jobType)
        
        # Update user record in MongoDB with optimized results
        user_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "resumeFile": pdfFileName,
                    "technicalSkills": llm_optimized.get("match_hard", unique_skills),
                    "resume_analysis_data": llm_optimized
                }
            }
        )
        
        return jsonify(llm_optimized), 200
    
    return jsonify({"error": "Invalid file format! Allowed formats: pdf, docx"}), 400

def send_to_llm(ats_response, role, jobType):
    """
    Send ATS results to LLM service for optimization and return the improved results.
    """
    try:
        # Create the optimization prompt that matches your LLM's expected format
        prompt = f"""
You are a resume analysis expert. I need you to optimize the following ATS (Applicant Tracking System) scan results.

The original ATS results are:
```json
{json.dumps(ats_response, indent=2)}
```

Job Role: {role}
Job Type: {jobType}

Please optimize the results following these rules:
1. If a skill appears in both match_hard and missing_hard lists, remove it from missing_hard
1. the imporatnat thing is if the supporting skills is already in matching then remove the missing some related skill for eg if node js is in matching and django in missing no need to keep it in missing because its supporting skill is already in match
2. And also cross check the skills with job role if something is not correct then you can skip them
2. If the job role is not technical (jobType is not "Tech"), don't consider hard skills
3. For non-technical roles:
   - Set hsp (hard skills percentage) to 0
   - Recalculate final score: final = (ssp * 0.4 + wcp * 0.3 + struct * 0.3)
4. For technical roles:
   - Remove duplicates but keep original formula: final = (hsp * 0.3 + ssp * 0.3 + wcp * 0.2 + struct * 0.2)
5. Ensure all percentages are integers
6. Please Edit the correction array because it is consider the Nouns also as mistake like ullas koshti which is noun some empty mistakes 
also some city name company name just keep skills because it should be in fix naming convention so please check it 

Return ONLY a valid JSON object with exactly the same structure as the input, with no additional text or explanation.
"""
        
        # Call your Node.js LLM service at port 2000
        response = requests.post(
            "http://localhost:2000/gemini-prompt",
            json={"prompt": prompt},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            response_data = response.json()
            
            # Extract the LLM's response text
            llm_response_text = response_data.get("response", "")
            
            print(llm_response_text)
            # Try to extract JSON from the response text
            try:
                # First try: see if the entire response is valid JSON
                optimized_data = json.loads(llm_response_text)
                return optimized_data
            except json.JSONDecodeError:
                # Second try: look for JSON block in markdown code blocks
                import re
                json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', llm_response_text)
                if json_match:
                    try:
                        return json.loads(json_match.group(1))
                    except:
                        pass
                
                # Third try: look for anything that looks like JSON
                json_pattern = re.search(r'(\{[\s\S]*\})', llm_response_text)
                if json_pattern:
                    try:
                        return json.loads(json_pattern.group(1))
                    except:
                        pass
            
            # If we've reached here, we couldn't extract valid JSON, so implement a fallback
            # Apply basic optimization rules directly
            return optimize_response_fallback(ats_response, role, jobType)
        else:
            # If LLM service returns an error, log it and use fallback
            print(f"LLM service error: {response.status_code}, {response.text}")
            return optimize_response_fallback(ats_response, role, jobType)
            
    except Exception as e:
        # If any error occurs, log it and use fallback
        print(f"Error communicating with LLM service: {str(e)}")
        return optimize_response_fallback(ats_response, role, jobType)

def optimize_response_fallback(ats_response, role, jobType):
    """
    Fallback function to optimize response if LLM service fails
    """
    # Create a copy to avoid modifying the original
    result = ats_response.copy()
    
    # Remove duplicates from missing_hard if they exist in match_hard
    if "match_hard" in result and "missing_hard" in result:
        result["missing_hard"] = [skill for skill in result["missing_hard"] 
                                 if skill not in result["match_hard"]]
    
    # Check if job is technical
    is_technical = jobType.lower() == "tech"
    
    if not is_technical:
        # For non-tech roles
        original_hsp = result.get("hsp", 0)
        result["hsp"] = 0
        
        # Recalculate final score
        ssp = result.get("ssp", 0)
        wcp = result.get("wcp", 0)
        struct = result.get("struct", 0)
        result["final"] = int((ssp * 0.4 + wcp * 0.3 + struct * 0.3))
    else:
        # For tech roles, recalculate with the tech formula
        hsp = result.get("hsp", 0)
        ssp = result.get("ssp", 0)
        wcp = result.get("wcp", 0)
        struct = result.get("struct", 0)
        result["final"] = int((hsp * 0.3 + ssp * 0.3 + wcp * 0.2 + struct * 0.2))
    
    # Ensure all values are integers
    for key in ["final", "struct", "hsp", "ssp", "wcp"]:
        if key in result:
            result[key] = int(result[key])
    
    return result

def allowed_file(filename):
    """
    Check if the uploaded file has an allowed extension.
    """
    ALLOWED_EXTENSIONS = {'pdf', 'docx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# ********************************************************** ats end    ******************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************
# **********************************************************************************************************************************







if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0', port=5000, debug=False)