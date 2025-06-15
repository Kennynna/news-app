import { format, parseISO } from 'date-fns'
import type { Article, GroupedArticles } from '@/types'

export function groupArticlesByDate(articles: Article[]): GroupedArticles[] {
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

export function formatDate(dateString: string): string {
	const date = parseISO(dateString)
	return `News for ${format(date, 'dd.MM.yyyy')}`
}
