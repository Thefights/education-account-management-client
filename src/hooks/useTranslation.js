import { useCallback, useMemo } from 'react'
import * as translations from '../locales'
import { useLocalStorage } from './useStorage'

export default function useTranslation() {
	const [language, setLanguage] = useLocalStorage('language', 'en')
	const fallbackLanguage = 'en'

	const dict = useMemo(() => resolveDict(translations, language) ?? {}, [language])
	const fallbackDict = useMemo(() => resolveDict(translations, fallbackLanguage) ?? {}, [])

	const t = useCallback(
		(key, params) => {
			const keys = key.split('.')
			const val = getNestedTranslation(dict, keys) || getNestedTranslation(fallbackDict, keys) || key

			return interpolate(val, params)
		},
		[dict, fallbackDict]
	)

	return {
		language,
		setLanguage,
		t,
	}
}

export const getTranslation = (key, params) => {
	let language = window?.localStorage?.getItem('language') || 'en'
	try {
		language = JSON.parse(language)
	} catch {
		/* empty */
	}

	const dict = resolveDict(translations, language)
	const fallbackDict = resolveDict(translations, 'en')

	const keys = key.split('.')
	const val = getNestedTranslation(dict, keys) || getNestedTranslation(fallbackDict, keys) || key

	return interpolate(val, params)
}

function getNestedTranslation(dict, keys) {
	return keys.reduce((obj, key) => {
		return obj?.[key]
	}, dict)
}

function interpolate(str, params) {
	if (!params || typeof str !== 'string') return str
	return str.replace(/\{(\w+)\}/g, (_, k) => (k in params ? String(params[k]) : `{${k}}`))
}

function resolveDict(mod, lang) {
	const m = mod?.[lang]
	return m && m.default ? m.default : m || {}
}

// Usage example:
/*
const { t } = useTranslation()
// { header: { title: "Welcome {name}" } }
<div>{t("header.title", { name: "John" })}</div> => "Welcome John"
*/
