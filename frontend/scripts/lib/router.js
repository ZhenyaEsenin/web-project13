// frontend/scripts/lib/router.js

/**
 * Нормализация hash-строки
 */
function normalizeHash() {
    const raw = window.location.hash || '#/dashboard';
    return raw.startsWith('#') ? raw.slice(1) : raw;
}

/**
 * Парсинг маршрута из hash
 */
export function parseRoute() {
    const hash = normalizeHash();
    console.log('Парсинг маршрута:', hash);

    // Главная страница
    if (hash === '/dashboard' || hash === '' || hash === '/') {
        return { name: 'dashboard', params: {} };
    }

    // Список транзакций
    if (hash === '/transactions') {
        return { name: 'transactions', params: {} };
    }

    // Просмотр конкретной транзакции
    if (hash.startsWith('/transactions/')) {
        const parts = hash.split('/');
        if (parts.length === 3) {
            const id = Number(parts[2]);
            if (Number.isFinite(id)) {
                return { name: 'transaction-view', params: { id } };
            }
        }
        return { name: 'not-found', params: {} };
    }

    // Создание новой транзакции
    if (hash === '/create') {
        return { name: 'create', params: {} };
    }

    // Аналитика
    if (hash === '/analytics') {
        return { name: 'analytics', params: {} };
    }

    // Категории
    if (hash === '/categories') {
        return { name: 'categories', params: {} };
    }

    // Вход
    if (hash === '/login') {
        return { name: 'login', params: {} };
    }

    // Маршрут не найден
    return { name: 'not-found', params: {} };
}

/**
 * Запуск маршрутизатора
 */
export function startRouter(onRouteChange) {
    const applyRoute = () => {
        const route = parseRoute();
        onRouteChange(route);
    };

    window.addEventListener('hashchange', applyRoute);
    applyRoute(); // Первоначальный запуск

    console.log('Маршрутизатор запущен');
}

/**
 * Переход по маршруту
 */
export function navigateTo(path) {
    window.location.hash = path;
}