# ai_service/app/main.py (top part only – replacing DayData/Predict models)

from typing import List, Optional
import joblib
import numpy as np
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .config import SERVICE_NAME, SEQ_LEN, FEATURE_NAMES, MODEL_PATH, SCALER_PATH
from .insomnia_model_def import InsomniaNet


class DayData(BaseModel):
    hr_mean: Optional[float] = None
    hr_min: Optional[float] = None
    hr_max: Optional[float] = None

    spo2_mean: Optional[float] = None
    spo2_min: Optional[float] = None
    spo2_max: Optional[float] = None

    sleep_hours: Optional[float] = None
    sleep_score: Optional[float] = None

    steps_total: Optional[float] = None
    exercise_minutes: Optional[float] = None

    bp_sys_mean: Optional[float] = None
    bp_dia_mean: Optional[float] = None

    stress_score: Optional[float] = None


class PredictRequest(BaseModel):
    person_id: str = Field(..., description="User ID from your backend")
    days: List[DayData] = Field(
        ..., description=f"Ordered list (oldest→newest) of {SEQ_LEN} daily features"
    )


class PredictResponse(BaseModel):
    person_id: str
    insomnia_risk: float
    message: str


device = torch.device("cpu")

n_features = len(FEATURE_NAMES)
model = InsomniaNet(n_features=n_features)
state = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state)
model.to(device)
model.eval()

scaler = joblib.load(SCALER_PATH)

app = FastAPI(title=SERVICE_NAME)


def request_to_tensor(req: PredictRequest) -> torch.Tensor:
    if len(req.days) != SEQ_LEN:
        raise HTTPException(
            status_code=400,
            detail=f"You must send exactly {SEQ_LEN} days, got {len(req.days)}",
        )

    seq = []
    for d in req.days:
        # same order as FEATURE_NAMES
        row = [getattr(d, name) for name in FEATURE_NAMES]
        seq.append(row)

    
    arr = np.array(seq, dtype=np.float32)

    arr = np.nan_to_num(arr, nan=0.0, posinf=0.0, neginf=0.0)
    arr_scaled = scaler.transform(arr)
    arr_scaled = np.expand_dims(arr_scaled, axis=0)  
    tensor = torch.from_numpy(arr_scaled).to(device)
    return tensor


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": SERVICE_NAME,
        "seq_len": SEQ_LEN,
        "n_features": len(FEATURE_NAMES),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    x = request_to_tensor(req)

    with torch.no_grad():
        logits = model(x)
        risk = float(torch.sigmoid(logits).item())
        risk = max(0.0, min(1.0, risk))

    return PredictResponse(
        person_id=req.person_id,
        insomnia_risk=risk,
        message="Insomnia risk computed successfully.",
    )

