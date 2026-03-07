/**
 * Нормализация данных формы транзакции
 * @param {HTMLFormElement} form - элемент формы
 * @returns {Object} нормализованный объект данных
 */
export function normalizeTransactionForm(form) {
    const formData = new FormData(form);
    
    // Извлекаем значения и очищаем от пробелов
    const amount = String(formData.get('amount') || '').trim();
    const date = String(formData.get('date') || '').trim();
    const project_id = String(formData.get('project_id') || '').trim();
    const category_id = String(formData.get('category_id') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const comment = String(formData.get('comment') || '').trim();
    const payment_method = String(formData.get('payment_method') || '').trim();
    const is_reimbursable = formData.get('is_reimbursable') === 'on' ? 'true' : '';
    
    return {
        amount,
        date,
        project_id,
        category_id,
        description,
        comment,
        payment_method,
        is_reimbursable
    };
}

/**
 * Нормализация числовых значений
 * @param {string} value - строковое значение
 * @returns {number|null} число или null
 */
export function normalizeNumber(value) {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
}

/**
 * Нормализация даты (приведение к формату YYYY-MM-DD)
 * @param {string} dateStr - строка с датой
 * @returns {string} нормализованная дата
 */
export function normalizeDate(dateStr) {
    if (!dateStr) return '';
    // Проверяем, что дата в формате YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    return '';
}

/**
 * Очистка строки от лишних пробелов
 * @param {string} str - исходная строка
 * @returns {string} очищенная строка
 */
export function normalizeString(str) {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ');
}
