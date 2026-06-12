/**
 * Generic table component shared by list and management screens.
 * Renders columns from field config with sorting, selection, loading, and empty states.
 */
import { getObjectValueFromStringPath } from '@/utils/handleObjectUtil'
import { getEnumLabelByValue, renderEmptyFallback } from '@/utils/handleStringUtil'
import { Space, Table, Tag } from 'antd'
import { useMemo } from 'react'
import EmptyRow from '../placeholders/EmptyRow'
import SkeletonTableRow from '../skeletons/SkeletonTableRow'

const getDataIndex = (key) => {
  if (!key) return undefined
  return key.includes('.') ? key.split('.') : key
}

const getSorterField = (field) => {
  if (Array.isArray(field)) return field.join('.')
  return field
}

const getTagColor = (color, value, row) => {
  if (typeof color === 'function') return color(value, row)
  return color
}

const tableSortDirections = ['ascend', 'descend', 'ascend']

const renderCellValue = (field, value, row, rowIndex) => {
  if (field.render) {
    return field.render(value, row, rowIndex)
  }

  const displayValue = field.options ? getEnumLabelByValue(field.options, value) || value : value

  if (field.type === 'tags') {
    const values = Array.isArray(value) ? value : value == null || value === '' ? [] : [value]

    if (!values.length) return renderEmptyFallback(null)

    return (
      <Space size={[4, 4]} wrap>
        {values.map((item) => {
          const label = field.options ? getEnumLabelByValue(field.options, item) || item : item
          return (
            <Tag key={String(item)} color={getTagColor(field.color, item, row)}>
              {renderEmptyFallback(label)}
            </Tag>
          )
        })}
      </Space>
    )
  }

  if (field.type === 'tag') {
    return (
      <Tag color={getTagColor(field.color, value, row)}>{renderEmptyFallback(displayValue)}</Tag>
    )
  }

  return renderEmptyFallback(displayValue)
}

const GenericTable = ({
  data = [],
  fields = [],
  rowKey,
  sort = { key: null, direction: 'asc' },
  setSort = () => {},
  canSelectRows = false,
  selectedRows = [],
  setSelectedRows = () => {},
  loading = false,
  stickyHeader = false,
}) => {
  const columns = useMemo(() => {
    return fields.map((field) => ({
      key: field.key,
      dataIndex: getDataIndex(field.key),
      title: field.title,
      width: field.width ?? `${100 / fields.length}%`,
      align: field.isNumeric ? 'right' : 'left',
      sorter: field.sortable || false,
      sortDirections: tableSortDirections,
      sortOrder:
        field.key === sort?.key ? (sort?.direction === 'asc' ? 'ascend' : 'descend') : undefined,
      fixed: field.fixedColumn ? 'left' : undefined,
      render: (_, row, rowIndex) => {
        const value = field.key ? getObjectValueFromStringPath(row, field.key) : undefined

        return renderCellValue(field, value, row, rowIndex)
      },
    }))
  }, [fields, sort])

  const rowSelection = useMemo(
    () =>
      canSelectRows
        ? {
            selectedRowKeys: selectedRows,
            onChange: (selectedKeys) => {
              setSelectedRows(selectedKeys)
            },
            preserveSelectedRowKeys: false,
          }
        : undefined,
    [canSelectRows, selectedRows, setSelectedRows]
  )

  const tableData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      key: rowKey ? getObjectValueFromStringPath(item, rowKey) : index,
    }))
  }, [data, rowKey])
  const hasData = tableData.length > 0

  const handleTableChange = (_, __, sorter) => {
    const sorterField = getSorterField(sorter?.field)

    if (!sorterField) return

    if (!sorter.order) {
      setSort({
        key: sorterField,
        direction: sort?.key === sorterField && sort?.direction === 'desc' ? 'asc' : 'desc',
      })
      return
    }

    setSort({
      key: sorterField,
      direction: sorter.order === 'ascend' ? 'asc' : 'desc',
    })
  }

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      rowSelection={rowSelection}
      loading={loading && hasData}
      pagination={false}
      sortDirections={tableSortDirections}
      scroll={{
        x: true,
        y: stickyHeader ? 560 : undefined,
      }}
      onChange={handleTableChange}
      locale={{
        emptyText: loading && !hasData ? (
          <SkeletonTableRow colSpan={fields.length + (canSelectRows ? 1 : 0)} />
        ) : (
          <EmptyRow colSpan={fields.length + (canSelectRows ? 1 : 0)} />
        ),
      }}
      style={{
        border: '1px solid var(--app-border-color)',
        borderRadius: '8px',
      }}
    />
  )
}

export default GenericTable
