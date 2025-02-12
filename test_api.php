<?php
// Тестовые данные
$subject = "Test Subject";
$body = "Test Body";
$from_email = "test@example.com";

// Формирование данных для API
$api_data = [
    "subject" => $subject,
    "body" => $body,
    "from_email" => $from_email
];

// Отправка данных на API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://devsanya.ru/api/receive-email");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($api_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Вывод результата
echo "HTTP Code: $http_code\n";
echo "Response: $response\n";
?>
