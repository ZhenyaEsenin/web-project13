// frontend/scripts/lib/render.js
import { 
    getCategoryById, 
    getProjectById, 
    formatAmount, 
    formatDate
} from './data.js';

/**
 * Создаёт строку таблицы транзакций
 * @param {Object} transaction - данные транзакции
 * @param {boolean} forDashboard - для главной страницы (без кнопок редактирования)
 * @returns {HTMLTableRowElement} строка таблицы
 */
export function createTransactionRow(transaction, forDashboard = false) {
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
    
    // Категория с бейджем
    const tdCategory = document.createElement('td');
    const categorySpan = document.createElement('span');
    
    // Определяем класс для бейджа на основе названия категории
    let categoryClass = 'category-other';
    if (category) {
        const categoryName = category.name.toLowerCase();
        if (categoryName.includes('питание') || categoryName.includes('food')) {
            categoryClass = 'category-food';
        } else if (categoryName.includes('транспорт') || categoryName.includes('transport')) {
            categoryClass = 'category-transport';
        } else if (categoryName.includes('хостинг') || categoryName.includes('hosting')) {
            categoryClass = 'category-hosting';
        } else if (categoryName.includes('софт') || categoryName.includes('software') || categoryName.includes('лиценз')) {
            categoryClass = 'category-software';
        } else if (categoryName.includes('оборуд') || categoryName.includes('equipment')) {
            categoryClass = 'category-equipment';
        } else if (categoryName.includes('маркет') || categoryName.includes('marketing')) {
            categoryClass = 'category-marketing';
        }
    }
    
    categorySpan.className = `category-badge ${categoryClass}`;
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
    
    // Ссылка на просмотр через hash-маршрут (для SPA)
    const viewLink = document.createElement('a');
    viewLink.href = `#/transactions/${encodeURIComponent(transaction.id)}`;
    viewLink.textContent = '👁️';
    viewLink.setAttribute('aria-label', 'Просмотр');
    viewLink.dataset.action = 'view';
    viewLink.className = 'action-link';
    
    tdActions.appendChild(viewLink);
    
    // Для главной страницы не показываем кнопки редактирования и удаления
    if (!forDashboard) {
        // Разделитель
        tdActions.appendChild(document.createTextNode(' '));
        
        // Ссылка на редактирование
        const editLink = document.createElement('a');
        editLink.href = `#/create?id=${encodeURIComponent(transaction.id)}`;
        editLink.textContent = '✏️';
        editLink.setAttribute('aria-label', 'Редактировать');
        editLink.dataset.action = 'edit';
        editLink.className = 'action-link';
        
        // Разделитель
        tdActions.appendChild(document.createTextNode(' '));
        
        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.setAttribute('aria-label', 'Удалить');
        deleteBtn.dataset.action = 'delete';
        deleteBtn.type = 'button';
        deleteBtn.className = 'action-button';
        
        tdActions.appendChild(editLink);
        tdActions.appendChild(document.createTextNode(' '));
        tdActions.appendChild(deleteBtn);
    }
    
    tr.append(tdDate, tdProject, tdCategory, tdDesc, tdAmount, tdActions);
    
    return tr;
}

/**
 * Рендерит таблицу транзакций
 * @param {HTMLElement} tbodyEl - элемент tbody
 * @param {Array} transactions - массив транзакций
 * @param {boolean} forDashboard - для главной страницы
 */
export function renderTransactionsTable(tbodyEl, transactions, forDashboard = false) {
    if (!tbodyEl) {
        console.error('tbodyEl не найден');
        return;
    }
    
    const rows = transactions.map(t => createTransactionRow(t, forDashboard));
    tbodyEl.replaceChildren(...rows);
}

/**
 * Рендерит детали транзакции в виде dl
 * @param {HTMLElement} dlEl - элемент dl
 * @param {Object} transaction - данные транзакции
 */
