<?php
// Подключаем Roundcube
require_once '/var/www/test.domain.tld/program/include/iniset.php';

// Создаем тестовое письмо
$message = new rcube_message();
$message->headers = [
    'Subject' => 'Test Subject',
    'From' => 'sender@example.com',
    'To' => 'recipient@example.com'
];
$message->body = 'This is a test email body';

// Выводим содержимое объекта $message
var_dump($message);
?>
