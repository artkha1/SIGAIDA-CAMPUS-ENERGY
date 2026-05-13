"""
LSTM model for PM2.5 prediction.
Trained on: pm10, carbon_monoxide, nitrogen_dioxide, sulphur_dioxide, ozone, carbon_dioxide
Sequence length: 24 hours
"""
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from pathlib import Path
import sys
from datetime import datetime

sys.path.append(str(Path(__file__).parent.parent))
from database import db

FEATURES = ['pm10', 'carbon_monoxide', 'nitrogen_dioxide', 'sulphur_dioxide', 'ozone', 'carbon_dioxide']
SEQUENCE_LENGTH = 24
MODEL_PATH = Path(__file__).parent.parent / "model1_pm25.pth"


class PM25LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=2, dropout=0.2):
        super(PM25LSTMModel, self).__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        return self.fc(lstm_out[:, -1, :])


def load_model():
    """Load the trained LSTM model from disk. Returns None if weights file not found."""
    if not MODEL_PATH.exists():
        print(f"Warning: model weights not found at {MODEL_PATH}")
        return None
    model = PM25LSTMModel(input_size=len(FEATURES))
    model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
    model.eval()
    return model


def predict_pm25_next_hour() -> dict:
    """
    Use the last 24 hours of data to predict the next hour's PM2.5 value.
    Returns a dict with predicted_pm25, confidence, and model name.
    """
    model = load_model()
    if model is None:
        return {"error": "Model weights not found", "predicted_pm25": None}

    try:
        # Pull the last 7 days of data (same as original script; ensures we have 24+ rows)
        historical = db.get_historical_air_quality(limit=200)
        if not historical or len(historical) < SEQUENCE_LENGTH:
            return {"error": "Not enough data to form a 24-hour sequence", "predicted_pm25": None}

        df = pd.DataFrame(historical)

        # Drop rows where any feature or target is null
        df_clean = df[FEATURES + ['pm2_5']].dropna()
        if len(df_clean) < SEQUENCE_LENGTH:
            return {"error": "Not enough clean data after removing nulls", "predicted_pm25": None}

        # Fit scalers on available data (same approach as training script)
        scaler_X = StandardScaler()
        scaler_y = StandardScaler()
        X_scaled = scaler_X.fit_transform(df_clean[FEATURES].values)
        scaler_y.fit_transform(df_clean['pm2_5'].values.reshape(-1, 1))

        # Take the most recent 24-hour window as input
        last_seq = X_scaled[-SEQUENCE_LENGTH:]                        # shape: (24, 6)
        last_seq_tensor = torch.FloatTensor(last_seq).unsqueeze(0)    # shape: (1, 24, 6)

        with torch.no_grad():
            pred_scaled = model(last_seq_tensor).numpy()

        pred_pm25 = float(scaler_y.inverse_transform(pred_scaled)[0][0])

        return {
            "predicted_pm25": round(pred_pm25, 2),
            "model_rmse": 1.3644,
            "model_r2": 0.8430,
            "predicted_at": datetime.now().isoformat(),
            "note": "Next-hour PM2.5 prediction from trained LSTM model"
        }

    except Exception as e:
        return {"error": str(e), "predicted_pm25": None}