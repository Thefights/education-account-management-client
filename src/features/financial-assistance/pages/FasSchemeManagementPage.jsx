import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import { FasSchemeFilterSection } from '@/features/financial-assistance/components/FasFilterSections'
import { FasAdminSchemeTableSection } from '@/features/financial-assistance/components/FasTableSections'
import {
  FAS_CONDITION_FIELD,
  FAS_CONDITION_OPERATOR,
  FAS_FIELD_OPTIONS,
  FAS_LOGICAL_OPERATOR,
  FAS_STATUS,
  countFasConditionGroupItems,
  createEmptyFasCondition,
  createEmptyFasConditionGroup,
  createFasConditionGroupFromFlat,
  isFasConditionGroupValid,
  isFasTextField,
  normalizeFasConditionField,
  normalizeFasConditionGroup,
  serializeFasConditionGroup,
} from '@/features/financial-assistance/data/fasSeedData'
import useFetch from '@/shared/hooks/useFetch'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useReasonConfirm from '@/shared/hooks/useReasonConfirm'
import { ApiUrls } from '@/shared/api/apiUrls'
import { EnumConfig } from '@/shared/config/enumConfig'
import '@/features/financial-assistance/styles/financialAssistance.css'
import {
  buildEligibilityPreviewParts,
  describeCondition,
  statusLabel,
} from '@/features/financial-assistance/utils/fasRules'
import { defaultFasSchemeFilters } from '@/features/financial-assistance/utils/fasTableConfig'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Flex,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
  Tree,
  Typography,
  Upload,
  message,
  theme,
} from 'antd'
import { useMemo, useState } from 'react'

const nationalityOptions = ['Singapore Citizen', 'Permanent Resident', 'Other', 'Any'].map(
  (value) => ({
    value,
    label: value,
  })
)

const numberOperatorOptions = [
  { value: FAS_CONDITION_OPERATOR.Equals, label: '=' },
  { value: FAS_CONDITION_OPERATOR.GreaterThan, label: '>' },
  { value: FAS_CONDITION_OPERATOR.GreaterThanOrEqual, label: '≥' },
  { value: FAS_CONDITION_OPERATOR.LessThan, label: '<' },
  { value: FAS_CONDITION_OPERATOR.LessThanOrEqual, label: '≤' },
  { value: FAS_CONDITION_OPERATOR.Between, label: 'Between' },
]

const textOperatorOptions = [
  { value: FAS_CONDITION_OPERATOR.Equals, label: 'is' },
  { value: FAS_CONDITION_OPERATOR.NotEquals, label: 'is not' },
]

const clone = (value) => JSON.parse(JSON.stringify(value))

const rowId = (prefix) => prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)

const numericInputStyle = { width: '100%' }
const FAS_DOCUMENT_UPLOAD_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const FAS_DOCUMENT_UPLOAD_EXTENSIONS = new Set(['pdf', 'doc', 'docx'])
const FAS_DOCUMENT_UPLOAD_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const isAllowedFasDocumentUpload = (file) => {
  const extension = file.name?.split('.').pop()?.toLowerCase()
  const hasAllowedExtension = FAS_DOCUMENT_UPLOAD_EXTENSIONS.has(extension)
  const hasAllowedMimeType = !file.type || FAS_DOCUMENT_UPLOAD_MIME_TYPES.has(file.type)
  return hasAllowedExtension && hasAllowedMimeType
}

const FAS_SCHEME_STATUS_ID = EnumConfig.FasSchemeStatusId
const FAS_SUBSIDY_TYPE_ID = EnumConfig.FasSubsidyTypeId
const FAS_SUBSIDY_TYPE = EnumConfig.FasSubsidyType

const schemeStatusByApiValue = {
  [FAS_SCHEME_STATUS_ID.Draft]: FAS_STATUS.Draft,
  [FAS_SCHEME_STATUS_ID.Active]: FAS_STATUS.Active,
  [FAS_SCHEME_STATUS_ID.Inactive]: FAS_STATUS.Inactive,
  draft: FAS_STATUS.Draft,
  active: FAS_STATUS.Active,
  inactive: FAS_STATUS.Inactive,
  Draft: FAS_STATUS.Draft,
  Active: FAS_STATUS.Active,
  Inactive: FAS_STATUS.Inactive,
}

const normalizeSchemeStatus = (status) =>
  schemeStatusByApiValue[status] ??
  schemeStatusByApiValue[String(status || '').toLowerCase()] ??
  FAS_STATUS.Draft

const normalizeSubsidyType = (subsidyType) => {
  if (Number(subsidyType) === FAS_SUBSIDY_TYPE_ID.FixedAmount) return FAS_SUBSIDY_TYPE.Fixed
  return String(subsidyType || '').toLowerCase().includes('fixed')
    ? FAS_SUBSIDY_TYPE.Fixed
    : FAS_SUBSIDY_TYPE.Percent
}

