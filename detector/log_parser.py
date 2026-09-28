import re


def parse_log_line(line):
    pattern = (
        r"(?P<timestamp>\S+ \S+) "
        r"(?P<level>\w+) "
        r"(?P<message>.*?) "
        r"user=(?P<user>\S+) "
        r"ip=(?P<ip>\S+)"
    )

    match = re.match(pattern, line.strip())

    if not match:
        return None

    return match.groupdict()


def parse_log_file(filepath):
    events = []

    with open(filepath, "r") as file:
        for line in file:
            event = parse_log_line(line)

            if event:
                events.append(event)

    return events

