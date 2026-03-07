// frontend/scripts/pages/transactions.js
import {
    initializeData,
    getAllTransactions,
    getAllCategories,
    getAllProjects,
    getCategoryById,
    getProjectById
} from '../lib/data.js';
import { renderTransactionsTable } from '../lib/render.js';

// Состояние фильтров
let currentFilters = {
    period: 'month',
    from: '',
    to: '',
    projectId: '',
    categoryId: '',
    minSum: '',
    maxSum: '',
    search: ''
};

// Отфильтрованные транзакции
let filteredTransactions = [];

/**
 * Инициализация страницы
 */
function init() {
    // 1) Инициализируем данные
    initializeData();

    // 2) Находим контейнер таблицы
    const tbody = document.querySelector('#transactions-tbody');
    if (!tbody) {
        console.error('Не найден #transactions-tbody. Проверьте transactions.html');
        return;
    }

    // 3) Заполняем выпадающие списки фильтров
    populateFilterSelects();

    // 4) Устанавливаем значения по умолчанию для периода
    setDefaultPeriod();

    // 5) Загружаем и отображаем транзакции
    applyFilters();

    // 6) Навешиваем обработчики событий
    setupEventListeners(tbody);
}

/**
 * Заполнение select-элементов для фильтров
 */
function populateFilterSelects() {
    const categories = getAllCategories();
    const projects = getAllProjects().filter(p => p.active);

    // Категории
    const categorySelect = document.querySelector('#filter-category');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Все категории</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
    }

    // Проекты
    const projectSelect = document.querySelector('#filter-project');
    if (projectSelect) {
        projectSelect.innerHTML = '<option value="">Все проекты</option>';
        projects.forEach(proj => {
            const option = document.createElement('option');
            option.value = proj.id;
            option.textContent = proj.name;
            projectSelect.appendChild(option);
        });
    }
}

/**
 * Установка периода по умолчанию (текущий месяц)
 */
function setDefaultPeriod() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const fromInput = document.querySelector('#date-from');
    const toInput = document.querySelector('#date-to');

    if (fromInput) {
        fromInput.value = formatDateForInput(firstDay);
        currentFilters.from = fromInput.value;
    }

    if (toInput) {
        toInput.value = formatDateForInput(lastDay);
        currentFilters.to = toInput.value;
    }
}

/**
 * Форматирование даты для input type="date"
 */
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Настройка обработчиков событий
 */
function setupEventListeners(tbody) {
    // Форма фильтров
    const filterForm = document.querySelector('#filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateFiltersFromForm();
            applyFilters();
        });
        filterForm.addEventListener('reset', () => {
            // Сброс фильтров
            setTimeout(() => {
                updateFiltersFromForm();
                applyFilters();
            }, 0);
        });
    }

    // Быстрый период
    const periodSelect = document.querySelector('#period');
    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            const period = e.target.value;
            updateDateRangeByPeriod(period);
        });
    }

    // Делегирование событий для таблицы (удаление)
    tbody.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;

        // Обработка кнопки удаления
        if (target.dataset.action === 'delete') {
            const row = target.closest('tr');
            if (row && row.dataset.id) {
                const id = parseInt(row.dataset.id);
                deleteTransaction(id);
            }
        }
    });
}

/**
 * Обновление фильтров из формы
 */
function updateFiltersFromForm() {
    currentFilters = {
        period: document.querySelector('#period')?.value || 'month',
        from: document.querySelector('#date-from')?.value || '',
        to: document.querySelector('#date-to')?.value || '',
        projectId: document.querySelector('#filter-project')?.value || '',
        categoryId: document.querySelector('#filter-category')?.value || '',
        minSum: document.querySelector('#min-sum')?.value || '',
        maxSum: document.querySelector('#max-sum')?.value || '',
        search: document.querySelector('#search')?.value || ''
    };
}

/**
 * Обновление диапазона дат по выбранному периоду
 */
function updateDateRangeByPeriod(period) {
    const now = new Date();
    let fromDate, toDate;

    switch (period) {
        case 'today':
            fromDate = now;
            toDate = now;
            break;
        case 'week':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay() + 1);
            fromDate = startOfWeek;
            toDate = now;
            break;
        case 'month':
            fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
            toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            fromDate = new Date(now.getFullYear(), quarter * 3, 1);
            toDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
            break;
        case 'year':
            fromDate = new Date(now.getFullYear(), 0, 1);
            toDate = new Date(now.getFullYear(), 11, 31);
            break;
        case 'custom':
            // Оставляем текущие значения
            return;
        default:
            return;
    }
    const fromInput = document.querySelector('#date-from');
    const toInput = document.querySelector('#date-to');
    if (fromInput && fromDate) {
        fromInput.value = formatDateForInput(fromDate);
        currentFilters.from = fromInput.value;
    }
    if (toInput && toDate) {
        toInput.value = formatDateForInput(toDate);
        currentFilters.to = toInput.value;
    }
}

/**
 * Применение фильтров к транзакциям
 */
function applyFilters() {
    let transactions = getAllTransactions();

    // Фильтр по дате
    if (currentFilters.from) {
        transactions = transactions.filter(t => t.date >= currentFilters.from);
    }
    if (currentFilters.to) {
        transactions = transactions.filter(t => t.date <= currentFilters.to);
    }
    
    // Фильтр по проекту
    if (currentFilters.projectId) {
        transactions = transactions.filter(t => t.projectId == currentFilters.projectId);
    }
    
    // Фильтр по категории
    if (currentFilters.categoryId) {
        transactions = transactions.filter(t => t.categoryId == currentFilters.categoryId);
    }
    
    // Фильтр по минимальной сумме
    if (currentFilters.minSum) {
        transactions = transactions.filter(t => t.amount >= parseFloat(currentFilters.minSum));
    }
    
    // Фильтр по максимальной сумме
    if (currentFilters.maxSum) {
        transactions = transactions.filter(t => t.amount <= parseFloat(currentFilters.maxSum));
    }
    
    // Фильтр по поиску в описании
    if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        transactions = transactions.filter(t => 
            t.description?.toLowerCase().includes(searchLower) ||
            t.comment?.toLowerCase().includes(searchLower)
        );
    }

    // Сортировка по дате (сначала новые)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredTransactions = transactions;
    // Обновление таблицы
    const tbody = document.querySelector('#transactions-tbody');
    if (tbody) {
        renderTransactionsTable(tbody, transactions);
    }
    // Обновление итоговой суммы
    updateTotalAmount(transactions);
}

/**
 * Обновление итоговой суммы в подвале таблицы
 */
function updateTotalAmount(transactions) {
    const totalElement = document.querySelector('#total-amount');
    if (!totalElement) return;

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    totalElement.textContent = formatAmount(total);
}

/**
 * Форматирование суммы (дублируем, чтобы не импортировать лишнее)
 */
function formatAmount(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Удаление транзакции
 */
function deleteTransaction(id) {
    if (!confirm('Вы уверены, что хотите удалить этот расход?')) {
        return;
    }
    import('../lib/storage.js').then(({ loadData, saveData }) => {
        const data = loadData();
        if (data && data.transactions) {
            data.transactions = data.transactions.filter(t => t.id !== id);
            saveData(data);
            // Обновляем отображение
            applyFilters();
        }
    });
}

// Запуск инициализации после загрузки DOM
document.addEventListener('DOMContentLoaded', init);
