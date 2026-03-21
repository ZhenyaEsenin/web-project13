// frontend/scripts/lib/views.js

import {
    renderTransactionsTable,
    renderTransactionDetails
} from './render.js';
import {
    getCategoryById,
    getProjectById,
    formatAmount,
    getAllCategories,
    getAllProjects
} from './data.js';
import { getFilteredTransactions, getTransactionById } from './state.js';

/**
 * Установка сообщения в приложении
 */
export function setAppMessage(message = '', type = 'info') {
    const messageEl = document.querySelector('#app-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `app-message app-message-${type}`;

        // Автоматически скрыть сообщение через 3 секунды
        if (message && type === 'success') {
            setTimeout(() => {
                messageEl.textContent = '';
                messageEl.className = 'app-message';
            }, 3000);
        }
    }
}

/**
 * Подсветка активного пункта навигации
 */
export function highlightActiveRoute(routeName) {
    document.querySelectorAll('[data-route-link]').forEach(link => {
        link.removeAttribute('aria-current');
    });

    const map = {
        dashboard: '#/dashboard',
        transactions: '#/transactions',
        create: '#/create',
        analytics: '#/analytics',
        categories: '#/categories',
        login: '#/login'
    };

    const href = map[routeName];
    if (!href) return;

    const activeLink = document.querySelector(`[data-route-link][href="${href}"]`);
    if (activeLink) {
        activeLink.setAttribute('aria-current', 'page');
    }
}

/**
 * Рендеринг главной страницы (дашборд)
 */
export function renderDashboardView(container, transactions, projects) {
    container.innerHTML = `
        <section aria-labelledby="dashboard-title">
            <h2 id="dashboard-title">Сводка за текущий месяц</h2>
            
            <div class="summary-cards">
                <article class="metric-card">
                    <h3>Всего расходов</h3>
                    <p><strong id="metric-total">—</strong></p>
                </article>
                <article class="metric-card">
                    <h3>Количество операций</h3>
                    <p><strong id="metric-count">—</strong></p>
                </article>
                <article class="metric-card">
                    <h3>Средний чек</h3>
                    <p><strong id="metric-average">—</strong></p>
                </article>
                <article class="metric-card">
                    <h3>Активные проекты</h3>
                    <p><strong id="metric-projects">—</strong></p>
                </article>
            </div>

            <div class="recent-transactions">
                <h3>Последние расходы</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Проект</th>
                                <th>Категория</th>
                                <th>Описание</th>
                                <th>Сумма</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="dashboard-transactions-tbody"></tbody>
                    </table>
                </div>
            </div>
        </section>
    `;

    // Вычисляем метрики
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const count = transactions.length;
    const average = count > 0 ? Math.round(total / count) : 0;
    const activeProjects = projects.filter(p => p.active).length;

    // Обновляем метрики
    container.querySelector('#metric-total').textContent = formatAmount(total);
    container.querySelector('#metric-count').textContent = count;
    container.querySelector('#metric-average').textContent = formatAmount(average);
    container.querySelector('#metric-projects').textContent = activeProjects;

    // Показываем последние 5 транзакций
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const tbody = container.querySelector('#dashboard-transactions-tbody');
    renderTransactionsTable(tbody, recentTransactions, true);
}

/**
 * Рендеринг страницы списка транзакций
 */
export function renderTransactionsView(container, transactions, categories, projects) {
    container.innerHTML = `
        <section aria-labelledby="transactions-title">
            <h2 id="transactions-title">Список расходов</h2>
            
            <div class="filters">
                <form id="filter-form" class="filter-form">
                    <div class="filter-row">
                        <div class="filter-group">
                            <label for="filter-period">Период</label>
                            <select id="filter-period" name="period">
                                <option value="month">Текущий месяц</option>
                                <option value="quarter">Квартал</option>
                                <option value="year">Год</option>
                                <option value="all">Все</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="filter-project">Проект</label>
                            <select id="filter-project" name="project_id">
                                <option value="">Все проекты</option>
                                ${projects.filter(p => p.active).map(p =>
        `<option value="${p.id}">${p.name}</option>`
    ).join('')}
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="filter-category">Категория</label>
                            <select id="filter-category" name="category_id">
                                <option value="">Все категории</option>
                                ${categories.map(c =>
        `<option value="${c.id}">${c.name}</option>`
    ).join('')}
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>&nbsp;</label>
                            <button type="submit" class="button-primary">Применить</button>
                        </div>
                    </div>
                </form>
            </div>

            <div class="action-bar">
                <a href="#/create" class="button-primary">➕ Добавить новый расход</a>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Проект</th>
                            <th>Категория</th>
                            <th>Описание</th>
                            <th>Сумма</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody id="transactions-tbody"></tbody>
                    <tfoot>
                        <tr>
                            <th colspan="4">Итого:</th>
                            <td><strong id="transactions-total">0 ₽</strong></td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    `;

    const tbody = container.querySelector('#transactions-tbody');
    renderTransactionsTable(tbody, transactions);

    // Обновляем итоговую сумму
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    container.querySelector('#transactions-total').textContent = formatAmount(total);
}

