
export interface GroupedArticles {
	date: string
	articles: Article[]
}

export interface ArticleCardProps {
	article: Article
	className?: string
}
export interface Article {
	web_url: string
	abstract: string
	pub_date: string
	source: string
	multimedia: { url: string; type: string }[]
	headline?: {
		main: string
		print_headline?: string
	}
	lead_paragraph?: string
}

export interface ArchiveResponse {
	copyright: string
	response: {
		meta: { hits: number }
		docs: Article[]
	}
}
