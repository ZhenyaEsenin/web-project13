// frontend/scripts/pages/transaction-view.js
import { 
    initializeData, 
    getTransactionById,
    getCategoryById,
    getProjectById,
    formatAmount,
    formatDate,
    getAllTransactions
} from '../lib/data.js';
import { renderTransactionDetails } from '../lib/render.js';

/**
 * Получение ID из URL
 */
function getIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('id');
    const id = raw ? parseInt(raw) : NaN;
    return Number.isFinite(id) ? id : null;
}

/**
 * Инициализация страницы
 */
function init() {
    // Инициализируем данные
    initializeData();
    
    // Находим контейнер для деталей
    const dl = document.querySelector('#transaction-details');
    if (!dl) {
        console.error('Не найден #transaction-details. Проверьте transaction-view.html');
        return;
    }
    
    // Получаем ID из URL
    const id = getIdFromQuery();
    if (id == null) {
        dl.innerHTML = '<dt>Ошибка</dt><dd>Не указан идентификатор транзакции (параметр id)</dd>';
        return;
    }
    
    // Получаем транзакцию
    const transaction = getTransactionById(id);
    if (!transaction) {
        dl.innerHTML = `<dt>Ошибка</dt><dd>Транзакция с id=${id} не найдена</dd>`;
        return;
    }
    
    // Рендерим детали
    renderTransactionDetails(dl, transaction);
    
    // Загружаем связанные транзакции (по той же категории)
    loadRelatedTransactions(transaction);
    
    // Обновляем заголовок страницы
    updatePageTitle(transaction);
}

/**
 * Загрузка связанных транзакций
 */
function loadRelatedTransactions(transaction) {
    const relatedContainer = document.querySelector('#related-transactions');
    if (!relatedContainer) return;
    
    const allTransactions = getAllTransactions();
    
    // Ищем другие транзакции по той же категории (кроме текущей)
    const related = allTransactions
        .filter(t => t.categoryId === transaction.categoryId && t.id !== transaction.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5); // максимум 5
    
    if (related.length === 0) {
        relatedContainer.innerHTML = '<p>Нет других расходов по этой категории</p>';
        return;
    }
    
    const ul = document.createElement('ul');
    related.forEach(t => {
        const li = document.createElement('li');
        const project = getProjectById(t.projectId);
        const date = formatDate(t.date);
        const amount = formatAmount(t.amount);
        
        li.innerHTML = `<a href="/pages/transactions-view.html?id=${t.id}">
            ${date} — ${project?.name || '—'}: ${amount} (${t.description || 'без описания'})
        </a>`;
        ul.appendChild(li);
    });
    
    relatedContainer.innerHTML = '<h3>Другие расходы по этой категории</h3>';
    relatedContainer.appendChild(ul);
}

/**
 * Обновление заголовка страницы
 */
function updatePageTitle(transaction) {
    document.title = `Учёт затрат — ${transaction.description || 'Просмотр расхода'}`;
    
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.textContent = `Расход: ${transaction.description || 'без описания'}`;
    }
}

// Запуск инициализации после загрузки DOM
document.addEventListener('DOMContentLoaded', init);
