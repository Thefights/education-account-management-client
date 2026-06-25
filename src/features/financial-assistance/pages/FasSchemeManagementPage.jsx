import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import { FasSchemeFilterSection } from '@/features/financial-assistance/components/FasFilterSections'
import { FasAdminSchemeTableSection } from '@/features/financial-assistance/components/FasTableSections'
import {
  FAS_COURSE_OPTIONS,
  FAS_FIELD_OPTIONS,
  FAS_STATUS,
} from '@/features/financial-assistance/data/fasSeedData'
import {
  fasMockStore,
  useFasMockStore,
} from '@/features/financial-assistance/data/fasMockStore'
import { useFasMockTable } from '@/features/financial-assistance/hooks/useFasMockTable'
import '@/features/financial-assistance/styles/financialAssistance.css'
import {
  buildEligibilityPreviewParts,
  statusLabel,
} from '@/features/financial-assistance/utils/fasRules'
import { defaultFasSchemeFilters } from '@/features/financial-assistance/utils/fasTableConfig'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Flex,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Switch,
  Typography,
  Upload,
  message,
} from 'antd'
import { useMemo, useState } from 'react'

const nationalityOptions = ['Singapore Citizen', 'Permanent Resident', 'Any'].map((value) => ({
  value,
  label: value,
}))

const fieldDefaults = {
  studentAge: 12,
  nationality: 'Singapore Citizen',
  parentNationality: 'Singapore Citizen',
  pci: '',
  income: '',
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const rowId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const equalityFields = new Set(['studentAge', 'nationality', 'parentNationality'])

const conditionOperator = (field) => (equalityFields.has(field) ? '=' : '≤')

const numericInputStyle = { width: '100%' }

const normalizeScheme = (scheme) => ({
  ...clone(scheme),
  connectors: (scheme.connectors || []).slice(0, Math.max((scheme.conditions || []).length - 1, 0)),
})

const FasSchemeManagementPage = () => {
  const { schemes } = useFasMockStore()
  const [filters, setFilters] = useState(defaultFasSchemeFilters)
  const [sort, setSort] = useState({ key: 'id', direction: 'asc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editingScheme, setEditingScheme] = useState(null)
  const [readOnly, setReadOnly] = useState(false)

  const schemeRows = useMemo(
    () =>
      schemes.map((scheme) => ({
        ...scheme,
        conditionCount: scheme.conditions?.length || 0,
        documentCount: scheme.documents?.length || 0,
      })),
    [schemes]
  )

  const tableData = useFasMockTable({
    rows: schemeRows,
    filters,
    sort,
    page,
    pageSize,
    filterRow: (scheme, currentFilters) => {
      const query = currentFilters.search.trim().toLowerCase()
      const matchesQuery =
        !query ||
        scheme.name.toLowerCase().includes(query) ||
        scheme.id.toLowerCase().includes(query)
      const matchesStatus =
        !currentFilters.status ||
        currentFilters.status === 'all' ||
        currentFilters.status === scheme.status

      return matchesQuery && matchesStatus
    },
  })

  const openCreate = () => {
    setEditingScheme(fasMockStore.createDraftScheme())
    setReadOnly(false)
  }

  const openEdit = (scheme, locked = false) => {
    setEditingScheme(normalizeScheme(scheme))
    setReadOnly(locked)
  }

  const closeEditor = () => {
    setEditingScheme(null)
    setReadOnly(false)
  }

  const updateScheme = (updater) => {
    setEditingScheme((current) => {
      const draft = clone(current)
      const next = updater(draft) || draft
      return normalizeScheme(next)
    })
  }

  const duplicateScheme = (id) => {
    const copy = fasMockStore.duplicateScheme(id)
    if (!copy) return
    message.success(`Duplicated ${copy.id} as Draft`)
    openEdit(copy, false)
  }

  const deleteDraft = (scheme) => {
    Modal.confirm({
      title: `Delete draft ${scheme.name}?`,
      content: 'This removes the draft scheme only. Approved application history is preserved.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => {
        fasMockStore.deleteDraftScheme(scheme.id)
        message.success(`Deleted ${scheme.id}`)
      },
    })
  }

  const changeStatus = (scheme, status) => {
    const verb = status === FAS_STATUS.Active ? 'Activate' : 'Deactivate'

    Modal.confirm({
      title: `${verb} ${scheme.name}?`,
      content:
        status === FAS_STATUS.Active
          ? 'The scheme will reappear in F7 Apply.'
          : 'New student applications will be blocked. Existing records remain.',
      okText: verb,
      onOk: () => {
        fasMockStore.changeSchemeStatus(scheme.id, status)
        message.success(`${scheme.name} is now ${statusLabel(status)}`)
      },
    })
  }

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }

  if (editingScheme) {
    return (
      <SchemeEditor
        scheme={editingScheme}
        isNew={!schemes.some((scheme) => scheme.id === editingScheme.id)}
        readOnly={readOnly}
        onBack={closeEditor}
        onChange={updateScheme}
        onDuplicate={(scheme) => duplicateScheme(scheme.id)}
      />
    )
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            FAS Schemes
          </Typography.Title>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Create FAS
            </Button>
          </Space>
        </Flex>

        <FasSchemeFilterSection
          filters={filters}
          loading={false}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFasSchemeFilters)}
        />
        <FasAdminSchemeTableSection
          schemes={tableData.collection}
          loading={false}
          sort={sort}
          setSort={setSort}
          onView={(scheme) => openEdit(scheme, true)}
          onEdit={(scheme) => openEdit(scheme, false)}
          onDuplicate={(scheme) => duplicateScheme(scheme.id)}
          onDelete={deleteDraft}
          onActivate={(scheme) => changeStatus(scheme, FAS_STATUS.Active)}
          onDeactivate={(scheme) => changeStatus(scheme, FAS_STATUS.Inactive)}
        />
        <GenericTablePagination
          totalCount={tableData.totalCount}
          totalPage={tableData.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={false}
        />

        <div className="fas-note">
          <strong>Link to students:</strong> Active schemes here are the same schemes shown in F7
          Apply. Draft schemes are hidden, and inactive schemes block new applications.
        </div>
      </Flex>
    </Card>
  )
}

