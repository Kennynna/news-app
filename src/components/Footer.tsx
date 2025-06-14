export const Footer = () => {
	return (
		<div className='w-full px-10 py-15'>
			<div className='flex flex-col gap-6 items-center'>
				<div className='flex gap-3'>
					<p className='footer-text '>Log In</p>
					<p className='footer-text '>About Us</p>
					<p className='footer-text '>Publishers</p>
					<p className='footer-text '>Sitemap</p>
				</div>

				<div>
					<p className='footer-text'>Powered by</p>
					<img src='Screenshot.png' alt='' />
				</div>

				<p className='footer-text'>© 2023 Besider. Inspired by Insider</p>
			</div>
		</div>
	)
}
