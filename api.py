import subprocess

def send_to_api(subject, body, from_email):
    """
    Отправляет данные на API через curl.
    """
    api_url = "https://localhost:3001/receive-email"
    json_data = f'{{"subject": "{subject}", "body": "{body}", "from_email": "{from_email}"}}'

    # Формируем команду curl
    command = [
        "curl",
        "-X", "POST",
        api_url,
        "-H", "Content-Type: application/json",
        "-d", json_data
    ]

    try:
        # Выполняем команду
        result = subprocess.run(command, check=True, text=True, capture_output=True)
        print("Ответ от API:")
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Ошибка при отправке данных: {e}")
        print(e.stderr)

if __name__ == "__main__":
    # Пример данных
    subject = "Re: test [thread_1737423675497_uzx0r1fsy]"
    body = "шлем входящее"
    from_email = "support@example.com"

    # Отправляем данные на API
    send_to_api(subject, body, from_email)
