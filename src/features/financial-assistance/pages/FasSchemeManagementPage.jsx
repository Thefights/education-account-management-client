import FasConditionEditor from '@/features/financial-assistance/components/FasConditionEditor'
import { getScenarioErrors } from '@/features/financial-assistance/utils/fasConditionValidation'
import FasStatusTag from '@/features/financial-assistance/components/FasStatusTag'
import {
  buildSchemePayload,
  createEmptyScheme,
  createEmptyTier,
  formatTierRange,
  getSchemeFormValue,
  validateTierConfiguration,
} from '@/features/financial-assistance/utils/fasFormUtil'
import { ApiUrls } from '@/shared/api/apiUrls'
import GenericFilterSection from '@/shared/components/filters/GenericFilterSection'
import { GenericTablePagination } from '@/shared/components/generals/GenericPagination'
import ActionMenu from '@/shared/components/generals/ActionMenu'
import GenericTable from '@/shared/components/tables/GenericTable'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useEnum from '@/shared/hooks/useEnum'
import useFieldRenderer from '@/shared/hooks/useFieldRenderer'
import useFetch from '@/shared/hooks/useFetch'
import useForm from '@/shared/hooks/useForm'
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  PoweroffOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Typography,
  Upload,
  message,
} from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAS_STATUS = EnumConfig.FasSchemeStatus
const FAS_SUBSIDY_TYPE = EnumConfig.FasSubsidyType
const FAS_TIER_INCOME_BASIS = EnumConfig.FasTierIncomeBasis
const defaultFilters = { search: '', statuses: [] }

const sortFields = {
  schemeCode: 'schemeCode',
  schemeName: 'schemeName',
  status: 'status',
  durationInMonths: 'durationInMonths',
  createdAt: 'createdAt',
}

const SchemeFilters = ({ value, loading, onApply }) => {
  const { fasSchemeStatusOptions } = useEnum()
  const { values, handleChange, setField, registerRef, reset } = useForm(value)
  const { renderField } = useFieldRenderer(values, setField, handleChange, registerRef)
  const fields = useMemo(
    () => [
      {
        key: 'search',
        title: 'Search by scheme code or scheme name',
        label: 'Search by scheme code or scheme name',
        type: 'search',
        required: false,
        reserveLabelSpace: true,
      },
      {
        key: 'statuses',
        title: 'Status',
        type: 'multi-check-dropdown',
        options: fasSchemeStatusOptions,
        required: false,
        placeholder: 'All',
        selectAllText: 'Select all',
        searchPlaceholder: 'Input keyword',
        cancelText: 'Cancel',
        okText: 'OK',
        selectedText: (count) => `${count} items`,
      },
    ],
    [fasSchemeStatusOptions]
  )

  return (
    <GenericFilterSection
      fields={fields}
      values={values}
      renderField={renderField}
      reset={reset}
      resetValues={defaultFilters}
      onReset={() => onApply(defaultFilters)}
      onFilter={onApply}
      loading={loading}
      getFieldColProps={(_, index) =>
        index === 0 ? { xs: 24, md: 14, lg: 16 } : { xs: 24, md: 10, lg: 8 }
      }
    />
  )
}

