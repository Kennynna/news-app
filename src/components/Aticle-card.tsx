import { Card, CardContent } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { ArticleCardProps } from '@/types'

export function ArticleCard({ article, className }: ArticleCardProps) {
	const handleClick = () => {
		window.open(article.web_url, '_blank', 'noopener,noreferrer')
	}

	const imageUrl = article.multimedia?.find(
		media => media.type === 'image' && media.url
	)?.url

	return (
		<Card
			className={cn(
				'cursor-pointer bg-white border-0 h-[176px] w-full',
				className
			)}
			onClick={handleClick}
		>
			<CardContent className=' h-full'>
				<div className='flex gap-4 items-center h-full'>
					<div className=''>
						{imageUrl ? (
							<img
								src={`https://www.nytimes.com/${imageUrl}`}
								alt=''
								className='object-cover rounded max-h-[95px]'
								onError={e => {
									e.currentTarget.src = '/placeholder.svg?height=64&width=64'
								}}
								height={95}
								width={130}
							/>
						) : (
							<div className='w-[130px] h-[95px] bg-gray-200 rounded flex items-center justify-center'>
								<span className='text-gray-400 text-xs'>NYT</span>
							</div>
						)}
					</div>
					<div className='flex-1 min-w-0 items-start text-start flex flex-col justify-around h-full'>
						<div className='text-title mb-1'>
							{article.source || 'New York Times'}
						</div>
						<h3 className='text-desc line-clamp-3 leading-tight'>
							{article.headline?.main || article.abstract}
						</h3>
						<div className='text-date'>
							{format(parseISO(article.pub_date), 'MMM dd, yyyy, HH:mm', {
								locale: ru,
							})}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
