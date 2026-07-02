import { formatCurrencyBasedOnCurrentLanguage } from '@/shared/utils/formatCurrencyUtil'
import {
  formatDateBasedOnCurrentLanguage,
  formatDatetimeStringBasedOnCurrentLanguage,
} from '@/shared/utils/formatDateUtil'

export const formatDashboardNumber = (value) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(value || 0))

export const formatDashboardPercent = (value) =>
  `${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))}%`

export const formatDashboardCurrency = (value) => formatCurrencyBasedOnCurrentLanguage(value)

export const formatDashboardDate = (value) => formatDateBasedOnCurrentLanguage(value)

export const formatDashboardDateTime = (value) => formatDatetimeStringBasedOnCurrentLanguage(value)

export const getEnumLabel = (options = [], value) =>
  options.find((option) => option.value === value)?.label || value || ''
