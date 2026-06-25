import {
  FAS_APPLICATION_STATUS,
  FAS_STATUS,
  MOCK_ACCOUNT_HOLDER,
} from '@/features/financial-assistance/data/fasSeedData'
import {
  fasMockStore,
  useFasMockStore,
} from '@/features/financial-assistance/data/fasMockStore'
import '@/features/financial-assistance/styles/financialAssistance.css'
import {
  buildEligibilityPreview,
  describeTierSubsidy,
  evaluateSchemeEligibility,
  formatTierConditionText,
  getSuggestedTier,
  getPci,
  isApprovedApplicationExpired,
} from '@/features/financial-assistance/utils/fasRules'
import { routeUrls } from '@/shared/config/routeUrls'
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

const getSchemeFieldSet = (scheme) =>
  new Set((scheme?.conditions || []).map((condition) => condition.field).filter(Boolean))

const schemeRequiresIncome = (fieldSet) => fieldSet.has('income') || fieldSet.has('pci')

const schemeRequiresMembers = (fieldSet) => fieldSet.has('pci')

const getTemplateUrl = (document) => {
  if (document?.templateUrl) return document.templateUrl
  if (!document?.templateName) return ''
  return `/templates/fas/${document.templateName}`
}

const MyFasApplyPage = () => {
  const { schemes, applications } = useFasMockStore()
  const location = useLocation()
  const navigate = useNavigate()
  const initialSchemeId = location.state?.schemeId || null
  const [profile, setProfile] = useState(initialProfile)
  const [shown, setShown] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedSchemeId, setExpandedSchemeId] = useState(null)
  const [formSchemeId, setFormSchemeId] = useState(initialSchemeId)
  const [formProfile, setFormProfile] = useState(initialProfile)
  const [attachedDocs, setAttachedDocs] = useState({})

  const schemeById = useMemo(
    () => Object.fromEntries(schemes.map((scheme) => [scheme.id, scheme])),
    [schemes]
  )

  useEffect(() => {
    if (!initialSchemeId) return
    navigate(location.pathname, { replace: true })
  }, [initialSchemeId, location.pathname, navigate])

  const accountApplications = useMemo(
    () =>
      applications.filter(
        (application) => application.accountNumber === MOCK_ACCOUNT_HOLDER.accountNumber
      ),
    [applications]
  )

  const blockingSchemeIds = useMemo(
    () =>
      new Set(
        accountApplications
          .filter(
            (application) =>
              application.status === FAS_APPLICATION_STATUS.Pending ||
              (application.status === FAS_APPLICATION_STATUS.Approved &&
                !isApprovedApplicationExpired(application))
          )
          .map((application) => application.schemeId)
      ),
    [accountApplications]
  )

  const activeAvailableSchemes = useMemo(
    () =>
      schemes.filter(
        (scheme) => scheme.status === FAS_STATUS.Active && !blockingSchemeIds.has(scheme.id)
      ),
    [blockingSchemeIds, schemes]
  )

  const pci = getPci(profile.income, profile.members)

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
      if (!shown) return true
      return (
        evaluateSchemeEligibility(scheme, eligibleProfile) &&
        !!getSuggestedTier(scheme, { data: eligibleProfile })
      )
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
  ])

  const openForm = (schemeId) => {
    setFormSchemeId(schemeId)
    setFormProfile(profile)
    setAttachedDocs({})
  }

  if (formSchemeId) {
    const scheme = schemeById[formSchemeId]
    if (!scheme) return null

    return (
      <ApplyForm
        scheme={scheme}
        profile={formProfile}
        attachedDocs={attachedDocs}
        onBack={() => setFormSchemeId(null)}
        onProfileChange={setFormProfile}
        onAttachedDocsChange={setAttachedDocs}
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
                  prefix="S$"
                  style={{ width: '100%' }}
                  onChange={(value) => setProfile((current) => ({ ...current, income: value || '' }))}
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
                  options={parentNationalityOptions}
                  style={{ width: '100%' }}
                  onChange={(value) =>
                    setProfile((current) => ({ ...current, parentNationality: value }))
                  }
                />
              </ProfileQuestion>

              <div className="fas-pci-pill">
                Per-capita income (PCI) = <strong>{pci ? `S$${pci.toLocaleString()}` : '-'}</strong>
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
                    {shown
                      ? 'No scheme matches the household details and tier limits entered.'
                      : 'No schemes available right now.'}
                  </div>
                )}
              </div>

              {!shown && (
                <div className="fas-note">
                  Showing active schemes that do not already have an application. Enter details and
                  use the button to narrow the list.
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
      <span>{buildEligibilityPreview(scheme.conditions, scheme.connectors)}</span>
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
  attachedDocs,
  onBack,
  onProfileChange,
  onAttachedDocsChange,
  onSubmitted,
}) => {
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
  const isReadyToSubmit = hasProfileDetails && !!matchingTier && attachedCount === totalDocuments

  const attachDoc = (documentId, file) => {
    onAttachedDocsChange((current) => ({
      ...current,
      [documentId]: {
        fileName: file.name,
        size: file.size,
        type: file.type,
      },
    }))
  }

  const submit = () => {
    if (!hasProfileDetails) {
      message.error('Confirm the required application details')
      return
    }

    if (!matchingTier) {
      message.error('The entered details do not match any tier for this scheme')
      return
    }

    const missing = scheme.documents.filter((document) => !attachedDocs[document.id])
    if (missing.length) {
      message.error(`Attach all required documents (${missing.length} left)`)
      return
    }

    fasMockStore.createAccountHolderApplication({
      schemeId: scheme.id,
      profile,
      attachedDocuments: scheme.documents.map((document) => ({
        documentId: document.id,
        fileName: attachedDocs[document.id]?.fileName || `${document.id}.pdf`,
      })),
    })
    message.success(`Application submitted: ${scheme.name}`)
    onSubmitted()
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
                    <h3>Review household details</h3>
                    <p>These values are pre-filled from your profile. Update them before submitting.</p>
                  </div>
                </div>

                <SchemeApplicationFields
                  fieldSet={schemeFieldSet}
                  profile={profile}
                  pci={pci}
                  onProfileChange={onProfileChange}
                />
              </section>

              <section className="fas-apply-step-card">
                <div className="fas-apply-step-head">
                  <span className="fas-block-number">2</span>
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
                              message.warning('No template file has been uploaded for this document')
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
                          <Button icon={<PaperClipOutlined />} type={attachment ? 'primary' : 'default'}>
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
                <ApplicationSummaryRows
                  fieldSet={schemeFieldSet}
                  profile={profile}
                  pci={pci}
                />
                <div className="fas-summary-row">
                  <span>Estimated tier</span>
                  <strong>{matchingTier?.name || 'No matching tier'}</strong>
                </div>
                <div className="fas-summary-row">
                  <span>FAS duration</span>
                  <strong>{scheme.validityMonths || 12} months</strong>
                </div>
                <div className="fas-summary-row">
                  <span>Documents</span>
                  <strong>
                    {attachedCount}/{totalDocuments}
                  </strong>
                </div>
                <Button
                  type="primary"
                  block
                  size="large"
                  disabled={!isReadyToSubmit}
                  onClick={submit}
                >
                  Submit application
                </Button>
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

const SchemeApplicationFields = ({ fieldSet, profile, pci, onProfileChange }) => {
  const requiresIncome = schemeRequiresIncome(fieldSet)
  const requiresMembers = schemeRequiresMembers(fieldSet)
  const hasVisibleFields =
    fieldSet.has('studentAge') ||
    fieldSet.has('nationality') ||
    fieldSet.has('parentNationality') ||
    requiresIncome ||
    requiresMembers

  if (!hasVisibleFields) {
    return (
      <div className="fas-note" style={{ marginTop: 0 }}>
        This scheme does not require additional household fields.
      </div>
    )
  }

  return (
    <>
      <div className="fas-form-grid">
        {fieldSet.has('studentAge') && (
          <div>
            <label className="fas-field-label">Student age</label>
            <InputNumber disabled min={0} value={profile.age} style={{ width: '100%' }} />
            <div className="fas-field-help">Auto-filled from profile date of birth.</div>
          </div>
        )}

        {fieldSet.has('nationality') && (
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
        )}

        {fieldSet.has('parentNationality') && (
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
          </div>
        )}

        {requiresIncome && (
          <div>
            <label className="fas-field-label">Gross household income (S$/month)</label>
            <InputNumber
              min={0}
              value={profile.income}
              prefix="S$"
              style={{ width: '100%' }}
              onChange={(value) =>
                onProfileChange((current) => ({ ...current, income: value || '' }))
              }
            />
          </div>
        )}

        {requiresMembers && (
          <div>
            <label className="fas-field-label">Household members</label>
            <InputNumber
              min={0}
              value={profile.members}
              style={{ width: '100%' }}
              onChange={(value) =>
                onProfileChange((current) => ({ ...current, members: value || '' }))
              }
            />
          </div>
        )}
      </div>

      {fieldSet.has('pci') && (
        <div className="fas-pci-box">
          <span>Per-capita income (PCI)</span>
          <strong>{pci ? `S$${pci.toLocaleString()}` : '-'}</strong>
          <small>Income ÷ household members</small>
        </div>
      )}
    </>
  )
}

const ApplicationSummaryRows = ({ fieldSet, profile, pci }) => {
  const requiresIncome = schemeRequiresIncome(fieldSet)
  const requiresMembers = schemeRequiresMembers(fieldSet)

  return (
    <>
      {fieldSet.has('studentAge') && (
        <div className="fas-summary-row">
          <span>Student age</span>
          <strong>{profile.age || '-'}</strong>
        </div>
      )}
      {fieldSet.has('nationality') && (
        <div className="fas-summary-row">
          <span>Student nationality</span>
          <strong>{profile.nationality}</strong>
        </div>
      )}
      {fieldSet.has('parentNationality') && (
        <div className="fas-summary-row">
          <span>Parent nationality</span>
          <strong>{profile.parentNationality}</strong>
        </div>
      )}
      {requiresIncome && (
        <div className="fas-summary-row">
          <span>Monthly income</span>
          <strong>S${Number(profile.income || 0).toLocaleString()}</strong>
        </div>
      )}
      {requiresMembers && (
        <div className="fas-summary-row">
          <span>Household size</span>
          <strong>{profile.members || '-'}</strong>
        </div>
      )}
      {fieldSet.has('pci') && (
        <div className="fas-summary-highlight">
          <span>Calculated PCI</span>
          <strong>{pci ? `S$${pci.toLocaleString()}` : '-'}</strong>
        </div>
      )}
    </>
  )
}

export default MyFasApplyPage
