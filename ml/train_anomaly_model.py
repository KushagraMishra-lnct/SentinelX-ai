import os

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest


# Training examples:
# [total_events, unique_ips, warnings, failed_logins, most_active_ip_count]

training_data = np.array([
    [5, 3, 0, 0, 2],
    [6, 4, 1, 0, 2],
    [8, 5, 1, 0, 3],
    [10, 6, 1, 0, 3],
    [7, 4, 0, 0, 2],
    [9, 5, 1, 0, 3],
    [12, 7, 2, 0, 4],
    [6, 3, 0, 0, 2],
    [11, 6, 1, 0, 3],
    [8, 4, 0, 0, 2],
])


model = IsolationForest(
    contamination=0.15,
    random_state=42,
)


model.fit(training_data)


os.makedirs("ml/models", exist_ok=True)

model_path = "ml/models/anomaly_model.joblib"

joblib.dump(model, model_path)

print(f"[+] Model trained")
print(f"[+] Training samples: {len(training_data)}")
print(f"[+] Model saved to: {model_path}")

