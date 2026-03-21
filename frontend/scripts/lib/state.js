// frontend/scripts/lib/state.js

/**
 * Централизованное состояние приложения
 */
export const state = {
    route: {
        name: 'dashboard',
        params: {}
    },
    transactions: [],
    categories: [],
    projects: [],
    selectedTransactionId: null,
    filters: {
        period: 'month',
        from: '',
        to: '',
        projectId: '',
        categoryId: ''
    }
};

/**
 * Установка текущего маршрута
 */
export function setRoute(route) {
    state.route = route;
    state.selectedTransactionId = route.params?.id ?? null;
    console.log('Маршрут установлен:', route);
}

/**
 * Установка списка транзакций
 */
export function setTransactions(transactions) {
    state.transactions = Array.isArray(transactions) ? transactions : [];
    console.log('Транзакции обновлены:', state.transactions.length);
}

/**
 * Установка списка категорий
 */
export function setCategories(categories) {
    state.categories = Array.isArray(categories) ? categories : [];
}

/**
 * Установка списка проектов
 */
export function setProjects(projects) {
    state.projects = Array.isArray(projects) ? projects : [];
}

/**
 * Обновление фильтров
 */
export function setFilters(filters) {
    state.filters = { ...state.filters, ...filters };
}

/**
 * Получение отфильтрованных транзакций
 */
export function getFilteredTransactions() {
    let filtered = [...state.transactions];
    
    if (state.filters.from) {
        filtered = filtered.filter(t => t.date >= state.filters.from);
    }
    if (state.filters.to) {
        filtered = filtered.filter(t => t.date <= state.filters.to);
    }
    if (state.filters.projectId) {
        filtered = filtered.filter(t => t.projectId == state.filters.projectId);
    }
    if (state.filters.categoryId) {
        filtered = filtered.filter(t => t.categoryId == state.filters.categoryId);
    }
    
    return filtered;
}

/**
 * Получение транзакции по ID
 */
export function getTransactionById(id) {
    return state.transactions.find(t => t.id === id) || null;
}

/**
 * Получение категории по ID
 */
export function getCategoryById(id) {
    return state.categories.find(c => c.id === id) || null;
}

/**
 * Получение проекта по ID
 */
export function getProjectById(id) {
    return state.projects.find(p => p.id === id) || null;
}