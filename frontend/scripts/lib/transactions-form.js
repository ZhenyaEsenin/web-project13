import { 
    initializeData, 
    createTransaction,
    getTransactionById,
    updateTransaction,
    getAllCategories,
    getAllProjects
} from '../lib/data.js';
import { normalizeTransactionForm } from '../lib/form-normalize.js';
import { validateTransactionData } from '../lib/form-validate.js';
import {
    clearFormErrors,
    showFormErrors,
    showFormSuccess
} from '../lib/form-errors.js';

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
    const form = document.getElementById('transaction-form');
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
async function init() {
    // Инициализируем данные
    initializeData();
    
    // Загружаем опции для select
    await loadSelectOptions();
    
    const form = document.getElementById('transaction-form');
    if (!form) {
        console.error('Форма #transaction-form не найдена');
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
    
    // Обработчик отправки формы
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
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
                    showFormSuccess(`Расход «${result.description}» успешно добавлен. Перенаправление...`);
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
