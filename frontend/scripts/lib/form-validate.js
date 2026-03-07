/**
 * Проверка валидности даты
 * @param {string} dateStr - строка с датой
 * @returns {boolean} true если дата корректна
 */
function isValidDate(dateStr) {
    if (!dateStr) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
}

/**
 * Проверка суммы
 * @param {string} amount - строка с суммой
 * @returns {Object} результат проверки
 */
function validateAmount(amount) {
    if (!amount) {
        return { valid: false, message: 'Сумма является обязательным полем.' };
    }
    
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
        return { valid: false, message: 'Сумма должна быть положительным числом.' };
    }
    
    if (num > 999999999.99) {
        return { valid: false, message: 'Сумма не может превышать 1 миллиард.' };
    }
    
    // Проверка на не более 2 знаков после запятой
    const parts = amount.toString().split('.');
    if (parts.length > 1 && parts[1].length > 2) {
        return { valid: false, message: 'Сумма может содержать не более 2 знаков после запятой.' };
    }
    
    return { valid: true };
}

/**
 * Валидация данных транзакции
 * @param {Object} data - нормализованные данные формы
 * @returns {Object} результат валидации { valid: boolean, errors: Object }
 */
export function validateTransactionData(data) {
    const errors = {};
    
    // Валидация суммы
    if (!data.amount) {
        errors.amount = 'Сумма является обязательным полем.';
    } else {
        const num = parseFloat(data.amount);
        if (isNaN(num) || num <= 0) {
            errors.amount = 'Сумма должна быть положительным числом.';
        }
    }
    
    // Валидация даты
    if (!data.date) {
        errors.date = 'Дата операции является обязательным полем.';
    } else if (!isValidDate(data.date)) {
        errors.date = 'Укажите корректную дату в формате ГГГГ-ММ-ДД.';
    } else {
        // Проверка, что дата не в будущем
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(data.date);
        
        if (selectedDate > today) {
            errors.date = 'Дата не может быть в будущем.';
        }
        
        // Проверка, что дата не слишком старая (например, не более 10 лет назад)
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        if (selectedDate < tenYearsAgo) {
            errors.date = 'Дата не может быть более 10 лет назад.';
        }
    }
    
    // Валидация проекта
    if (!data.project_id) {
        errors.project = 'Необходимо выбрать проект.';
    } else {
        const projectId = parseInt(data.project_id);
        if (isNaN(projectId) || projectId <= 0) {
            errors.project = 'Выбран некорректный проект.';
        }
    }
    
    // Валидация категории
    if (!data.category_id) {
        errors.category = 'Необходимо выбрать категорию расхода.';
    } else {
        const categoryId = parseInt(data.category_id);
        if (isNaN(categoryId) || categoryId <= 0) {
            errors.category = 'Выбрана некорректная категория.';
        }
    }
    
    // Валидация описания
    if (!data.description) {
        errors.description = 'Описание является обязательным полем.';
    } else if (data.description.length < 3) {
        errors.description = 'Описание должно содержать не менее 3 символов.';
    } else if (data.description.length > 200) {
        errors.description = 'Описание не должно превышать 200 символов.';
    }
    
    // Валидация комментария (необязательное поле)
    if (data.comment && data.comment.length > 1000) {
        errors.comment = 'Комментарий не должен превышать 1000 символов.';
    }
    
    // Валидация способа оплаты (если выбран)
    if (data.payment_method) {
        const validMethods = ['card', 'cash', 'transfer'];
        if (!validMethods.includes(data.payment_method)) {
            errors.payment_method = 'Выбран недопустимый способ оплаты.';
        }
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Проверка, является ли объект пустым (для опциональных полей)
 * @param {Object} obj - объект для проверки
 * @returns {boolean} true если объект пустой
 */
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
} 
