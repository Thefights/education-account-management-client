import { useCallback, useEffect, useRef } from 'react'

export default function useFileUrls() {
	const urlsRef = useRef(new Map())

	useEffect(() => {
		const urls = urlsRef.current
		return () => {
			urls.forEach((url) => URL.revokeObjectURL(url))
			urls.clear()
		}
	}, [])

	const getUrlForFile = useCallback((file) => {
		if (!(file instanceof File)) return ''
		if (!urlsRef.current.has(file)) {
			urlsRef.current.set(file, URL.createObjectURL(file))
		}
		return urlsRef.current.get(file)
	}, [])

	const revokeUrlForFile = useCallback((file) => {
		const url = urlsRef.current.get(file)
		if (!url) return
		URL.revokeObjectURL(url)
		urlsRef.current.delete(file)
	}, [])

	return { getUrlForFile, revokeUrlForFile }
}
