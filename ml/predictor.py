import joblib
import numpy as np


MODEL_PATH = "ml/models/anomaly_model.joblib"


def load_model():
    return joblib.load(MODEL_PATH)


def predict_anomaly(features):
    model = load_model()

    data = np.array(features).reshape(1, -1)

    prediction = model.predict(data)[0]

    # IsolationForest:
    #  1  = normal
    # -1  = anomaly

    if prediction == -1:
        return "ANOMALY"

    return "NORMAL"


def anomaly_score(features):
    model = load_model()

    data = np.array(features).reshape(1, -1)

    raw_score = model.decision_function(data)[0]

    # Convert IsolationForest score into an easier 0-100 scale.
    score = int(max(0, min(100, (0.5 - raw_score) * 100)))

    return score

