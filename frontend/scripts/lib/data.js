// frontend/scripts/lib/data.js
import { loadData, saveData } from './storage.js';

// Структура данных проекта
export const projectStructure = {
    transactions: [],  // массив транзакций
    categories: [],    // массив категорий
    projects: [],      // массив проектов
    lastId: 0          // последний использованный ID
};

// Демонстрационные категории
const defaultCategories = [
    { id: 1, name: 'Питание', color: '#f97316', group: 'Прямые', budget: 10000 },
    { id: 2, name: 'Транспорт', color: '#3b82f6', group: 'Прямые', budget: 5000 },
    { id: 3, name: 'Хостинг', color: '#8b5cf6', group: 'Косвенные', budget: 6000 },
    { id: 4, name: 'Софт/Лицензии', color: '#ec4899', group: 'Косвенные', budget: 5000 },
    { id: 5, name: 'Оборудование', color: '#10b981', group: 'Прямые', budget: 20000 },
    { id: 6, name: 'Маркетинг', color: '#f59e0b', group: 'Косвенные', budget: 15000 },
    { id: 7, name: 'Аренда', color: '#6b7280', group: 'Админ', budget: 30000 }
];

// Демонстрационные проекты
const defaultProjects = [
    { id: 1, name: 'Веб-сайт', budget: 50000, active: true },
    { id: 2, name: 'Мобильное приложение', budget: 40000, active: true },
    { id: 3, name: 'Общие расходы', budget: 20000, active: true },
    { id: 4, name: 'Маркетинг', budget: 30000, active: false }
];

// Демонстрационные транзакции
const defaultTransactions = [
    {
        id: 1,
        amount: 1500,
        date: '2026-02-28',
        projectId: 1,
        categoryId: 3,
        description: 'Продление хостинга на март',
        comment: 'Тариф Бизнес',
        paymentMethod: 'card',
        isReimbursable: false
    },
    {
        id: 2,
        amount: 2400,
        date: '2026-02-27',
        projectId: 2,
        categoryId: 4,
        description: 'Лицензия Figma',
        comment: 'Годовая подписка',
        paymentMethod: 'card',
        isReimbursable: false
    },
    {
        id: 3,
        amount: 3200,
        date: '2026-02-26',
        projectId: 3,
        categoryId: 1,
        description: 'Обед с командой',
        comment: 'Ресторан',
        paymentMethod: 'card',
        isReimbursable: true
    },
    {
        id: 4,
        amount: 800,
        date: '2026-02-25',
        projectId: 1,
        categoryId: 6,
        description: 'Иконки для сайта',
        comment: 'Покупка на Envato',
        paymentMethod: 'transfer',
        isReimbursable: false
    },
    {
        id: 5,
        amount: 15000,
        date: '2026-02-24',
        projectId: 2,
        categoryId: 5,
        description: 'Телефон для тестирования',
        comment: 'Xiaomi Redmi',
        paymentMethod: 'card',
        isReimbursable: true
    }
];

/**
 * Инициализация данных
 */
export function initializeData() {
    let data = loadData();
    
    if (!data || !data.transactions || data.transactions.length === 0) {
        data = {
            transactions: defaultTransactions,
            categories: defaultCategories,
            projects: defaultProjects,
            lastId: defaultTransactions.length
        };
        saveData(data);
    }
    
    return data;
}

/**
 * Получить все транзакции
 */
export function getAllTransactions() {
    const data = loadData();
    return data?.transactions || [];
}

/**
 * Получить транзакцию по ID
 */
export function getTransactionById(id) {
    const data = loadData();
    return data?.transactions.find(t => t.id === id) || null;
}

/**
 * Создание новой транзакции
 */
export function createTransaction(transactionData) {
    console.log('createTransaction вызван с данными:', transactionData);
    
    const data = loadData();
    if (!data) {
        console.error('Нет данных');
        return null;
    }
    
    // Генерируем новый ID
    const nextId = data.transactions.length > 0 
        ? Math.max(...data.transactions.map(t => t.id)) + 1 
        : 1;
    
    console.log('Новый ID:', nextId);
    
    // Создаём новую транзакцию
    const newTransaction = {
        id: nextId,
        amount: parseFloat(transactionData.amount) || 0,
        date: transactionData.date || new Date().toISOString().split('T')[0],
        projectId: parseInt(transactionData.project_id) || null,
        categoryId: parseInt(transactionData.category_id) || null,
        description: transactionData.description || '',
        comment: transactionData.comment || '',
        paymentMethod: transactionData.payment_method || '',
        isReimbursable: transactionData.is_reimbursable === 'true' || transactionData.is_reimbursable === true
    };
    
    console.log('Новая транзакция:', newTransaction);
    
    // Проверяем обязательные поля
    if (!newTransaction.amount || !newTransaction.date || !newTransaction.projectId || !newTransaction.categoryId || !newTransaction.description) {
        console.error('Отсутствуют обязательные поля');
        return null;
    }
    
    data.transactions.push(newTransaction);
    data.lastId = nextId;
    
    if (saveData(data)) {
        console.log('Транзакция сохранена');
        return newTransaction;
    }
    
    return null;
}

/**
 * Обновление существующей транзакции
 */
export function updateTransaction(id, transactionData) {
    const data = loadData();
    if (!data) return null;
    
    const index = data.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    const updatedTransaction = {
        id: id,
        amount: parseFloat(transactionData.amount) || data.transactions[index].amount,
        date: transactionData.date || data.transactions[index].date,
        projectId: parseInt(transactionData.project_id) || data.transactions[index].projectId,
        categoryId: parseInt(transactionData.category_id) || data.transactions[index].categoryId,
        description: transactionData.description || data.transactions[index].description,
        comment: transactionData.comment !== undefined ? transactionData.comment : data.transactions[index].comment,
        paymentMethod: transactionData.payment_method || data.transactions[index].paymentMethod,
        isReimbursable: transactionData.is_reimbursable !== undefined 
            ? (transactionData.is_reimbursable === 'true' || transactionData.is_reimbursable === true)
            : data.transactions[index].isReimbursable
    };
    
    data.transactions[index] = updatedTransaction;
    
    if (saveData(data)) {
        return updatedTransaction;
    }
    
    return null;
}

/**
 * Удаление транзакции
 */
export function deleteTransaction(id) {
    const data = loadData();
    if (!data) return false;
    
    data.transactions = data.transactions.filter(t => t.id !== id);
    return saveData(data);
}

/**
 * Получить категорию по ID
 */
export function getCategoryById(id) {
    const data = loadData();
    return data?.categories.find(c => c.id === id) || null;
}

/**
 * Получить проект по ID
 */
export function getProjectById(id) {
    const data = loadData();
    return data?.projects.find(p => p.id === id) || null;
}

/**
 * Получить все категории
 */
export function getAllCategories() {
    const data = loadData();
    return data?.categories || [];
}

/**
 * Получить все проекты
 */
export function getAllProjects() {
    const data = loadData();
    return data?.projects || [];
}

/**
 * Форматировать сумму
 */
export function formatAmount(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Форматировать дату
 */
export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('ru-RU');
}

/**
 * Получить транзакцию для редактирования
 */
export function getTransactionForEdit(id) {
    const transaction = getTransactionById(id);
    if (!transaction) return null;
    
    return {
        amount: transaction.amount,
        date: transaction.date,
        project_id: transaction.projectId,
        category_id: transaction.categoryId,
        description: transaction.description,
        comment: transaction.comment || '',
        payment_method: transaction.paymentMethod || '',
        is_reimbursable: transaction.isReimbursable ? 'true' : ''
    };
}