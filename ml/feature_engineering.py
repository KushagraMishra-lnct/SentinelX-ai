from collections import Counter


def extract_features(events):
    """
    Convert SentinelX events into numerical ML features.
    """

    if not events:
        return [0, 0, 0, 0, 0]

    ips = [
        event.get("ip")
        for event in events
        if event.get("ip")
    ]

    messages = [
        event.get("message", "").lower()
        for event in events
    ]

    warnings = sum(
        1
        for event in events
        if event.get("level", "").upper() == "WARNING"
    )

    failed_logins = sum(
        1
        for message in messages
        if "failed" in message
    )

    unique_ips = len(set(ips))

    total_events = len(events)

    most_active_ip_count = max(
        Counter(ips).values(),
        default=0
    )

    return [
        total_events,
        unique_ips,
        warnings,
        failed_logins,
        most_active_ip_count,
    ]

