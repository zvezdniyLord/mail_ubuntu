<?php

class my_custom_api extends rcube_plugin
{
    public $task = 'mail';

    public function init()
    {
        $this->add_hook('message_before_send', [$this, 'handle_message_before_send']);
    }

    public function handle_message_before_send($args)
    {
        // Получаем объект письма
        $message = $args['message'];

        // Извлекаем необходимые данные
        $subject = $message->get_header('subject');
        $from_email = $message->get_header('from');
        $body = $this->get_message_body($message);

        // Формируем данные для API
        $api_data = [
            "subject"    => $subject,
            "body"       => $body,
            "from_email" => $from_email,
            // Дополнительные данные при необходимости:
            "to"         => $message->get_header('to'),
            "cc"         => $message->get_header('cc'),
            "bcc"        => $message->get_header('bcc'),
        ];

        // Отправляем данные на API
        $this->send_to_api($api_data);

        return $args;
    }

    private function get_message_body($message)
    {
        // Пытаемся получить текстовую версию письма
        $body = $message->get_text_body();

        // Если текстовой версии нет, используем HTML
        if (empty($body)) {
            $body = $message->get_html_body();
        }

        return $body ?: '';
    }

    private function send_to_api($api_data)
    {
        $api_url = rcmail::get_instance()->config->get('my_custom_api_url');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $api_url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($api_data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);

        // Для асинхронной отправки (если не требуется ждать ответа)
        curl_setopt($ch, CURLOPT_TIMEOUT, 1);
        curl_setopt($ch, CURLOPT_NOSIGNAL, 1);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Логирование (опционально)
        if ($http_code != 200) {
            rcube::write_log('errors', "API request failed. HTTP Code: $http_code Response: $response");
        }
    }
}
