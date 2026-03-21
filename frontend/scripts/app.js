// frontend/scripts/app.js

import { 
    initializeData, 
    getAllTransactions,
    getAllCategories,
    getAllProjects,
    createTransaction,
    getTransactionById,
    updateTransaction
} from './lib/data.js';
import { normalizeTransactionForm } from './lib/form-normalize.js';
import { validateTransactionData } from './lib/form-validate.js';
import { clearFormErrors, showFormErrors, showFormSuccess } from './lib/form-errors.js';

import { 
    state, 
    setRoute, 
    setTransactions, 
    setCategories, 
    setProjects,
    setFilters,
    getFilteredTransactions,
    getTransactionById as getTransactionByIdFromState
} from './lib/state.js';

import { startRouter, navigateTo } from './lib/router.js';

import {
    highlightActiveRoute,
    renderDashboardView,
    renderTransactionsView,
    renderTransactionView,
    renderCreateView,
    renderAnalyticsView,
    renderCategoriesView,
    renderLoginView,
    renderNotFoundView,
    setAppMessage
} from './lib/views.js';

/**
 * Получение контейнера для отображения
 */
function getViewContainer() {
    return document.querySelector('#app-view');
}

/**
 * Рендеринг текущего маршрута
 */
function renderCurrentRoute() {
    const container = getViewContainer();
    if (!container) {
        console.error('Контейнер #app-view не найден');
        return;
    }

    highlightActiveRoute(state.route.name);
    setAppMessage('');

    console.log('Рендеринг маршрута:', state.route.name, 'с параметрами:', state.route.params);

    switch (state.route.name) {
        case 'dashboard':
            renderDashboardView(container, state.transactions, state.projects);
            setupDashboardListeners();
            break;

        case 'transactions': {
            const filtered = getFilteredTransactions();
            renderTransactionsView(container, filtered, state.categories, state.projects);
            setupFilterListeners();
            setupTransactionTableListeners();
            break;
        }

        case 'transaction-view': {
            const transaction = getTransactionByIdFromState(state.route.params.id);
            renderTransactionView(container, transaction);
            setupTransactionViewListeners();
            break;
        }

        case 'create': {
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
            const editId = urlParams.get('id') ? parseInt(urlParams.get('id')) : null;
            renderCreateView(container, editId);
            
            // Заполняем select-ы после рендера
            setTimeout(() => {
                populateFormSelects();
                setupFormListener();
                
                if (editId) {
                    loadTransactionForEdit(editId);
                } else {
                    // Устанавливаем сегодняшнюю дату по умолчанию
                    const today = new Date().toISOString().split('T')[0];
                    const dateInput = document.querySelector('#date');
                    if (dateInput) dateInput.value = today;
                }
            }, 0);
            break;
        }

        case 'analytics':
            renderAnalyticsView(container, state.transactions, state.categories);
            setupAnalyticsListeners();
            break;

        case 'categories':
            renderCategoriesView(container, state.categories, state.transactions);
            setupCategoriesListeners();
            break;

        case 'login':
            renderLoginView(container);
            setupLoginListener();
            break;

        default:
            renderNotFoundView(container);
    }
}

/**
 * Обработчик изменения маршрута
 */
function handleRouteChange(route) {
    console.log('Маршрут изменён:', route);
    
    // Обновляем данные из хранилища
    setTransactions(getAllTransactions());
    setCategories(getAllCategories());
    setProjects(getAllProjects());
    
    // Устанавливаем новый маршрут
    setRoute(route);
    
    // Рендерим соответствующий экран
    renderCurrentRoute();
}

/**
 * Настройка слушателей для главной страницы
 */
function setupDashboardListeners() {
    // Слушатели для кнопок на главной
    document.querySelectorAll('[data-action="view"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) navigateTo(href);
        });
    });
}

/**
 * Настройка слушателей для таблицы транзакций
 */
