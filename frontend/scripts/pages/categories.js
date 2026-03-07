// frontend/scripts/pages/categories.js
import { 
    initializeData, 
    getAllCategories,
    getAllTransactions,
    formatAmount 
} from '../lib/data.js';

/**
 * Инициализация страницы категорий
 */
function init() {
    initializeData();
    
    const tbody = document.querySelector('#categories-tbody');
    if (!tbody) return;
    
    renderCategories(tbody);
}

/**
 * Отображение категорий
 */
function renderCategories(tbody) {
    const categories = getAllCategories();
    const transactions = getAllTransactions();
    
    // Получаем расходы по категориям за текущий месяц
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthTransactions = transactions.filter(t => 
        t.date >= formatDateForInput(firstDay) && 
        t.date <= formatDateForInput(lastDay)
    );
    
    // Группируем по категориям
    const categoryExpenses = new Map();
    monthTransactions.forEach(t => {
        const current = categoryExpenses.get(t.categoryId) || 0;
        categoryExpenses.set(t.categoryId, current + t.amount);
    });
    
    const rows = categories.map(cat => {
        const tr = document.createElement('tr');
        const spent = categoryExpenses.get(cat.id) || 0;
        const remaining = (cat.budget || 0) - spent;
        
        tr.innerHTML = `
            <td>${cat.id}</td>
            <td><span class="category-badge" style="background: ${cat.color}20; color: ${cat.color}; border-color: ${cat.color};">${cat.name}</span></td>
            <td>${cat.group || '—'}</td>
            <td style="background: ${cat.color}20;">${cat.color}</td>
            <td>${cat.budget ? formatAmount(cat.budget) : '—'}</td>
            <td>${formatAmount(spent)}</td>
            <td style="color: ${remaining < 0 ? '#ef4444' : '#10b981'}; font-weight: 600;">
                ${cat.budget ? formatAmount(remaining) : '—'}
            </td>
            <td>
                <a href="/pages/category-form.html?id=${cat.id}" aria-label="Редактировать">✏️</a>
                <button type="button" aria-label="Удалить" data-action="delete" data-id="${cat.id}">🗑️</button>
            </td>
        `;
        
        return tr;
    });
    
    tbody.replaceChildren(...rows);
    
    // Добавляем обработчики удаления
    tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteCategory(id);
        });
    });
}

/**
 * Форматирование даты
 */
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Удаление категории
 */
function deleteCategory(id) {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
        return;
    }
    
    import('../lib/storage.js').then(({ loadData, saveData }) => {
        const data = loadData();
        if (data && data.categories) {
            data.categories = data.categories.filter(c => c.id !== id);
            saveData(data);
            window.location.reload();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
