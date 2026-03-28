<?php


return [
    'app_name' => 'Учёт затрат проекта - Backend API',
    'app_env' => 'development',
    'app_version' => '1.0.0',
    'db' => [
        'host' => getenv('DB_HOST') ?: 'db',
        'port' => getenv('DB_PORT') ?: 3306,
        'dbname' => getenv('DB_NAME') ?: 'appdb',
        'user' => getenv('DB_USER') ?: 'appuser',
        'password' => getenv('DB_PASSWORD') ?: 'apppass',
        'charset' => 'utf8mb4'
    ]
];