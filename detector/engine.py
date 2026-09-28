from detector.log_parser import parse_log_file
from detector.detector import detect_brute_force
from detector.web_detector import detect_web_attack

from backend.alert_service import save_alert
from backend.event_service import save_event
from ml.feature_engineering import extract_features
from ml.predictor import predict_anomaly, anomaly_score

def run_auth_detection():
    events = parse_log_file("logs/auth.log")

    normalized_events = []

    for event in events:
        normalized = {
            "source": "auth.log",
            "level": event["level"],
            "ip": event["ip"],
            "message": event["message"],
        }

        normalized_events.append(normalized)
        save_event(normalized)

    alerts = detect_brute_force(events)

    return alerts, normalized_events


def run_web_detection():
    alerts = []
    normalized_events = []

    with open("logs/web.log", "r") as file:
        for line in file:
            parts = line.strip().split()

            if len(parts) < 2:
                continue

            level = parts[2] if len(parts) > 2 else "INFO"

            ip = None

            for part in parts:
                if part.startswith("ip="):
                    ip = part.split("=", 1)[1]

            message = " ".join(parts[3:])

            normalized_events.append({
                "source": "web.log",
                "level": level,
                "ip": ip,
                "message": message,
            })

            alerts.extend(detect_web_attack(line))

    return alerts, normalized_events


def run_detection():
    alerts = []

    auth_alerts, auth_events = run_auth_detection()
    web_alerts, web_events = run_web_detection()

    alerts.extend(auth_alerts)
    alerts.extend(web_alerts)

    events = auth_events + web_events

    features = extract_features(events)
    ml_prediction = predict_anomaly(features)
    ml_score = anomaly_score(features)

    for alert in alerts:
        alert["ml_prediction"] = ml_prediction
        alert["ml_score"] = ml_score

    return alerts, events

if __name__ == "__main__":
    alerts, events = run_detection()
    features = extract_features(events)
    ml_prediction = predict_anomaly(features)
    ml_score = anomaly_score(features)

    print(f"[+] ML prediction: {ml_prediction}")
    print(f"[+] ML anomaly score: {ml_score}/100")
    print(f"\n[+] Detection complete")
    print(f"[+] Events analyzed: {len(events)}")
    print(f"[+] Alerts generated: {len(alerts)}\n")

    for alert_data in alerts:
        saved_alert = save_alert(alert_data, events)

        print(
            f"[{saved_alert.severity}] "
            f"{saved_alert.alert_type} | "
            f"{saved_alert.ip} | "
            f"Risk {saved_alert.risk_score}/100 | "
            f"Anomaly {saved_alert.anomaly_score}/100 | "
            f"Saved as alert #{saved_alert.id}"
        )

