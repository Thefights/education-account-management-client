import {
  FAS_APPLICATION_STATUS,
  MOCK_ACCOUNT_HOLDER,
} from '@/features/financial-assistance/data/fasSeedData'
import {
  buildAvailableSchemesParams,
  buildSubmitFasApplicationPayload,
  normalizeApiApplicationDetail,
  normalizeApiApplicationPage,
  normalizeApiAvailableSchemesResponse,
  normalizeFasProfileFromApi,
  normalizeFasSnapshotProfile,
} from '@/features/financial-assistance/api/accountHolderFasApi'
import '@/features/financial-assistance/styles/financialAssistance.css'
import {
  buildEligibilityPreview,
  collectConditionFields,
  describeTierSubsidy,
  formatTierConditionText,
  getSuggestedTier,
  getPci,
  isApprovedApplicationExpired,
} from '@/features/financial-assistance/utils/fasRules'
import { ApiUrls } from '@/shared/api/apiUrls'
import { routeUrls } from '@/shared/config/routeUrls'
import useFetch from '@/shared/hooks/useFetch'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  ArrowLeftOutlined,
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DownOutlined,
  FileTextOutlined,
  IdcardOutlined,
  PaperClipOutlined,
  UpOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Button, Input, InputNumber, Select, Upload, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const nationalityOptions = ['Singapore Citizen', 'Permanent Resident', 'Other'].map((value) => ({
  value,
  label: value,
}))

const parentNationalityOptions = ['Singapore Citizen', 'Other'].map((value) => ({
  value,
  label: value,
}))

const noExpandedSchemeId = '__none__'
const applicationListParams = { Page: 1, PageSize: 100, Sort: 'createdAt desc' }
const isBlockingApplication = (application) =>
  application?.displayStatus === FAS_APPLICATION_STATUS.Pending ||
  (application?.displayStatus === FAS_APPLICATION_STATUS.Approved &&
    !isApprovedApplicationExpired(application))

const getSchemeLookupId = (scheme) => {
  const value = scheme?.apiId ?? scheme?.id ?? scheme?.schemeId
  return value == null ? '' : String(value)
}

const findActiveApplicationForScheme = (applications, scheme) => {
  const schemeId = getSchemeLookupId(scheme)
  if (!schemeId) return null

  return (
    (applications || []).find(
      (application) =>
        String(application.schemeId) === schemeId && isBlockingApplication(application)
    ) || null
  )
}

const getAgeFromDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return null

  const birthDate = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(birthDate.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDelta = today.getMonth() - birthDate.getMonth()

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age
}

const profileToFasProfile = (accountHolder) => ({
  name: accountHolder.name,
  accountNumber: accountHolder.accountNumber,
  age: getAgeFromDateOfBirth(accountHolder.dateOfBirth) || accountHolder.age,
  nationality:
    typeof accountHolder.isSingaporeCitizen === 'boolean'
      ? accountHolder.isSingaporeCitizen
        ? 'Singapore Citizen'
        : 'Other'
      : accountHolder.nationality,
  parentNationality: accountHolder.parentNationality,
  income: accountHolder.monthlyHouseholdIncome,
  members: accountHolder.householdMembers,
})

const initialProfile = profileToFasProfile(MOCK_ACCOUNT_HOLDER)

const getSchemeFieldSet = (scheme) => collectConditionFields(scheme)

const schemeRequiresIncome = (fieldSet) => fieldSet.has('income') || fieldSet.has('pci')

const schemeRequiresMembers = (fieldSet) => fieldSet.has('pci')

const getTemplateUrl = (document) => {
  if (document?.templateUrl) return document.templateUrl
  if (!document?.templateName) return ''
  return `/templates/fas/${document.templateName}`
}

const getApiErrorMessage = (error, t) => {
  const payload = error?.response?.data
  if (!payload) return t('financial_assistance.message.submit_failed')
  if (payload.message && payload.message !== 'Validation failed') return payload.message
  if (typeof payload.error === 'string') return payload.error
  if (payload.error && typeof payload.error === 'object') {
    return Object.values(payload.error).filter(Boolean).join(', ')
  }
  return payload.message || t('financial_assistance.message.submit_failed')
}