const SchemeEditor = ({ scheme, isNew, readOnly, onBack, onChange, onDuplicate }) => {
  const mode = readOnly ? 'View' : isNew ? 'Create' : 'Edit'

  const save = (status) => {
    const name = scheme.name.trim()

    if (!name) {
      message.error('Enter scheme name')
      return
    }

    if (!scheme.conditions.length) {
      message.error('Add at least 1 eligibility condition')
      return
    }

    if (!scheme.tiers.length) {
      message.error('Add at least 1 tier')
      return
    }

    if (status === FAS_STATUS.Active && !Number(scheme.validityMonths)) {
      message.error('Set the FAS duration before publishing')
      return
    }

    fasMockStore.saveScheme({ ...scheme, name }, status)
    message.success(`${status === FAS_STATUS.Active ? 'Published' : 'Saved draft'} ${scheme.id}`)
    onBack()
  }

  return (
    <div className="fas-page">
      <div className="fas-frame">
        <div className="fas-bar">
          <span className="fas-back" onClick={onBack}>
            <ArrowLeftOutlined /> Scheme
          </span>
          <span>/</span>
          <span>{mode} FAS</span>
          <span style={{ marginLeft: 'auto' }}>
            <FasStatusTag status={scheme.status} />
          </span>
        </div>

        <div className="fas-body">
          <div style={{ marginBottom: 12 }}>
            <label className="fas-field-label">Scheme name</label>
            <Input
              disabled={readOnly}
              placeholder="Enter name..."
              value={scheme.name}
              onChange={(event) => onChange((draft) => ({ ...draft, name: event.target.value }))}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="fas-field-label">Description shown to account holders</label>
            <Input.TextArea
              disabled={readOnly}
              rows={2}
              value={scheme.description}
              placeholder="Describe what this FAS supports."
              onChange={(event) =>
                onChange((draft) => ({ ...draft, description: event.target.value }))
              }
            />
          </div>

          <div className="fas-form-grid" style={{ marginBottom: 12 }}>
            <div>
              <label className="fas-field-label">FAS ID (auto)</label>
              <Input disabled value={scheme.id} />
            </div>
            <div>
              <label className="fas-field-label">FAS duration after student applies</label>
              <InputNumber
                disabled={readOnly}
                min={1}
                value={scheme.validityMonths}
                addonAfter="months"
                style={{ width: '100%' }}
                onChange={(value) =>
                  onChange((draft) => ({ ...draft, validityMonths: value || '' }))
                }
              />
            </div>
          </div>

          <div className="fas-course-selector-field">
            <div className="fas-course-selector-head">
              <label className="fas-field-label">Applicable courses</label>
              <span>{scheme.linkedCourses?.length || 0} selected</span>
            </div>
            <Select
              className="fas-course-select"
              classNames={{ popup: { root: 'fas-course-select-popup' } }}
              disabled={readOnly}
              mode="multiple"
              allowClear
              maxTagCount="responsive"
              listHeight={272}
              value={scheme.linkedCourses || []}
              placeholder="Select courses"
              style={{ width: '100%' }}
              options={FAS_COURSE_OPTIONS.map((course) => ({ value: course, label: course }))}
              onChange={(value) => onChange((draft) => ({ ...draft, linkedCourses: value }))}
            />
          </div>

          <EligibilityEditor scheme={scheme} readOnly={readOnly} onChange={onChange} />
          <SubsidyEditor scheme={scheme} readOnly={readOnly} onChange={onChange} />
          <DocumentsEditor scheme={scheme} readOnly={readOnly} onChange={onChange} />

          {readOnly ? (
            <div className="fas-actions">
              <Button onClick={() => onDuplicate(scheme)}>Duplicate to edit</Button>
              <Button onClick={onBack}>
                Close
              </Button>
            </div>
          ) : (
            <div className="fas-actions">
              <Button onClick={() => save(FAS_STATUS.Draft)}>Save as Draft</Button>
              <Button type="primary" onClick={() => save(FAS_STATUS.Active)}>
                Publish
              </Button>
            </div>
          )}

          <div className="fas-note">
            <strong>Funding rule:</strong> Funded = (Course x %c + Misc x %m) x 1.09. Net =
            Total - Funded. Total gross remains unchanged.
          </div>
        </div>
      </div>
    </div>
  )
}

