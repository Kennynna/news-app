import './App.css'
import { Footer, NavBar, NewsList } from './components'
import { Provider } from 'react-redux'
import { store } from '@/store'

function App() {
	return (
		<div className='flex flex-col justify-between h-screen'>
			<NavBar />
			<Provider store={store}>
				<NewsList />
			</Provider>
			<Footer />
		</div>
	)
}

export default App
