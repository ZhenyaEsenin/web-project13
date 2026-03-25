<?php


return [
    'app_name' => 'Учёт затрат проекта - Backend API',
    'app_env' => 'development',
    'app_version' => '1.0.0',
    'db' => [
        'host' => getenv('DB_HOST') ?: 'db',
        'port' => getenv('DB_PORT') ?: 3306,
        'dbname' => getenv('DB_NAME') ?: 'project_db',
        'user' => getenv('DB_USER') ?: 'project_user',
        'password' => getenv('DB_PASSWORD') ?: 'project_pass',
        'charset' => 'utf8mb4'
    ]
];