const TierEditor = ({ scheme, setScheme, readOnly }) => {
  const { fasTierIncomeBasisOptions } = useEnum()
  const updateTier = (index, patch) =>
    setScheme((current) => ({
      ...current,
      tiers: current.tiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, ...patch } : tier
      ),
    }))

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {(scheme.tiers || []).map((tier, index) => {
        const usesPci =
          tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaIncome ||
          tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaOrGrossHouseholdIncome
        const usesGross =
          tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.GrossHouseholdIncome ||
          tier.tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaOrGrossHouseholdIncome
        return (
          <Card
            key={tier.id || index}
            size="small"
            title={`${tier.tierName || `Tier ${index + 1}`} — ${formatTierRange(tier)}`}
            extra={
              !readOnly && (
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  disabled={scheme.tiers.length === 1}
                  onClick={() =>
                    setScheme((current) => ({
                      ...current,
                      tiers: current.tiers.filter((_, tierIndex) => tierIndex !== index),
                    }))
                  }
                />
              )
            }
          >
            <Flex gap={12} wrap="wrap">
              <Input
                value={tier.tierName}
                disabled={readOnly}
                style={{ width: 180 }}
                placeholder="Tier name"
                onChange={(event) => updateTier(index, { tierName: event.target.value })}
              />
              <Select
                value={tier.tierIncomeBasis}
                disabled={readOnly}
                style={{ width: 260 }}
                options={fasTierIncomeBasisOptions}
                onChange={(tierIncomeBasis) => {
                  const nextUsesPci =
                    tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaIncome ||
                    tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaOrGrossHouseholdIncome
                  const nextUsesGross =
                    tierIncomeBasis === FAS_TIER_INCOME_BASIS.GrossHouseholdIncome ||
                    tierIncomeBasis === FAS_TIER_INCOME_BASIS.PerCapitaOrGrossHouseholdIncome
                  updateTier(index, {
                    tierIncomeBasis,
                    minPerCapitaIncome: nextUsesPci ? tier.minPerCapitaIncome : '',
                    maxPerCapitaIncome: nextUsesPci ? tier.maxPerCapitaIncome : '',
                    minGrossHouseholdIncome: nextUsesGross ? tier.minGrossHouseholdIncome : '',
                    maxGrossHouseholdIncome: nextUsesGross ? tier.maxGrossHouseholdIncome : '',
                  })
                }}
              />
              {usesPci && (
                <>
                  <InputNumber
                    value={tier.minPerCapitaIncome}
                    disabled={readOnly}
                    min={0}
                    prefix="S$"
                    placeholder="Min PCI"
                    onChange={(value) => updateTier(index, { minPerCapitaIncome: value })}
                  />
                  <InputNumber
                    value={tier.maxPerCapitaIncome}
                    disabled={readOnly}
                    min={0}
                    prefix="S$"
                    placeholder="Max PCI (blank = no limit)"
                    onChange={(value) => updateTier(index, { maxPerCapitaIncome: value ?? '' })}
                  />
                </>
              )}
              {usesGross && (
                <>
                  <InputNumber
                    value={tier.minGrossHouseholdIncome}
                    disabled={readOnly}
                    min={0}
                    prefix="S$"
                    placeholder="Min gross income"
                    onChange={(value) => updateTier(index, { minGrossHouseholdIncome: value })}
                  />
                  <InputNumber
                    value={tier.maxGrossHouseholdIncome}
                    disabled={readOnly}
                    min={0}
                    prefix="S$"
                    placeholder="Max gross (blank = no limit)"
                    onChange={(value) => updateTier(index, { maxGrossHouseholdIncome: value ?? '' })}
                  />
                </>
              )}
              {scheme.isPerComponent ? (
                <>
                  <InputNumber
                    value={tier.courseFeeSubsidyValue}
                    disabled={readOnly}
                    min={0}
                    max={scheme.subsidyType === FAS_SUBSIDY_TYPE.Percent ? 100 : undefined}
                    placeholder="Course fee subsidy"
                    onChange={(value) => updateTier(index, { courseFeeSubsidyValue: value })}
                  />
                  <InputNumber
                    value={tier.miscFeeSubsidyValue}
                    disabled={readOnly}
                    min={0}
                    max={scheme.subsidyType === FAS_SUBSIDY_TYPE.Percent ? 100 : undefined}
                    placeholder="Misc fee subsidy"
                    onChange={(value) => updateTier(index, { miscFeeSubsidyValue: value })}
                  />
                </>
              ) : (
                <InputNumber
                  value={tier.subsidyValue}
                  disabled={readOnly}
                  min={0}
                  max={scheme.subsidyType === FAS_SUBSIDY_TYPE.Percent ? 100 : undefined}
                  placeholder="Subsidy"
                  onChange={(value) => updateTier(index, { subsidyValue: value })}
                />
              )}
            </Flex>
          </Card>
        )
      })}
      {!readOnly && (
        <Button
          icon={<PlusOutlined />}
          onClick={() =>
            setScheme((current) => ({
              ...current,
              tiers: [...current.tiers, createEmptyTier(current.tiers.length)],
            }))
          }
        >
          Add tier
        </Button>
      )}
    </Space>
  )
}

