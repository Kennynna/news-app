export function LoadingSpinner() {
	return (
		<div className='flex items-center justify-center py-8'>
			<div className='flex flex-col items-center gap-4'>
				<div className='flex gap-2'>
					<div className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'></div>
					<div
						className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'
						style={{ animationDelay: '0.1s' }}
					></div>
					<div
						className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'
						style={{ animationDelay: '0.2s' }}
					></div>
				</div>
			</div>
		</div>
	)
}
