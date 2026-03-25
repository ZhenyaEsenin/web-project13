<?php
// backend/public/index.php

// Простейшая конфигурация (без подключения внешнего файла)
$app_name = 'Учёт затрат проекта - Backend API';
$app_env = 'development';

// Устанавливаем заголовки для JSON ответов
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка preflight запросов (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Получаем путь запроса
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Простейшая маршрутизация
if ($path === '/' || $path === '') {
    echo json_encode([
        'status' => 'ok',
        'message' => 'Backend service is running',
        'app' => $app_name,
        'environment' => $app_env
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

if ($path === '/api/status') {
    echo json_encode([
        'status' => 'success',
        'data' => [
            'service' => 'backend',
            'timestamp' => date('Y-m-d H:i:s'),
            'php_version' => PHP_VERSION
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// Если маршрут не найден
http_response_code(404);
echo json_encode([
    'status' => 'error',
    'message' => 'Route not found',
    'path' => $path
], JSON_UNESCAPED_UNICODE);