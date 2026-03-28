<?php
// backend/public/test.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "PHP работает!<br>";

// ПРАВИЛЬНЫЙ ПУТЬ
require __DIR__ . '/../src/db.php';
echo "db.php загружен<br>";

// Проверим, что функция существует
if (function_exists('getPDO')) {
    echo "Функция getPDO существует<br>";
    
    try {
        $pdo = getPDO();
        echo "PDO получен<br>";
        
        $stmt = $pdo->query("SELECT * FROM tasks LIMIT 1");
        $tasks = $stmt->fetchAll();
        echo "Запрос выполнен. Найдено задач: " . count($tasks) . "<br>";
        
    } catch (Throwable $e) {
        echo "Ошибка: " . $e->getMessage() . "<br>";
        echo "Файл: " . $e->getFile() . "<br>";
        echo "Строка: " . $e->getLine() . "<br>";
    }
} else {
    echo "Функция getPDO НЕ существует!<br>";
    echo "Проверьте содержимое файла /app/src/db.php<br>";
}