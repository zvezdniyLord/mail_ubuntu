import sys
import email
import json
import requests
from email.header import decode_header

def parse_email(raw_email):
    msg = email.message_from_string(raw_email)

    subject_header = msg.get("Subject", "")
    subject, encoding = decode_header(sub_header)[0] if sub_header else ("", None)
    if isinstance(subject, bytes):
        subject = subject.decode(encoding or "utf-8")

    from_email = msg.get("From", "")

    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                body = part.get_payload(decode=True).decode("utf-8", errors="ignore")
                break
    else:
        body = msg.get_payload(decode=True).decode("utf-8", errors="ignore")

    return {
        "subject": subject.strip(),
        "body": body.strip(),
        "from_email": from_email.strip()
    }

raw_email = sys.stdin.read()
email_data = parse_email(raw_email)

API_URL = "http://localhost:3001/endpoint"
HEADERS = {"Content-Type": "application/json"}

try:
    response = requests.post(API_URL, json=email_data, headers=HEADERS)
    response.raise_for_status() 
except Exception as e:
    sys.stderr.write(f"API Error: {str(e)}\n")
    sys.exit(1)
