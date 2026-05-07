from flask import Flask, jsonify, render_template
import traceback
import os
from services.data_loader import load_data
from services.analytics import get_dataset_summary
from services.model_service import evaluate_model

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


# =========================
# Dataset API
# =========================
@app.route("/dataset/summary", methods=["GET"])
def dataset_summary():
    try:
        df = load_data()
        return jsonify(get_dataset_summary(df))
    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Dataset error"}), 500


# =========================
# Model Evaluation
# =========================
@app.route("/model/evaluate", methods=["GET"])
def model_evaluate():
    try:
        df = load_data()
        return jsonify(evaluate_model(df))
    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Model error"}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

port = int(os.environ.get("PORT", 8000))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port)