import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

export const NavBar = () => {
	return (
		<div className='w-full fixed top-0 z-50 bg-white left-0 p-5 flex items-center justify-center '>
			<Sheet>
				<SheetTrigger
					asChild
					className='absolute top-1/2 left-4 -translate-y-1/2'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='20'
						height='16'
						viewBox='0 0 20 16'
						fill='none'
					>
						<rect width='20' height='2.25' fill='black' />
						<rect y='6.75' width='20' height='2.25' fill='black' />
						<rect y='13.5' width='20' height='2.25' fill='black' />
					</svg>
				</SheetTrigger>
				<SheetContent side='right' className='p-4'>
					<div className='flex flex-col h-full justify-center items-center p-4 gap-7'>
						<p className='nav-item'>SCIENCE</p>
						<p className='nav-item'>GENERAL</p>
						<p className='nav-item'>ENTERTAINMENT</p>
						<p className='nav-item'>TECHNOLOGY</p>
						<p className='nav-item'>BUSINESS</p>
						<p className='nav-item'>SPORTS</p>
					</div>
				</SheetContent>
			</Sheet>
			<h1 className='nav-item'>BESIDER</h1>
		</div>
	)
}
