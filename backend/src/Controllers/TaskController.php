<?php
declare(strict_types=1);
class TaskController extends Controller
{
 private TaskModel $taskModel;
 private CategoryModel $categoryModel;
 public function __construct()
 {
 $this->taskModel = new TaskModel();
 $this->categoryModel = new CategoryModel();
 }
 public function status(): void
 {
 $this->json([
 'status' => 'success',
 'data' => [
 'service' => 'backend',
 'database' => 'connected'
 ]
 ]);
 }
 public function categories(): void
 {
 $this->json([
 'status' => 'success',
 'data' => $this->categoryModel->getAll()
 ]);
 }
 public function index(): void
 {
 $this->json([
 'status' => 'success',
 'data' => $this->taskModel->getAll()
 ]);
 }
 public function show(string $id): void
 {
    $id = (int) $id;
 $task = $this->taskModel->getById($id);
 if (!$task) {
 $this->json([
 'status' => 'error',
 'message' => 'Запись не найдена.'
 ], 404);
 }
 $this->json([
 'status' => 'success',
 'data' => $task
 ]);
 }
 public function store(): void
 {
 $input = $this->getJsonInput();
 $errors = $this->taskModel->validate($input);
 if ($errors) {
 $this->json([
 'status' => 'error',
 'message' => 'Ошибка валидации.',
 'errors' => $errors
 ], 422);
 }
 $taskData = $this->taskModel->normalize($input);
 if ($taskData['category_id'] !== null && !$this->categoryModel->exists($taskData['category_id'])) {
 $this->json([
 'status' => 'error',
 'message' => 'Указанная категория не существует.'
 ], 422);
 }
 $task = $this->taskModel->create($taskData);
 $this->json([
 'status' => 'success',
 'message' => 'Запись успешно создана.',
 'data' => $task
 ], 201);
 }
 public function update(string $id): void
 {
    $id = (int) $id;
 $input = $this->getJsonInput();
 $errors = $this->taskModel->validate($input);
 if ($errors) {
 $this->json([
 'status' => 'error',
 'message' => 'Ошибка валидации.',
 'errors' => $errors
 ], 422);
 }
 $taskData = $this->taskModel->normalize($input);
 if ($taskData['category_id'] !== null && !$this->categoryModel->exists($taskData['category_id'])) {
 $this->json([
 'status' => 'error',
 'message' => 'Указанная категория не существует.'
 ], 422);
 }
 $updatedTask = $this->taskModel->update($id, $taskData);
 if (!$updatedTask) {
 $this->json([
 'status' => 'error',
 'message' => 'Запись для обновления не найдена.'
 ], 404);
 }
 $this->json([
 'status' => 'success',
 'message' => 'Запись успешно обновлена.',
 'data' => $updatedTask
 ]);
 }
 public function destroy(string $id): void
 {
    $id = (int) $id;
 $deleted = $this->taskModel->delete($id);
 if (!$deleted) {
 $this->json([
 'status' => 'error',
 'message' => 'Запись для удаления не найдена.'
 ], 404);
 }
 $this->json([
 'status' => 'success',
 'message' => 'Запись успешно удалена.'
 ]);
 }
}