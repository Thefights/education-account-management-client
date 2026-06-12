import { getTranslation } from '@/hooks/useTranslation'

const emailRegex = new RegExp(
	'^(?=.{1,320}$)(?!.*\\.\\.)[a-zA-Z0-9](?:[a-zA-Z0-9._%+\\-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9\\-]{0,253}[a-zA-Z0-9])?(?:\\.[a-zA-Z]{2,})+$'
)

export const phoneRegex = /^0(2[0-9]{1,2}\d{7,8}|(3[2-9]|5[2-9]|7[0-9]|8[1-9]|9[0-9])\d{7})$/

export const isRequired =
	(msg = getTranslation('error.required')) =>
	(v) => {
		const s = typeof v === 'string' ? v.trim() : v
		return s === undefined || s === null || s === '' || (Array.isArray(s) && s.length === 0)
			? msg
			: true
	}

export const isEmail =
	(msg = getTranslation('error.invalid_email')) =>
	(v) =>
		v == null || v === '' || emailRegex.test(String(v)) ? true : msg

export const isPhone =
	(msg = getTranslation('error.invalid_phone')) =>
	(v) => {
		if (v == null || v === '') return true
		return phoneRegex.test(String(v)) ? true : msg
	}

export const isPhoneOrEmail =
	(msg = getTranslation('error.invalid_phone_or_email')) =>
	(v) => {
		if (v == null || v === '') return true
		return phoneRegex.test(String(v)) || emailRegex.test(String(v)) ? true : msg
	}

export const isNumber =
	(msg = getTranslation('error.invalid_number')) =>
	(v) => {
		if (v == null || v === '') return true
		return !Number.isNaN(Number(v)) ? true : msg
	}

export const isPasswordStrong =
	(msg = getTranslation('error.weak_password')) =>
	(v) => {
		if (v == null || v === '') return true
		const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
		return strongPasswordRegex.test(v) ? true : msg
	}

export const minLen = (n, msg) => (v) =>
	String(v ?? '').length < n
		? (msg ?? getTranslation('error.min_length', { min: n, current: String(v ?? '').length }))
		: true

export const maxLen = (n, msg) => (v) =>
	String(v ?? '').length > n
		? (msg ?? getTranslation('error.max_length', { max: n, current: String(v ?? '').length }))
		: true

export const numberRange = (min, max) => (v) => {
	if (v == null || v === '') return true
	const n = Number(v)

	if (min != null && n < min) return getTranslation('error.min_number', { min })
	if (max != null && n > max) return getTranslation('error.max_number', { max })
	return true
}

export const numberHigherThan = (min) => (v) => {
	if (v == null || v === '') return true
	const n = Number(v)
	return n > min ? true : getTranslation('error.number_higher_than', { min })
}

export const numberHigherThanOrEqual = (min) => (v) => {
	if (v == null || v === '') return true
	const n = Number(v)
	return n >= min ? true : getTranslation('error.number_higher_than_or_equal', { min })
}

export const numberLessThan = (max) => (v) => {
	if (v == null || v === '') return true
	const n = Number(v)
	return n < max ? true : getTranslation('error.number_less_than', { max })
}

export const numberLessThanOrEqual = (max) => (v) => {
	if (v == null || v === '') return true
	const n = Number(v)
	return n <= max ? true : getTranslation('error.number_less_than_or_equal', { max })
}

export const compare = (otherValue, msg) => (v) => {
	if (v == null || v === '') return true
	return v === otherValue ? true : (msg ?? getTranslation('error.not_match'))
}

export const notEqual = (otherValue, msg) => (v) => {
	if (v == null || v === '') return true
	return v !== otherValue ? true : (msg ?? getTranslation('error.must_be_different'))
}

export const isPercentage =
	(msg = getTranslation('error.invalid_percentage')) =>
	(v) => {
		if (v == null || v === '') return true
		const n = Number(v)
		if (Number.isNaN(n)) return msg
		return n >= 0 && n <= 100 ? true : msg
	}

export const hasNoDuplicateValues =
	(getValue = (item) => item, msg = getTranslation('error.duplicate_values_not_allowed')) =>
	(values) => {
		if (!Array.isArray(values)) return true

		const seen = new Set()

		for (const item of values) {
			const rawValue = getValue(item)
			const normalizedValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue

			if (normalizedValue == null || normalizedValue === '') continue
			if (seen.has(normalizedValue)) return msg

			seen.add(normalizedValue)
		}

		return true
	}

export const isFutureDate =
	(msg = getTranslation('error.past_date')) =>
	(v) => {
		if (v == null || v === '') return true
		const inputDate = new Date(v)
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return inputDate >= today ? true : msg
	}
