// frontend/scripts/pages/analytics.js
import { 
    initializeData, 
    getAllTransactions,
    getAllCategories,
    getAllProjects,
    getCategoryById,
    getProjectById,
    formatAmount,
    formatDate
} from '../lib/data.js';

/**
 * Инициализация страницы аналитики
 */
function init() {
    // Инициализируем данные
    initializeData();
    
    // Получаем данные
    const transactions = getAllTransactions();
    const categories = getAllCategories();
    const projects = getAllProjects();
    
    // Устанавливаем период по умолчанию (текущий месяц)
    setDefaultPeriod();
    
    // Обработчик формы
    setupFormListener();
    
    // Загружаем аналитику за текущий месяц
    loadAnalytics();
}

/**
 * Установка периода по умолчанию (текущий месяц)
 */
function setDefaultPeriod() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const fromInput = document.querySelector('#analytics-from');
    const toInput = document.querySelector('#analytics-to');
    
    if (fromInput) {
        fromInput.value = formatDateForInput(firstDay);
    }
    
    if (toInput) {
        toInput.value = formatDateForInput(lastDay);
    }
}

/**
 * Форматирование даты для input
 */
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Настройка обработчика формы
 */
function setupFormListener() {
    const form = document.querySelector('#analytics-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            loadAnalytics();
        });
    }
    
    const periodSelect = document.querySelector('#analytics-period');
    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            const period = e.target.value;
            updateDateRangeByPeriod(period);
        });
    }
}

/**
 * Обновление диапазона дат по периоду
 */
function updateDateRangeByPeriod(period) {
    const now = new Date();
    let fromDate, toDate;
    
    switch (period) {
        case 'month':
            fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
            toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'prev-month':
            fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            toDate = new Date(now.getFullYear(), now.getMonth(), 0);
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
            return;
        default:
            return;
    }
    
    const fromInput = document.querySelector('#analytics-from');
    const toInput = document.querySelector('#analytics-to');
    
    if (fromInput && fromDate) {
        fromInput.value = formatDateForInput(fromDate);
    }
    
    if (toInput && toDate) {
        toInput.value = formatDateForInput(toDate);
    }
}

/**
 * Загрузка и отображение аналитики
 */
function loadAnalytics() {
    const from = document.querySelector('#analytics-from')?.value;
    const to = document.querySelector('#analytics-to')?.value;
    
    if (!from || !to) return;
    
    const transactions = getAllTransactions();
    const categories = getAllCategories();
    const projects = getAllProjects();
    
    // Фильтруем транзакции по дате
    const filtered = transactions.filter(t => 
        t.date >= from && t.date <= to
    );
    
    // Аналитика по категориям
    renderCategoryAnalytics(filtered, categories);
    
    // Аналитика по проектам
    renderProjectAnalytics(filtered, projects);
    
    // Динамика по дням
    renderDailyDynamics(filtered, from, to);
}

/**
 * Отображение аналитики по категориям
 */
