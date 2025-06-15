import { useEffect, useRef, useCallback } from 'react'

import { fetchNews, loadMoreNews, clearError } from '@/store/slices/news-slice'
import { ArticleCard, ErrorDisplay, LoadingSpinner } from '.'
import { formatDate, groupArticlesByDate } from '@/lib/group-articles-by-date'
import { getErrorMessage } from '@/lib/get-error-message'
import { useAppDispatch, useAppSelector } from '@/store/hoosk'

export function NewsList() {
	const dispatch = useAppDispatch()
	const { articles, loading, loadingMore, error, hasMore } = useAppSelector(
		state => state.news
	)
	const observerRef = useRef<HTMLDivElement>(null)

	// Загружаем первую страницу при монтировании
	useEffect(() => {
		dispatch(fetchNews({ page: 0 }))
	}, [dispatch])

	// Интервал для обновления новостей каждые 30 секунд
	useEffect(() => {
		const interval = setInterval(() => {
			// Обновляем только если нет активной загрузки
			if (!loading && !loadingMore) {
				dispatch(fetchNews({ page: 0 }))
			}
		}, 30000) // 30 секунд

		return () => clearInterval(interval)
	}, [dispatch, loading, loadingMore])

	// Бесконечный скролл через IntersectionObserver
	const handleObserver = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [target] = entries
			console.log('Observer triggered:', {
				isIntersecting: target.isIntersecting,
				hasMore,
				loadingMore,
				error,
			})

			if (target.isIntersecting && hasMore && !loadingMore && !error) {
				console.log('Loading more news...')
				dispatch(loadMoreNews())
			}
		},
		[hasMore, loadingMore, error, dispatch]
	)

	useEffect(() => {
		const elem = observerRef.current
		if (!elem) {
			console.log('Observer element not found')
			return
		}

		console.log('Setting up observer')
		const observer = new IntersectionObserver(handleObserver, {
			root: null,
			rootMargin: '0px 0px 200px 0px', // старт догрузки за 200px до низа
			threshold: 0, // любое пересечение
		})

		observer.observe(elem)
		return () => {
			console.log('Cleaning up observer')
			observer.disconnect()
		}
		// пересоздаем, когда появляются статьи или меняется флаг hasMore
	}, [handleObserver, articles.length, hasMore])

	// Retry — сбрасываем ошибку и перезагружаем
	const handleRetry = () => {
		dispatch(clearError())
		dispatch(fetchNews({ page: 0 }))
	}

	// Рендер
	if (error && articles.length === 0) {
		return <ErrorDisplay error={error} onRetry={handleRetry} />
	}

	const groupedArticles = groupArticlesByDate(articles)

	console.log('Render state:', {
		articlesCount: articles.length,
		hasMore,
		loading,
		loadingMore,
		error,
	})

	return (
		<div className=' bg-white w-full mt-[53px] flex-1'>
			<div className=' p-4 min-w-full'>
				{loading && articles.length === 0 ? (
					<LoadingSpinner />
				) : (
					<div className='space-y-6'>
						{groupedArticles.map(({ date, articles }) => (
							<div key={date} className='space-y-3'>
								<h2 className='news-h mb-[10px] text-start mt-4'>
									{formatDate(date)}
								</h2>
								<div className='space-y-3 flex flex-col gap-4'>
									{articles.map((article, index) => (
										<ArticleCard
											key={`${article.web_url}-${index}`}
											article={article}
											className={
												index === articles.length - 1 ? '' : 'card-border'
											}
										/>
									))}
								</div>
							</div>
						))}

						{/* Элемент для наблюдения - делаем его более заметным */}
						<div
							ref={observerRef}
							className='h-20 flex items-center justify-center'
							style={{ minHeight: '20px' }}
						>
							{hasMore && !loadingMore && (
								<div className='text-gray-400 text-sm'>
									Прокрутите для загрузки еще...
								</div>
							)}
						</div>

						{/* Показываем ошибку при загрузке дополнительных новостей */}
						{error && articles.length > 0 && (
							<div className='text-center py-4'>
								<div className='bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto'>
									<p className='text-red-600 text-sm mb-2'>
										{getErrorMessage(error)}
									</p>
									{error !== 'RATE_LIMIT_EXCEEDED' && (
										<button
											onClick={handleRetry}
											className='text-red-700 underline text-sm hover:no-underline'
										>
											Попробовать снова
										</button>
									)}
								</div>
							</div>
						)}

						{/* Индикатор загрузки дополнительных новостей */}
						{loadingMore && <LoadingSpinner />}

						{!hasMore && articles.length > 0 && !error && (
							<div className='text-center py-8'>
								<p className='text-gray-500'>Все новости загружены</p>
							</div>
						)}
					</div>
				)}

				{!loading && articles.length === 0 && !error && (
					<div className='text-center py-12'>
						<p className='text-gray-500'>Новости не найдены</p>
					</div>
				)}
			</div>
		</div>
	)
}
