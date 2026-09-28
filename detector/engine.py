from detector.log_parser import parse_log_file
from detector.detector import detect_brute_force
from detector.web_detector import detect_web_attack

from backend.alert_service import save_alert
from backend.event_service import save_event


def run_auth_detection():
    events = parse_log_file("logs/auth.log")

    for event in events:
        save_event({
            "source": "auth.log",
            "level": event["level"],
            "ip": event["ip"],
            "message": event["message"],
        })

    return detect_brute_force(events)


def run_web_detection():
    alerts = []

    with open("logs/web.log", "r") as file:
        for line in file:
            alerts.extend(detect_web_attack(line))

    return alerts


def run_detection():
    alerts = []

    alerts.extend(run_auth_detection())
    alerts.extend(run_web_detection())

    return alerts


if __name__ == "__main__":
    alerts = run_detection()

    print(f"\n[+] Detection complete")
    print(f"[+] Alerts generated: {len(alerts)}\n")

    for alert_data in alerts:
        saved_alert = save_alert(alert_data)

        print(
            f"[{saved_alert.severity}] "
            f"{saved_alert.alert_type} | "
            f"{saved_alert.ip} | "
            f"Saved as alert #{saved_alert.id}"
        )