function setupTransactionTableListeners() {
    const tbody = document.querySelector('#transactions-tbody');
    if (!tbody) return;
    
    tbody.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        
        // Обработка кнопки удаления
        if (target.dataset.action === 'delete') {
            e.preventDefault();
            const row = target.closest('tr');
            if (row && row.dataset.id) {
                const id = parseInt(row.dataset.id);
                deleteTransaction(id);
            }
        }
        
        // Обработка ссылок просмотра и редактирования
        if (target.dataset.action === 'view' || target.dataset.action === 'edit') {
            e.preventDefault();
            const href = target.getAttribute('href');
            if (href) navigateTo(href);
        }
    });
}

/**
 * Удаление транзакции
 */
function deleteTransaction(id) {
    if (!confirm('Вы уверены, что хотите удалить этот расход?')) return;
    
    import('./lib/data.js').then(({ deleteTransaction }) => {
        const result = deleteTransaction(id);
        if (result) {
            setAppMessage('Расход успешно удалён', 'success');
            setTransactions(getAllTransactions());
            
            // Обновляем текущее представление
            if (state.route.name === 'transactions') {
                const filtered = getFilteredTransactions();
                const container = getViewContainer();
                if (container) {
                    renderTransactionsView(container, filtered, state.categories, state.projects);
                    setupFilterListeners();
                    setupTransactionTableListeners();
                }
            }
        }
    });
}

/**
 * Настройка слушателей для фильтров
 */
function setupFilterListeners() {
    const filterForm = document.querySelector('#filter-form');
    if (!filterForm) return;
    
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(filterForm);
        const filters = {
            period: formData.get('period') || 'month',
            projectId: formData.get('project_id') || '',
            categoryId: formData.get('category_id') || '',
            from: formData.get('from') || '',
            to: formData.get('to') || ''
        };
        
        setFilters(filters);
        
        // Обновляем отображение
        const filtered = getFilteredTransactions();
        const container = getViewContainer();
        if (container) {
            renderTransactionsView(container, filtered, state.categories, state.projects);
            setupFilterListeners();
            setupTransactionTableListeners();
        }
    });
}

/**
 * Настройка слушателей для страницы просмотра транзакции
 */
function setupTransactionViewListeners() {
    // Слушатели для кнопок на странице просмотра
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) navigateTo(href);
        });
    });
}

/**
 * Настройка слушателя для формы транзакции
 */
function setupFormListener() {
    const form = document.querySelector('#transaction-form');
    if (!form) {
        console.log('Форма #transaction-form не найдена');
        return;
    }

    console.log('Настройка слушателя для формы');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();

        console.log('Форма отправлена');

        clearFormErrors(form);

        const rawData = normalizeTransactionForm(form);
        console.log('Нормализованные данные:', rawData);

        const validationResult = validateTransactionData(rawData);
        console.log('Результат валидации:', validationResult);

        if (!validationResult.valid) {
            showFormErrors(form, validationResult.errors);
            return;
        }

        // Проверяем, это создание или редактирование
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const editId = urlParams.get('id') ? parseInt(urlParams.get('id')) : null;

        try {
            let result;
            if (editId) {
                result = updateTransaction(editId, rawData);
                if (result) {
                    setAppMessage(`Расход «${result.description}» успешно обновлён!`, 'success');
                }
            } else {
                result = createTransaction(rawData);
                if (result) {
                    setAppMessage(`Расход «${result.description}» успешно добавлен!`, 'success');
                }
            }
            
            if (result) {
                setTransactions(getAllTransactions());
                
                setTimeout(() => {
                    navigateTo('/transactions');
                }, 1000);
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            setAppMessage('Ошибка при сохранении', 'error');
        }
    });
}

/**
 * Загрузка данных транзакции для редактирования
 */
