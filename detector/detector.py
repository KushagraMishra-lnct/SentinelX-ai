from collections import Counter


def detect_brute_force(events, threshold=5):
    failed_attempts = Counter()

    for event in events:
        if (
            event["level"] == "WARNING"
            and "Login failed" in event["message"]
        ):
            failed_attempts[event["ip"]] += 1

    alerts = []

    for ip, attempts in failed_attempts.items():
        if attempts >= threshold:
            alerts.append({
                "type": "BRUTE_FORCE",
                "severity": "HIGH",
                "ip": ip,
                "attempts": attempts,
                "message": f"Possible brute-force attack from {ip}"
            })

    return alerts

