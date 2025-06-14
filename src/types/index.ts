import type { Article } from '@/api/archive'

export interface GroupedArticles {
	date: string
	articles: Article[]
}

export interface ArticleCardProps {
	article: Article
	className?: string
}
