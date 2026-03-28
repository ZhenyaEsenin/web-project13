<?php
declare(strict_types=1);
require __DIR__ . '/../src/db.php';
require __DIR__ . '/../src/task-functions.php';
function jsonResponse(array $payload, int $statusCode = 200): void
{
 http_response_code($statusCode);
 header('Content-Type: application/json; charset=utf-8');
 echo json_encode($payload, JSON_UNESCAPED_UNICODE);
 exit;
}
function getJsonInput(): array
{
 $raw = file_get_contents('php://input');
 if ($raw === '' || $raw === false) {
 return [];
 }
 $data = json_decode($raw, true);
 if (json_last_error() !== JSON_ERROR_NONE) {
 jsonResponse([
 'status' => 'error',
 'message' => 'Некорректный JSON в теле запроса.'
 ], 400);
 }
 return $data;
}
$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
try {
 $pdo = getPDO();
 if ($path === '' && $method === 'GET') {
 jsonResponse([
 'status' => 'ok',
 'message' => 'Backend service is running'
 ]);
 }
 if ($path === 'api/status' && $method === 'GET') {
 jsonResponse([
 'status' => 'success',
 'data' => [
 'service' => 'backend',
 'database' => 'connected'
 ]
 ]);
 }
 if ($path === 'api/categories' && $method === 'GET') {
 jsonResponse([
 'status' => 'success',
 'data' => fetchAllCategories($pdo)
 ]);
 }
 if ($path === 'api/tasks' && $method === 'GET') {
 jsonResponse([
 'status' => 'success',
 'data' => fetchAllTasks($pdo)
 ]);
 }
 if (preg_match('#^api/tasks/(\d+)$#', $path, $matches) && $method === 'GET') {
 $id = (int)$matches[1];
 $task = fetchTaskById($pdo, $id);
 if (!$task) {
 jsonResponse([
 'status' => 'error',
 'message' => 'Запись не найдена.'
 ], 404);
 }
 jsonResponse([
 'status' => 'success',
 'data' => $task
 ]);
 }
 if ($path === 'api/tasks' && $method === 'POST') {
 $input = getJsonInput();
 $errors = validateTaskData($input);
 if ($errors) {
 jsonResponse([
 'status' => 'error',
 'message' => 'Ошибка валидации.',
 'errors' => $errors
 ], 422);
 }
 $taskData = normalizeTaskData($input);
 if ($taskData['category_id'] !== null && !categoryExists($pdo, $taskData['category_id'])) {
 jsonResponse([
 'status' => 'error',
 'message' => 'Указанная категория не существует.'
 ], 422);
 }
 $task = createTask($pdo, $taskData);
 jsonResponse([
 'status' => 'success',
 'message' => 'Запись успешно создана.',
 'data' => $task
 ], 201);
 }
 if (preg_match('#^api/tasks/(\d+)$#', $path, $matches) && $method === 'PUT') {
 $id = (int)$matches[1];
 $input = getJsonInput();
 $errors = validateTaskData($input);
 if ($errors) {
 jsonResponse([
 'status' => 'error',
 'message' => 'Ошибка валидации.',
 'errors' => $errors
 ], 422);
 }
 $taskData = normalizeTaskData($input);
 if ($taskData['category_id'] !== null && !categoryExists($pdo, $taskData['category_id'])) {
 jsonResponse([
 'status' => 'error',
 'message' => 'Указанная категория не существует.'
 ], 422);
 }
 $updatedTask = updateTask($pdo, $id, $taskData);
 if (!$updatedTask) {
 jsonResponse([
 'status' => 'error',
 'message' => 'Запись для обновления не найдена.'
 ], 404);
 }
 jsonResponse([
 'status' => 'success',
 'message' => 'Запись успешно обновлена.',
 'data' => $updatedTask
 ]);
 }
 if (preg_match('#^api/tasks/(\d+)$#', $path, $matches) && $method === 'DELETE') {
 $id = (int)$matches[1];
 $deleted = deleteTask($pdo, $id);
 if (!$deleted) {
 jsonResponse([
 'status' => 'error',
 'message' => 'Запись для удаления не найдена.'
 ], 404);
 }
 jsonResponse([
 'status' => 'success',
 'message' => 'Запись успешно удалена.'
 ]);
 }
 jsonResponse([
 'status' => 'error',
 'message' => 'Route not found'
 ], 404);
} catch (PDOException $e) {
 jsonResponse([
 'status' => 'error',
 'message' => 'Ошибка работы с базой данных.'
 ], 500);
} catch (Throwable $e) {
 jsonResponse([
 'status' => 'error',
 'message' => 'Внутренняя ошибка сервера.'
 ], 500);
}