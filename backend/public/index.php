<?php
declare(strict_types=1);
require __DIR__ . '/../src/Core/Database.php';
require __DIR__ . '/../src/Core/View.php';
require __DIR__ . '/../src/Core/Controller.php';
require __DIR__ . '/../src/Core/Router.php';
require __DIR__ . '/../src/Models/CategoryModel.php';
require __DIR__ . '/../src/Models/TaskModel.php';
require __DIR__ . '/../src/Controllers/TaskController.php';
$router = new Router();
$router->add('GET', '', [TaskController::class, 'status']);
$router->add('GET', 'api/status', [TaskController::class, 'status']);
$router->add('GET', 'api/categories', [TaskController::class, 'categories']);
$router->add('GET', 'api/tasks', [TaskController::class, 'index']);
$router->add('GET', 'api/tasks/(\d+)', [TaskController::class, 'show']);
$router->add('POST', 'api/tasks', [TaskController::class, 'store']);
$router->add('PUT', 'api/tasks/(\d+)', [TaskController::class, 'update']);
$router->add('DELETE', 'api/tasks/(\d+)', [TaskController::class, 'destroy']);
try {
 $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (PDOException $e) {
 View::json([
 'status' => 'error',
 'message' => 'Ошибка работы с базой данных.'
 ], 500);
} catch (Throwable $e) {
 View::json([
 'status' => 'error',
 'message' => 'Внутренняя ошибка сервера.'
 ], 500);
}