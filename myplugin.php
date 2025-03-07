<?php
class my_custom_api extends rcube_plugin
{
    public $task = 'mail';

    public function init()
    {
        // Регистрируем хук для перехвата отправки письма
        $this->add_hook('message_before_send', [$this, 'handle_message_before_send']);
    }

    public function handle_message_before_send($args)
    {
        // Получаем объект письма
        $message = $args['message'];

        // Извлекаем данные
        $headers = $message->getHeaders();
        $subject = $headers['subject'] ?? 'No Subject';
        $from_email = $headers['from'] ?? 'Unknown Sender';
        $body = $message->getBody() ?? 'No Body';

        // Формируем данные для API
        $api_data = [
            'subject' => $subject,
            'from_email' => $from_email,
            'body' => $body,
        ];

        // Отправляем данные на API
        $this->send_to_api($api_data);

        return $args;
    }

    private function send_to_api($data)
    {
        $api_url = 'http://devsanya.ru/api/receive-email';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $api_url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code != 200) {
            rcube::write_log('errors', "API request failed. HTTP Code: $http_code, Response: $response");
        }
    }
}
