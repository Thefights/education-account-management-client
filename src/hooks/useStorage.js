import { useCallback, useEffect, useState } from 'react'

export function useLocalStorage(key, defaultValue) {
	return useStorage(key, defaultValue, window.localStorage, 'local')
}

export function useSessionStorage(key, defaultValue) {
	return useStorage(key, defaultValue, window.sessionStorage, 'session')
}

/**
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @param {Storage} storageObject
 * @param {string} type
 * @returns {[value: T, setValue: (value: T) => void, removeValue: () => void]}
 */
function useStorage(key, defaultValue, storageObject, type) {
	const [value, setValue] = useState(() => {
		try {
			const jsonValue = storageObject.getItem(key)
			if (jsonValue != null) return JSON.parse(jsonValue)
		} catch {
			/* empty */
		}
		return typeof defaultValue === 'function' ? defaultValue() : defaultValue
	})

	useEffect(() => {
		if (value === undefined) {
			storageObject.removeItem(key)
		} else {
			storageObject.setItem(key, JSON.stringify(value))
		}

		window.dispatchEvent(
			new CustomEvent('storage-change', {
				detail: { key, value, type },
			})
		)
	}, [key, value, storageObject, type])

	useEffect(() => {
		const handleStorage = (e) => {
			if (e.key === key && e.storageArea === storageObject) {
				try {
					setValue(e.newValue ? JSON.parse(e.newValue) : undefined)
				} catch {
					setValue(undefined)
				}
			}
		}

		const handleCustom = (e) => {
			if (e.detail.key === key && e.detail.type === type) {
				setValue(e.detail.value)
			}
		}

		window.addEventListener('storage', handleStorage)
		window.addEventListener('storage-change', handleCustom)
		return () => {
			window.removeEventListener('storage', handleStorage)
			window.removeEventListener('storage-change', handleCustom)
		}
	}, [key, storageObject, type])

	const remove = useCallback(() => {
		setValue(undefined)
	}, [])

	return [value, setValue, remove]
}

// Usage example:
// const [name, setName, removeName] = useLocalStorage('name', 'Bob')
// const [age, setAge, removeAge] = useSessionStorage('age', 42)
