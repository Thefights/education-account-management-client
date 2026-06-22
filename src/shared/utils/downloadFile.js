import { getAccessToken } from '@/shared/api/authTokenStore'
import { envConfig } from '@/shared/config/envConfig'
import axios from 'axios'

const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const deriveFilename = (url, extension = '.xlsx', filenamePrefix) => {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')

  if (filenamePrefix) {
    return `${filenamePrefix}-${today}${extension}`
  }

  return `export-${today}${extension}`
}

const getExtensionFromContentType = (contentType = '') => {
  if (contentType.includes('text/csv')) {
    return '.csv'
  }

  if (contentType.includes('spreadsheetml') || contentType.includes('sheet')) {
    return '.xlsx'
  }

  return '.xlsx'
}

const getFilenameFromContentDisposition = (contentDisposition = '') => {
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
  if (plainMatch?.[1]) {
    return plainMatch[1]
  }

  return null
}

const serializeParams = (params = {}) =>
  Object.entries(params)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
      }

      if (value === undefined || value === null || value === '') return []

      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('&')

export const downloadFile = async (url, params = {}, options = {}) => {
  const { method = 'GET', data, headers = {}, filenamePrefix } = options
  const token = getAccessToken()
  const baseURL = envConfig.api.baseUrl

  const response = await axios.request({
    url,
    method,
    baseURL,
    params,
    data,
    withCredentials: true,
    paramsSerializer: serializeParams,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      ...headers,
    },
    responseType: 'blob',
  })

  const contentType = response.headers['content-type'] || XLSX_MIME_TYPE
  const contentDisposition = response.headers['content-disposition'] || ''
  const extension = getExtensionFromContentType(contentType)
  const filename =
    getFilenameFromContentDisposition(contentDisposition) ||
    deriveFilename(url, extension, filenamePrefix)

  const blob = new Blob([response.data], { type: contentType })
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)
}

export const downloadCsv = downloadFile

const escapeCsvValue = (value) => {
  const text = value == null ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export const downloadCsvTemplate = ({ filename, headers, sampleRows = [] }) => {
  const content = [headers, ...sampleRows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\r\n')
  const blob = new Blob([`\uFEFF${content}\r\n`], { type: 'text/csv;charset=utf-8' })
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)
}
