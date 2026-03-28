<?php
declare(strict_types=1);
class TaskModel
{
 private PDO $pdo;
 public function __construct()
 {
 $this->pdo = Database::getConnection();
 }
 public function getAll(): array
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
 $stmt = $this->pdo->query($sql);
 return $stmt->fetchAll();
 }
 public function getById(int $id): array|false
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
 $stmt = $this->pdo->prepare($sql);
 $stmt->execute(['id' => $id]);
 return $stmt->fetch();
 }
 public function validate(array $data): array
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
идентификатор.';
 }
 }
 return $errors;
 }
 public function normalize(array $data): array
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
 public function create(array $taskData): array
 {
 $sql = '
 INSERT INTO tasks (title, description, status, category_id)
 VALUES (:title, :description, :status, :category_id)
 ';
 $stmt = $this->pdo->prepare($sql);
 $stmt->bindValue(':title', $taskData['title']);
 $stmt->bindValue(':description', $taskData['description']);
 $stmt->bindValue(':status', $taskData['status']);
 if ($taskData['category_id'] === null) {
 $stmt->bindValue(':category_id', null, PDO::PARAM_NULL);
 } else {
 $stmt->bindValue(':category_id', $taskData['category_id'], PDO::PARAM_INT);
 }
 $stmt->execute();
 $id = (int)$this->pdo->lastInsertId();
 return $this->getById($id);
 }
 public function update(int $id, array $taskData): array|false
 {
 if (!$this->getById($id)) {
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
 $stmt = $this->pdo->prepare($sql);
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
 return $this->getById($id);
 }
 public function delete(int $id): bool
 {
 $stmt = $this->pdo->prepare('DELETE FROM tasks WHERE id = :id');
 $stmt->execute(['id' => $id]);
 return $stmt->rowCount() > 0;
 }
}