const EligibilityEditor = ({ scheme, readOnly, onChange }) => {
  const previewParts = buildEligibilityPreviewParts(scheme.conditions, scheme.connectors)

  const updateCondition = (index, patch) => {
    onChange((draft) => {
      draft.conditions[index] = { ...draft.conditions[index], ...patch }
      return draft
    })
  }

  const addCondition = () => {
    onChange((draft) => {
      draft.conditions.push({ id: rowId('cond'), field: 'pci', value: '' })
      draft.connectors.push('AND')
      return draft
    })
  }

  const removeCondition = (index) => {
    if (scheme.conditions.length <= 1) {
      message.warning('Need at least 1 condition')
      return
    }

    onChange((draft) => {
      draft.conditions.splice(index, 1)
      draft.connectors.splice(index > 0 ? index - 1 : 0, 1)
      return draft
    })
  }

  return (
    <div className="fas-block">
      <div className="fas-block-title">
        <span className="fas-block-number">1</span>
        Eligibility (who can apply)
      </div>
      <div className="fas-block-subtitle">
        Add conditions, then choose AND or OR between each pair.
      </div>

      {scheme.conditions.map((condition, index) => (
        <div key={condition.id}>
          <div className="fas-elig-row">
            <Select
              disabled={readOnly}
              value={condition.field}
              options={FAS_FIELD_OPTIONS}
              onChange={(field) =>
                updateCondition(index, { field, value: fieldDefaults[field] ?? '' })
              }
            />
            <div className="fas-operator">{conditionOperator(condition.field)}</div>
            {condition.field === 'nationality' || condition.field === 'parentNationality' ? (
              <Select
                disabled={readOnly}
                value={condition.value}
                options={nationalityOptions}
                onChange={(value) => updateCondition(index, { value })}
              />
            ) : (
              <InputNumber
                disabled={readOnly}
                value={condition.value}
                min={0}
                style={numericInputStyle}
                placeholder={
                  condition.field === 'studentAge'
                    ? '12'
                    : condition.field === 'pci'
                      ? '1000'
                      : '4000'
                }
                onChange={(value) => updateCondition(index, { value: value ?? '' })}
              />
            )}
            <Button
              disabled={readOnly}
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeCondition(index)}
            />
          </div>

          {index < scheme.conditions.length - 1 && (
            <div className="fas-connector-row">
              <span className="fas-connector-line" />
              <Select
                disabled={readOnly}
                value={scheme.connectors[index] || 'AND'}
                style={{ width: 94 }}
                options={[
                  { value: 'AND', label: 'AND' },
                  { value: 'OR', label: 'OR' },
                ]}
                onChange={(value) =>
                  onChange((draft) => {
                    draft.connectors[index] = value
                    return draft
                  })
                }
              />
              <span className="fas-connector-line" />
            </div>
          )}
        </div>
      ))}

      <Button disabled={readOnly} size="small" icon={<PlusOutlined />} onClick={addCondition}>
        Add condition
      </Button>

      <div className="fas-preview">
        <span className="fas-preview-label">Eligible if </span>
        {previewParts.length ? (
          previewParts.map((part, index) => (
            <span key={`${part}-${index}`}>
              {index > 0 && <strong style={{ color: 'var(--fas-amber)' }}> or </strong>}
              <span>{part}</span>
            </span>
          ))
        ) : (
          <span className="fas-muted">-</span>
        )}
      </div>
    </div>
  )
}

