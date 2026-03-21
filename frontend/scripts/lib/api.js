// frontend/scripts/lib/api.js

import { API_BASE_URL } from './config.js';

// Обработка ответа от сервера
async function handleResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    
    let data = null;
    if (contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }
    
    if (!response.ok) {
        const error = new Error('Ошибка HTTP-запроса');
        error.status = response.status;
        error.data = data;
        throw error;
    }
    
    return data;
}

// Получение всех транзакций
export async function getTransactionsApi() {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    return handleResponse(response);
}

// Получение транзакции по ID
export async function getTransactionByIdApi(id) {
    const response = await fetch(`${API_BASE_URL}/transactions/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    return handleResponse(response);
}

// Создание новой транзакции
export async function createTransactionApi(transactionData) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(transactionData)
    });
    
    return handleResponse(response);
}

//Обновление транзакции
export async function updateTransactionApi(id, transactionData) {
    const response = await fetch(`${API_BASE_URL}/transactions/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(transactionData)
    });
    
    return handleResponse(response);
}

// Удаление транзакции
export async function deleteTransactionApi(id) {
    const response = await fetch(`${API_BASE_URL}/transactions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    return handleResponse(response);
}

// Получение всех категорий
export async function getCategoriesApi() {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    return handleResponse(response);
}

// Получение всех проектов

export async function getProjectsApi() {
    const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    return handleResponse(response);
}