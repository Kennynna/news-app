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

// Async thunk для загрузки новостей
const NYT_API_KEY = 'HDpxjv7texsIckUASLuAcpVUzw1b5QeK'
export const fetchNews = createAsyncThunk(
	'news/fetchNews',
	async (
		{ year, month, page = 0 }: { year: number; month: number; page?: number },
		{ rejectWithValue }
	) => {
		try {
			const response = await fetch(
				`/api/svc/archive/v1/${year}/${month}.json?api-key=${NYT_API_KEY}`
			)

			if (!response.ok) {
				const errorData = await response.json()
				throw errorData
			}

			const data = await response.json()
			const articlesPerPage = 10
			const startIndex = page * articlesPerPage
			const endIndex = startIndex + articlesPerPage

			return {
				articles: data.response.docs.slice(startIndex, endIndex),
				hasMore: endIndex < data.response.docs.length,
				page,
			}
		} catch (error) {
			const parsedError = parseAPIError(error)
			return rejectWithValue(parsedError)
		}
	}
)

// Async thunk для загрузки дополнительных новостей
export const loadMoreNews = createAsyncThunk(
	'news/loadMoreNews',
	async (_, { getState, rejectWithValue }) => {
		try {
			const state = getState() as { news: NewsState }
			const { year, month, currentPage } = state.news
			const nextPage = currentPage + 1

			const response = await fetch(
				`/api/svc/archive/v1/${year}/${month}.json?api-key=${NYT_API_KEY}`
			)

			if (!response.ok) {
				const errorData = await response.json()
				throw errorData
			}

			const data = await response.json()
			const articlesPerPage = 10
			const startIndex = nextPage * articlesPerPage
			const endIndex = startIndex + articlesPerPage

			return {
				articles: data.response.docs.slice(startIndex, endIndex),
				hasMore: endIndex < data.response.docs.length,
				page: nextPage,
			}
		} catch (error) {
			const parsedError = parseAPIError(error)
			return rejectWithValue(parsedError)
		}
	}
)

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
		},
	},
	extraReducers: builder => {
		builder
			// Загрузка новостей
			.addCase(fetchNews.pending, state => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchNews.fulfilled, (state, action) => {
				state.loading = false
				state.articles = action.payload.articles
				state.hasMore = action.payload.hasMore
				state.currentPage = action.payload.page
			})
			.addCase(fetchNews.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload as string
			})
			// Загрузка дополнительных новостей
			.addCase(loadMoreNews.pending, state => {
				state.loadingMore = true
			})
			.addCase(loadMoreNews.fulfilled, (state, action) => {
				state.loadingMore = false
				state.articles = [...state.articles, ...action.payload.articles]
				state.hasMore = action.payload.hasMore
				state.currentPage = action.payload.page
			})
			.addCase(loadMoreNews.rejected, (state, action) => {
				state.loadingMore = false
				state.error = action.payload as string
			})
	},
})

export const { clearError, resetNews } = newsSlice.actions
export default newsSlice.reducer
