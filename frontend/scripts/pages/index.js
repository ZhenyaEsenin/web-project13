// frontend/scripts/pages/index.js
import { 
    initializeData, 
    getAllTransactions,
    getAllProjects,
    getCategoryById,
    getProjectById,
    formatAmount 
} from '../lib/data.js';
import { createTransactionRow } from '../lib/render.js';

/**
 * Инициализация главной страницы
 */
function init() {
    // Инициализируем данные
    initializeData();
    
    // Получаем все транзакции
    const transactions = getAllTransactions();
    const projects = getAllProjects();
    
    // Обновляем метрики
    updateMetrics(transactions, projects);
    
    // Отображаем последние 5 транзакций
    renderRecentTransactions(transactions);
}

/**
 * Обновление карточек с метриками
 */
function updateMetrics(transactions, projects) {
    const totalEl = document.querySelector('#metric-total');
    const countEl = document.querySelector('#metric-count');
    const averageEl = document.querySelector('#metric-average');
    const projectsEl = document.querySelector('#metric-projects');
    
    if (totalEl) {
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        totalEl.textContent = formatAmount(total);
    }
    
    if (countEl) {
        countEl.textContent = transactions.length;
    }
    
    if (averageEl) {
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        const avg = transactions.length > 0 ? Math.round(total / transactions.length) : 0;
        averageEl.textContent = formatAmount(avg);
    }
    
    if (projectsEl) {
        const activeProjects = projects.filter(p => p.active).length;
        projectsEl.textContent = activeProjects;
    }
}

/**
 * Отображение последних 5 транзакций
 */
function renderRecentTransactions(transactions) {
    const tbody = document.querySelector('#recent-transactions-tbody');
    if (!tbody) return;
    
    // Сортируем по дате (сначала новые) и берём первые 5
    const recent = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    // Создаём строки таблицы
    const rows = recent.map(transaction => {
        const tr = createTransactionRow(transaction);
        
        // Добавляем обработчик для кнопки удаления
        const deleteBtn = tr.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                deleteTransaction(transaction.id);
            });
        }
        
        return tr;
    });
    
    tbody.replaceChildren(...rows);
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
            
            // Обновляем страницу
            window.location.reload();
        }
    });
}

// Запуск инициализации после загрузки DOM
document.addEventListener('DOMContentLoaded', init);
