def extract_skills(resume_text):
    skills_keywords = [
        "python", "javascript", "react", "node.js", "flask", "sql",
        "mongodb", "machine learning", "data analytics", "c++", "git",
        "powerbi", "tailwind css", "html", "css"
    ]

    # Extract matching skills from the resume
    extracted_skills = {skill for skill in skills_keywords if skill in resume_text}
    return list(extracted_skills)
