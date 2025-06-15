
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { getErrorMessage } from '@/lib/get-error-message'

interface ErrorDisplayProps {
	error: string
	onRetry: () => void
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
	const isRateLimitError = error === 'RATE_LIMIT_EXCEEDED'
	const errorMessage = getErrorMessage(error)

	return (
		<div className='p-4 text-center mt-[60px] flex-1'>
			<Card className='max-w-md mx-auto'>
				<CardContent className='p-6'>
					<div className='flex flex-col items-center gap-4'>
						{isRateLimitError ? (
							<Clock className='h-12 w-12 text-orange-500' />
						) : (
							<AlertCircle className='h-12 w-12 text-red-500' />
						)}

						<div className='text-center'>
							<h3 className='text-lg font-semibold mb-2'>
								{isRateLimitError
									? 'Лимит запросов превышен'
									: 'Ошибка загрузки'}
							</h3>
							<p
								className={`mb-4 ${
									isRateLimitError ? 'text-orange-600' : 'text-red-600'
								}`}
							>
								{errorMessage}
							</p>
						</div>

						{isRateLimitError ? (
							<div className='text-sm text-gray-600 text-center'>
								<p>
									API New York Times имеет ограничения на количество запросов.
								</p>
								<p>Попробуйте обновить страницу через несколько минут.</p>
							</div>
						) : (
							<Button onClick={onRetry} className='flex items-center gap-2'>
								<RefreshCw className='h-4 w-4' />
								Попробовать снова
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
