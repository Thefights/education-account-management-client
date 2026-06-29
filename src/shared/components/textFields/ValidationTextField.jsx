import MultipleSelectDialog from '@/shared/components/dialogs/commons/MultipleSelectDialog'
import SelectDialog from '@/shared/components/dialogs/commons/SelectDialog'
import { isEmail, isNumber, isPhone, isRequired } from '@/shared/utils/validateUtil'
import { Form, Input, Select } from 'antd'
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'

const ValidationTextField = (
  {
    label,
    type = 'text',
    required = true,
    value,
    onChange,
    validate,
    validationContext,
    loadOptions,
    options = [],
    remainOptions = undefined,
    renderOption,
    minValue,
    maxValue,
    readOnly = false,
    suffix,
    select,
    multiline = false,
    multipleSelect = false,
    minRows,
    renderOptionValue,
    ...props
  },
  ref
) => {
  const [error, setError] = useState('')
  const [openMultipleSelect, setOpenMultipleSelect] = useState(false)
  const [openSelectDialog, setOpenSelectDialog] = useState(false)
  const fieldLabel = label ? (
    <span style={{ whiteSpace: 'normal', lineHeight: 1.35 }}>{label}</span>
  ) : (
    label
  )
  const verticalFormItemProps = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    labelAlign: 'left',
    colon: false,
    style: { marginBottom: error ? 8 : 0 },
  }
  const isReadOnlyOrDisabled = readOnly || props.disabled

  const isMultipleSelect = useMemo(() => {
    return (type === 'select' || select) && multipleSelect === true
  }, [type, select, multipleSelect])

  const isSelectDialog = useMemo(() => {
    return type === 'select-dialog'
  }, [type])

  const userRules = useMemo(() => {
    if (!validate) return []
    return Array.isArray(validate) ? validate : [validate]
  }, [validate])

  const builtinRules = useMemo(() => {
    const rs = []
    if (required) rs.push(isRequired())
    if (type === 'email') rs.push(isEmail())
    if (type === 'number') rs.push(isNumber())
    if (type === 'tel') rs.push(isPhone())
    return rs
  }, [required, type])

  const allRules = useMemo(() => [...builtinRules, ...userRules], [builtinRules, userRules])

  const runWith = useCallback(
    (val, { skipEmpty = false } = {}) => {
      const isEmpty = val === '' || val === undefined || val === null
      if (skipEmpty && isEmpty) {
        setError('')
        return true
      }
      for (const r of allRules) {
        const res = r(val, validationContext)
        if (res !== true) {
          setError(res)
          return false
        }
      }
      setError('')
      return true
    },
    [allRules, validationContext]
  )

  const run = useCallback(() => runWith(value), [runWith, value])

  useImperativeHandle(
    ref,
    () => ({
      validate: run,
      resetValidation: () => setError(''),
    }),
    [run]
  )

  const displayOptions = useMemo(() => {
    const map = new Map()
    const push = (opt) => {
      if (!opt) return
      const k = String(opt.value)
      if (!map.has(k)) map.set(k, opt)
    }

    const src = (remainOptions && Array.isArray(remainOptions) ? remainOptions : options) || []
    src.forEach(push)

    const selectedValues = Array.isArray(value) ? value : [value]
    selectedValues
      .filter(
        (selectedValue) =>
          selectedValue !== undefined && selectedValue !== null && selectedValue !== ''
      )
      .forEach((selectedValue) => {
        const valueKey = String(selectedValue)
        if (!map.has(valueKey)) {
          const found = (options || []).find((option) => String(option.value) === valueKey)
          push(found)
        }
      })

    return Array.from(map.values())
  }, [remainOptions, options, value])

  const renderSelectedOptionValue = (selectedOption) => {
    if (!renderOptionValue) return selectedOption.label

    return renderOptionValue(selectedOption.value, selectedOption.label)
  }

  const isSelect = type === 'select' || type === 'select-dialog' || select

  if (isSelect) {
    const useDialogPicker = isMultipleSelect || isSelectDialog
    const selectOptions = displayOptions.map((opt) => ({
      value: opt.value,
      label: renderOption ? renderOption(opt.value, opt.label) : opt.label,
      disabled: opt.disabled,
    }))

    return (
      <>
        <Form.Item
          {...verticalFormItemProps}
          label={fieldLabel}
          required={required}
          validateStatus={error ? 'error' : undefined}
          help={error || undefined}
        >
          <Select
            placeholder={props.placeholder}
            value={value ?? undefined}
            onChange={(val) => {
              if (error) runWith(val, { skipEmpty: true })
              onChange?.({ target: { name: props.name, value: val } })
            }}
            onClick={() => {
              if (isMultipleSelect && !isReadOnlyOrDisabled) setOpenMultipleSelect(true)
              if (isSelectDialog && !isReadOnlyOrDisabled) setOpenSelectDialog(true)
            }}
            open={useDialogPicker ? false : undefined}
            disabled={isReadOnlyOrDisabled}
            options={selectOptions}
            mode={multipleSelect ? 'multiple' : undefined}
            labelRender={renderSelectedOptionValue}
            {...props}
          />
        </Form.Item>

        {isMultipleSelect && !isReadOnlyOrDisabled && (
          <MultipleSelectDialog
            open={openMultipleSelect}
            onClose={() => setOpenMultipleSelect(false)}
            options={options}
            value={value || []}
            onChange={(selectedValues) => {
              onChange?.({ target: { name: props.name, value: selectedValues } })
            }}
            renderOption={renderOption}
            loadOptions={loadOptions}
            title={label}
          />
        )}

        {isSelectDialog && !isReadOnlyOrDisabled && (
          <SelectDialog
            open={openSelectDialog}
            onClose={() => setOpenSelectDialog(false)}
            options={displayOptions}
            value={value}
            onChange={(selectedValue) => {
              onChange?.({ target: { name: props.name, value: selectedValue } })
            }}
            renderOption={renderOption}
            title={label}
          />
        )}
      </>
    )
  }

  return (
    <Form.Item
      {...verticalFormItemProps}
      label={fieldLabel}
      required={required}
      validateStatus={error ? 'error' : undefined}
      help={error || undefined}
    >
      {multiline ? (
        <Input.TextArea
          value={value ?? undefined}
          onChange={(e) => {
            if (error) runWith(e.target.value, { skipEmpty: true })
            onChange?.(e)
          }}
          disabled={isReadOnlyOrDisabled}
          readOnly={readOnly}
          rows={minRows}
          {...props}
        />
      ) : (
        <Input
          type={type}
          value={value ?? undefined}
          onChange={(e) => {
            if (error) runWith(e.target.value, { skipEmpty: true })
            onChange?.(e)
          }}
          disabled={isReadOnlyOrDisabled}
          readOnly={readOnly}
          min={minValue}
          max={maxValue}
          suffix={suffix}
          {...props}
        />
      )}
    </Form.Item>
  )
}

export default forwardRef(ValidationTextField)
