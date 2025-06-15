import { parseAPIError } from '@/lib/get-error-message'
import type { Article } from '@/types'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface NewsState {
	articles: Article[]
	loading: boolean
	loadingMore: boolean
	error: string | null
	hasMore: boolean
	currentPage: number
	year: number
	month: number
}

export function getArchiveYearMonth(): { year: number; month: number } {
	const today = new Date()
	const year = today.getFullYear()
	const curMonth0 = today.getMonth() // 0…11
	const day = today.getDate()
	// последний день текущего месяца:
	const lastDay = new Date(year, curMonth0 + 1, 0).getDate()

	// Если сегодня не последний день месяца, берем предыдущий месяц так как при отправке текущего вылезает ошибка
	if (day < lastDay) {
		if (curMonth0 === 0) {
			return { year: year - 1, month: 12 }
		}
		return { year, month: curMonth0 } 
	}
	// последний день месяца можно брать текущий
	return { year, month: curMonth0 + 1 }
}

const initialState: NewsState = {
	articles: [],
	loading: false,
	loadingMore: false,
	error: null,
	hasMore: true,
	currentPage: 0,
	year: new Date().getFullYear(),
	month: new Date().getMonth() + 1,
}

const NYT_API_KEY ='aDrloJH7Rkpv8OkmAB0h7TdoFYwB4RSD'
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchArchive(y: number, m: number) {
	  await delay(2000)
	const res = await fetch(
		`/api/svc/archive/v1/${y}/${m}.json?api-key=${NYT_API_KEY}`
	)
	if (!res.ok) {
		const err = await res.json()
		throw err
	}
	return res.json()
}

export const fetchNews = createAsyncThunk<
	{
		articles: Article[]
		hasMore: boolean
		page: number
		year: number
		month: number
	},
	{ page?: number },
	{ rejectValue: string }
>('news/fetchNews', async ({ page = 0 }, { rejectWithValue }) => {
	const { year, month } = getArchiveYearMonth()
	const perPage = 10

	try {
		const data = await fetchArchive(year, month)
		const docs = data.response.docs as Article[]
		const start = page * perPage
		const end = start + perPage

		return {
			articles: docs.slice(start, end),
			hasMore: end < docs.length,
			page,
			year,
			month,
		}
	} catch (err) {
		return rejectWithValue(parseAPIError(err))
	}
})

export const loadMoreNews = createAsyncThunk<
	{
		articles: Article[]
		hasMore: boolean
		page: number
	},
	void,
	{ rejectValue: string; state: { news: NewsState } }
>('news/loadMoreNews', async (_, { getState, rejectWithValue }) => {
	try {
		const state = getState().news
		const nextPage = state.currentPage + 1
		// берём уже сохранённый ранее год/месяц из стейта
		const data = await fetchArchive(state.year, state.month)
		const docs = data.response.docs as Article[]
		const perPage = 10
		const start = nextPage * perPage
		const end = start + perPage

		return {
			articles: docs.slice(start, end),
			hasMore: end < docs.length,
			page: nextPage,
		}
	} catch (err) {
		return rejectWithValue(parseAPIError(err))
	}
})

const newsSlice = createSlice({
	name: 'news',
	initialState,
	reducers: {
		clearError: state => {
			state.error = null
		},
		resetNews: state => {
			state.articles = []
			state.currentPage = 0
			state.hasMore = true
			state.error = null
			const { year, month } = getArchiveYearMonth()
			state.year = year
			state.month = month
		},
	},
	extraReducers: builder => {
		builder
			// Загрузка новостей
			.addCase(fetchNews.pending, state => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchNews.fulfilled, (state, { payload }) => {
				state.loading = false
				state.articles = payload.articles
				state.hasMore = payload.hasMore
				state.currentPage = payload.page
				// сохраняем «архивный» год/месяц
				state.year = payload.year
				state.month = payload.month
			})
			.addCase(fetchNews.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'Неизвестная ошибка'
			})

			// Загрузка доп. новостей
			.addCase(loadMoreNews.pending, state => {
				state.loadingMore = true
			})
			.addCase(loadMoreNews.fulfilled, (state, { payload }) => {
				state.loadingMore = false
				state.articles.push(...payload.articles)
				state.hasMore = payload.hasMore
				state.currentPage = payload.page
			})
			.addCase(loadMoreNews.rejected, (state, action) => {
				state.loadingMore = false
				state.error = action.payload || 'Неизвестная ошибка'
			})
	},
})

export const { clearError, resetNews } = newsSlice.actions
export default newsSlice.reducer
