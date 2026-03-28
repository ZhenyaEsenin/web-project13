<?php
declare(strict_types=1);
function fetchAllCategories(PDO $pdo): array
{
 $stmt = $pdo->query('SELECT id, name, created_at FROM categories ORDER BY name
ASC');
 return $stmt->fetchAll();
}
function fetchAllTasks(PDO $pdo): array
{
 $sql = '
 SELECT
 tasks.id,
 tasks.title,
 tasks.description,
 tasks.status,
 tasks.category_id,
 categories.name AS category_name,
 tasks.created_at,
 tasks.updated_at
 FROM tasks
 LEFT JOIN categories ON categories.id = tasks.category_id
 ORDER BY tasks.id DESC
 ';
 $stmt = $pdo->query($sql);
 return $stmt->fetchAll();
}
function fetchTaskById(PDO $pdo, int $id): array|false
{
 $sql = '
 SELECT
 tasks.id,
 tasks.title,
 tasks.description,
 tasks.status,
 tasks.category_id,
 categories.name AS category_name,
 tasks.created_at,
 tasks.updated_at
 FROM tasks
 LEFT JOIN categories ON categories.id = tasks.category_id
 WHERE tasks.id = :id
 LIMIT 1
 ';
 $stmt = $pdo->prepare($sql);
 $stmt->execute(['id' => $id]);
 return $stmt->fetch();
}
function categoryExists(PDO $pdo, int $categoryId): bool
{
 $stmt = $pdo->prepare('SELECT id FROM categories WHERE id = :id LIMIT 1');
 $stmt->execute(['id' => $categoryId]);
 return (bool) $stmt->fetch();
}
function validateTaskData(array $data): array
{
 $errors = [];
 $title = trim((string)($data['title'] ?? ''));
 $status = trim((string)($data['status'] ?? ''));
 if ($title === '') {
 $errors['title'] = 'Поле title является обязательным.';
 }
 $allowedStatuses = ['new', 'in_progress', 'done'];
 if ($status === '') {
 $errors['status'] = 'Поле status является обязательным.';
 } elseif (!in_array($status, $allowedStatuses, true)) {
 $errors['status'] = 'Недопустимое значение status.';
 }
 if (array_key_exists('category_id', $data) && $data['category_id'] !== null &&
$data['category_id'] !== '') {
 if (!is_numeric($data['category_id']) || (int)$data['category_id'] <= 0) {
 $errors['category_id'] = 'Поле category_id должно содержать положительный
целочисленный идентификатор.';
 }
 }
 return $errors;
}
function normalizeTaskData(array $data): array
{
 $categoryId = $data['category_id'] ?? null;
 if ($categoryId === '' || $categoryId === null) {
 $categoryId = null;
 } else {
 $categoryId = (int)$categoryId;
 }
 return [
 'title' => trim((string)($data['title'] ?? '')),
 'description' => trim((string)($data['description'] ?? '')),
 'status' => trim((string)($data['status'] ?? 'new')),
 'category_id' => $categoryId,
 ];
}
function createTask(PDO $pdo, array $taskData): array
{
 $sql = '
 INSERT INTO tasks (title, description, status, category_id)
 VALUES (:title, :description, :status, :category_id)
 ';
 $stmt = $pdo->prepare($sql);
 $stmt->bindValue(':title', $taskData['title']);
 $stmt->bindValue(':description', $taskData['description']);
 $stmt->bindValue(':status', $taskData['status']);
 if ($taskData['category_id'] === null) {
 $stmt->bindValue(':category_id', null, PDO::PARAM_NULL);
 } else {
 $stmt->bindValue(':category_id', $taskData['category_id'], PDO::PARAM_INT);
 }
 $stmt->execute();
 $id = (int)$pdo->lastInsertId();
 return fetchTaskById($pdo, $id);
}
function updateTask(PDO $pdo, int $id, array $taskData): array|false
{
 if (!fetchTaskById($pdo, $id)) {
 return false;
 }
 $sql = '
 UPDATE tasks
 SET
 title = :title,
 description = :description,
 status = :status,
 category_id = :category_id
 WHERE id = :id
 ';
 $stmt = $pdo->prepare($sql);
 $stmt->bindValue(':id', $id, PDO::PARAM_INT);
 $stmt->bindValue(':title', $taskData['title']);
 $stmt->bindValue(':description', $taskData['description']);
 $stmt->bindValue(':status', $taskData['status']);
 if ($taskData['category_id'] === null) {
 $stmt->bindValue(':category_id', null, PDO::PARAM_NULL);
 } else {
 $stmt->bindValue(':category_id', $taskData['category_id'], PDO::PARAM_INT);
 }
 $stmt->execute();
 return fetchTaskById($pdo, $id);
}
function deleteTask(PDO $pdo, int $id): bool
{
 $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = :id');
 $stmt->execute(['id' => $id]);
 return $stmt->rowCount() > 0;
}