from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import yt_dlp
import os
import threading
import uuid
import time

app = Flask(__name__)
CORS(app)

DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), "downloads")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

jobs = {}

def do_download(job_id, url, fmt):
    jobs[job_id]["status"] = "downloading"
    ydl_opts = {
        "outtmpl": os.path.join(DOWNLOAD_DIR, f"{job_id}_%(title)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "progress_hooks": [lambda d: progress_hook(job_id, d)],
    }
    if fmt == "audio":
        ydl_opts.update({"format": "bestaudio/best", "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}]})
    elif fmt == "720":
        ydl_opts["format"] = "bestvideo[height<=720]+bestaudio/best[height<=720]"
    elif fmt == "1080":
        ydl_opts["format"] = "bestvideo[height<=1080]+bestaudio/best[height<=1080]"
    else:
        ydl_opts["format"] = "bestvideo+bestaudio/best"
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            if fmt == "audio":
                filename = os.path.splitext(filename)[0] + ".mp3"
            jobs[job_id]["status"] = "done"
            jobs[job_id]["filename"] = filename
            jobs[job_id]["title"] = info.get("title", "video")
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)

def progress_hook(job_id, d):
    if d["status"] == "downloading":
        total = d.get("total_bytes") or d.get("total_bytes_estimate", 0)
        downloaded = d.get("downloaded_bytes", 0)
        if total:
            jobs[job_id]["progress"] = int(downloaded / total * 100)
    elif d["status"] == "finished":
        jobs[job_id]["progress"] = 99

@app.route("/")
def index():
    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), "index.html")

@app.route("/info", methods=["POST"])
def get_info():
    url = request.json.get("url", "").strip()
    if not url:
        return jsonify({"error": "URL requerida"}), 400
    try:
        with yt_dlp.YoutubeDL({"quiet": True, "no_warnings": True}) as ydl:
            info = ydl.extract_info(url, download=False)
            return jsonify({"title": info.get("title"), "thumbnail": info.get("thumbnail"), "duration": info.get("duration"), "uploader": info.get("uploader"), "view_count": info.get("view_count")})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/download", methods=["POST"])
def start_download():
    data = request.json
    url = data.get("url", "").strip()
    fmt = data.get("format", "best")
    if not url:
        return jsonify({"error": "URL requerida"}), 400
    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = {"status": "queued", "progress": 0}
    threading.Thread(target=do_download, args=(job_id, url, fmt), daemon=True).start()
    return jsonify({"job_id": job_id})

@app.route("/status/<job_id>")
def status(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job no encontrado"}), 404
    return jsonify(job)

@app.route("/file/<job_id>")
def serve_file(job_id):
    job = jobs.get(job_id)
    if not job or job.get("status") != "done":
        return jsonify({"error": "Archivo no disponible"}), 404
    filepath = job["filename"]
    if not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado en disco"}), 404
    return send_file(filepath, as_attachment=True)

def cleanup():
    while True:
        time.sleep(3600)
        now = time.time()
        for f in os.listdir(DOWNLOAD_DIR):
            fp = os.path.join(DOWNLOAD_DIR, f)
            if os.path.isfile(fp) and now - os.path.getmtime(fp) > 3600:
                os.remove(fp)

threading.Thread(target=cleanup, daemon=True).start()

if __name__ == "__main__":
    print("Servidor corriendo en http://localhost:5000")
    app.run(debug=False, port=5000)