const SchemeDialog = ({ open, scheme, setScheme, readOnly, loading, courseOptions, onClose, onSave }) => {
  const { fasSubsidyTypeOptions } = useEnum()
  return (
  <Modal
    open={open}
    width={1100}
    title={readOnly ? 'FAS scheme details' : scheme.id ? 'Update FAS scheme' : 'Create FAS scheme'}
    okText={scheme.id ? 'Update' : 'Create'}
    okButtonProps={{ loading, disabled: readOnly }}
    onCancel={onClose}
    onOk={onSave}
    footer={readOnly ? <Button onClick={onClose}>Close</Button> : undefined}
    destroyOnHidden
  >
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Flex gap={12} wrap="wrap">
        <Input
          value={scheme.schemeName}
          disabled={readOnly}
          style={{ flex: 1, minWidth: 260 }}
          placeholder="Scheme name"
          onChange={(event) => setScheme((current) => ({ ...current, schemeName: event.target.value }))}
        />
        <InputNumber
          value={scheme.durationInMonths}
          disabled={readOnly}
          min={1}
          addonAfter="months"
          onChange={(durationInMonths) => setScheme((current) => ({ ...current, durationInMonths }))}
        />
        <Select
          value={scheme.subsidyType}
          disabled={readOnly}
          style={{ width: 180 }}
          options={fasSubsidyTypeOptions}
          onChange={(subsidyType) => setScheme((current) => ({ ...current, subsidyType }))}
        />
        <Space>
          <Typography.Text>Per component</Typography.Text>
          <Switch
            checked={scheme.isPerComponent}
            disabled={readOnly}
            onChange={(isPerComponent) => setScheme((current) => ({ ...current, isPerComponent }))}
          />
        </Space>
      </Flex>
      <Input.TextArea
        value={scheme.description}
        disabled={readOnly}
        rows={3}
        placeholder="Description"
        onChange={(event) => setScheme((current) => ({ ...current, description: event.target.value }))}
      />
      <Divider orientation="left">Eligibility tree</Divider>
      <FasConditionEditor
        value={scheme.rootConditionGroup}
        readOnly={readOnly}
        onChange={(rootConditionGroup) => setScheme((current) => ({ ...current, rootConditionGroup }))}
      />
      <Divider orientation="left">Tiers</Divider>
      <TierEditor scheme={scheme} setScheme={setScheme} readOnly={readOnly} />
      <Divider orientation="left">Required documents</Divider>
      {(scheme.requiredDocuments || []).map((document, index) => (
        <Flex key={document.id || index} gap={8} align="center" wrap="wrap">
          <Input
            value={document.documentName}
            disabled={readOnly}
            style={{ width: 280 }}
            placeholder="Document name"
            onChange={(event) =>
              setScheme((current) => ({
                ...current,
                requiredDocuments: current.requiredDocuments.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, documentName: event.target.value } : item
                ),
              }))
            }
          />
          <Upload
            maxCount={1}
            showUploadList={false}
            disabled={readOnly}
            beforeUpload={(file) => {
              setScheme((current) => ({
                ...current,
                requiredDocuments: current.requiredDocuments.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, templateFile: file, templateFileName: file.name } : item
                ),
              }))
              return false
            }}
          >
            <Button disabled={readOnly}>Choose template file</Button>
          </Upload>
          <Typography.Text type="secondary">
            {document.templateFileName || document.templateFileKey || 'No template'}
          </Typography.Text>
          {!readOnly && (
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() =>
                setScheme((current) => ({
                  ...current,
                  requiredDocuments: current.requiredDocuments.filter((_, itemIndex) => itemIndex !== index),
                }))
              }
            />
          )}
        </Flex>
      ))}
      {!readOnly && (
        <Button
          icon={<PlusOutlined />}
          onClick={() =>
            setScheme((current) => ({
              ...current,
              requiredDocuments: [
                ...current.requiredDocuments,
                { id: `doc-${Date.now()}`, documentName: '', templateFileKey: '', templateFileName: '', templateFile: null },
              ],
            }))
          }
        >
          Add required document
        </Button>
      )}
      <Divider orientation="left">Courses</Divider>
      <Select
        mode="multiple"
        value={(scheme.schemeCourses || []).map((item) => item.courseId)}
        disabled={readOnly}
        options={courseOptions}
        style={{ width: '100%' }}
        placeholder="Select courses"
        onChange={(courseIds) =>
          setScheme((current) => ({
            ...current,
            schemeCourses: courseIds.map((courseId) => ({ courseId })),
          }))
        }
      />
      <Divider orientation="left">Additional questions</Divider>
      {(scheme.additionalQuestions || []).map((question, index) => (
        <Flex key={question.id || index} gap={8} align="center">
          <Input
            value={question.questionText}
            disabled={readOnly}
            placeholder="Question"
            onChange={(event) =>
              setScheme((current) => ({
                ...current,
                additionalQuestions: current.additionalQuestions.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, questionText: event.target.value } : item
                ),
              }))
            }
          />
          <Checkbox
            checked={question.isRequired}
            disabled={readOnly}
            onChange={(event) =>
              setScheme((current) => ({
                ...current,
                additionalQuestions: current.additionalQuestions.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, isRequired: event.target.checked } : item
                ),
              }))
            }
          >
            Required
          </Checkbox>
          {!readOnly && (
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() =>
                setScheme((current) => ({
                  ...current,
                  additionalQuestions: current.additionalQuestions.filter((_, itemIndex) => itemIndex !== index),
                }))
              }
            />
          )}
        </Flex>
      ))}
      {!readOnly && (
        <Button
          icon={<PlusOutlined />}
          onClick={() =>
            setScheme((current) => ({
              ...current,
              additionalQuestions: [
                ...current.additionalQuestions,
                { id: `question-${Date.now()}`, questionText: '', isRequired: false },
              ],
            }))
          }
        >
          Add question
        </Button>
      )}
    </Space>
  </Modal>
  )
}

