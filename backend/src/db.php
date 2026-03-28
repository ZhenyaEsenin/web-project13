<?php
// backend/src/db.php
declare(strict_types=1);

function getPDO(): PDO
{
    static $pdo = null;
    
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    
    $config = require __DIR__ . '/../config/app.php';
    $db = $config['db'];
    
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $db['host'],
        $db['port'],
        $db['dbname'],
        $db['charset']
    );
    
    $pdo = new PDO(
        $dsn,
        $db['user'],
        $db['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
    
    return $pdo;
}