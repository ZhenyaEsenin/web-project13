<?php
declare(strict_types=1);
abstract class Controller
{
 protected function json(array $payload, int $statusCode = 200): void
 {
 View::json($payload, $statusCode);
 }
 protected function getJsonInput(): array
 {
 $raw = file_get_contents('php://input');
 if ($raw === '' || $raw === false) {
 return [];
 }
 $data = json_decode($raw, true);
 if (json_last_error() !== JSON_ERROR_NONE) {
 $this->json([
 'status' => 'error',
 'message' => 'Некорректный JSON в теле запроса.'
 ], 400);
 }
 return $data;
 }
}