const FasSchemeManagementPage = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialog, setDialog] = useState(null)
  const [scheme, setScheme] = useState(createEmptyScheme())

  const params = useMemo(
    () => ({
      search: filters.search || undefined,
      statuses: filters.statuses?.length ? filters.statuses : undefined,
      sort: `${sortFields[sort.key] || sort.key} ${sort.direction}`,
      page,
      pageSize,
    }),
    [filters, sort, page, pageSize]
  )
  const schemes = useFetch(ApiUrls.FAS_SCHEME_MANAGEMENT.INDEX, params, [params])
  const courses = useFetch(ApiUrls.COURSE_MANAGEMENT.GET_ALL, {}, [])
  const pageData = schemes.data || { collection: [], totalCount: 0, totalPage: 0 }
  const courseOptions = useMemo(
    () =>
      (courses.data?.collection || courses.data || []).map((course) => ({
        value: course.id,
        label: [course.courseCode, course.courseName || course.name].filter(Boolean).join(' — '),
      })),
    [courses.data]
  )

  const detail = useAxiosSubmit({ method: 'GET' })
  const update = useAxiosSubmit({ method: 'PUT' })
  const duplicate = useAxiosSubmit({ method: 'POST' })
  const updateStatus = useAxiosSubmit({ url: ApiUrls.FAS_SCHEME_MANAGEMENT.UPDATE_STATUS, method: 'PUT' })

  const openScheme = async (row, readOnly) => {
    if (!row) {
      navigate(routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.SCHEME_CREATE))
      return
    }
    const response = await detail.submit({ overrideUrl: ApiUrls.FAS_SCHEME_MANAGEMENT.DETAIL(row.id) })
    if (!response) return
    setScheme(getSchemeFormValue(response.data))
    setDialog({ readOnly })
  }

  const handleSave = async () => {
    if (!scheme.schemeName?.trim()) return message.error('Scheme name is required.')
    const conditionErrors = (scheme.rootConditionGroup?.groups || []).flatMap(getScenarioErrors)
    if (conditionErrors.length) return message.error(conditionErrors[0])
    const tierErrors = validateTierConfiguration(scheme.tiers, scheme.subsidyType)
    if (tierErrors.length) return message.error(tierErrors[0])
    const payload = buildSchemePayload(scheme)
    const response = scheme.id
      ? await update.submit({
          overrideUrl: ApiUrls.FAS_SCHEME_MANAGEMENT.DETAIL(scheme.id),
          overrideData: payload,
        })
      : undefined
    if (!response) return
    setDialog(null)
    await schemes.fetch()
  }

  const handleStatus = async (row) => {
    const next = row.status === FAS_STATUS.Active ? FAS_STATUS.Inactive : FAS_STATUS.Active
    const response = await updateStatus.submit({
      overrideData: { ids: [row.id], status: next, reason: `Set FAS scheme to ${next}.` },
    })
    if (response) await schemes.fetch()
  }

  const fields = [
    { key: 'schemeCode', title: 'Scheme code', sortable: true },
    { key: 'schemeName', title: 'Scheme name', sortable: true },
    { key: 'durationInMonths', title: 'Duration (months)', sortable: true, isNumeric: true },
    { key: 'status', title: 'Status', sortable: true, render: (value) => <FasStatusTag status={value} /> },
    {
      key: 'tiers',
      title: 'Tiers',
      render: (value) => (value || []).map((tier) => tier.tierName).join(', '),
    },
    {
      key: 'actions',
      title: '',
      width: 60,
      render: (_, row) => (
        <ActionMenu
          actions={[
            { title: 'View', icon: <EyeOutlined />, onClick: () => openScheme(row, true) },
            { title: 'Update', icon: <EditOutlined />, onClick: () => openScheme(row, false) },
            {
              title: 'Duplicate',
              icon: <CopyOutlined />,
              onClick: async () => {
                const response = await duplicate.submit({
                  overrideUrl: ApiUrls.FAS_SCHEME_MANAGEMENT.DUPLICATE(row.id),
                })
                if (response) await schemes.fetch()
              },
            },
            { title: row.status === FAS_STATUS.Active ? 'Deactivate' : 'Activate', icon: <PoweroffOutlined />, onClick: () => handleStatus(row) },
          ]}
        />
      ),
    },
  ]

  return (
    <Card>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center">
          <Typography.Title level={4} style={{ margin: 0 }}>FAS Scheme Management</Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openScheme(null, false)}>Create scheme</Button>
        </Flex>
        <SchemeFilters
          value={filters}
          loading={schemes.loading}
          onApply={(value) => {
            setFilters(value)
            setPage(1)
          }}
        />
        <GenericTable
          data={pageData.collection}
          fields={fields}
          rowKey="id"
          sort={sort}
          setSort={setSort}
          loading={schemes.loading}
        />
        <GenericTablePagination
          totalCount={pageData.totalCount}
          totalPage={pageData.totalPage}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          loading={schemes.loading}
        />
      </Flex>
      {dialog && (
        <SchemeDialog
          open
          scheme={scheme}
          setScheme={setScheme}
          readOnly={dialog.readOnly}
          loading={update.loading}
          courseOptions={courseOptions}
          onClose={() => setDialog(null)}
          onSave={handleSave}
        />
      )}
    </Card>
  )
}

export default FasSchemeManagementPage
