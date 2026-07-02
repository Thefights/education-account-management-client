import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
	const { pathname, search } = useLocation()

	useEffect(() => {
		const scrollToTop = () => {
			window.scrollTo({
				top: 0,
				left: 0,
			})

			document.querySelectorAll('.dashboard-content-scroll').forEach((element) => {
				element.scrollTo({
					top: 0,
					left: 0,
				})
			})
		}

		requestAnimationFrame(scrollToTop)
	}, [pathname, search])

	return null
}

export default ScrollToTop
