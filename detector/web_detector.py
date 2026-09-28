import re


SUSPICIOUS_PATTERNS = {
    "XSS": [
        r"<script",
        r"javascript:",
        r"onerror=",
    ],
    "SQL_INJECTION": [
        r"'\s*OR\s*['\"]?1['\"]?\s*=\s*['\"]?1",
        r"UNION\s+SELECT",
        r"--\s*$",
    ],
}


def detect_web_attack(line):
    alerts = []

    for attack_type, patterns in SUSPICIOUS_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, line, re.IGNORECASE):
                ip_match = re.search(r"ip=(\S+)", line)

                alerts.append({
                    "type": attack_type,
                    "severity": "HIGH",
                    "ip": ip_match.group(1) if ip_match else "UNKNOWN",
                    "message": f"Possible {attack_type.replace('_', ' ')} detected"
                })

                break

    return alerts

