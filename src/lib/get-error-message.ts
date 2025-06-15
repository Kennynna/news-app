

export function parseAPIError(error: any): string {
	// Проверяем, является ли это ошибкой NYT API
	if (error.fault && error.fault.faultstring) {
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

	// Обрабатываем стандартные HTTP ошибки
	if (error.message) {
		return error.message
	}

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
		default:
			if (errorCode.startsWith('API_ERROR:')) {
				return `Ошибка API: ${errorCode.replace('API_ERROR: ', '')}`
			}
			return 'Произошла неизвестная ошибка. Попробуйте позже.'
	}
}