const normalizeScheme = (scheme) => {
  const draft = clone(scheme)
  const rootConditionGroup = normalizeFasConditionGroup(
    draft.rootConditionGroup || createFasConditionGroupFromFlat(draft.conditions || [], draft.connectors || [])
  )

  delete draft.conditions
  delete draft.connectors

  return {
    ...draft,
    rootConditionGroup,
    additionalQuestions: draft.additionalQuestions || [],
  }
}

const createDraftScheme = () => {
  const localId = rowId('fas-draft')

  return normalizeScheme({
    id: localId,
    isNew: true,
    schoolId: null,
    createdAt: null,
    name: '',
    description: '',
    status: FAS_STATUS.Draft,
    subsidyType: FAS_SUBSIDY_TYPE.Percent,
    validityMonths: 12,
    linkedCourses: [],
    rootConditionGroup: createFasConditionGroupFromFlat(
      [
        {
          id: rowId('cond'),
          field: FAS_CONDITION_FIELD.Nationality,
          valueText: 'Singapore Citizen',
        },
        {
          id: rowId('cond'),
          field: FAS_CONDITION_FIELD.PerCapitaIncome,
          valueNumber: '',
        },
      ],
      ['AND']
    ),
    tiers: [
      {
        id: rowId('tier'),
        name: 'Tier 1',
        maxPci: '',
        perComponent: false,
        value: '',
        courseValue: '',
        miscValue: '',
      },
    ],
    documents: [
      {
        id: rowId('doc'),
        name: 'Household Income Declaration Form',
        templateName: 'income_declaration_template.docx',
        templateUrl: '/templates/fas/income_declaration_template.docx',
      },
      {
        id: rowId('doc'),
        name: 'Identity Document (NRIC / Birth Cert)',
        templateName: 'identity_proof_guide.docx',
        templateUrl: '/templates/fas/identity_proof_guide.docx',
      },
    ],
    additionalQuestions: [],
  })
}

const mapFrontendSchemeToBackend = (scheme) => {
  const subsidyType =
    scheme.subsidyType === FAS_SUBSIDY_TYPE.Fixed
      ? FAS_SUBSIDY_TYPE_ID.FixedAmount
      : FAS_SUBSIDY_TYPE_ID.Percent
  return {
    schemeName: scheme.name,
    description: scheme.description || '',
    durationInMonths: Number(scheme.validityMonths || 12),
    subsidyType,
    isPerComponent: Boolean(scheme.isPerComponent),
    rootConditionGroup: serializeFasConditionGroup(scheme.rootConditionGroup),
    tiers: (scheme.tiers || []).map((tier, index) => ({
      tierName: tier.name || `Tier ${index + 1}`,
      maxPerCapitaIncome: tier.maxPci !== '' && tier.maxPci != null ? Number(tier.maxPci) : null,
      subsidyValue: tier.value !== '' && tier.value != null ? Number(tier.value) : null,
      courseFeeSubsidyValue: tier.courseValue !== '' && tier.courseValue != null ? Number(tier.courseValue) : null,
      miscFeeSubsidyValue: tier.miscValue !== '' && tier.miscValue != null ? Number(tier.miscValue) : null,
      displayOrder: index + 1,
    })),
    requiredDocuments: (scheme.documents || []).map((doc, index) => ({
      documentName: doc.name,
      templateFileKey: doc.templateUrl || null,
      displayOrder: index + 1,
    })),
    schemeCourses: (scheme.linkedCourses || []).map((courseId) => ({
      courseId: Number(courseId),
    })),
    additionalQuestions: (scheme.additionalQuestions || [])
      .map((question) => ({
        questionText: String(question.questionText || '').trim(),
        isRequired: Boolean(question.isRequired),
      }))
      .filter((question) => question.questionText),
  }
}

const mapBackendSchemeToFrontend = (dto) => {
  return {
    id: dto.id,
    schoolId: dto.schoolId,
    createdAt: dto.createdAt,
    name: dto.schemeName || '',
    description: dto.description || '',
    status: normalizeSchemeStatus(dto.status),
    subsidyType: normalizeSubsidyType(dto.subsidyType),
    validityMonths: dto.durationInMonths || 12,
    linkedCourses: (dto.schemeCourses || []).map(sc => sc.courseId),
    rootConditionGroup: normalizeFasConditionGroup(dto.rootConditionGroup),
    tiers: (dto.tiers || []).map((tier, index) => ({
      id: String(tier.id || index + 1),
      name: tier.tierName || `Tier ${index + 1}`,
      maxPci: tier.maxPerCapitaIncome ?? '',
      value: tier.subsidyValue ?? '',
      courseValue: tier.courseFeeSubsidyValue ?? '',
      miscValue: tier.miscFeeSubsidyValue ?? '',
      displayOrder: tier.displayOrder ?? index + 1,
    })),
    documents: (dto.requiredDocuments || []).map((doc) => ({
      id: String(doc.id),
      name: doc.documentName || '',
      templateUrl: doc.templateFileKey || '',
    })),
    additionalQuestions: (dto.additionalQuestions || []).map((question) => ({
      id: String(question.id),
      questionText: question.questionText || '',
      isRequired: Boolean(question.isRequired),
    })),
  }
}