export function renderTransactionDetails(dlEl, transaction) {
    if (!dlEl) {
        console.error('dlEl не найден');
        return;
    }
    
    if (!transaction) {
        dlEl.innerHTML = '<dt>Ошибка</dt><dd>Данные транзакции отсутствуют</dd>';
        return;
    }
    
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
 * Рендерит список связанных транзакций
 * @param {HTMLElement} containerEl - контейнер для списка
 * @param {Array} transactions - массив связанных транзакций
 */
export function renderRelatedTransactions(containerEl, transactions) {
    if (!containerEl) return;
    
    if (!transactions || transactions.length === 0) {
        containerEl.innerHTML = '<p>Нет связанных транзакций</p>';
        return;
    }
    
    const ul = document.createElement('ul');
    ul.className = 'related-list';
    
    transactions.slice(0, 5).forEach(t => {
        const project = getProjectById(t.projectId);
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#/transactions/${t.id}">
                ${formatDate(t.date)} — ${project?.name || '—'}: ${formatAmount(t.amount)}
                ${t.description ? ` (${t.description})` : ''}
            </a>
        `;
        ul.appendChild(li);
    });
    
    containerEl.innerHTML = '<h4>Другие расходы</h4>';
    containerEl.appendChild(ul);
}

/**
 * Создаёт опцию для select
 * @param {string|number} value - значение
 * @param {string} text - отображаемый текст
 * @param {boolean} selected - выбрана ли опция
 * @returns {HTMLOptionElement} элемент option
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
 * @param {HTMLSelectElement} selectEl - элемент select
 * @param {Array} categories - массив категорий
 * @param {number|null} selectedId - ID выбранной категории
 */
export function populateCategorySelect(selectEl, categories, selectedId = null) {
    if (!selectEl) return;
    
    selectEl.innerHTML = '';
    selectEl.appendChild(createOption('', 'Выберите категорию'));
    
    categories.forEach(cat => {
        selectEl.appendChild(createOption(cat.id, cat.name, cat.id === selectedId));
    });
}

/**
 * Заполняет select проектами
 * @param {HTMLSelectElement} selectEl - элемент select
 * @param {Array} projects - массив проектов
 * @param {number|null} selectedId - ID выбранного проекта
 */
export function populateProjectSelect(selectEl, projects, selectedId = null) {
    if (!selectEl) return;
    
    selectEl.innerHTML = '';
    selectEl.appendChild(createOption('', 'Выберите проект'));
    
    projects.filter(p => p.active).forEach(proj => {
        selectEl.appendChild(createOption(proj.id, proj.name, proj.id === selectedId));
    });
}

/**
 * Рендерит карточку метрики на главной
 * @param {string} title - заголовок метрики
 * @param {string|number} value - значение
 * @param {string} id - ID элемента для обновления
 * @returns {HTMLElement} элемент карточки
 */
export function createMetricCard(title, value, id) {
    const article = document.createElement('article');
    article.className = 'metric-card';
    
    const h3 = document.createElement('h3');
    h3.textContent = title;
    
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.id = id;
    strong.textContent = value;
    
    p.appendChild(strong);
    article.appendChild(h3);
    article.appendChild(p);
    
    return article;
}

/**
 * Рендерит блок фильтров
 * @param {Object} filters - текущие фильтры
 * @param {Array} projects - проекты для фильтра
 * @param {Array} categories - категории для фильтра
 * @returns {string} HTML строка с фильтрами
 */
export function renderFilters(filters = {}, projects = [], categories = []) {
    return `
        <div class="filters">
            <form id="filter-form" class="filter-form">
                <div class="filter-row">
                    <div class="filter-group">
                        <label for="filter-period">Период</label>
                        <select id="filter-period" name="period">
                            <option value="month" ${filters.period === 'month' ? 'selected' : ''}>Текущий месяц</option>
                            <option value="quarter" ${filters.period === 'quarter' ? 'selected' : ''}>Квартал</option>
                            <option value="year" ${filters.period === 'year' ? 'selected' : ''}>Год</option>
                            <option value="all" ${filters.period === 'all' ? 'selected' : ''}>Все</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="filter-project">Проект</label>
                        <select id="filter-project" name="project_id">
                            <option value="">Все проекты</option>
                            ${projects.filter(p => p.active).map(p => 
                                `<option value="${p.id}" ${filters.projectId == p.id ? 'selected' : ''}>${p.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="filter-category">Категория</label>
                        <select id="filter-category" name="category_id">
                            <option value="">Все категории</option>
                            ${categories.map(c => 
                                `<option value="${c.id}" ${filters.categoryId == c.id ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="date-from">С</label>
                        <input type="date" id="date-from" name="from" value="${filters.from || ''}">
                    </div>
                    
                    <div class="filter-group">
                        <label for="date-to">По</label>
                        <input type="date" id="date-to" name="to" value="${filters.to || ''}">
                    </div>
                    
                    <div class="filter-group">
                        <label>&nbsp;</label>
                        <button type="submit" class="button-primary">Применить</button>
                    </div>
                </div>
            </form>
        </div>
    `;
}

/**
 * Рендерит пагинацию
 * @param {number} currentPage - текущая страница
 * @param {number} totalPages - всего страниц
 * @returns {string} HTML пагинации
 */
export function renderPagination(currentPage, totalPages) {
    if (totalPages <= 1) return '';
    
    let html = '<nav aria-label="Пагинация" class="pagination"><ul>';
    
    // Кнопка "Назад"
    html += `<li><a href="#" data-page="${currentPage - 1}" ${currentPage === 1 ? 'aria-disabled="true"' : ''}>← Назад</a></li>`;
    
    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        html += `<li><a href="#" data-page="${i}" ${i === currentPage ? 'aria-current="page"' : ''}>${i}</a></li>`;
    }
    
    // Кнопка "Вперёд"
    html += `<li><a href="#" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'aria-disabled="true"' : ''}>Вперёд →</a></li>`;
    
    html += '</ul></nav>';
    return html;
}

/**
 * Рендерит сообщение об ошибке
 * @param {string} message - текст ошибки
 * @returns {string} HTML сообщения
 */
export function renderErrorMessage(message) {
    return `<div class="error-message" role="alert">${message}</div>`;
}

/**
 * Рендерит сообщение об успехе
 * @param {string} message - текст сообщения
 * @returns {string} HTML сообщения
 */
export function renderSuccessMessage(message) {
    return `<div class="success-message" role="status">${message}</div>`;
}