function loadTransactionForEdit(id) {
    console.log('Загрузка транзакции для редактирования, ID:', id);
    
    const transaction = getTransactionById(id);
    if (!transaction) {
        console.error('Транзакция не найдена');
        return;
    }

    console.log('Данные транзакции:', transaction);

    const form = document.querySelector('#transaction-form');
    if (!form) return;

    // Заполняем поля формы
    const amountInput = form.querySelector('[name="amount"]');
    const dateInput = form.querySelector('[name="date"]');
    const projectSelect = form.querySelector('[name="project_id"]');
    const categorySelect = form.querySelector('[name="category_id"]');
    const descriptionInput = form.querySelector('[name="description"]');
    const commentTextarea = form.querySelector('[name="comment"]');
    const paymentSelect = form.querySelector('[name="payment_method"]');
    const reimbursableCheck = form.querySelector('[name="is_reimbursable"]');

    if (amountInput) amountInput.value = transaction.amount;
    if (dateInput) dateInput.value = transaction.date;
    if (projectSelect) projectSelect.value = transaction.projectId;
    if (categorySelect) categorySelect.value = transaction.categoryId;
    if (descriptionInput) descriptionInput.value = transaction.description;
    if (commentTextarea) commentTextarea.value = transaction.comment || '';
    if (paymentSelect) paymentSelect.value = transaction.paymentMethod || '';
    if (reimbursableCheck) reimbursableCheck.checked = transaction.isReimbursable || false;
    
    // Меняем заголовок
    const titleEl = document.querySelector('#create-title');
    if (titleEl) titleEl.textContent = 'Редактирование расхода';
}

/**
 * Заполнение выпадающих списков в форме
 */
function populateFormSelects() {
    console.log('Заполнение select-ов');
    
    const projectSelect = document.querySelector('#project_id');
    const categorySelect = document.querySelector('#category_id');

    if (projectSelect) {
        projectSelect.innerHTML = '<option value="">Выберите проект</option>';
        state.projects.filter(p => p.active).forEach(proj => {
            const option = document.createElement('option');
            option.value = proj.id;
            option.textContent = proj.name;
            projectSelect.appendChild(option);
        });
        console.log('Проекты загружены:', state.projects.length);
    }

    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
        state.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
        console.log('Категории загружены:', state.categories.length);
    }
}

/**
 * Настройка слушателей для страницы аналитики
 */
function setupAnalyticsListeners() {
    // Здесь можно добавить слушатели для интерактивной аналитики
    console.log('Аналитика загружена');
}

/**
 * Настройка слушателей для страницы категорий
 */
function setupCategoriesListeners() {
    const tbody = document.querySelector('#categories-tbody');
    if (!tbody) return;
    
    tbody.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        
        if (target.dataset.action === 'delete') {
            e.preventDefault();
            // Здесь будет удаление категории
            console.log('Удаление категории');
        }
    });
}

/**
 * Настройка слушателя для формы входа
 */
function setupLoginListener() {
    const form = document.querySelector('#login-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        setAppMessage('Функция входа будет реализована позже', 'info');
    });
}

/**
 * Инициализация приложения
 */
function initApp() {
    console.log('🚀 Инициализация приложения...');
    
    // Инициализируем данные
    initializeData();
    console.log('✅ Данные инициализированы');
    
    // Загружаем данные в состояние
    setTransactions(getAllTransactions());
    setCategories(getAllCategories());
    setProjects(getAllProjects());
    
    console.log('📊 Загружено транзакций:', state.transactions.length);
    console.log('📊 Загружено категорий:', state.categories.length);
    console.log('📊 Загружено проектов:', state.projects.length);

    const container = getViewContainer();
    if (!container) {
        console.error('❌ Контейнер #app-view не найден');
        return;
    }

    // Устанавливаем начальный hash, если его нет
    if (!window.location.hash || window.location.hash === '#') {
        console.log('Устанавливаем начальный маршрут #/dashboard');
        window.location.hash = '#/dashboard';
    }

    // Запускаем маршрутизатор
    console.log('🔄 Запуск маршрутизатора...');
    startRouter(handleRouteChange);
    
    // Добавляем глобальный обработчик для навигации по ссылкам
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (!target) return;
        
        const href = target.getAttribute('href');
        if (href && href.startsWith('#/')) {
            e.preventDefault();
            navigateTo(href.slice(1)); // убираем # для navigateTo
        }
    });
    
    console.log('✅ Приложение инициализировано');
}

// Запуск приложения после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}