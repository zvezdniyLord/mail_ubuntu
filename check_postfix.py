import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Настройки SMTP (Postfix)
SMTP_SERVER = "localhost"
SMTP_PORT = 25

# Данные для письма
FROM_EMAIL = "support@example.com"
TO_EMAIL = "http://localhost:3001/receive-email"  # Это ваш API endpoint
SUBJECT = "Re: test [thread_1737423675497_uzx0r1fsy]"
BODY = "шлем входящее"

def create_email():
    # Создаем объект MIMEMultipart
    msg = MIMEMultipart()
    msg['From'] = FROM_EMAIL
    msg['To'] = TO_EMAIL
    msg['Subject'] = SUBJECT

    # Добавляем тело письма в формате JSON
    body_content = json.dumps({
        "subject": SUBJECT,
        "body": BODY,
        "from_email": FROM_EMAIL
    })
    msg.attach(MIMEText(body_content, 'plain'))

    return msg.as_string()

def send_email():
    try:
        # Подключаемся к SMTP-серверу
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            # Отправляем письмо
            email_content = create_email()
            server.sendmail(FROM_EMAIL, TO_EMAIL, email_content)
            print("Письмо успешно отправлено через Postfix!")
    except Exception as e:
        print(f"Ошибка при отправке письма: {e}")

if __name__ == "__main__":
    send_email()