function renderCategoryAnalytics(transactions, categories) {
    const tbody = document.querySelector('#analytics-categories-tbody');
    if (!tbody) return;
    
    // Группируем по категориям
    const categoryStats = new Map();
    
    // Инициализируем все категории
    categories.forEach(cat => {
        categoryStats.set(cat.id, {
            category: cat,
            total: 0,
            count: 0
        });
    });
    
    // Суммируем по транзакциям
    transactions.forEach(t => {
        const stat = categoryStats.get(t.categoryId);
        if (stat) {
            stat.total += t.amount;
            stat.count++;
        }
    });
    
    // Преобразуем в массив и сортируем по убыванию суммы
    const stats = Array.from(categoryStats.values())
        .filter(s => s.count > 0) // только категории с расходами
        .sort((a, b) => b.total - a.total);
    
    const totalAmount = stats.reduce((sum, s) => sum + s.total, 0);
    
    // Создаём строки таблицы
    const rows = stats.map(stat => {
        const tr = document.createElement('tr');
        const percent = totalAmount > 0 ? ((stat.total / totalAmount) * 100).toFixed(1) : 0;
        
        tr.innerHTML = `
            <th scope="row">${stat.category.name}</th>
            <td>${formatAmount(stat.total)}</td>
            <td>${percent}%</td>
            <td>${stat.count}</td>
        `;
        
        return tr;
    });
    
    // Добавляем итоговую строку
    if (stats.length > 0) {
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <th scope="row"><strong>Итого</strong></th>
            <td><strong>${formatAmount(totalAmount)}</strong></td>
            <td><strong>100%</strong></td>
            <td><strong>${transactions.length}</strong></td>
        `;
        rows.push(totalRow);
    } else {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" style="text-align: center;">Нет данных за выбранный период</td>';
        rows.push(emptyRow);
    }
    
    tbody.replaceChildren(...rows);
    
    // Обновляем информацию о периоде
    updatePeriodInfo(transactions.length, totalAmount);
}

/**
 * Отображение аналитики по проектам
 */
function renderProjectAnalytics(transactions, projects) {
    const tbody = document.querySelector('#analytics-projects-tbody');
    if (!tbody) return;
    
    // Группируем по проектам
    const projectStats = new Map();
    
    projects.forEach(proj => {
        projectStats.set(proj.id, {
            project: proj,
            total: 0,
            count: 0
        });
    });
    
    transactions.forEach(t => {
        const stat = projectStats.get(t.projectId);
        if (stat) {
            stat.total += t.amount;
            stat.count++;
        }
    });
    
    const stats = Array.from(projectStats.values())
        .filter(s => s.count > 0)
        .sort((a, b) => b.total - a.total);
    
    const rows = stats.map(stat => {
        const tr = document.createElement('tr');
        const remaining = (stat.project.budget || 0) - stat.total;
        
        tr.innerHTML = `
            <th scope="row">${stat.project.name}</th>
            <td>${formatAmount(stat.total)}</td>
            <td>${stat.count}</td>
            <td>${stat.project.budget ? formatAmount(stat.project.budget) : '—'}</td>
            <td>${stat.project.budget ? formatAmount(remaining) : '—'}</td>
        `;
        
        return tr;
    });
    
    if (rows.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" style="text-align: center;">Нет данных за выбранный период</td>';
        rows.push(emptyRow);
    }
    
    tbody.replaceChildren(...rows);
}

/**
 * Отображение динамики по дням
 */
function renderDailyDynamics(transactions, from, to) {
    const tbody = document.querySelector('#analytics-dynamics-tbody');
    if (!tbody) return;
    
    // Группируем по дням
    const dailyTotals = new Map();
    
    transactions.forEach(t => {
        const current = dailyTotals.get(t.date) || 0;
        dailyTotals.set(t.date, current + t.amount);
    });
    
    // Получаем все даты в диапазоне
    const dates = getDatesInRange(new Date(from), new Date(to));
    
    const rows = dates.map(date => {
        const dateStr = formatDateForInput(date);
        const total = dailyTotals.get(dateStr) || 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(dateStr)}</td>
            <td>${total > 0 ? formatAmount(total) : '—'}</td>
            <td>${total > 0 ? '✓' : '✗'}</td>
        `;
        
        return tr;
    });
    
    tbody.replaceChildren(...rows);
}

/**
 * Получение всех дат в диапазоне
 */
function getDatesInRange(start, end) {
    const dates = [];
    const current = new Date(start);
    
    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    
    return dates;
}

/**
 * Обновление информации о периоде
 */
function updatePeriodInfo(count, total) {
    const infoEl = document.querySelector('#period-info');
    if (!infoEl) return;
    
    const from = document.querySelector('#analytics-from')?.value;
    const to = document.querySelector('#analytics-to')?.value;
    
    if (from && to) {
        infoEl.innerHTML = `<strong>Период:</strong> ${formatDate(from)} — ${formatDate(to)} | 
            <strong>Всего операций:</strong> ${count} | 
            <strong>Общая сумма:</strong> ${formatAmount(total)}`;
    }
}

// Запуск инициализации
document.addEventListener('DOMContentLoaded', init);
