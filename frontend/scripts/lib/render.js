// frontend/scripts/lib/render.js
import { 
    getCategoryById, 
    getProjectById, 
    formatAmount, 
    formatDate,
    getAllCategories,
    getAllProjects
} from './data.js';

/**
 * Создаёт строку таблицы транзакций
 */
export function createTransactionRow(transaction) {
    const tr = document.createElement('tr');
    tr.dataset.id = String(transaction.id);
    
    const category = getCategoryById(transaction.categoryId);
    const project = getProjectById(transaction.projectId);
    
    // Дата
    const tdDate = document.createElement('td');
    tdDate.textContent = formatDate(transaction.date);
    
    // Проект
    const tdProject = document.createElement('td');
    tdProject.textContent = project?.name || '—';
    
    // Категория
    const tdCategory = document.createElement('td');
    const categorySpan = document.createElement('span');
    categorySpan.className = `category-badge category-${category?.name?.toLowerCase() || 'other'}`;
    categorySpan.textContent = category?.name || '—';
    tdCategory.appendChild(categorySpan);
    
    // Описание
    const tdDesc = document.createElement('td');
    tdDesc.textContent = transaction.description || '—';
    
    // Сумма
    const tdAmount = document.createElement('td');
    tdAmount.className = 'amount';
    tdAmount.textContent = formatAmount(transaction.amount);
    
    // Действия
    const tdActions = document.createElement('td');
    const viewLink = document.createElement('a');
    viewLink.href = `/pages/transactions-view.html?id=${encodeURIComponent(transaction.id)}`;
    viewLink.textContent = '👁️';
    viewLink.setAttribute('aria-label', 'Просмотр');
    viewLink.dataset.action = 'view';
    
    const editLink = document.createElement('a');
    editLink.href = `/pages/transactions-form.html?id=${encodeURIComponent(transaction.id)}`;
    editLink.textContent = '✏️';
    editLink.setAttribute('aria-label', 'Редактировать');
    editLink.dataset.action = 'edit';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', 'Удалить');
    deleteBtn.dataset.action = 'delete';
    deleteBtn.type = 'button';
    
    tdActions.append(viewLink, ' ', editLink, ' ', deleteBtn);
    
    tr.append(tdDate, tdProject, tdCategory, tdDesc, tdAmount, tdActions);
    
    return tr;
}

/**
 * Рендерит таблицу транзакций
 */
export function renderTransactionsTable(tbodyEl, transactions) {
    const rows = transactions.map(createTransactionRow);
    tbodyEl.replaceChildren(...rows);
}

/**
 * Рендерит детали транзакции
 */
export function renderTransactionDetails(dlEl, transaction) {
    const category = getCategoryById(transaction.categoryId);
    const project = getProjectById(transaction.projectId);
    
    const pairs = [
        ['ID', transaction.id],
        ['Дата', formatDate(transaction.date)],
        ['Проект', project?.name || '—'],
        ['Категория', category?.name || '—'],
        ['Сумма', formatAmount(transaction.amount)],
        ['Описание', transaction.description || '—'],
        ['Комментарий', transaction.comment || '—'],
        ['Способ оплаты', {
            'card': 'Банковская карта',
            'cash': 'Наличные',
            'transfer': 'Перевод'
        }[transaction.paymentMethod] || '—'],
        ['Компенсируемый', transaction.isReimbursable ? 'Да' : 'Нет']
    ];
    
    const nodes = [];
    for (const [key, value] of pairs) {
        const dt = document.createElement('dt');
        dt.textContent = key;
        
        const dd = document.createElement('dd');
        dd.textContent = value != null ? String(value) : '—';
        
        nodes.push(dt, dd);
    }
    
    dlEl.replaceChildren(...nodes);
}

/**
 * Создаёт опцию для select
 */
export function createOption(value, text, selected = false) {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = text;
    if (selected) {
        option.selected = true;
    }
    return option;
}

/**
 * Заполняет select категориями
 */
export function populateCategorySelect(selectEl, selectedId = null) {
    const categories = getAllCategories();
    selectEl.innerHTML = '';
    selectEl.appendChild(createOption('', 'Выберите категорию'));
    
    categories.forEach(cat => {
        selectEl.appendChild(createOption(cat.id, cat.name, cat.id === selectedId));
    });
}

/**
 * Заполняет select проектами
 */
export function populateProjectSelect(selectEl, selectedId = null) {
    const projects = getAllProjects().filter(p => p.active);
    selectEl.innerHTML = '';
    selectEl.appendChild(createOption('', 'Выберите проект'));

    projects.forEach(proj => {
        selectEl.appendChild(createOption(proj.id, proj.name, proj.id === selectedId));
    });
}
