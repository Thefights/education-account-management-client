export const getSelectedRecords = (records = [], selectedIds = [], idKey = 'id') => {
  const selected = new Set(selectedIds.map(String))
  return (records || []).filter((record) => selected.has(String(record?.[idKey])))
}

export const getStatusActionMeta = ({
  records = [],
  selectedIds = [],
  targetStatus,
  idKey = 'id',
  statusKey = 'status',
}) => {
  const selectedRecords = getSelectedRecords(records, selectedIds, idKey)
  const actionableRecords = selectedRecords.filter((record) => record?.[statusKey] !== targetStatus)

  return {
    selectedRecords,
    actionableRecords,
    actionableIds: actionableRecords.map((record) => record[idKey]),
    actionableCount: actionableRecords.length,
    skippedCount: selectedRecords.length - actionableRecords.length,
    hasActionable: actionableRecords.length > 0,
  }
}
