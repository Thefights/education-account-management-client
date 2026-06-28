export const getObjectValueFromStringPath = (object, path) => {
	if (!object || typeof object !== 'object' || !path) return undefined
	return path
		.split('.')
		.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), object)
}

export const getObjectConvertingToFormData = (object, form = new FormData(), segments = []) => {
	const isFiley = (v) => v instanceof File || v instanceof Blob

	const buildKey = (segs) => {
		let key = ''
		for (let i = 0; i < segs.length; i++) {
			const s = segs[i]
			if (typeof s === 'number') {
				key += `[${s}]`
			} else {
				key += i === 0 ? s : `.${s}`
			}
		}
		return key
	}

	if (object === undefined || object === null) return form

	if (isFiley(object)) {
		form.append(buildKey(segments), object)
		return form
	}

	if (object instanceof Date) {
		form.append(buildKey(segments), object.toISOString())
		return form
	}

	if (Array.isArray(object)) {
		if (object.every((v) => isFiley(v))) {
			const key = buildKey(segments)
			object.forEach((file) => {
				form.append(key, file)
			})
		} else {
			object.forEach((v, i) => getObjectConvertingToFormData(v, form, segments.concat(i)))
		}
		return form
	}

	if (typeof object === 'object') {
		Object.keys(object).forEach((k) =>
			getObjectConvertingToFormData(object[k], form, segments.concat(k))
		)
		return form
	}

	form.append(buildKey(segments), object)
	return form
}

export const normalizeOptions = (options) => {
	return Array.isArray(options)
		? options.map((option) =>
				typeof option === 'object' && option !== null && 'value' in option
					? option
					: { label: String(option), value: option }
		  )
		: []
}
