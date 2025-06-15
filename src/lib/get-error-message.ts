// Типы для различных ошибок
interface NYTAPIError {
	fault: {
		faultstring: string
		detail: {
			errorcode: string
		}
	}
}

interface StandardError {
	message: string
}

// Type guards для проверки типов ошибок
function isNYTAPIError(error: unknown): error is NYTAPIError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'fault' in error &&
		typeof (error as any).fault === 'object' &&
		'faultstring' in (error as any).fault &&
		typeof (error as any).fault.faultstring === 'string'
	)
}

function isStandardError(error: unknown): error is StandardError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as any).message === 'string'
	)
}

// Основная функция для парсинга ошибок
export function parseAPIError(error: unknown): string {
	// Проверяем, является ли это ошибкой NYT API
	if (isNYTAPIError(error)) {
		const faultstring = error.fault.faultstring
		const errorcode = error.fault.detail?.errorcode

		// Обрабатываем ошибку превышения лимита
		if (errorcode === 'policies.ratelimit.QuotaViolation') {
			return 'RATE_LIMIT_EXCEEDED'
		}

		// Другие возможные ошибки API
		if (faultstring.includes('Invalid API key')) {
			return 'INVALID_API_KEY'
		}

		if (faultstring.includes('Not found')) {
			return 'NOT_FOUND'
		}

		// Возвращаем общую ошибку API
		return `API_ERROR: ${faultstring}`
	}

	// Проверяем стандартные ошибки
	if (isStandardError(error)) {
		return error.message
	}

	// Если ошибка - строка
	if (typeof error === 'string') {
		return error
	}

	// Неизвестная ошибка
	return 'UNKNOWN_ERROR'
}

export function getErrorMessage(errorCode: string): string {
	switch (errorCode) {
		case 'RATE_LIMIT_EXCEEDED':
			return 'Превышен лимит запросов к API. Попробуйте позже.'
		case 'INVALID_API_KEY':
			return 'Неверный API ключ. Обратитесь к администратору.'
		case 'NOT_FOUND':
			return 'Запрашиваемые данные не найдены.'
		case 'UNKNOWN_ERROR':
			return 'Произошла неизвестная ошибка. Попробуйте позже.'
		default:
			if (errorCode.startsWith('API_ERROR:')) {
				return `Ошибка API: ${errorCode.replace('API_ERROR: ', '')}`
			}
			return 'Произошла неизвестная ошибка. Попробуйте позже.'
	}
}
