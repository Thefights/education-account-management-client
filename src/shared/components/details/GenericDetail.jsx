import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useForm from '@/shared/hooks/useForm'
import useTranslation from '@/shared/hooks/useTranslation'
import { getObjectValueFromStringPath } from '@/shared/utils/handleObjectUtil'
import { renderEmptyFallback } from '@/shared/utils/handleStringUtil'
import { ArrowLeftOutlined, CloseOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Flex, Skeleton, Space, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'

const defaultColumn = { xs: 1, md: 2 }
const detailCellMinHeight = 40
const viewCellContentStyle = {
  minHeight: detailCellMinHeight,
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  overflowWrap: 'anywhere',
}
const editCellContentStyle = {
  minHeight: detailCellMinHeight,
  width: '100%',
}

const GenericDetail = ({
  title,
  data,
  fields = [],
  loading = false,
  onBack,
  extra,
  edit,
  column = defaultColumn,
  bordered = true,
  cardProps,
  descriptionsProps,
}) => {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const editInitialValues = useMemo(() => edit?.initialValues ?? {}, [edit?.initialValues])
  const { values, handleChange, setField, reset, registerRef, validateAll, resetValidation } =
    useForm(editInitialValues)
  const { renderField, hasRequiredMissing } = useFieldRenderer(
    values,
    setField,
    handleChange,
    registerRef,
    submitted
  )
  const visibleFields = useMemo(
    () => fields.filter((field) => field && field.hidden !== true),
    [fields]
  )
  const editableFields = useMemo(() => {
    const editFields = edit?.fields ?? []
    const resolvedFields =
      typeof editFields === 'function' ? editFields({ values, data }) : editFields

    return resolvedFields.filter((field) => field && field.hidden !== true)
  }, [data, edit, values])
  const editableFieldMap = useMemo(() => {
    const map = new Map()
    editableFields.forEach((field) => {
      const detailKey = field.detailKey || field.viewKey || field.key
      if (detailKey) map.set(detailKey, field)
    })

    return map
  }, [editableFields])
  const editable = !!edit
  const editLoading = saving || !!edit?.loading
  const descriptionsClassName = ['generic-detail-descriptions', descriptionsProps?.className]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    reset(editInitialValues)
    resetValidation()
  }, [editInitialValues, reset, resetValidation])

  const renderValue = (field) => {
    const value = field.key ? getObjectValueFromStringPath(data || {}, field.key) : undefined

    if (field.render) return field.render(value, data)

    if (field.code || field.copyable) {
      return (
        <Typography.Text code={field.code} copyable={field.copyable}>
          {renderEmptyFallback(value)}
        </Typography.Text>
      )
    }

    return renderEmptyFallback(value)
  }

  const renderEditField = (field) =>
    renderField({
      ...field,
      title: undefined,
      label: undefined,
      hideLabel: true,
    })

  const renderInlineEditValue = (field) => {
    const editableField = editableFieldMap.get(field.key)
    if (!editableField) return renderValue(field)

    return renderEditField(editableField)
  }

  const renderDetailCellValue = (field) => {
    const content = editing ? renderInlineEditValue(field) : renderValue(field)
    const editableField = editing && editableFieldMap.has(field.key)

    return <div style={editableField ? editCellContentStyle : viewCellContentStyle}>{content}</div>
  }

  const handleCancelEdit = () => {
    reset(editInitialValues)
    resetValidation()
    setSubmitted(false)
    setEditing(false)
    edit?.onCancel?.()
  }

  const handleSaveEdit = async () => {
    setSubmitted(true)
    const missingField = hasRequiredMissing(editableFields)
    const valid = validateAll()
    if (missingField || !valid) return

    setSaving(true)
    try {
      const result = await edit?.onSubmit?.({ values, setField })
      if (result === false) return

      setSubmitted(false)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const headerExtra = editing ? (
    <Space>
      <Button icon={<CloseOutlined />} onClick={handleCancelEdit} disabled={editLoading}>
        {edit?.cancelLabel || t('button.cancel')}
      </Button>
      <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveEdit} loading={editLoading}>
        {edit?.saveLabel || t('button.save')}
      </Button>
    </Space>
  ) : extra || editable ? (
    <Space>
      {extra}
      {editable && (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => setEditing(true)}
          disabled={edit?.disabled || !data}
        >
          {edit?.updateLabel || t('button.update')}
        </Button>
      )}
    </Space>
  ) : null

  return (
    <Card {...cardProps}>
      <Flex vertical gap={16}>
        {(title || onBack || headerExtra) && (
          <Flex align="center" justify="space-between" gap={12} wrap>
            <Flex align="center" gap={12}>
              {onBack && <Button icon={<ArrowLeftOutlined />} onClick={onBack} />}
              {title && (
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {title}
                </Typography.Title>
              )}
            </Flex>
            {headerExtra}
          </Flex>
        )}

        {loading && !data ? (
          <Skeleton active />
        ) : (
          <Descriptions
            bordered={bordered}
            column={column}
            {...descriptionsProps}
            className={descriptionsClassName}
          >
            {visibleFields.map((field) => (
              <Descriptions.Item
                key={field.key || field.label}
                label={field.label ?? field.title}
                span={field.span}
              >
                {renderDetailCellValue(field)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Flex>
    </Card>
  )
}

export default GenericDetail
