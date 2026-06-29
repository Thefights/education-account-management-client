export const isPlainObject = (v) => {
	return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export const isStringArray = (v) => {
	return Array.isArray(v) && v.every((i) => typeof i === 'string')
}

