'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'

import { fetchNews, loadMoreNews, clearError } from '@/store/slices/newsSlice'
import { useAppDispatch, useAppSelector } from '@/store/hoosk'
import { formatDate, groupArticlesByDate } from '@/lib/group-articles-by-date'
import { ArticleCard, LoadingSpinner } from '.'

export function NewsList() {
	const dispatch = useAppDispatch()
	const { articles, loading, loadingMore, error, hasMore, year, month } =
		useAppSelector(state => state.news)
	const observerRef = useRef<HTMLDivElement>(null)

	// Загружаем новости при монтировании компонента
	useEffect(() => {
		dispatch(fetchNews({ year, month }))
	}, [dispatch, year, month])

	// Intersection Observer для бесконечной прокрутки
	const handleObserver = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [target] = entries
			if (target.isIntersecting && hasMore && !loadingMore) {
				dispatch(loadMoreNews())
			}
		},
		[hasMore, loadingMore, dispatch]
	)

	useEffect(() => {
		const element = observerRef.current
		if (!element) return

		const observer = new IntersectionObserver(handleObserver, {
			threshold: 0.1,
		})

		observer.observe(element)
		return () => observer.disconnect()
	}, [handleObserver])

	const handleRetry = () => {
		dispatch(clearError())
		dispatch(fetchNews({ year, month }))
	}

	if (error) {
		return (
			<div className='p-4 text-center mt-[60px] flex-1 '>
				<p className='text-red-500 mb-4'>Ошибка загрузки: {error}</p>
				<Button onClick={handleRetry}>Попробовать снова</Button>
			</div>
		)
	}

	const groupedArticles = groupArticlesByDate(articles)

	return (
		<div className=' bg-white w-full mt-[53px] flex-1'>
			<div className=' p-4 min-w-full'>
				{loading && articles.length === 0 ? (
					<LoadingSpinner />
				) : (
					<div className='space-y-6'>
						{groupedArticles.map(({ date, articles }) => (
							<div key={date} className='space-y-3'>
								<h2 className='news-h mb-[10px] text-start'>
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

						<div ref={observerRef} className='h-4' />

						{/* Индикатор загрузки дополнительных новостей */}
						{loadingMore && <LoadingSpinner />}

						{!hasMore && articles.length > 0 && (
							<div className='text-center py-8'>
								<p className='text-gray-500'>Все новости загружены</p>
							</div>
						)}
					</div>
				)}

				{!loading && articles.length === 0 && (
					<div className='text-center py-12'>
						<p className='text-gray-500'>Новости не найдены</p>
					</div>
				)}
			</div>
		</div>
	)
}
