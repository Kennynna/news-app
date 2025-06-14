'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Article, fetchArchive } from '../api/archive'

export function useArchive(year: number, month: number) {
	const [allArticles, setAllArticles] = useState<Article[]>([])
	const [displayedArticles, setDisplayedArticles] = useState<Article[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date())
	const [currentPage, setCurrentPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)

	const ITEMS_PER_PAGE = 10

	const loadArticles = useCallback(
		async (isRefresh = false) => {
			try {
				if (!isRefresh) setLoading(true)
				setError(null)

				const newArticles = await fetchArchive(year, month)

				const sortedArticles = newArticles.sort(
					(a, b) =>
						new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime()
				)

				if (isRefresh) {

					const currentTime = new Date()
					const newItems = sortedArticles.filter(
						article => new Date(article.pub_date) > lastFetchTime
					)

					if (newItems.length > 0) {
						setAllArticles(prev => {
							const combined = [...newItems, ...prev]
							// Удаляем дубликаты по web_url
							const unique = combined.filter(
								(article, index, self) =>
									index === self.findIndex(a => a.web_url === article.web_url)
							)
							return unique.sort(
								(a, b) =>
									new Date(b.pub_date).getTime() -
									new Date(a.pub_date).getTime()
							)
						})
					}
					setLastFetchTime(currentTime)
				} else {
					setAllArticles(sortedArticles)
					setDisplayedArticles(sortedArticles.slice(0, ITEMS_PER_PAGE))
					setCurrentPage(1)
					setHasMore(sortedArticles.length > ITEMS_PER_PAGE)
					setLastFetchTime(new Date())
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Failed to fetch articles'
				)
			} finally {
				setLoading(false)
			}
		},
		[year, month, lastFetchTime]
	)

	const loadMore = useCallback(() => {
		if (loadingMore || !hasMore) return

		setLoadingMore(true)

		setTimeout(() => {
			const nextPage = currentPage + 1
			const startIndex = (nextPage - 1) * ITEMS_PER_PAGE
			const endIndex = startIndex + ITEMS_PER_PAGE

			const newItems = allArticles.slice(startIndex, endIndex)

			if (newItems.length > 0) {
				setDisplayedArticles(prev => [...prev, ...newItems])
				setCurrentPage(nextPage)
				setHasMore(endIndex < allArticles.length)
			} else {
				setHasMore(false)
			}

			setLoadingMore(false)
		}, 500) 
	}, [allArticles, currentPage, loadingMore, hasMore])

	useEffect(() => {
		if (allArticles.length > 0) {
			const endIndex = currentPage * ITEMS_PER_PAGE
			setDisplayedArticles(allArticles.slice(0, endIndex))
			setHasMore(endIndex < allArticles.length)
		}
	}, [allArticles, currentPage])

	useEffect(() => {
		loadArticles()
	}, [year, month])

	// Автообновление каждые 30 секунд
	useEffect(() => {
		const interval = setInterval(() => {
			loadArticles(true)
		}, 30000)

		return () => clearInterval(interval)
	}, [loadArticles])

	return {
		articles: displayedArticles,
		loading,
		loadingMore,
		error,
		hasMore,
		loadMore,
		refresh: () => loadArticles(true),
	}
}
