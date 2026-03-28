<?php
declare(strict_types=1);
class Router
{
 private array $routes = [];
 public function add(string $method, string $pattern, array $handler): void
 {
 $this->routes[] = [
 'method' => strtoupper($method),
 'pattern' => $pattern,
 'handler' => $handler,
 ];
 }
 public function dispatch(string $method, string $uri): void
 {
 $method = strtoupper($method);
 $path = trim(parse_url($uri, PHP_URL_PATH), '/');
 foreach ($this->routes as $route) {
 if ($route['method'] !== $method) {
 continue;
 }
 $pattern = '#^' . trim($route['pattern'], '/') . '$#';
 if (preg_match($pattern, $path, $matches)) {
 array_shift($matches);
 [$controllerClass, $action] = $route['handler'];
 if (!class_exists($controllerClass)) {
 View::json([
 'status' => 'error',
 'message' => 'Контроллер не найден.'
 ], 500);
 }
 $controller = new $controllerClass();
 if (!method_exists($controller, $action)) {
 View::json([
 'status' => 'error',
 'message' => 'Метод контроллера не найден.'
 ], 500);
 }
 call_user_func_array([$controller, $action], $matches);
 return;
 }
 }
 View::json([
 'status' => 'error',
 'message' => 'Route not found'
 ], 404);
 }
}