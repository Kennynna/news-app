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

const NYT_API_KEY = 'HDpxjv7texsIckUASLuAcpVUzw1b5QeK'

export async function fetchArchive(
	year: number,
	month: number
): Promise<Article[]> {
	const res = await fetch(
		`/api/svc/archive/v1/${year}/${month}.json?api-key=${NYT_API_KEY}`,
		{
			headers: { Accept: 'application/json' },
			cache: 'no-store',
		}
	)

	if (!res.ok) {
		const err = await res.json()
		throw new Error(`NYT API error: ${err.fault?.faultstring || res.status}`)
	}

	const data = (await res.json()) as ArchiveResponse
	return data.response.docs
}