const FasSchemeManagementPage = () => {
  const confirmReason = useReasonConfirm()
  const [filters, setFilters] = useState(defaultFasSchemeFilters)
  const [sort, setSort] = useState({ key: 'id', direction: 'asc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editingScheme, setEditingScheme] = useState(null)
  const [readOnly, setReadOnly] = useState(false)

  const getBackendSort = (sort) => {
    if (!sort || !sort.key) return undefined
    let key = sort.key
    if (key === 'name') key = 'schemeName'
    return `${key} ${sort.direction}`
  }

  const queryParams = useMemo(() => ({
    page,
    pageSize,
    search: filters.search ? filters.search.trim() : undefined,
    statuses: filters.status && filters.status !== 'all'
      ? [
          filters.status === FAS_STATUS.Draft
            ? FAS_SCHEME_STATUS_ID.Draft
            : filters.status === FAS_STATUS.Active
              ? FAS_SCHEME_STATUS_ID.Active
              : FAS_SCHEME_STATUS_ID.Inactive,
        ]
      : undefined,
    sort: getBackendSort(sort),
  }), [page, pageSize, filters, sort])

  const schemesList = useFetch(ApiUrls.FAS_SCHEME_MANAGEMENT.INDEX, queryParams, [queryParams])
  const coursesData = useFetch(ApiUrls.COURSE_MANAGEMENT.GET_ALL)

  const schemes = useMemo(() => {
    const rawList = schemesList.data?.collection || []
    return rawList.map(mapBackendSchemeToFrontend)
  }, [schemesList.data])

  const courseOptions = useMemo(() => {
    const list = coursesData.data || []
    return list.map(course => ({
      value: course.id,
      label: `[${course.courseCode}] ${course.courseName}`,
    }))
  }, [coursesData.data])

  const schemeRows = useMemo(
    () =>
      schemes.map((scheme) => ({
        ...scheme,
        conditionCount: countFasConditionGroupItems(scheme.rootConditionGroup),
        documentCount: scheme.documents?.length || 0,
      })),
    [schemes]
  )

  const tableData = {
    collection: schemeRows,
    totalCount: schemesList.data?.totalCount || 0,
    totalPage: schemesList.data?.totalPage || 1,
  }

  const createSubmit = useAxiosSubmit({
    url: ApiUrls.FAS_SCHEME_MANAGEMENT.INDEX,
    method: 'POST',
  })

  const updateSubmit = useAxiosSubmit({
    method: 'PUT',
  })

  const statusSubmit = useAxiosSubmit({
    url: ApiUrls.FAS_SCHEME_MANAGEMENT.UPDATE_STATUS,
    method: 'PUT',
  })

  const detailSubmit = useAxiosSubmit({
    method: 'GET',
  })

  const duplicateSubmit = useAxiosSubmit({
    method: 'POST',
  })

  const deleteSubmit = useAxiosSubmit({
    method: 'DELETE',
  })

  const openCreate = () => {
    setEditingScheme(createDraftScheme())
    setReadOnly(false)
  }

  const openEdit = async (scheme, locked = false) => {
    if (!scheme?.id || scheme.isNew) {
      setEditingScheme(normalizeScheme(scheme))
      setReadOnly(locked)
      return
    }

    const response = await detailSubmit.submit({
      overrideUrl: ApiUrls.FAS_SCHEME_MANAGEMENT.DETAIL(scheme.id),
    })
    if (!response) {
      setEditingScheme(normalizeScheme(scheme))
      setReadOnly(locked)
      return
    }

    const detail = response.data || response
    setEditingScheme(normalizeScheme(mapBackendSchemeToFrontend(detail)))
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

  const handleSave = async (scheme, status) => {
    const payload = mapFrontendSchemeToBackend(scheme)
    const isNew = Boolean(scheme.isNew)

    let response
    if (isNew) {
      response = await createSubmit.submit({
        overrideData: payload,
      })
    } else {
      response = await updateSubmit.submit({
        overrideUrl: ApiUrls.FAS_SCHEME_MANAGEMENT.DETAIL(scheme.id),
        overrideData: payload,
      })
    }

    if (response) {
      const savedScheme = response.data || response
      const savedSchemeId = savedScheme.id

      if (status === FAS_STATUS.Active) {
        const reason = await confirmReason({
          title: `Publish ${scheme.name}?`,
          description: 'The scheme will be available for student applications.',
          confirmText: 'Publish',
        })
        if (!reason) return false
        const statusResponse = await statusSubmit.submit({
          overrideData: {
            ids: [Number(savedSchemeId)],
            status: FAS_SCHEME_STATUS_ID.Active,
            reason,
          },
        })
        if (statusResponse) {
          message.success(`Published scheme successfully`)
        } else {
          message.warning(`Scheme saved as Draft, but publishing failed.`)
        }
      } else {
        message.success(isNew ? 'Created scheme draft successfully' : 'Saved scheme draft successfully')
      }

      schemesList.fetch()
      return true
    }
    return false
  }

  const duplicateScheme = async (id) => {
    const response = await duplicateSubmit.submit({
      overrideUrl: ApiUrls.FAS_SCHEME_MANAGEMENT.DUPLICATE(id),
    })
    if (response) {
      const newScheme = mapBackendSchemeToFrontend(response.data || response)
      message.success(`Duplicated scheme successfully`)
      schemesList.fetch()
      openEdit(newScheme, false)
    }
  }

  const deleteDraft = async (scheme) => {
    const reason = await confirmReason({
      title: `Delete draft ${scheme.name}?`,
      description: 'This removes the draft scheme only. Approved application history is preserved.',
      confirmColor: 'error',
      confirmText: 'Delete',
    })
    if (!reason) return
    const response = await deleteSubmit.submit({
      overrideUrl: ApiUrls.FAS_SCHEME_MANAGEMENT.DELETE_SELECTED,
      overrideData: { ids: [Number(scheme.id)], reason },
    })
    if (response) {
      message.success(`Deleted ${scheme.name}`)
      schemesList.fetch()
    }
  }

  const changeStatus = async (scheme, status) => {
    const verb = status === FAS_STATUS.Active ? 'Activate' : 'Deactivate'
    const nextStatus =
      status === FAS_STATUS.Active ? FAS_SCHEME_STATUS_ID.Active : FAS_SCHEME_STATUS_ID.Inactive

    const reason = await confirmReason({
      title: `${verb} ${scheme.name}?`,
      description:
        status === FAS_STATUS.Active
          ? 'The scheme will reappear in F7 Apply.'
          : 'New student applications will be blocked. Existing records remain.',
      confirmColor: status === FAS_STATUS.Active ? 'primary' : 'error',
      confirmText: verb,
    })
    if (!reason) return
    const response = await statusSubmit.submit({
      overrideData: {
        ids: [Number(scheme.id)],
        status: nextStatus,
        reason,
      },
    })
    if (response) {
      message.success(`${scheme.name} is now ${statusLabel(status)}`)
      schemesList.fetch()
    }
  }

  const handleFilter = (values) => {
    setFilters(values)
    setPage(1)
  }

  if (editingScheme) {
    return (
      <SchemeEditor
        scheme={editingScheme}
        isNew={Boolean(editingScheme.isNew)}
        readOnly={readOnly}
        courseOptions={courseOptions}
        onBack={closeEditor}
        onChange={updateScheme}
        onDuplicate={(scheme) => duplicateScheme(scheme.id)}
        onSave={handleSave}
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
          loading={schemesList.loading}
          onFilter={handleFilter}
          onReset={() => handleFilter(defaultFasSchemeFilters)}
        />
        <FasAdminSchemeTableSection
          schemes={tableData.collection}
          loading={schemesList.loading || statusSubmit.loading || detailSubmit.loading || duplicateSubmit.loading || deleteSubmit.loading}
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
          loading={schemesList.loading}
        />

        <div className="fas-note">
          <strong>Link to students:</strong> Active schemes here are the same schemes shown in F7
          Apply. Draft schemes are hidden, and inactive schemes block new applications.
        </div>
      </Flex>
    </Card>
  )
}

const SchemeEditor = ({ scheme, isNew, readOnly, courseOptions, onBack, onChange, onDuplicate, onSave }) => {
  const mode = readOnly ? 'View' : isNew ? 'Create' : 'Edit'

  const save = async (status) => {
    const name = scheme.name.trim()

    if (!name) {
      message.error('Enter scheme name')
      return
    }

    if (!isFasConditionGroupValid(scheme.rootConditionGroup)) {
      message.error('Complete at least 1 eligibility condition')
      return
    }

    if (!scheme.tiers.length) {
      message.error('Add at least 1 tier')
      return
    }

    const tierLimitKeys = new Set()
    const hasDuplicateTierLimit = scheme.tiers.some((tier) => {
      const limitKey =
        tier.maxPci !== '' && tier.maxPci != null && Number.isFinite(Number(tier.maxPci))
          ? String(Number(tier.maxPci))
          : 'none'
      if (tierLimitKeys.has(limitKey)) return true
      tierLimitKeys.add(limitKey)
      return false
    })
    if (hasDuplicateTierLimit) {
      message.error('Tier Max PCI values must be unique to avoid duplicate tier limits.')
      return
    }

    if (status === FAS_STATUS.Active && !Number(scheme.validityMonths)) {
      message.error('Set the FAS duration before publishing')
      return
    }

    const invalidQuestion = (scheme.additionalQuestions || []).find(
      (question) =>
        !String(question.questionText || '').trim() ||
        String(question.questionText || '').trim().length > 500
    )
    if (invalidQuestion) {
      message.error('Complete each additional question using 500 characters or fewer')
      return
    }

    const success = await onSave?.({ ...scheme, name }, status)
    if (success) {
      onBack()
    }
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
              placeholder="e.g. Student Support Scheme 2026"
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
              placeholder="e.g. Supports eligible students with course fees"
              onChange={(event) =>
                onChange((draft) => ({ ...draft, description: event.target.value }))
              }
            />
          </div>

          <div className="fas-form-grid" style={{ marginBottom: 12 }}>
            <div>
              <label className="fas-field-label">FAS ID (auto)</label>
              <Input disabled value={scheme.isNew ? 'Auto-generated' : scheme.id} />
            </div>
            <div>
              <label className="fas-field-label">FAS duration after student applies</label>
              <InputNumber
                disabled={readOnly}
                min={1}
                value={scheme.validityMonths}
                addonAfter="months"
                placeholder="e.g. 12"
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
              placeholder="Select one or more courses"
              style={{ width: '100%' }}
              options={courseOptions}
              onChange={(value) => onChange((draft) => ({ ...draft, linkedCourses: value }))}
            />
          </div>

          <EligibilityEditor scheme={scheme} readOnly={readOnly} onChange={onChange} />
          <SubsidyEditor scheme={scheme} readOnly={readOnly} onChange={onChange} />
          <DocumentsEditor scheme={scheme} readOnly={readOnly} onChange={onChange} />
          <AdditionalQuestionsEditor scheme={scheme} readOnly={readOnly} onChange={onChange} />

          {readOnly ? (
            <div className="fas-actions" style={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => onDuplicate(scheme)}>Duplicate to edit</Button>
              <Button onClick={onBack}>
                Close
              </Button>
            </div>
          ) : (
            <div className="fas-actions" style={{ justifyContent: 'flex-end' }}>
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

const getConditionFieldOptions = () =>
  FAS_FIELD_OPTIONS.map((field) => ({ value: field.value, label: field.label }))

const getConditionOperatorOptions = (field) =>
  isFasTextField(field) ? textOperatorOptions : numberOperatorOptions

const conditionInputMeta = (field) => {
  const normalizedField = normalizeFasConditionField(field)
  if (normalizedField === FAS_CONDITION_FIELD.StudentAge) {
    return { precision: 0, suffix: 'years', placeholder: '12' }
  }
  if (normalizedField === FAS_CONDITION_FIELD.PerCapitaIncome) {
    return { precision: 2, prefix: 'SS$', placeholder: '1000' }
  }
  if (normalizedField === FAS_CONDITION_FIELD.GrossHouseholdIncome) {
    return { precision: 2, prefix: 'SS$', placeholder: '4000' }
  }
  return { precision: 2, placeholder: 'Value' }
}

const buildFasTreeNode = (group, nodeKey = 'root', label = 'Requirement set') => {
  const operatorLabel = group.logicalOperator === FAS_LOGICAL_OPERATOR.Any ? 'ANY' : 'ALL'
  const conditionNodes = (group.conditions || []).map((condition, index) => ({
    key: nodeKey + '-condition-' + (condition.id || index),
    title: describeCondition(condition),
  }))
  const groupNodes = (group.groups || []).map((child, index) =>
    buildFasTreeNode(child, nodeKey + '-group-' + (child.id || index), 'Scenario ' + (index + 1))
  )

  return {
    key: nodeKey,
    title: (
      <Space size={8}>
        <Tag color={group.logicalOperator === FAS_LOGICAL_OPERATOR.Any ? 'geekblue' : 'blue'}>
          {operatorLabel}
        </Tag>
        <Typography.Text strong>{label}</Typography.Text>
      </Space>
    ),
    children: [...conditionNodes, ...groupNodes],
  }
}

const FasConditionPreviewTree = ({ value }) => {
  const group = normalizeFasConditionGroup(value)
  return (
    <Tree
      selectable={false}
      showLine
      defaultExpandAll
      treeData={[buildFasTreeNode(group)]}
      style={{ background: 'transparent' }}
    />
  )
}

const FasSectionShell = ({ title, subtitle, accentColor, onDelete, readOnly, children }) => {
  const { token } = theme.useToken()

  return (
    <div
      style={{
        border: '1px solid ' + token.colorBorderSecondary,
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
        padding: 16,
      }}
    >
      <Flex justify="space-between" align="flex-start" gap={12}>
        <Flex gap={10} align="flex-start">
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: accentColor,
              color: token.colorWhite,
              flex: '0 0 auto',
            }}
          >
            <ApartmentOutlined />
          </span>
          <div>
            <Typography.Text strong>{title}</Typography.Text>
            {subtitle && (
              <Typography.Paragraph type="secondary" style={{ margin: '2px 0 0' }}>
                {subtitle}
              </Typography.Paragraph>
            )}
          </div>
        </Flex>
        {onDelete && (
          <Button
            danger
            disabled={readOnly}
            icon={<DeleteOutlined />}
            onClick={onDelete}
            aria-label="Delete scenario"
          />
        )}
      </Flex>
      <div style={{ marginTop: 14 }}>{children}</div>
    </div>
  )
}

const FasConditionRow = ({ condition, index, readOnly, onChange, onDelete }) => {
  const field = normalizeFasConditionField(condition.field)
  const isText = isFasTextField(field)
  const isBetween = condition.operator === FAS_CONDITION_OPERATOR.Between
  const inputMeta = conditionInputMeta(field)

  return (
    <div className="fas-elig-row" style={{ alignItems: 'flex-start' }}>
      <Row gutter={[10, 10]} style={{ flex: 1 }}>
        <Col xs={24} lg={8}>
          <Select
            disabled={readOnly}
            value={field}
            placeholder="Select field"
            options={getConditionFieldOptions()}
            style={{ width: '100%' }}
            onChange={(nextField) => {
              const nextIsText = isFasTextField(nextField)
              onChange({
                ...condition,
                field: nextField,
                operator: nextIsText
                  ? FAS_CONDITION_OPERATOR.Equals
                  : FAS_CONDITION_OPERATOR.LessThanOrEqual,
                valueText: nextIsText ? 'Singapore Citizen' : null,
                valueNumber: null,
                valueNumberTo: null,
              })
            }}
          />
        </Col>
        <Col xs={24} md={12} lg={isBetween ? 4 : 5}>
          <Select
            disabled={readOnly}
            value={condition.operator}
            placeholder="Select operator"
            options={getConditionOperatorOptions(field)}
            style={{ width: '100%' }}
            onChange={(operator) =>
              onChange({
                ...condition,
                operator,
                valueNumberTo:
                  operator === FAS_CONDITION_OPERATOR.Between ? condition.valueNumberTo : null,
              })
            }
          />
        </Col>
        <Col xs={24} md={12} lg={isBetween ? 5 : 9}>
          {isText ? (
            <Select
              disabled={readOnly}
              value={condition.valueText}
              placeholder="Select value"
              options={nationalityOptions}
              style={{ width: '100%' }}
              onChange={(valueText) => onChange({ ...condition, valueText })}
            />
          ) : (
            <InputNumber
              disabled={readOnly}
              min={0}
              value={condition.valueNumber}
              precision={inputMeta.precision}
              prefix={inputMeta.prefix}
              suffix={inputMeta.suffix}
              placeholder={isBetween ? 'From' : inputMeta.placeholder}
              style={{ width: '100%' }}
              onChange={(valueNumber) => onChange({ ...condition, valueNumber })}
            />
          )}
        </Col>
        {isBetween && !isText && (
          <Col xs={24} md={12} lg={5}>
            <InputNumber
              disabled={readOnly}
              min={0}
              value={condition.valueNumberTo}
              precision={inputMeta.precision}
              prefix={inputMeta.prefix}
              suffix={inputMeta.suffix}
              placeholder="To"
              style={{ width: '100%' }}
              onChange={(valueNumberTo) => onChange({ ...condition, valueNumberTo })}
            />
          </Col>
        )}
      </Row>
      <Button
        disabled={readOnly}
        danger
        icon={<DeleteOutlined />}
        aria-label={'Delete condition ' + (index + 1)}
        onClick={onDelete}
      />
    </div>
  )
}

const FasConditionGroupEditor = ({ group, depth, groupNumber, readOnly, onChange, onDelete }) => {
  const { token } = theme.useToken()
  const isRoot = depth === 1
  const conditions = group.conditions || []
  const groups = group.groups || []

  const updateCondition = (index, nextCondition) =>
    onChange({
      ...group,
      conditions: conditions.map((condition, itemIndex) =>
        itemIndex === index ? nextCondition : condition
      ),
    })

  return (
    <FasSectionShell
      title={isRoot ? 'Eligibility requirements' : 'Scenario ' + groupNumber}
      subtitle={
        isRoot
          ? 'Use the same ALL / ANY condition pattern as Top-up rules.'
          : 'A sub-scenario groups related conditions together.'
      }
      accentColor={isRoot ? token.colorPrimary : token.colorInfo}
      readOnly={readOnly}
      onDelete={onDelete}
    >
      <Flex vertical gap={12}>
        <Flex align="center" gap={8} wrap="wrap">
          <Typography.Text>Matching mode</Typography.Text>
          <Select
            disabled={readOnly}
            value={group.logicalOperator}
            placeholder="Select matching mode"
            style={{ minWidth: 280 }}
            options={[
              {
                value: FAS_LOGICAL_OPERATOR.All,
                label: isRoot
                  ? 'Applicant must match all requirements'
                  : 'Must match all conditions in this scenario',
              },
              {
                value: FAS_LOGICAL_OPERATOR.Any,
                label: isRoot
                  ? 'Applicant can match any requirement'
                  : 'Can match any condition in this scenario',
              },
            ]}
            onChange={(logicalOperator) => onChange({ ...group, logicalOperator })}
          />
          <Tooltip title="ALL works like AND. ANY works like OR. Sub-scenarios can group related conditions.">
            <QuestionCircleOutlined style={{ color: token.colorTextSecondary }} />
          </Tooltip>
        </Flex>

        {conditions.map((condition, index) => (
          <FasConditionRow
            key={condition.id || 'condition-' + index}
            condition={condition}
            index={index}
            readOnly={readOnly}
            onChange={(nextCondition) => updateCondition(index, nextCondition)}
            onDelete={() =>
              onChange({
                ...group,
                conditions: conditions.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          />
        ))}

        {groups.map((child, index) => (
          <FasConditionGroupEditor
            key={child.id || 'group-' + index}
            group={child}
            depth={depth + 1}
            groupNumber={index + 1}
            readOnly={readOnly}
            onChange={(nextChild) =>
              onChange({
                ...group,
                groups: groups.map((item, itemIndex) => (itemIndex === index ? nextChild : item)),
              })
            }
            onDelete={() =>
              onChange({
                ...group,
                groups: groups.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          />
        ))}

        {!readOnly && (
          <Space wrap>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                onChange({
                  ...group,
                  conditions: [...conditions, { ...createEmptyFasCondition(), id: rowId('cond') }],
                })
              }
            >
              {isRoot ? 'Add requirement' : 'Add scenario condition'}
            </Button>
            {isRoot && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() =>
                  onChange({
                    ...group,
                    groups: [...groups, { ...createEmptyFasConditionGroup(), id: rowId('group') }],
                  })
                }
              >
                Add sub-scenario
              </Button>
            )}
          </Space>
        )}

        {!conditions.length && !groups.length && (
          <Typography.Text type="danger">Add at least one condition.</Typography.Text>
        )}
      </Flex>
    </FasSectionShell>
  )
}

const EligibilityEditor = ({ scheme, readOnly, onChange }) => {
  const { token } = theme.useToken()
  const rootConditionGroup = normalizeFasConditionGroup(scheme.rootConditionGroup)
  const previewParts = buildEligibilityPreviewParts(rootConditionGroup)

  const updateRootGroup = (nextGroup) => {
    onChange((draft) => {
      draft.rootConditionGroup = normalizeFasConditionGroup(nextGroup)
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
        Build nested conditions with the same ALL / ANY structure used by Top-up rules.
      </div>

      <FasConditionGroupEditor
        group={rootConditionGroup}
        depth={1}
        groupNumber={1}
        readOnly={readOnly}
        onChange={updateRootGroup}
      />

      {isFasConditionGroupValid(rootConditionGroup) && (
        <div
          className="fas-preview"
          style={{
            border: '1px solid ' + token.colorBorderSecondary,
            background: token.colorBgContainer,
          }}
        >
          <Flex vertical gap={10}>
            <div>
              <span className="fas-preview-label">Eligible if </span>
              {previewParts.length ? (
                previewParts.map((part, index) => (
                  <span key={part + '-' + index}>
                    {index > 0 && <strong style={{ color: 'var(--fas-amber)' }}> or </strong>}
                    <span>{part}</span>
                  </span>
                ))
              ) : (
                <span className="fas-muted">-</span>
              )}
            </div>
            <FasConditionPreviewTree value={rootConditionGroup} />
          </Flex>
        </div>
      )}
    </div>
  )
}

const SubsidyEditor = ({ scheme, readOnly, onChange }) => {
  const addTier = () => {
    onChange((draft) => {
      draft.tiers.push({
        id: rowId('tier'),
        name: '',
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
        <Radio.Button value="fixed">S$ Fixed</Radio.Button>
      </Radio.Group>

      {scheme.tiers.map((tier, index) => (
        <div className="fas-tier-card" key={tier.id}>
          <div className="fas-tier-grid">
            <Input
              disabled={readOnly}
              placeholder={`e.g. Tier ${index + 1}`}
              value={tier.name}
              onChange={(event) => updateTier(index, { name: event.target.value })}
            />
            <InputNumber
              disabled={readOnly}
              value={tier.maxPci}
              min={0}
              style={numericInputStyle}
              addonBefore="PCI ≤"
              placeholder="e.g. 690"
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
                placeholder={scheme.subsidyType === 'percent' ? 'e.g. 50' : 'e.g. 500'}
                addonAfter={scheme.subsidyType === 'percent' ? '%' : 'SS$'}
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
                  Course Fee {scheme.subsidyType === 'percent' ? '%' : 'SS$'}
                </label>
                <InputNumber
                  disabled={readOnly}
                  value={tier.courseValue}
                  min={0}
                  style={numericInputStyle}
                  placeholder={scheme.subsidyType === 'percent' ? 'e.g. 50' : 'e.g. 500'}
                  onChange={(value) => updateTier(index, { courseValue: value ?? '' })}
                />
              </div>
              <div>
                <label className="fas-field-label">
                  Misc Fee {scheme.subsidyType === 'percent' ? '%' : 'SS$'}
                </label>
                <InputNumber
                  disabled={readOnly}
                  value={tier.miscValue}
                  min={0}
                  style={numericInputStyle}
                  placeholder={scheme.subsidyType === 'percent' ? 'e.g. 50' : 'e.g. 500'}
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
            placeholder="e.g. Household income statement"
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
              accept={FAS_DOCUMENT_UPLOAD_ACCEPT}
              maxCount={1}
              beforeUpload={(file) => {
                if (!isAllowedFasDocumentUpload(file)) {
                  message.error('Upload PDF, DOC, or DOCX files only.')
                  return Upload.LIST_IGNORE
                }
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

const AdditionalQuestionsEditor = ({ scheme, readOnly, onChange }) => {
  const questions = scheme.additionalQuestions || []

  const updateQuestion = (index, patch) => {
    onChange((draft) => {
      const existingQuestions = draft.additionalQuestions || []
      existingQuestions[index] = { ...existingQuestions[index], ...patch }
      draft.additionalQuestions = existingQuestions
      return draft
    })
  }

  const addQuestion = () => {
    onChange((draft) => {
      draft.additionalQuestions = [
        ...(draft.additionalQuestions || []),
        { id: rowId('question'), questionText: '', isRequired: false },
      ]
      return draft
    })
  }

  const removeQuestion = (index) => {
    onChange((draft) => {
      draft.additionalQuestions = (draft.additionalQuestions || []).filter(
        (_, itemIndex) => itemIndex !== index
      )
      return draft
    })
  }

  return (
    <div className="fas-block">
      <div className="fas-block-title">
        <span className="fas-block-number">4</span>
        Additional questions
      </div>
      <div className="fas-block-subtitle">
        These questions are shown to account holders when they apply for this scheme.
      </div>

      <Flex vertical gap={10}>
        {questions.map((question, index) => (
          <div className="fas-doc-row" key={question.id || `question-${index}`}>
            <Input.TextArea
              disabled={readOnly}
              rows={2}
              maxLength={500}
              showCount
              placeholder="e.g. Briefly explain why financial assistance is needed."
              value={question.questionText}
              onChange={(event) => updateQuestion(index, { questionText: event.target.value })}
            />
            <Flex align="center" gap={8} style={{ minWidth: 130 }}>
              <Switch
                disabled={readOnly}
                checked={Boolean(question.isRequired)}
                onChange={(isRequired) => updateQuestion(index, { isRequired })}
              />
              <span>Required</span>
            </Flex>
            <Button
              disabled={readOnly}
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeQuestion(index)}
            />
          </div>
        ))}
      </Flex>

      {!questions.length && <div className="fas-muted">No additional questions configured.</div>}

      <Button
        disabled={readOnly}
        size="small"
        icon={<PlusOutlined />}
        style={{ marginTop: 10 }}
        onClick={addQuestion}
      >
        Add question
      </Button>
    </div>
  )
}

export default FasSchemeManagementPage
