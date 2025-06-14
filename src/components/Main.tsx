import { useArchive } from '../hooks/use-archive'
import { useEffect, useRef, useCallback } from 'react'
import type { Article } from '../api/archive'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface GroupedArticles {
	date: string
	articles: Article[]
}

function groupArticlesByDate(articles: Article[]): GroupedArticles[] {
	const groups: { [key: string]: Article[] } = {}

	articles.forEach(article => {
		const date = format(parseISO(article.pub_date), 'yyyy-MM-dd')
		if (!groups[date]) {
			groups[date] = []
		}
		groups[date].push(article)
	})

	return Object.entries(groups)
		.map(([date, articles]) => ({ date, articles }))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function formatDate(dateString: string): string {
	const date = parseISO(dateString)
	return `News for ${format(date, 'dd.MM.yyyy')}`
}

function ArticleCard({
	article,
	className,
}: {
	article: Article
	className?: string
}) {
	const handleClick = () => {
		window.open(article.web_url, '_blank', 'noopener,noreferrer')
	}

	const imageUrl = article.multimedia?.find(
		media => media.type === 'image' && media.url
	)?.url

	return (
		<Card
			className={cn(
				'cursor-pointer  bg-white border-0  h-[176px] w-full',
				className
			)}
			onClick={handleClick}
		>
			<CardContent className='p-4 h-full'>
				<div className='flex gap-4 items-center h-full'>
					<div className=''>
						{imageUrl ? (
							<img
								src={`https://www.nytimes.com/${imageUrl}`}
								alt=''
								className='object-cover rounded max-h-[95px]'
								onError={e => {
									e.currentTarget.src = '/placeholder.svg?height=64&width=64'
								}}
								height={95}
								width={130}
							/>
						) : (
							<div className='w-16 h-16 bg-gray-200 rounded flex items-center justify-center'>
								<span className='text-gray-400 text-xs'>NYT</span>
							</div>
						)}
					</div>
					<div className='flex-1 min-w-0 items-start text-start flex flex-col justify-around h-full'>
						<div className='text-title mb-1'>
							{article.source || 'New York Times'}
						</div>
						<h3 className='text-desc line-clamp-5 leading-tight'>
							{article.headline?.main || article.abstract}
						</h3>
						<div className='text-date'>
							{format(parseISO(article.pub_date), 'MMM dd, yyyy, HH:mm', {
								locale: ru,
							})}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

function LoadingSpinner() {
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

export function NewsList() {
	const { articles, loading, loadingMore, error, hasMore, loadMore } =
		useArchive(2025, 1)
	const observerRef = useRef<HTMLDivElement>(null)

	// Intersection Observer для бесконечной прокрутки
	const handleObserver = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [target] = entries
			if (target.isIntersecting && hasMore && !loadingMore) {
				loadMore()
			}
		},
		[hasMore, loadingMore, loadMore]
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

	if (error) {
		return (
			<div className='p-4 text-center'>
				<p className='text-red-500 mb-4'>Ошибка загрузки: {error}</p>
				<Button onClick={() => window.location.reload()}>
					Попробовать снова
				</Button>
			</div>
		)
	}

	const groupedArticles = groupArticlesByDate(articles)

	return (
		<div className='min-h-screen bg-white w-full'>
			<div className='max-w-2xl mx-auto p-4 min-w-full'>

				{loading && articles.length === 0 ? (
					<LoadingSpinner />
				) : (
					<div className='space-y-6'>
						{groupedArticles.map(({ date, articles }) => (
							<div key={date} className='space-y-3'>
								<h2 className='news-h mb-[10px] text-start'>{formatDate(date)}</h2>
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
