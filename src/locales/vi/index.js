const modules = import.meta.glob('./**/*.json', { eager: true, import: 'default' })

const deepMerge = (t, s) => {
	for (const k of Object.keys(s)) {
		const sv = s[k]
		if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
			t[k] = deepMerge(t[k] || {}, sv)
		} else {
			t[k] = sv
		}
	}
	return t
}

const vi = Object.values(modules).reduce((acc, cur) => deepMerge(acc, cur), {})

export default vi
