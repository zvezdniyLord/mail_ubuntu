<?php
class my_custom_api extends rcube_plugin
{
    public $task = 'mail';

    public function init()
    {
        error_log("[PLUGIN] INIT CALLED"); // Метка: init() вызван
        $this->add_hook('message_before_send', [$this, 'handle_message_before_send']);
    }

    public function handle_message_before_send($args)
    {
        error_log("[PLUGIN] HOOK message_before_send TRIGGERED"); // Метка: хук сработал

        $message = $args['message'];
        if (empty($message)) {
            error_log("[PLUGIN] ERROR: Message object is empty");
            return $args;
        }

        error_log("[PLUGIN] Extracting headers...");
        $headers = $message->getHeaders();
        $subject = $headers['subject'] ?? 'No Subject';
        $from = $headers['from'] ?? 'Unknown Sender';
        $body = $message->getBody() ?? 'No Body';

        error_log("[PLUGIN] Data extracted - Subject: $subject, From: $from");

        $api_data = [
            'subject' => $subject,
            'from' => $from,
            'body' => $body,
        ];

        error_log("[PLUGIN] Sending data to API...");
        $this->send_to_api($api_data);

        return $args;
    }

    private function send_to_api($data)
    {
        error_log("[PLUGIN] API URL: " . 'http://devsanya.ru/api/receive-email');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://devsanya.ru/api/receive-email");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code != 200) {
            error_log("[PLUGIN] API ERROR - HTTP Code: $http_code, Response: $response");
        } else {
            error_log("[PLUGIN] API SUCCESS - HTTP Code: $http_code");
        }
    }
}