/**
 * Рендеринг страницы просмотра транзакции
 */
export function renderTransactionView(container, transaction) {
    if (!transaction) {
        container.innerHTML = `
            <section class="error-section">
                <h2>Транзакция не найдена</h2>
                <p>Запись с указанным идентификатором отсутствует.</p>
                <p><a href="#/transactions" class="button-secondary">Вернуться к списку</a></p>
            </section>
        `;
        return;
    }

    container.innerHTML = `
        <section aria-labelledby="transaction-title">
            <h2 id="transaction-title">Просмотр расхода</h2>
            
            <dl id="transaction-details" class="transaction-details"></dl>
            
            <div class="related-transactions">
                <h3>Другие расходы по этой категории</h3>
                <div id="related-transactions-container"></div>
            </div>
            
            <div class="button-group">
                <a href="#/transactions" class="button-secondary">← К списку</a>
                <a href="#/create?id=${transaction.id}" class="button-primary">✏️ Редактировать</a>
            </div>
        </section>
    `;

    const dl = container.querySelector('#transaction-details');
    renderTransactionDetails(dl, transaction);
}

/**
 * Рендеринг страницы создания транзакции
 */
export function renderCreateView(container, editId = null) {
    container.innerHTML = `
        <section aria-labelledby="create-title">
            <h2 id="create-title">${editId ? 'Редактирование' : 'Добавление'} расхода</h2>
            
            <div id="form-message" class="form-message" aria-live="polite"></div>
            
            <form id="transaction-form" class="transaction-form" novalidate>
                <fieldset>
                    <legend>Основная информация</legend>
                    
                    <div class="form-group">
                        <label for="amount">Сумма (₽) *</label>
                        <input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
                        <small class="field-error" id="amount-error"></small>
                    </div>
                    
                    <div class="form-group">
                        <label for="date">Дата операции *</label>
                        <input id="date" name="date" type="date" required />
                        <small class="field-error" id="date-error"></small>
                    </div>
                    
                    <div class="form-group">
                        <label for="project_id">Проект *</label>
                        <select id="project_id" name="project_id" required>
                            <option value="">Выберите проект</option>
                        </select>
                        <small class="field-error" id="project-error"></small>
                    </div>
                    
                    <div class="form-group">
                        <label for="category_id">Категория *</label>
                        <select id="category_id" name="category_id" required>
                            <option value="">Выберите категорию</option>
                        </select>
                        <small class="field-error" id="category-error"></small>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Описание *</label>
                        <input id="description" name="description" type="text" maxlength="200" required />
                        <small class="field-error" id="description-error"></small>
                    </div>
                </fieldset>
                
                <fieldset>
                    <legend>Дополнительная информация</legend>
                    
                    <div class="form-group">
                        <label for="comment">Комментарий</label>
                        <textarea id="comment" name="comment" rows="3" maxlength="1000"></textarea>
                        <small class="field-error" id="comment-error"></small>
                    </div>
                    
                    <div class="form-group">
                        <label for="payment_method">Способ оплаты</label>
                        <select id="payment_method" name="payment_method">
                            <option value="">Не указано</option>
                            <option value="card">Банковская карта</option>
                            <option value="cash">Наличные</option>
                            <option value="transfer">Перевод</option>
                        </select>
                    </div>
                    
                    <div class="checkbox-group">
                        <input type="checkbox" id="is_reimbursable" name="is_reimbursable" value="true" />
                        <label for="is_reimbursable">Компенсируемый расход</label>
                    </div>
                </fieldset>
                
                <div class="button-group">
                    <button type="submit" class="button-primary">💾 Сохранить</button>
                    <a href="#/transactions" class="button-secondary">❌ Отмена</a>
                </div>
            </form>
        </section>
    `;
}

/**
 * Рендеринг страницы аналитики
 */
