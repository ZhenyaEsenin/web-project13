// Соответствие между именами полей и ID элементов ошибок
const fieldErrorMap = {
    amount: 'amount-error',
    date: 'date-error',
    project: 'project-error',
    project_id: 'project-error',
    category: 'category-error',
    category_id: 'category-error',
    description: 'description-error',
    comment: 'comment-error',
    payment_method: 'payment-method-error'
};

/**
 * Очистка всех ошибок формы
 * @param {HTMLFormElement} form - элемент формы
 */
export function clearFormErrors(form) {
    // Очищаем все элементы с классом field-error
    form.querySelectorAll('.field-error').forEach(el => {
        el.textContent = '';
    });
    
    // Удаляем класс is-invalid у всех полей
    form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    
    // Очищаем общее сообщение формы
    const messageEl = document.getElementById('form-message');
    if (messageEl) {
        messageEl.textContent = '';
        messageEl.classList.remove('form-message-error', 'form-message-success');
    }
}

/**
 * Отображение ошибок формы
 * @param {HTMLFormElement} form - элемент формы
 * @param {Object} errors - объект с ошибками
 */
export function showFormErrors(form, errors) {
    for (const [field, message] of Object.entries(errors)) {
        // Получаем ID элемента ошибки
        const errorId = fieldErrorMap[field];
        if (!errorId) continue;
        
        // Показываем сообщение об ошибке
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
        }
        
        // Подсвечиваем поле с ошибкой
        let inputEl;
        if (field === 'project' || field === 'project_id') {
            inputEl = form.querySelector('[name="project_id"]');
        } else if (field === 'category' || field === 'category_id') {
            inputEl = form.querySelector('[name="category_id"]');
        } else {
            inputEl = form.querySelector(`[name="${field}"]`);
        }
        
        if (inputEl) {
            inputEl.classList.add('is-invalid');
        }
    }
    
    // Показываем общее сообщение
    const messageEl = document.getElementById('form-message');
    if (messageEl && Object.keys(errors).length > 0) {
        messageEl.textContent = 'Форма содержит ошибки. Пожалуйста, исправьте выделенные поля.';
        messageEl.classList.add('form-message-error');
    }
}

/**
 * Отображение ошибок с сервера (для будущей интеграции)
 * @param {HTMLFormElement} form - элемент формы
 * @param {Object} serverErrors - ошибки с сервера
 */
export function showServerErrors(form, serverErrors) {
    clearFormErrors(form);
    
    for (const [field, message] of Object.entries(serverErrors)) {
        const errorId = fieldErrorMap[field];
        if (!errorId) continue;
        
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
        }
        
        const inputEl = form.querySelector(`[name="${field}"]`);
        if (inputEl) {
            inputEl.classList.add('is-invalid');
        }
    }
    
    const messageEl = document.getElementById('form-message');
    if (messageEl) {
        messageEl.textContent = 'Ошибка при сохранении на сервере.';
        messageEl.classList.add('form-message-error');
    }
}

/**
 * Отображение успешного сообщения
 * @param {string} message - текст сообщения
 */
export function showFormSuccess(message) {
    const messageEl = document.getElementById('form-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.classList.add('form-message-success');
    }
}

/**
 * Подсветка поля при фокусе (для улучшения UX)
 * @param {HTMLInputElement} input - поле ввода
 */
export function setupFieldHighlight(input) {
    input.addEventListener('focus', () => {
        input.classList.add('field-focused');
    });
    
    input.addEventListener('blur', () => {
        input.classList.remove('field-focused');
    });
}
