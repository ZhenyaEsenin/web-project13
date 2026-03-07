
import { normalizeTransactionForm } from '../lib/form-normalize.js';
import { validateTransactionData } from '../lib/form-validate.js';
import {
    clearFormErrors,
    showFormErrors,
    showFormSuccess
} from '../lib/form-errors.js';

// frontend/scripts/lib/storage.js

const STORAGE_KEY = 'cost_tracker_v1';

/**
 * Загружает данные из localStorage
 */
export function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('Ошибка загрузки из localStorage:', e);
        return null;
    }
}

/**
 * Сохраняет данные в localStorage
 */
export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Ошибка сохранения в localStorage:', e);
        return false;
    }
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
 * Получить категорию по ID
 */
export function getCategoryById(id) {
    const data = loadData();
    return data?.categories.find(c => c.id === id) || null;
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
 * Получение ID транзакции из URL (для режима редактирования)
 */
function getIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('id');
    const id = raw ? parseInt(raw) : NaN;
    return Number.isFinite(id) ? id : null;
}

/**
 * Заполнение формы данными транзакции (для редактирования)
 */
function populateFormWithData(transaction) {
    const form = document.getElementById('transactions-form');
    if (!form) return;
    
    // Заполняем поля
    form.querySelector('[name="amount"]').value = transaction.amount || '';
    form.querySelector('[name="date"]').value = transaction.date || '';
    form.querySelector('[name="project_id"]').value = transaction.projectId || '';
    form.querySelector('[name="category_id"]').value = transaction.categoryId || '';
    form.querySelector('[name="description"]').value = transaction.description || '';
    form.querySelector('[name="comment"]').value = transaction.comment || '';
    form.querySelector('[name="payment_method"]').value = transaction.paymentMethod || '';
    
    if (transaction.isReimbursable) {
        form.querySelector('[name="is_reimbursable"]').checked = true;
    }
    
    // Меняем заголовок
    document.querySelector('h1').textContent = 'Редактирование расхода';
    document.title = 'Учёт затрат — Редактирование';
}

/**
 * Загрузка категорий и проектов в выпадающие списки
 */
async function loadSelectOptions() {
    const categories = getAllCategories();
    const projects = getAllProjects().filter(p => p.active);
    
    const categorySelect = document.querySelector('[name="category_id"]');
    const projectSelect = document.querySelector('[name="project_id"]');
    
    if (categorySelect) {
        // Оставляем первый option (пустой)
        categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
    }
    
    if (projectSelect) {
        projectSelect.innerHTML = '<option value="">Выберите проект</option>';
        projects.forEach(proj => {
            const option = document.createElement('option');
            option.value = proj.id;
            option.textContent = proj.name;
            projectSelect.appendChild(option);
        });
    }
}

/**
 * Инициализация страницы формы
 */
function init() {
    // Инициализируем данные
    initializeData();
    
    // Загружаем опции для select
    loadSelectOptions();
    
    const form = document.getElementById('transaction-form');
    if (!form) {
        console.error('Форма #transactions-form не найдена');
        return;
    }
    
    // Проверяем, не в режиме ли мы редактирования
    const editId = getIdFromQuery();
    if (editId) {
        const transaction = getTransactionById(editId);
        if (transaction) {
            populateFormWithData(transaction);
        } else {
            const messageEl = document.getElementById('form-message');
            if (messageEl) {
                messageEl.textContent = 'Транзакция не найдена. Будет создана новая.';
            }
        }
    }
    
    form.removeAttribute('action');

    // Обработчик отправки формы
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();

        
        // Очищаем предыдущие ошибки
        clearFormErrors(form);
        
        // 1. Нормализация данных
        const rawData = normalizeTransactionForm(form);
        console.log('Нормализованные данные:', rawData);
        
        // 2. Валидация
        const validationResult = validateTransactionData(rawData);
        console.log('Результат валидации:', validationResult);
        
        if (!validationResult.valid) {
            // 3. Отображение ошибок
            showFormErrors(form, validationResult.errors);
            
            // Прокрутка к первому полю с ошибкой
            const firstError = form.querySelector('.is-invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // 4. Сохранение данных
        try {
            let result;
            if (editId) {
                // Обновление существующей транзакции
                result = updateTransaction(editId, rawData);
                if (result) {
                    showFormSuccess('Расход успешно обновлён. Перенаправление...');
                }
            } else {
                // Создание новой транзакции
                result = createTransaction(rawData);
                if (result) {
                    showFormSuccess('Расход «${result.description}» успешно добавлен. Перенаправление...');
                }
            }
            
            if (result) {
                // Перенаправление на страницу списка через 1.5 секунды
                setTimeout(() => {
                    window.location.href = '/pages/transactions.html';
                }, 1500);
            } else {
                throw new Error('Не удалось сохранить данные');
            }
            
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            const messageEl = document.getElementById('form-message');
            if (messageEl) {
                messageEl.textContent = 'Произошла ошибка при сохранении. Пожалуйста, попробуйте снова.';
                messageEl.classList.add('form-message-error');
            }
        }
    });
    
    // Обработчик сброса формы
    form.addEventListener('reset', () => {
        clearFormErrors(form);
    });
    
    // Валидация в реальном времени (для улучшения UX)
    const amountInput = form.querySelector('[name="amount"]');
    if (amountInput) {
        amountInput.addEventListener('input', () => {
            const errorEl = document.getElementById('amount-error');
            if (errorEl && errorEl.textContent) {
                errorEl.textContent = '';
                amountInput.classList.remove('is-invalid');
            }
        });
    }
}

// Запуск после загрузки DOM
document.addEventListener('DOMContentLoaded', init);