export function renderAnalyticsView(container, transactions, categories) {
    container.innerHTML = `
        <section aria-labelledby="analytics-title">
            <h2 id="analytics-title">Аналитика расходов</h2>
            
            <div class="analytics-section">
                <h3>Расходы по категориям</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Категория</th>
                                <th>Сумма</th>
                                <th>%</th>
                                <th>Кол-во</th>
                            </tr>
                        </thead>
                        <tbody id="analytics-categories-tbody"></tbody>
                    </table>
                </div>
            </div>
        </section>
    `;

    // Группировка по категориям
    const categoryStats = new Map();
    categories.forEach(cat => {
        categoryStats.set(cat.id, { name: cat.name, total: 0, count: 0 });
    });

    transactions.forEach(t => {
        const stat = categoryStats.get(t.categoryId);
        if (stat) {
            stat.total += t.amount;
            stat.count++;
        }
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const tbody = container.querySelector('#analytics-categories-tbody');

    Array.from(categoryStats.values())
        .filter(stat => stat.count > 0)
        .sort((a, b) => b.total - a.total)
        .forEach(stat => {
            const percent = totalAmount > 0 ? ((stat.total / totalAmount) * 100).toFixed(1) : 0;
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${stat.name}</td>
                <td>${formatAmount(stat.total)}</td>
                <td>${percent}%</td>
                <td>${stat.count}</td>
            `;
        });
}

/**
 * Рендеринг страницы категорий
 */
export function renderCategoriesView(container, categories, transactions) {
    container.innerHTML = `
        <section aria-labelledby="categories-title">
            <h2 id="categories-title">Управление категориями</h2>
            
            <div class="action-bar">
                <a href="#/category-create" class="button-primary">➕ Добавить категорию</a>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Группа</th>
                            <th>Бюджет</th>
                            <th>Расход</th>
                            <th>Остаток</th>
                        </tr>
                    </thead>
                    <tbody id="categories-tbody"></tbody>
                </table>
            </div>
        </section>
    `;

    const tbody = container.querySelector('#categories-tbody');

    // Расходы по категориям за текущий месяц
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const monthTransactions = transactions.filter(t =>
        t.date >= firstDay && t.date <= lastDay
    );

    const categoryExpenses = new Map();
    monthTransactions.forEach(t => {
        const current = categoryExpenses.get(t.categoryId) || 0;
        categoryExpenses.set(t.categoryId, current + t.amount);
    });

    categories.forEach(cat => {
        const spent = categoryExpenses.get(cat.id) || 0;
        const remaining = (cat.budget || 0) - spent;
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${cat.id}</td>
            <td><span class="category-badge" style="background: ${cat.color}20; color: ${cat.color};">${cat.name}</span></td>
            <td>${cat.group || '—'}</td>
            <td>${cat.budget ? formatAmount(cat.budget) : '—'}</td>
            <td>${formatAmount(spent)}</td>
            <td style="color: ${remaining < 0 ? '#ef4444' : '#10b981'};">
                ${cat.budget ? formatAmount(remaining) : '—'}
            </td>
        `;
    });
}

/**
 * Рендеринг страницы входа
 */
export function renderLoginView(container) {
    container.innerHTML = `
        <section aria-labelledby="login-title">
            <h2 id="login-title">Вход в систему</h2>
            
            <form id="login-form" class="login-form">
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input id="email" name="email" type="email" required />
                </div>
                
                <div class="form-group">
                    <label for="password">Пароль</label>
                    <input id="password" name="password" type="password" required />
                </div>
                
                <button type="submit" class="button-primary">Войти</button>
            </form>
        </section>
    `;
}

/**
 * Рендеринг страницы "Не найдено"
 */
export function renderNotFoundView(container) {
    container.innerHTML = `
        <section class="error-section">
            <h2>Маршрут не найден</h2>
            <p>Запрошенный раздел отсутствует в приложении.</p>
            <p><a href="#/dashboard" class="button-primary">На главную</a></p>
        </section>
    `;
}

export function renderLoadingView(container, message = 'Загрузка данных...') {
    container.innerHTML = `
        <section>
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </section>
    `;
}

export function renderErrorView(container, message = 'Произошла ошибка при обращении к серверу.') {
    container.innerHTML = `
        <section>
            <h2>Ошибка взаимодействия</h2>
            <p>${message}</p>
            <p>Проверьте доступность сервера и корректность выполняемого запроса.</p>
            <button onclick="window.location.reload()" class="button-primary">Повторить</button>
            </section>
    `;
}