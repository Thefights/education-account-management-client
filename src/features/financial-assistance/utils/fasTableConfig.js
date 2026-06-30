import { FAS_APPLICATION_STATUS, FAS_STATUS } from '../data/fasSeedData'

export const fasSchemeStatusOptions = [
  { value: FAS_STATUS.Active, label: 'Active' },
  { value: FAS_STATUS.Inactive, label: 'Inactive' },
  { value: FAS_STATUS.Draft, label: 'Draft' },
]

export const fasApplicationStatusOptions = [
  { value: FAS_APPLICATION_STATUS.Draft, label: 'Draft' },
  { value: FAS_APPLICATION_STATUS.Pending, label: 'Pending' },
  { value: FAS_APPLICATION_STATUS.Approved, label: 'Approved' },
  { value: FAS_APPLICATION_STATUS.Expired, label: 'Expired' },
  { value: FAS_APPLICATION_STATUS.Rejected, label: 'Rejected' },
  { value: FAS_APPLICATION_STATUS.Withdrawn, label: 'Withdrawn' },
]

export const myFasApplicationStatusOptions = [
  { value: FAS_APPLICATION_STATUS.Draft, label: 'Draft' },
  { value: FAS_APPLICATION_STATUS.Pending, label: 'Pending' },
  { value: FAS_APPLICATION_STATUS.Expired, label: 'Expired' },
  { value: FAS_APPLICATION_STATUS.Rejected, label: 'Rejected' },
]

export const getFasStatusColor = (status) => {
  if (status === FAS_STATUS.Active || status === FAS_APPLICATION_STATUS.Approved) return 'success'
  if (status === FAS_STATUS.Draft || status === FAS_APPLICATION_STATUS.Pending) return 'warning'
  if (status === FAS_APPLICATION_STATUS.Rejected || status === FAS_APPLICATION_STATUS.Expired) return 'error'
  if (status === FAS_APPLICATION_STATUS.Withdrawn) return 'default'
  return 'default'
}

export const defaultFasSchemeFilters = { search: '', status: 'all' }

export const defaultFasApplicationFilters = {
  search: '',
  status: 'all',
  statuses: [],
  dateFrom: '',
  dateTo: '',
}