const buildAttachedDocsFromApplication = (application) =>
  Object.fromEntries(
    (application?.attachments || [])
      .filter((document) => document.requiredDocumentId != null)
      .map((document) => [
        String(document.requiredDocumentId),
        {
          fileName: document.fileName,
          fileKey: document.fileKey,
        },
      ])
  )

const MyFasApplyPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [initialSchemeId] = useState(() =>
    location.state?.schemeId != null ? String(location.state.schemeId) : null
  )
  const [stateScheme] = useState(() => location.state?.scheme || null)
  const [draftApplicationId] = useState(() =>
    location.state?.draftApplicationId != null ? String(location.state.draftApplicationId) : null
  )
  const [snapshotProfile] = useState(() =>
    normalizeFasSnapshotProfile(location.state?.snapshot, initialProfile)
  )
  const startingProfile = snapshotProfile || initialProfile
  const [profile, setProfile] = useState(startingProfile)
  const [shown, setShown] = useState(Boolean(snapshotProfile))
  const [search, setSearch] = useState('')
  const [expandedSchemeId, setExpandedSchemeId] = useState(null)
  const [formSchemeId, setFormSchemeId] = useState(initialSchemeId)
  const [formProfile, setFormProfile] = useState(startingProfile)
  const [attachedDocs, setAttachedDocs] = useState({})
  const [additionalAnswers, setAdditionalAnswers] = useState({})
  const profileQuery = useFetch(ApiUrls.ACCOUNT_HOLDER.PROFILE)
  const draftApplicationQuery = useFetch(
    draftApplicationId ? ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_DETAIL(draftApplicationId) : '',
    {},
    [draftApplicationId],
    Boolean(draftApplicationId)
  )
  const draftApplication = useMemo(
    () => normalizeApiApplicationDetail(draftApplicationQuery.data),
    [draftApplicationQuery.data]
  )
  const initialScheme = draftApplication?.scheme || stateScheme

  const pci = getPci(profile.income, profile.members)
  const availableParams = useMemo(
    () => buildAvailableSchemesParams({ shown, profile }),
    [profile, shown]
  )
  const availableSchemesQuery = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_AVAILABLE_SCHEMES,
    availableParams,
    [availableParams]
  )
  const applicationsQuery = useFetch(
    ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS,
    applicationListParams,
    []
  )
  const applicationPage = useMemo(
    () => normalizeApiApplicationPage(applicationsQuery.data),
    [applicationsQuery.data]
  )
  const activeApplications = applicationPage.collection
  const apiAvailableSchemes = useMemo(
    () => normalizeApiAvailableSchemesResponse(availableSchemesQuery.data),
    [availableSchemesQuery.data]
  )
  const usingApiSchemes = Array.isArray(apiAvailableSchemes.schemes) && !availableSchemesQuery.error
  const schemes = useMemo(() => {
    const apiSchemes = usingApiSchemes ? apiAvailableSchemes.schemes : []
    if (!initialScheme) return apiSchemes
    if (apiSchemes.some((scheme) => String(scheme.id) === String(initialScheme.id))) {
      return apiSchemes
    }
    return [initialScheme, ...apiSchemes]
  }, [apiAvailableSchemes.schemes, initialScheme, usingApiSchemes])

  const schemeById = useMemo(
    () => Object.fromEntries(schemes.map((scheme) => [String(scheme.id), scheme])),
    [schemes]
  )

  useEffect(() => {
    if (!initialSchemeId && !snapshotProfile && !draftApplicationId) return
    navigate(location.pathname, { replace: true })
  }, [draftApplicationId, initialSchemeId, location.pathname, navigate, snapshotProfile])

  useEffect(() => {
    if (!profileQuery.data || snapshotProfile || draftApplication) return
    const nextProfile = normalizeFasProfileFromApi(profileQuery.data, initialProfile)
    queueMicrotask(() => {
      setProfile(nextProfile)
      setFormProfile(nextProfile)
    })
  }, [draftApplication, profileQuery.data, snapshotProfile])

  useEffect(() => {
    if (!draftApplication) return
    const nextProfile = normalizeFasSnapshotProfile(draftApplication.profileSnapshot, initialProfile)
    queueMicrotask(() => {
      setProfile(nextProfile)
      setFormProfile(nextProfile)
      setShown(true)
      setFormSchemeId(draftApplication.schemeId)
      setAttachedDocs(buildAttachedDocsFromApplication(draftApplication))

      const initialAnswers = {}
      ;(draftApplication.additionalAnswers || []).forEach((answer) => {
        if (answer.fasSchemeAdditionalQuestionId) {
          initialAnswers[answer.fasSchemeAdditionalQuestionId] = answer.answerText || ''
        }
      })
      setAdditionalAnswers(initialAnswers)
    })
  }, [draftApplication])

  const activeAvailableSchemes = schemes

  const visibleSchemes = useMemo(() => {
    const query = search.trim().toLowerCase()
    const eligibleProfile = {
      age: Number(profile.age || 0),
      nationality: profile.nationality,
      parentNationality: profile.parentNationality,
      income: Number(profile.income || 0),
      pci: pci || 0,
    }

    return activeAvailableSchemes.filter((scheme) => {
      const matchesQuery = !query || scheme.name.toLowerCase().includes(query)
      if (!matchesQuery) return false
      if (!draftApplicationId && findActiveApplicationForScheme(activeApplications, scheme))
        return false
      if (!shown) return true
      if (usingApiSchemes && scheme.apiId != null && !scheme.reapplyFallback) return true
      if (scheme.reapplyFallback || !scheme.tiers?.length) return true
      return !!getSuggestedTier(scheme, { data: eligibleProfile })
    })
  }, [
    activeAvailableSchemes,
    pci,
    profile.age,
    profile.income,
    profile.nationality,
    profile.parentNationality,
    search,
    shown,
    usingApiSchemes,
    activeApplications,
    draftApplicationId,
  ])

  const openForm = (schemeId) => {
    setFormSchemeId(String(schemeId))
    setFormProfile(profile)
    setAttachedDocs({})
    setAdditionalAnswers({})
  }

  if (formSchemeId) {
    const scheme = schemeById[formSchemeId]
    if (!scheme) {
      return (
        <div className="fas-page fas-page-account">
          <div className="fas-frame">
            <div className="fas-bar">Apply - browse & check the FAS you qualify for</div>
            <div className="fas-body">
              <div className="fas-empty">
                {availableSchemesQuery.loading
                  ? 'Loading FAS scheme details...'
                  : 'This FAS scheme is not available for application right now.'}
              </div>
            </div>
          </div>
        </div>
      )
    }

    const blockingApplication = draftApplicationId
      ? null
      : findActiveApplicationForScheme(activeApplications, scheme)

    return (
      <ApplyForm
        scheme={scheme}
        profile={formProfile}
        draftApplicationId={draftApplicationId}
        blockingApplication={blockingApplication}
        attachedDocs={attachedDocs}
        additionalAnswers={additionalAnswers}
        onBack={() => setFormSchemeId(null)}
        onProfileChange={setFormProfile}
        onAttachedDocsChange={setAttachedDocs}
        onAdditionalAnswersChange={setAdditionalAnswers}
        onSubmitted={() => {
          setFormSchemeId(null)
          navigate(routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.MANAGEMENT))
        }}
      />
    )
  }

  return (
    <div className="fas-page fas-page-account">
      <div className="fas-frame">
        <div className="fas-bar">Apply - browse & check the FAS you qualify for</div>
        <div className="fas-body">
          <div className="fas-apply-layout">
            <div className="fas-apply-panel">
              <ProfileQuestion icon={<WalletOutlined />} label="My monthly household income is">
                <InputNumber
                  min={0}
                  value={profile.income}
                  prefix="SS$"
                  placeholder="e.g. 4000.00"
                  style={{ width: '100%' }}
                  onChange={(value) =>
                    setProfile((current) => ({ ...current, income: value || '' }))
                  }
                />
              </ProfileQuestion>

              <div className="fas-question">
                <span className="fas-question-icon">
                  <BankOutlined />
                </span>
                <div className="fas-question-main">
                  <div className="fas-inline-input">
                    <span>There are</span>
                    <InputNumber
                      min={0}
                      value={profile.members}
                      placeholder="e.g. 4"
                      style={{ width: 86 }}
                      onChange={(value) =>
                        setProfile((current) => ({ ...current, members: value || '' }))
                      }
                    />
                    <span>people in my household.</span>
                  </div>
                </div>
              </div>

              <ProfileQuestion icon={<IdcardOutlined />} label="Parent's nationality">
                <Select
                  value={profile.parentNationality}
                  placeholder="Select nationality"
                  options={parentNationalityOptions}
                  style={{ width: '100%' }}
                  onChange={(value) =>
                    setProfile((current) => ({ ...current, parentNationality: value }))
                  }
                />
              </ProfileQuestion>

              <div className="fas-pci-pill">
                Per-capita income (PCI) ={' '}
                <strong>{pci != null ? `SS$${pci.toLocaleString()}` : '-'}</strong>
              </div>

              <Button
                type="primary"
                block
                size="large"
                onClick={() => {
                  if (!profile.parentNationality || !profile.income || !profile.members) {
                    message.error('Enter parent nationality, income, and household size')
                    return
                  }
                  setShown(true)
                }}
              >
                Show me my options
              </Button>
            </div>

            <div className="fas-results">
              <div className="fas-result-head">
                {shown ? 'FAS schemes you may qualify for' : 'All FAS schemes'}
                <span className="fas-count">{visibleSchemes.length}</span>
              </div>

              {activeAvailableSchemes.length > 3 && (
                <Input.Search
                  placeholder="Filter list..."
                  value={search}
                  allowClear
                  style={{ marginBottom: 10 }}
                  onChange={(event) => setSearch(event.target.value)}
                />
              )}

              <div className="fas-scheme-scroll">
                {visibleSchemes.length ? (
                  visibleSchemes.map((scheme, index) => {
                    const expanded =
                      expandedSchemeId === scheme.id || (expandedSchemeId === null && index === 0)

                    return (
                      <SchemeApplyCard
                        key={scheme.id}
                        scheme={scheme}
                        expanded={expanded}
                        onToggle={() =>
                          setExpandedSchemeId((current) => {
                            const isAutoExpanded = current === null && index === 0
                            if (current === scheme.id || isAutoExpanded) return noExpandedSchemeId
                            return scheme.id
                          })
                        }
                        onApply={() => openForm(scheme.id)}
                      />
                    )
                  })
                ) : (
                  <div className="fas-empty">
                    {availableSchemesQuery.error
                      ? 'Unable to load FAS schemes from the API right now.'
                      : shown
                      ? 'No scheme matches the household details and tier limits entered.'
                      : 'No schemes available right now.'}
                  </div>
                )}
              </div>

              {!shown && (
                <div className="fas-note">
                  Showing active schemes that do not already have an application. Enter details and
                  use the button to narrow the list.
                  {availableSchemesQuery.error ? ' Unable to load FAS schemes from the API.' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProfileQuestion = ({ icon, label, children }) => (
  <div className="fas-question">
    <span className="fas-question-icon">{icon}</span>
    <div className="fas-question-main">
      <label>{label}</label>
      {children}
    </div>
  </div>
)

const SchemeApplyCard = ({ scheme, expanded, onToggle, onApply }) => (
  <div className="fas-scheme-card">
    <div className="fas-scheme-card-top">
      <div className="fas-scheme-main">
        <div className="fas-scheme-name">{scheme.name}</div>
        <div className="fas-scheme-desc">{scheme.description}</div>
        <div className="fas-endline">
          <CalendarOutlined /> FAS duration: {scheme.validityMonths || 12} months
        </div>
      </div>
      <div className="fas-card-buttons">
        <Button type="primary" onClick={onApply}>
          Apply
        </Button>
        <Button
          aria-label={`View ${scheme.name} information`}
          icon={expanded ? <UpOutlined /> : <DownOutlined />}
          onClick={onToggle}
        />
      </div>
    </div>

    {expanded && <SchemeInfo scheme={scheme} />}
  </div>
)

const SchemeInfo = ({ scheme }) => (
  <div className="fas-info-body">
    <div className="fas-info-row">
      <span className="fas-info-label">Eligibility</span>
      <span>{buildEligibilityPreview(scheme)}</span>
    </div>
    <div className="fas-info-row">
      <span className="fas-info-label">Subsidy</span>
      <span>
        {scheme.subsidyType === 'fixed'
          ? 'Fixed cash amount'
          : scheme.tiers.some((tier) => tier.perComponent)
            ? 'Percentage, set separately for Course and Misc'
            : 'Percentage of (Course + Misc)'}
      </span>
    </div>
    <div className="fas-info-label" style={{ marginTop: 9, marginBottom: 4 }}>
      Tiers
    </div>
    {scheme.tiers.map((tier) => (
      <div className="fas-info-row" key={tier.id}>
        <span>{tier.name}</span>
        <strong>
          {formatTierConditionText(tier)}, then {describeTierSubsidy(scheme, tier)}
        </strong>
      </div>
    ))}
  </div>
)

const ApplyForm = ({
  scheme,
  profile,
  draftApplicationId,
  blockingApplication,
  attachedDocs,
  additionalAnswers,
  onBack,
  onProfileChange,
  onAttachedDocsChange,
  onAdditionalAnswersChange,
  onSubmitted,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const { t } = useTranslation()
  const submitApplication = useAxiosSubmit({
    method: 'POST',
    onError: async (error) => {
      message.error(getApiErrorMessage(error, t))
    },
  })
  const pci = getPci(profile.income, profile.members)
  const schemeFieldSet = useMemo(() => getSchemeFieldSet(scheme), [scheme])
  const requiresIncome = schemeRequiresIncome(schemeFieldSet)
  const requiresMembers = schemeRequiresMembers(schemeFieldSet)
  const matchingTier = getSuggestedTier(scheme, {
    data: {
      age: Number(profile.age || 0),
      nationality: profile.nationality,
      parentNationality: profile.parentNationality,
      income: Number(profile.income || 0),
      members: Number(profile.members || 0),
      pci: pci || 0,
    },
  })
  const attachedCount = scheme.documents.filter((document) => attachedDocs[document.id]).length
  const totalDocuments = scheme.documents.length
  const hasProfileDetails =
    (!schemeFieldSet.has('studentAge') || !!profile.age) &&
    (!schemeFieldSet.has('nationality') || !!profile.nationality) &&
    (!schemeFieldSet.has('parentNationality') || !!profile.parentNationality) &&
    (!requiresIncome || !!profile.income) &&
    (!requiresMembers || !!profile.members)
  const needsTierMatch = scheme.tiers?.length > 0

  const areRequiredQuestionsAnswered = (scheme.additionalQuestions || []).every(
    (q) => !q.isRequired || !!(additionalAnswers[q.id] && additionalAnswers[q.id].trim())
  )

  const isReadyToSubmit =
    !blockingApplication &&
    hasProfileDetails &&
    (!needsTierMatch || !!matchingTier) &&
    attachedCount === totalDocuments &&
    areRequiredQuestionsAnswered

  const attachDoc = (documentId, file) => {
    onAttachedDocsChange((current) => ({
      ...current,
      [documentId]: {
        fileName: file.name,
        size: file.size,
        type: file.type,
        fileKey: file.uid || file.name,
      },
    }))
  }

  const submit = async (isDraft = false) => {
    if (blockingApplication) {
      message.error(t('financial_assistance.message.duplicate_application'))
      return
    }

    if (!hasProfileDetails) {
      message.error(t('financial_assistance.message.confirm_required_details'))
      return
    }

    if (needsTierMatch && !matchingTier) {
      message.error(t('financial_assistance.message.no_matching_tier'))
      return
    }

    if (!isDraft) {
      const missing = scheme.documents.filter((document) => !attachedDocs[document.id])
      if (missing.length) {
        message.error(
          t('financial_assistance.message.attach_required_documents', { count: missing.length })
        )
        return
      }

      if (!areRequiredQuestionsAnswered) {
        message.error('Please answer all required additional questions.')
        return
      }
    }

    setSubmitting(true)
    try {
      const answersList = Object.entries(additionalAnswers)
        .filter(([, answerText]) => answerText)
        .map(([questionId, answerText]) => ({
          fasSchemeAdditionalQuestionId: Number(questionId),
          answerText,
        }))

      const payload = buildSubmitFasApplicationPayload({
        scheme,
        profile,
        documents: scheme.documents,
        attachedDocs,
        additionalAnswers: answersList,
      })
      const submitUrl = isDraft
        ? draftApplicationId
          ? ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_UPDATE_DRAFT(draftApplicationId)
          : ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_SAVE_DRAFT
        : draftApplicationId
          ? ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATION_PUBLISH_DRAFT(draftApplicationId)
          : ApiUrls.ACCOUNT_HOLDER.FAS_APPLICATIONS
      const response = await submitApplication.submit({
        overrideUrl: submitUrl,
        overrideData: payload,
      })
      if (!response) return
      message.success(
        isDraft
          ? 'Draft application saved successfully.'
          : t('financial_assistance.message.application_submitted', { name: scheme.name })
      )
      onSubmitted()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fas-page fas-page-account">
      <div className="fas-frame">
        <div className="fas-bar fas-apply-titlebar">
          <button className="fas-back-button" type="button" onClick={onBack}>
            <ArrowLeftOutlined />
            Back to schemes
          </button>
          <span className="fas-bar-divider">/</span>
          <span>Apply</span>
        </div>

        <div className="fas-body fas-apply-detail-body">
          <div className="fas-apply-hero">
            <div>
              <div className="fas-section-label">Financial assistance application</div>
              <h2>{scheme.name}</h2>
              <div className="fas-apply-hero-meta">
                <CalendarOutlined />
                FAS duration <strong>{scheme.validityMonths || 12} months</strong> from submission
              </div>
            </div>
            <div className="fas-apply-progress-pill">
              {attachedCount}/{totalDocuments} documents attached
            </div>
          </div>

          <div className="fas-apply-detail-layout">
            <div className="fas-apply-workflow">
              <section className="fas-apply-step-card">
                <div className="fas-apply-step-head">
                  <span className="fas-block-number">1</span>
                  <div>
                    <h3>Personal Information</h3>
                    <p>Profile details are locked.</p>
                  </div>
                </div>

                <PersonalInfoFields profile={profile} />
              </section>

              <section className="fas-apply-step-card">
                <div className="fas-apply-step-head">
                  <span className="fas-block-number">2</span>
                  <div>
                    <h3>Household Information</h3>
                    <p>Update the household values for this application.</p>
                  </div>
                </div>

                <HouseholdInfoFields
                  fieldSet={schemeFieldSet}
                  profile={profile}
                  pci={pci}
                  onProfileChange={onProfileChange}
                />
              </section>

              {scheme.additionalQuestions?.length > 0 && (
                <section className="fas-apply-step-card">
                  <div className="fas-apply-step-head">
                    <span className="fas-block-number">3</span>
                    <div>
                      <h3>Additional Questions</h3>
                      <p>
                        Please answer the following questions to help us evaluate your application.
                      </p>
                    </div>
                  </div>
                  <div className="fas-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                    {scheme.additionalQuestions.map((q) => (
                      <div key={q.id}>
                        <label className="fas-field-label">
                          {q.questionText}{' '}
                          {q.isRequired && <span style={{ color: 'var(--fas-red)' }}>*</span>}
                        </label>
                        <Input.TextArea
                          value={additionalAnswers[q.id] || ''}
                          maxLength={2000}
                          placeholder="Your answer (max 2000 characters)"
                          rows={3}
                          onChange={(e) =>
                            onAdditionalAnswersChange((current) => ({
                              ...current,
                              [q.id]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="fas-apply-step-card">
                <div className="fas-apply-step-head">
                  <span className="fas-block-number">
                    {scheme.additionalQuestions?.length > 0 ? '4' : '3'}
                  </span>
                  <div>
                    <h3>Attach supporting documents</h3>
                    <p>Download each template if needed, then attach the completed file.</p>
                  </div>
                </div>

                <div className="fas-student-doc-list">
                  {scheme.documents.map((document) => {
                    const attachment = attachedDocs[document.id]
                    const templateUrl = getTemplateUrl(document)
                    return (
                      <div
                        className={`fas-student-doc ${attachment ? 'is-attached' : ''}`}
                        key={document.id}
                      >
                        <span className="fas-doc-icon">
                          {attachment ? <CheckCircleOutlined /> : <FileTextOutlined />}
                        </span>
                        <div className="fas-doc-main">
                          <div className="fas-doc-name">{document.name}</div>
                          <a
                            className="fas-template-link"
                            href={templateUrl || undefined}
                            download={document.templateName || undefined}
                            onClick={(event) => {
                              if (templateUrl) return
                              event.preventDefault()
                              message.warning(
                                'No template file has been uploaded for this document'
                              )
                            }}
                          >
                            Download template
                          </a>
                          {attachment?.fileName && (
                            <div className="fas-uploaded-file">{attachment.fileName}</div>
                          )}
                        </div>
                        <Upload
                          showUploadList={false}
                          beforeUpload={(file) => {
                            attachDoc(document.id, file)
                            return false
                          }}
                        >
                          <Button
                            icon={<PaperClipOutlined />}
                            type={attachment ? 'primary' : 'default'}
                          >
                            {attachment ? 'Replace' : 'Attach'}
                          </Button>
                        </Upload>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>

            <aside className="fas-apply-summary">
              <div className="fas-summary-card">
                <div className="fas-section-label">Application summary</div>
                <div className="fas-summary-title">{scheme.name}</div>
                <ApplicationSummaryRows profile={profile} pci={pci} />
                <div className="fas-summary-row">
                  <span>Estimated tier</span>
                  <div style={{ textAlign: 'right' }}>
                    <strong>
                      {matchingTier?.name ||
                        (scheme.tiers?.length ? 'No matching tier' : 'To be confirmed')}
                    </strong>
                    {matchingTier && (
                      <div style={{ fontSize: '12px', color: 'var(--fas-gray-dark)', marginTop: '2px' }}>
                        ({describeTierSubsidy(scheme, matchingTier)})
                      </div>
                    )}
                  </div>
                </div>
                <div className="fas-summary-row">
                  <span>FAS duration</span>
                  <strong>{scheme.validityMonths || 12} months</strong>
                </div>
                {scheme.additionalQuestions?.length > 0 && (
                  <div className="fas-summary-row">
                    <span>Questions answered</span>
                    <strong>
                      {
                        scheme.additionalQuestions.filter(
                          (q) => additionalAnswers[q.id] && additionalAnswers[q.id].trim()
                        ).length
                      }
                      /{scheme.additionalQuestions.length}
                    </strong>
                  </div>
                )}
                <div className="fas-summary-row">
                  <span>Documents</span>
                  <strong>
                    {attachedCount}/{totalDocuments}
                  </strong>
                </div>
                {blockingApplication && (
                  <p style={{ color: 'var(--fas-red)', marginTop: 0 }}>
                    You already have a pending or approved application for this scheme
                    {blockingApplication.id ? ` (${blockingApplication.id})` : ''}.
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    disabled={!isReadyToSubmit}
                    loading={submitting || submitApplication.loading}
                    onClick={() => submit(false)}
                  >
                    Submit application
                  </Button>
                  {!isReadyToSubmit && !blockingApplication && (
                    <div style={{ fontSize: '12px', color: 'var(--fas-red)', textAlign: 'center', lineHeight: '1.2' }}>
                      {!hasProfileDetails
                        ? '* Please fill in all required profile fields.'
                        : needsTierMatch && !matchingTier
                          ? '* Household details do not meet any tier.'
                          : attachedCount < totalDocuments
                            ? `* Please attach all required documents (${attachedCount}/${totalDocuments}).`
                            : !areRequiredQuestionsAnswered
                              ? '* Please answer all required additional questions.'
                              : '* Please complete all required fields.'}
                    </div>
                  )}
                  <Button
                    block
                    size="large"
                    loading={submitting || submitApplication.loading}
                    disabled={Boolean(blockingApplication)}
                    onClick={() => submit(true)}
                  >
                    Save as draft
                  </Button>
                </div>
                <p>
                  The school admin reviews your documents and confirms the final assistance tier.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

const PersonalInfoFields = ({ profile }) => {
  return (
    <div className="fas-form-grid">
      <div>
        <label className="fas-field-label">Account holder name</label>
        <Input disabled value={profile.name || '-'} />
        <div className="fas-field-help">Auto-filled from profile.</div>
      </div>

      <div>
        <label className="fas-field-label">Student age</label>
        <InputNumber disabled min={0} value={profile.age} style={{ width: '100%' }} />
        <div className="fas-field-help">Auto-filled from profile date of birth.</div>
      </div>

      <div>
        <label className="fas-field-label">Student nationality</label>
        <Select
          disabled
          value={profile.nationality}
          options={nationalityOptions}
          style={{ width: '100%' }}
        />
        <div className="fas-field-help">Auto-filled from profile citizenship.</div>
      </div>
    </div>
  )
}

const HouseholdInfoFields = ({ fieldSet, profile, pci, onProfileChange }) => {
  return (
    <>
      <div className="fas-form-grid">
        <div>
          <label className="fas-field-label">Parent&apos;s nationality</label>
          <Select
            value={profile.parentNationality}
            options={parentNationalityOptions}
            style={{ width: '100%' }}
            onChange={(value) =>
              onProfileChange((current) => ({ ...current, parentNationality: value }))
            }
          />
          <div className="fas-field-help">Auto-filled from linked guardian profile.</div>
        </div>

        <div>
          <label className="fas-field-label">Gross household income (SS$/month)</label>
          <InputNumber
            min={0}
            value={profile.income}
            prefix="SS$"
            placeholder="e.g. 4000.00"
            style={{ width: '100%' }}
            onChange={(value) =>
              onProfileChange((current) => ({ ...current, income: value || '' }))
            }
          />
        </div>

        <div>
          <label className="fas-field-label">Household members</label>
          <InputNumber
            min={0}
            value={profile.members}
            placeholder="e.g. 4"
            style={{ width: '100%' }}
            onChange={(value) =>
              onProfileChange((current) => ({ ...current, members: value || '' }))
            }
          />
        </div>
      </div>

      {fieldSet.has('pci') && (
        <div className="fas-pci-box">
          <span>Per-capita income (PCI)</span>
          <strong>{pci != null ? `SS$${pci.toLocaleString()}` : '-'}</strong>
          <small>Income ÷ household members</small>
        </div>
      )}
    </>
  )
}

const ApplicationSummaryRows = ({ profile, pci }) => {
  return (
    <>
      <div className="fas-summary-row">
        <span>Account holder</span>
        <strong>{profile.name || '-'}</strong>
      </div>
      <div className="fas-summary-row">
        <span>Student age</span>
        <strong>{profile.age || '-'}</strong>
      </div>
      <div className="fas-summary-row">
        <span>Student nationality</span>
        <strong>{profile.nationality || '-'}</strong>
      </div>
      <div className="fas-summary-row">
        <span>Parent nationality</span>
        <strong>{profile.parentNationality || '-'}</strong>
      </div>
      <div className="fas-summary-row">
        <span>Monthly income</span>
        <strong>S${Number(profile.income || 0).toLocaleString()}</strong>
      </div>
      <div className="fas-summary-row">
        <span>Household size</span>
        <strong>{profile.members || '-'}</strong>
      </div>
      <div className="fas-summary-highlight">
        <span>Calculated PCI</span>
        <strong>{pci != null ? `SS$${pci.toLocaleString()}` : '-'}</strong>
      </div>
    </>
  )
}

export default MyFasApplyPage
