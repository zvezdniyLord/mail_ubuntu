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
        // Получаем объект письма (это экземпляр Mail_mime)
        $message = $args['message'];

        // Получаем заголовки письма
        $headers = $message->headers(); // Возвращает массив заголовков

        // Извлекаем нужные заголовки
        $subject = $headers['Subject'] ?? 'No Subject';
        $from = $headers['From'] ?? 'Unknown Sender';

        // Получаем тело письма
        $body = $message->get(); // Получаем всё тело письма (включая текстовую и HTML-части)

        // Формируем данные для API
        $api_data = [
            'subject' => $subject,
            'from' => $from,
            'body' => $body,
        ];

        // Отправляем данные на API
        $this->send_to_api($api_data);

        return $args;
    }

    private function send_to_api($data)
    {
        $api_url = rcmail::get_instance()->config->get('my_custom_api_url');

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
            rcube::write_log('errors', "API request failed. HTTP Code: $http_code Response: $response");
        }
    }
}
