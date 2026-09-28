SEVERITY_SCORES = {
    "INFO": 10,
    "WARNING": 30,
    "HIGH": 70,
    "CRITICAL": 95,
}


ATTACK_SCORES = {
    "BRUTE_FORCE": 70,
    "SQL_INJECTION": 90,
    "XSS": 75,
    "COMMAND_INJECTION": 95,
    "PATH_TRAVERSAL": 85,
}


def calculate_risk(event):
    """
    Calculate a 0-100 risk score for a security event.
    """

    score = 0

    severity = event.get("severity", "INFO")
    alert_type = event.get("type", "")

    # Base severity score
    score += SEVERITY_SCORES.get(severity, 10)

    # Attack-specific score
    score = max(
        score,
        ATTACK_SCORES.get(alert_type, 0)
    )

    # Repeated failed logins increase risk
    if event.get("failed_attempts", 0) >= 5:
        score += 15

    # Cap score at 100
    score = min(score, 100)

    if score >= 90:
        level = "CRITICAL"
    elif score >= 70:
        level = "HIGH"
    elif score >= 40:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "score": score,
        "risk_level": level,
    }
