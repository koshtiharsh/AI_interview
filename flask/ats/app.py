from flask import Flask, render_template, request, redirect, url_for
import os
import ats
from flask_cors import CORS
# from your_processing_module import process_resume  # Import your processing function

app = Flask(__name__, static_url_path="/static")
CORS(app)  # Enable CORS for all domains

UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"pdf", "docx"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return redirect(request.url)
    file = request.files["file"]
    desc = request.form["jobDescription"]
    if file.filename == "":
        return redirect(request.url)
    print(file.filename)
    if file and allowed_file(file.filename):
        filename = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(filename)
        # Call your processing script here with the filename as an argument
        # process_resume(filename)
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
        ) = ats.processing(file.filename, 1, desc)
        struct = str(int(sc)) + "%"
        hsp = str(int(hs)) + "%"
        ssp = str(int(ss)) + "%"
        wcp = str(int(wc)) + "%"
        pdfFileName = file.filename

        print(word_count)
        return render_template(
            "result.html",
            final=int(score),
            struct=struct,
            hsp=hsp,
            ssp=ssp,
            wcp=wcp,
            sections=sections,
            match_hard=list(set(match_hard)),
            missing_hard=missing_hard,
            match_soft=list(set(match_soft)),
            missing_soft=missing_soft,
            word_count=word_count,
            pdfFileName=pdfFileName,
        )
    else:
        return "Invalid file format! Allowed formats: pdf, docx"


if __name__ == "__main__":
    app.run(debug=True)
