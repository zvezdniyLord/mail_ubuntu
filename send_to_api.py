import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_via_postfix(subject, body, from_email, to_email):
    """
    Отправляет письмо через Postfix.
    """
    # Создаем объект письма
    message = MIMEMultipart()
    message["From"] = from_email
    message["To"] = to_email
    message["Subject"] = subject

    # Добавляем тело письма
    message.attach(MIMEText(body, "plain"))

    try:
        # Отправляем письмо через локальный SMTP-сервер Postfix
        with smtplib.SMTP("localhost") as server:
            server.sendmail(from_email, to_email, message.as_string())
        print("Письмо успешно отправлено через Postfix.")
    except Exception as e:
        print(f"Ошибка при отправке письма: {e}")

if __name__ == "__main__":
    # Пример данных
    subject = "Re: test [thread_1737423675497_uzx0r1fsy]"
    body = "шлем входящее"
    from_email = "support@example.com"
    to_email = "recipient@example.com"

    # Отправляем письмо
    send_email_via_postfix(subject, body, from_email, to_email)
