class my_custom_api extends rcube_plugin
{
    public $task = 'mail';

    public function init()
    {
        // Логируем вызов init()
        file_put_contents('/tmp/plugin_debug.log', "[PLUGIN] INIT CALLED\n", FILE_APPEND);

        $this->add_hook('message_before_send', [$this, 'handle_message_before_send']);
    }

    public function handle_message_before_send($args)
    {
        // Логируем вызов хука
        file_put_contents('/tmp/plugin_debug.log', "[PLUGIN] HOOK message_before_send TRIGGERED\n", FILE_APPEND);

        $message = $args['message'];
        if (empty($message)) {
            file_put_contents('/tmp/plugin_debug.log', "[PLUGIN] ERROR: Message object is empty\n", FILE_APPEND);
            return $args;
        }

        $headers = $message->getHeaders();
        $subject = $headers['subject'] ?? 'No Subject';
        $from = $headers['from'] ?? 'Unknown Sender';
        $body = $message->getBody() ?? 'No Body';

        file_put_contents('/tmp/plugin_debug.log', "[PLUGIN] Data extracted - Subject: $subject, From: $from\n", FILE_APPEND);

        $api_data = [
            'subject' => $subject,
            'from' => $from,
            'body' => $body,
        ];

        $this->send_to_api($api_data);

        return $args;
    }

    private function send_to_api($data)
    {
        file_put_contents('/tmp/plugin_debug.log', "[PLUGIN] Sending data to API...\n", FILE_APPEND);

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
            file_put_contents('/tmp/plugin_debug.log', "[PLUGIN] API ERROR - HTTP Code: $http_code, Response: $response\n", FILE_APPEND);
        } else {
            file_put_contents('/tmp/plugin_debug.log', "[PLUGIN] API SUCCESS - HTTP Code: $http_code\n", FILE_APPEND);
        }
    }
}