const SubsidyEditor = ({ scheme, readOnly, onChange }) => {
  const addTier = () => {
    onChange((draft) => {
      draft.tiers.push({
        id: rowId('tier'),
        name: '',
        conditionText: '',
        maxPci: '',
        perComponent: false,
        value: '',
        courseValue: '',
        miscValue: '',
      })
      return draft
    })
  }

  const updateTier = (index, patch) => {
    onChange((draft) => {
      draft.tiers[index] = { ...draft.tiers[index], ...patch }
      return draft
    })
  }

  const removeTier = (index) => {
    if (scheme.tiers.length <= 1) {
      message.warning('Need at least 1 tier')
      return
    }

    onChange((draft) => {
      draft.tiers.splice(index, 1)
      return draft
    })
  }

  return (
    <div className="fas-block">
      <div className="fas-block-title">
        <span className="fas-block-number">2</span>
        Subsidy & tiers (how much is covered)
      </div>
      <div className="fas-block-subtitle">
        FAS reduces Course + Misc only. GST is not configured here.
      </div>

      <Radio.Group
        disabled={readOnly}
        optionType="button"
        buttonStyle="solid"
        value={scheme.subsidyType}
        style={{ marginBottom: 12 }}
        onChange={(event) =>
          onChange((draft) => ({ ...draft, subsidyType: event.target.value }))
        }
      >
        <Radio.Button value="percent">% Percent</Radio.Button>
        <Radio.Button value="fixed">$ Fixed</Radio.Button>
      </Radio.Group>

      {scheme.tiers.map((tier, index) => (
        <div className="fas-tier-card" key={tier.id}>
          <div className="fas-tier-grid">
            <Input
              disabled={readOnly}
              placeholder={`Tier ${index + 1}`}
              value={tier.name}
              onChange={(event) => updateTier(index, { name: event.target.value })}
            />
            <Input
              disabled={readOnly}
              placeholder="Condition: PCI ≤ 690"
              value={tier.conditionText}
              onChange={(event) => updateTier(index, { conditionText: event.target.value })}
            />
            <InputNumber
              disabled={readOnly}
              value={tier.maxPci}
              min={0}
              style={numericInputStyle}
              placeholder="Max PCI"
              onChange={(value) => updateTier(index, { maxPci: value ?? '' })}
            />
            <Button
              disabled={readOnly}
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeTier(index)}
            />
          </div>

          <div className="fas-tier-subline">
            {!tier.perComponent && (
              <InputNumber
                disabled={readOnly}
                value={tier.value}
                min={0}
                style={{ width: 150 }}
                placeholder={scheme.subsidyType === 'percent' ? '50' : '500'}
                addonAfter={scheme.subsidyType === 'percent' ? '%' : 'S$'}
                onChange={(value) => updateTier(index, { value: value ?? '' })}
              />
            )}
            <Flex align="center" gap={8}>
              <Switch
                disabled={readOnly}
                checked={tier.perComponent}
                onChange={(checked) => updateTier(index, { perComponent: checked })}
              />
              <span>Set per component (Course / Misc)</span>
            </Flex>
          </div>

          {tier.perComponent && (
            <div className="fas-component-grid">
              <div>
                <label className="fas-field-label">
                  Course Fee {scheme.subsidyType === 'percent' ? '%' : 'S$'}
                </label>
                <InputNumber
                  disabled={readOnly}
                  value={tier.courseValue}
                  min={0}
                  style={numericInputStyle}
                  onChange={(value) => updateTier(index, { courseValue: value ?? '' })}
                />
              </div>
              <div>
                <label className="fas-field-label">
                  Misc Fee {scheme.subsidyType === 'percent' ? '%' : 'S$'}
                </label>
                <InputNumber
                  disabled={readOnly}
                  value={tier.miscValue}
                  min={0}
                  style={numericInputStyle}
                  onChange={(value) => updateTier(index, { miscValue: value ?? '' })}
                />
              </div>
            </div>
          )}

        </div>
      ))}

      <Button disabled={readOnly} size="small" icon={<PlusOutlined />} onClick={addTier}>
        Add tier
      </Button>
    </div>
  )
}

