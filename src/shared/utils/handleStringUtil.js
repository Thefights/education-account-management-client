export const getStringCapitalized = (string) => {
  return string
    .trim()
    .toLowerCase()
    .split(/[\s_]+/)
    .map((str) => str.replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase()))
    .join(' ')
}

export const getTrimString = (input) => {
  if (typeof input === 'string') return input.trim()
  if (Array.isArray(input)) return input.map(getTrimString)
  if (input && typeof input === 'object') {
    if (input instanceof File || input instanceof Blob || input instanceof Date) return input
    const out = {}
    for (const k of Object.keys(input)) out[k] = getTrimString(input[k])
    return out
  }
  return input
}

export const appendPath = (baseUrl, tail) => {
  if (tail == null || tail === '') return baseUrl
  const parts = Array.isArray(tail) ? tail : [tail]
  const cleaned = parts
    .map((p) => String(p).replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .map(encodeURIComponent)

  const [base, query = ''] = String(baseUrl).split('?')
  const url = [base.replace(/\/+$/, ''), ...cleaned].join('/')
  return query ? `${url}?${query}` : url
}

export const getEnumLabelByValue = (enumArray, value) => {
  if (!Array.isArray(enumArray)) return null
  const found = enumArray.find((item) => {
    if (typeof item === 'string') return item === value
    if (item && typeof item === 'object' && 'value' in item) return item.value === value
    return false
  })
  return found ? (found.label ?? (typeof found === 'string' ? found : String(value))) : null
}

export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const text = doc.body.textContent || ''
  return text
}

export const renderEmptyFallback = (value) => value ?? 'N/A'
