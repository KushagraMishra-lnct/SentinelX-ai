from collections import Counter


def calculate_ip_anomaly_score(events, target_ip):
    """
    Calculate anomaly score for one specific IP.
    """

    ip_events = [
        event for event in events
        if event.get("ip") == target_ip
    ]

    if not ip_events:
        return 0

    event_count = len(ip_events)

    failed_count = sum(
        1
        for event in ip_events
        if "failed" in event.get("message", "").lower()
    )

    warning_count = sum(
        1
        for event in ip_events
        if event.get("level", "").upper() == "WARNING"
    )

    score = 0

    # Activity frequency
    if event_count >= 10:
        score += 40
    elif event_count >= 5:
        score += 25
    elif event_count >= 3:
        score += 10

    # Failed authentication attempts
    if failed_count >= 10:
        score += 50
    elif failed_count >= 5:
        score += 35
    elif failed_count >= 3:
        score += 20

    # Warning/suspicious activity
    if warning_count >= 5:
        score += 35
    elif warning_count >= 3:
        score += 20
    elif warning_count >= 2:
        score += 10

    return min(score, 100)


def get_anomaly_level(score):
    if score >= 80:
        return "CRITICAL"
    elif score >= 60:
        return "HIGH"
    elif score >= 30:
        return "MEDIUM"
    else:
        return "LOW"