const DocumentsEditor = ({ scheme, readOnly, onChange }) => {
  const updateDocument = (index, patch) => {
    onChange((draft) => {
      draft.documents[index] = { ...draft.documents[index], ...patch }
      return draft
    })
  }

  const addDocument = () => {
    onChange((draft) => {
      draft.documents.push({ id: rowId('doc'), name: '', templateName: '', templateUrl: '' })
      return draft
    })
  }

  const removeDocument = (index) => {
    onChange((draft) => {
      draft.documents.splice(index, 1)
      return draft
    })
  }

  return (
    <div className="fas-block">
      <div className="fas-block-title">
        <span className="fas-block-number">3</span>
        Required supporting documents
      </div>
      <div className="fas-block-subtitle">
        This exact document set appears in F7 for the scheme.
      </div>

      {scheme.documents.map((document, index) => (
        <div className="fas-doc-row" key={document.id}>
          <Input
            disabled={readOnly}
            placeholder="Document name"
            value={document.name}
            onChange={(event) => updateDocument(index, { name: event.target.value })}
          />
          <div className="fas-upload-cell">
            <span className={document.templateName ? 'fas-upload-name' : 'fas-muted'}>
              {document.templateName || 'No template uploaded'}
            </span>
            <Upload
              disabled={readOnly}
              showUploadList={false}
              beforeUpload={(file) => {
                updateDocument(index, { templateName: file.name, templateUrl: '' })
                return false
              }}
            >
              <Button disabled={readOnly} size="small" icon={<UploadOutlined />}>
                Upload
              </Button>
            </Upload>
          </div>
          <Button
            disabled={readOnly}
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeDocument(index)}
          />
        </div>
      ))}

      <Button disabled={readOnly} size="small" icon={<PlusOutlined />} onClick={addDocument}>
        Add document
      </Button>
    </div>
  )
}

export default FasSchemeManagementPage
