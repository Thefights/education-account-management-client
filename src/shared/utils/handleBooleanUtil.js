export const isValidatedFieldsRef = (fieldsRef) => {
	let isValid = true
	Object.keys(fieldsRef.current).forEach((key) => {
		if (fieldsRef.current[key] && !fieldsRef.current[key].validate()) {
			isValid = false
		}
	})
	return isValid
}

export const isPlainObject = (v) => {
	return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export const isStringArray = (v) => {
	return Array.isArray(v) && v.every((i) => typeof i === 'string')
}

export const isEmptyValue = (v) => {
	if (v === null || v === undefined) return true
	if (typeof v === 'string' && v.trim() === '') return true
	if (Array.isArray(v) && v.length === 0) return true
	if (typeof v === 'object' && Object.keys(v).length === 0) return true
	return false
}
