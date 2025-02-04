import os
import subprocess

# Параметры для настройки
POSTFIX_CONFIG = {
    "transport_maps": "hash:/etc/postfix/transport",
    "default_transport": "external_transport:",
    "transport_file": "/etc/postfix/transport",
    "master_cf": "/etc/postfix/master.cf",
    "main_cf": "/etc/postfix/main.cf",
    "transport_entry": "* external_transport:\n",
    "master_entry": (
        "external_transport unix - n n - - pipe\n"
        "  flags=F user=nobody argv=/usr/local/bin/send_to_api.sh\n"
    ),
    "api_script": "/usr/local/bin/send_to_api.sh",
    "api_script_content": """#!/bin/bash

email=$(cat)

subject=$(echo "$email" | grep -i "^Subject:" | sed 's/^Subject: //')
from_email=$(echo "$email" | grep -i "^From:" | sed 's/^From: //' | awk '{print $1}')
body=$(echo "$email" | sed -n '/^$/,$p' | tail -n +2)

curl -X POST http://localhost:3001/receive-email \\
     -H "Content-Type: application/json" \\
     -d "{\\"subject\\": \\"Re: test [thread_1737423675497_uzx0r1fsy]\\", \\"body\\": \\"$body\\", \\"from_email\\": \\"$from_email\\"}"
"""
}

def run_command(command, input_data=None):
    """Выполняет команду в терминале."""
    try:
        subprocess.run(
            command,
            shell=True,
            check=True,
            input=input_data,
            text=True
        )
    except subprocess.CalledProcessError as e:
        print(f"Ошибка при выполнении команды: {e}")
        exit(1)

def install_postfix():
    """Устанавливает Postfix, если он еще не установлен."""
    print("Проверка наличия Postfix...")
    if not os.path.exists("/etc/postfix/main.cf"):
        print("Postfix не найден. Установка Postfix...")
        # Отключаем интерактивный режим установки
        run_command("sudo DEBIAN_FRONTEND=noninteractive apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postfix")
    else:
        print("Postfix уже установлен.")

def configure_main_cf():
    """Настройка файла main.cf."""
    print("Настройка main.cf...")
    with open(POSTFIX_CONFIG["main_cf"], "a") as f:
        f.write(f"\ntransport_maps = {POSTFIX_CONFIG['transport_maps']}\n")
        f.write(f"default_transport = {POSTFIX_CONFIG['default_transport']}\n")

def create_transport_file():
    """Создание файла transport."""
    print("Создание файла transport...")
    with open(POSTFIX_CONFIG["transport_file"], "w") as f:
        f.write(POSTFIX_CONFIG["transport_entry"])

def create_master_cf_entry():
    """Добавление записи в master.cf."""
    print("Настройка master.cf...")
    with open(POSTFIX_CONFIG["master_cf"], "a") as f:
        f.write("\n" + POSTFIX_CONFIG["master_entry"])

def create_api_script():
    """Создание скрипта для отправки данных на API."""
    print("Создание скрипта send_to_api.sh...")
    with open(POSTFIX_CONFIG["api_script"], "w") as f:
        f.write(POSTFIX_CONFIG["api_script_content"])
    run_command(f"sudo chmod +x {POSTFIX_CONFIG['api_script']}")

def create_transport_hash():
    """Создание хэш-файла для transport_maps."""
    print("Создание хэш-файла для transport_maps...")
    run_command(f"sudo postmap {POSTFIX_CONFIG['transport_file']}")

def restart_postfix():
    """Перезапуск Postfix."""
    print("Перезапуск Postfix...")
    run_command("sudo systemctl restart postfix")

def main():
    # Шаг 1: Установка Postfix
    install_postfix()

    # Шаг 2: Настройка main.cf
    configure_main_cf()

    # Шаг 3: Создание файла transport
    create_transport_file()

    # Шаг 4: Добавление записи в master.cf
    create_master_cf_entry()

    # Шаг 5: Создание скрипта для отправки данных на API
    create_api_script()

    # Шаг 6: Создание хэш-файла для transport_maps
    create_transport_hash()

    # Шаг 7: Перезапуск Postfix
    restart_postfix()

    print("Настройка завершена! Postfix готов к работе.")

if __name__ == "__main__":
    main()
