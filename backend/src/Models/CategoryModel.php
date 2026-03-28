<?php
declare(strict_types=1);
class CategoryModel
{
 private PDO $pdo;
 public function __construct()
 {
 $this->pdo = Database::getConnection();
 }
 public function getAll(): array
 {
 $stmt = $this->pdo->query(
 'SELECT id, name, created_at FROM categories ORDER BY name ASC'
 );
 return $stmt->fetchAll();
 }
 public function exists(int $id): bool
 {
 $stmt = $this->pdo->prepare(
 'SELECT id FROM categories WHERE id = :id LIMIT 1'
 );
 $stmt->execute(['id' => $id]);
 return (bool)$stmt->fetch();
 }
}