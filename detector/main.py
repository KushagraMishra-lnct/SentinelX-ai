from log_parser import parse_log_file
from detector import detect_brute_force


LOG_FILE = "logs/auth.log"


def main():
    events = parse_log_file(LOG_FILE)

    print(f"[+] Parsed {len(events)} security events")

    alerts = detect_brute_force(events)

    for alert in alerts:
        print(
            f"[ALERT] {alert['severity']} | "
            f"{alert['type']} | "
            f"{alert['ip']} | "
            f"{alert['message']}"
        )


if __name__ == "__main__":
    main()

