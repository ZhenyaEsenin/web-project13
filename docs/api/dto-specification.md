# DTO-спецификация проекта "Учёт затрат"

## 1. TransactionCreateDto

Используется при создании новой транзакции (`POST /transactions`).

| Поле | Тип | Обязательность | Описание |
|------|-----|----------------|----------|
| amount | number | обязательно | Сумма расхода (положительное число) |
| date | string | обязательно | Дата в формате `YYYY-MM-DD` |
| projectId | number | обязательно | Идентификатор проекта |
| categoryId | number | обязательно | Идентификатор категории |
| description | string | обязательно | Краткое описание (мин. 3 символа) |
| comment | string | нет | Комментарий |
| paymentMethod | string | нет | Способ оплаты: `card`, `cash`, `transfer` |
| isReimbursable | boolean | нет | Компенсируемый расход |

---

## 2. TransactionUpdateDto

Используется при обновлении транзакции (`PUT /transactions/{id}`).

| Поле | Тип | Обязательность | Описание |
|------|-----|----------------|----------|
| amount | number | обязательно | Сумма расхода |
| date | string | обязательно | Дата |
| projectId | number | обязательно | Идентификатор проекта |
| categoryId | number | обязательно | Идентификатор категории |
| description | string | обязательно | Описание |
| comment | string | нет | Комментарий |
| paymentMethod | string | нет | Способ оплаты |
| isReimbursable | boolean | нет | Компенсируемый расход |

---

## 3. TransactionResponseDto

Используется в успешных ответах API для транзакций.

| Поле | Тип | Описание |
|------|-----|----------|
| id | number | Идентификатор транзакции |
| amount | number | Сумма расхода |
| date | string | Дата в формате `YYYY-MM-DD` |
| projectId | number | Идентификатор проекта |
| categoryId | number | Идентификатор категории |
| description | string | Описание |
| comment | string | Комментарий |
| paymentMethod | string | Способ оплаты |
| isReimbursable | boolean | Компенсируемый расход |

---

## 4. CategoryResponseDto

| Поле | Тип | Описание |
|------|-----|----------|
| id | number | Идентификатор категории |
| name | string | Название категории |
| color | string | Цвет для отображения (HEX) |
| group | string | Группа категории |
| budget | number | Месячный бюджет (опционально) |

---

## 5. ProjectResponseDto

| Поле | Тип | Описание |
|------|-----|----------|
| id | number | Идентификатор проекта |
| name | string | Название проекта |
| budget | number | Бюджет проекта |
| active | boolean | Активен ли проект |

---

## 6. ErrorResponseDto

Используется для сообщений об ошибках.

| Поле | Тип | Описание |
|------|-----|----------|
| success | boolean | Признак успешности (всегда `false`) |
| message | string | Общее описание ошибки |
| errors | object/null | Ошибки по отдельным полям (если применимо) |