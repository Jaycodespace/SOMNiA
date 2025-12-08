# ai_service/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# How many days your sequence uses (match your training)
SEQ_LEN = int(os.getenv("SEQ_LEN", "21"))

# === DAILY FEATURES COMING FROM NODE BACKEND ===
# These MUST match the JSON that Node sends AND the columns used to train your model.
FEATURE_NAMES = [
    "hr_mean",
    "hr_min",
    "hr_max",
    "spo2_mean",
    "spo2_min",
    "spo2_max",
    "sleep_hours",
    "steps_total",
    "exercise_minutes",
    "bp_sys_mean",
    "bp_dia_mean",
    "stress_score",
    "sleep_score",
]

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")

MODEL_PATH = os.path.join(ARTIFACTS_DIR, "insomnia_cnn_lstm_model.pt")
SCALER_PATH = os.path.join(ARTIFACTS_DIR, "insomnia_scaler.pkl")

SERVICE_NAME = os.getenv("SERVICE_NAME", "SOMNiA AI")
