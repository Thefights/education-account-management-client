import { EnumConfig } from '@/shared/config/enumConfig'

export const FAS_CONDITION_FIELD = EnumConfig.FasConditionField

export const FAS_CONDITION_OPERATOR = EnumConfig.FasConditionOperator

export const FAS_LOGICAL_OPERATOR = EnumConfig.FasLogicalOperator

export const FAS_FIELD_OPTIONS = [
  { value: FAS_CONDITION_FIELD.StudentAge, legacyValue: 'studentAge', label: 'Student age' },
  { value: FAS_CONDITION_FIELD.Nationality, legacyValue: 'nationality', label: 'Nationality' },
  {
    value: FAS_CONDITION_FIELD.GuardianNationality,
    legacyValue: 'parentNationality',
    label: "Guardian's Nationality",
  },
  { value: FAS_CONDITION_FIELD.PerCapitaIncome, legacyValue: 'pci', label: 'Per-Capita Income' },
  {
    value: FAS_CONDITION_FIELD.GrossHouseholdIncome,
    legacyValue: 'income',
    label: 'Gross Household Income',
  },
]

export const FAS_FIELD_LABELS = FAS_FIELD_OPTIONS.reduce(
  (acc, item) => ({
    ...acc,
    [item.value]: item.label,
    [item.legacyValue]: item.label,
  }),
  {}
)

export const FAS_FIELD_KEY_BY_VALUE = FAS_FIELD_OPTIONS.reduce(
  (acc, item) => ({ ...acc, [item.value]: item.legacyValue }),
  {}
)

export const FAS_FIELD_VALUE_BY_KEY = {
  ...FAS_FIELD_OPTIONS.reduce((acc, item) => ({ ...acc, [item.legacyValue]: item.value }), {}),
  StudentAge: FAS_CONDITION_FIELD.StudentAge,
  StudentNationality: FAS_CONDITION_FIELD.StudentNationality,
  Nationality: FAS_CONDITION_FIELD.StudentNationality,
  GuardianNationality: FAS_CONDITION_FIELD.GuardianNationality,
  ParentNationality: FAS_CONDITION_FIELD.GuardianNationality,
  GrossHouseholdIncome: FAS_CONDITION_FIELD.GrossHouseholdIncome,
  PerCapitaIncome: FAS_CONDITION_FIELD.PerCapitaIncome,
  guardianNationality: FAS_CONDITION_FIELD.GuardianNationality,
}

export const FAS_TEXT_FIELD_VALUES = new Set([
  FAS_CONDITION_FIELD.StudentNationality,
  FAS_CONDITION_FIELD.GuardianNationality,
])

const localId = (prefix) =>
  prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)

export const normalizeFasConditionField = (field) => {
  if (typeof field === 'number') return field

  const numericField = Number(field)
  if (Number.isFinite(numericField) && numericField > 0) return numericField

  return FAS_FIELD_VALUE_BY_KEY[field] || FAS_CONDITION_FIELD.PerCapitaIncome
}

export const normalizeFasConditionOperator = (operator) => {
  if (typeof operator === 'number') return operator

  const numericOperator = Number(operator)
  if (Number.isFinite(numericOperator) && numericOperator > 0) return numericOperator

  const operatorValues = {
    Equal: FAS_CONDITION_OPERATOR.Equal,
    NotEqual: FAS_CONDITION_OPERATOR.NotEqual,
    Equals: FAS_CONDITION_OPERATOR.Equals,
    NotEquals: FAS_CONDITION_OPERATOR.NotEquals,
    GreaterThan: FAS_CONDITION_OPERATOR.GreaterThan,
    GreaterThanOrEqual: FAS_CONDITION_OPERATOR.GreaterThanOrEqual,
    LessThan: FAS_CONDITION_OPERATOR.LessThan,
    LessThanOrEqual: FAS_CONDITION_OPERATOR.LessThanOrEqual,
    Between: FAS_CONDITION_OPERATOR.Between,
  }

  return operatorValues[operator] || FAS_CONDITION_OPERATOR.Equals
}

export const isFasTextField = (field) => FAS_TEXT_FIELD_VALUES.has(normalizeFasConditionField(field))

export const createEmptyFasCondition = () => ({
  id: localId('fas-cond'),
  field: FAS_CONDITION_FIELD.PerCapitaIncome,
  operator: FAS_CONDITION_OPERATOR.LessThanOrEqual,
  valueText: null,
  valueNumber: null,
  valueNumberTo: null,
  displayOrder: 1,
})

export const createEmptyFasConditionGroup = () => ({
  id: localId('fas-group'),
  logicalOperator: FAS_LOGICAL_OPERATOR.All,
  displayOrder: 1,
  conditions: [createEmptyFasCondition()],
  groups: [],
})

const numberOrNull = (value) => {
  if (value === '' || value == null) return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const toFasCountryId = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized || normalized === 'any') return null
  if (normalized.includes('singapore')) return EnumConfig.FasGuardianNationalityId.SingaporeCitizen
  return EnumConfig.FasGuardianNationalityId.Other
}

const toFasCountryText = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized || normalized === 'any') return null
  if (normalized.includes('singapore')) return 'Singapore'
  return 'Other'
}

const fromFasCountryId = (value) => {
  const countryId = Number(value)
  if (countryId === EnumConfig.FasGuardianNationalityId.SingaporeCitizen) return 'Singapore Citizen'
  if (countryId > 0) return 'Other'
  return null
}

export const normalizeFasCondition = (condition = {}, index = 0) => {
  const field = normalizeFasConditionField(condition.field)
  const textField = isFasTextField(field)
  const operator = normalizeFasConditionOperator(
    condition.operator ||
      (textField ? FAS_CONDITION_OPERATOR.Equals : FAS_CONDITION_OPERATOR.LessThanOrEqual)
  )

  return {
    ...condition,
    id: condition.id || localId('fas-cond'),
    field,
    operator,
    valueText: textField
      ? condition.valueText ?? condition.value ?? fromFasCountryId(condition.countryId) ?? 'Singapore Citizen'
      : null,
    valueNumber: textField ? null : numberOrNull(condition.valueNumber ?? condition.value),
    valueNumberTo:
      !textField && operator === FAS_CONDITION_OPERATOR.Between
        ? numberOrNull(condition.valueNumberTo)
        : null,
    displayOrder: condition.displayOrder ?? index + 1,
  }
}

export const normalizeFasConditionGroup = (group) => {
  if (!group) return createEmptyFasConditionGroup()

  const logicalOperator =
    typeof group.logicalOperator === 'number'
      ? group.logicalOperator
      : String(group.logicalOperator || '').toUpperCase() === 'OR' ||
          String(group.logicalOperator || '').toUpperCase() === 'ANY'
        ? FAS_LOGICAL_OPERATOR.Any
        : FAS_LOGICAL_OPERATOR.All

  return {
    ...group,
    id: group.id || localId('fas-group'),
    logicalOperator,
    displayOrder: group.displayOrder ?? 1,
    conditions: (group.conditions || []).map(normalizeFasCondition),
    groups: (group.groups || []).map(normalizeFasConditionGroup),
  }
}

export const createFasConditionGroupFromFlat = (conditions = [], connectors = []) => {
  const normalizedConditions = conditions.map(normalizeFasCondition)
  if (!normalizedConditions.length) return createEmptyFasConditionGroup()

  if (!connectors.some((connector) => connector === 'OR')) {
    return normalizeFasConditionGroup({
      logicalOperator: FAS_LOGICAL_OPERATOR.All,
      displayOrder: 1,
      conditions: normalizedConditions,
      groups: [],
    })
  }

  const groups = []
  let currentConditions = []

  normalizedConditions.forEach((condition, index) => {
    currentConditions.push(condition)
    const connectorAfter = connectors[index]
    if (connectorAfter === 'OR' || index === normalizedConditions.length - 1) {
      groups.push({
        logicalOperator: FAS_LOGICAL_OPERATOR.All,
        displayOrder: groups.length + 1,
        conditions: currentConditions,
        groups: [],
      })
      currentConditions = []
    }
  })

  return normalizeFasConditionGroup({
    logicalOperator: FAS_LOGICAL_OPERATOR.Any,
    displayOrder: 1,
    conditions: [],
    groups,
  })
}

export const serializeFasConditionGroup = (group, displayOrder = 1) => {
  const normalizedGroup = normalizeFasConditionGroup(group)
  const conditions = normalizedGroup.conditions || []

  const serializedConditions = conditions
    .map((condition) => {
      const textField = isFasTextField(condition.field)
      const countryId = textField ? toFasCountryId(condition.valueText) : null
      if (textField && !countryId) return null

      return {
        field: condition.field,
        operator: condition.operator,
        countryId,
        valueText: textField ? toFasCountryText(condition.valueText) : null,
        valueNumber: textField ? null : condition.valueNumber,
        valueNumberTo:
          !textField && condition.operator === FAS_CONDITION_OPERATOR.Between
            ? condition.valueNumberTo
            : null,
      }
    })
    .filter(Boolean)
    .map((condition, index) => ({ ...condition, displayOrder: index + 1 }))

  return {
    logicalOperator: normalizedGroup.logicalOperator,
    displayOrder,
    conditions: serializedConditions,
    groups: (normalizedGroup.groups || []).map((child, index) =>
      serializeFasConditionGroup(child, serializedConditions.length + index + 1)
    ),
  }
}

export const isFasConditionGroupValid = (group, depth = 1) => {
  if (depth > 2 || !group || !(group.conditions?.length || group.groups?.length)) return false

  const conditionsValid = (group.conditions || []).every((condition) => {
    const normalized = normalizeFasCondition(condition)
    if (isFasTextField(normalized.field)) {
      return [FAS_CONDITION_OPERATOR.Equals, FAS_CONDITION_OPERATOR.NotEquals].includes(
        normalized.operator
      ) && Boolean(normalized.valueText)
    }

    if (normalized.valueNumber == null || Number(normalized.valueNumber) < 0) return false
    if (
      normalized.field === FAS_CONDITION_FIELD.StudentAge &&
      !Number.isInteger(Number(normalized.valueNumber))
    ) {
      return false
    }
    if (normalized.operator !== FAS_CONDITION_OPERATOR.Between) return true
    if (normalized.valueNumberTo == null || normalized.valueNumberTo < normalized.valueNumber) {
      return false
    }

    return (
      normalized.field !== FAS_CONDITION_FIELD.StudentAge ||
      Number.isInteger(Number(normalized.valueNumberTo))
    )
  })

  return (
    conditionsValid &&
    (group.groups || []).every((child) => isFasConditionGroupValid(child, depth + 1))
  )
}

export const countFasConditionGroupItems = (group) => {
  const normalizedGroup = normalizeFasConditionGroup(group)
  return (
    (normalizedGroup.conditions || []).length +
    (normalizedGroup.groups || []).reduce(
      (total, child) => total + countFasConditionGroupItems(child),
      0
    )
  )
}

export const rekeyFasConditionGroup = (group, prefix = 'FAS') => {
  const walk = (currentGroup, pathKey = '1') => {
    const normalizedGroup = normalizeFasConditionGroup(currentGroup)
    return {
      ...normalizedGroup,
      id: prefix + '-group-' + pathKey,
      conditions: (normalizedGroup.conditions || []).map((condition, index) => ({
        ...condition,
        id: prefix + '-cond-' + pathKey + '-' + (index + 1),
        displayOrder: index + 1,
      })),
      groups: (normalizedGroup.groups || []).map((child, index) =>
        walk(child, pathKey + '-' + (index + 1))
      ),
    }
  }

  return walk(group)
}

export const FAS_STATUS = EnumConfig.FasSchemeStatus

export const FAS_APPLICATION_STATUS = EnumConfig.FasApplicationStatus

export const MOCK_ACCOUNT_HOLDER = {
  accountNumber: 'ACC-1007',
  name: 'Pham Van A',
  dateOfBirth: '2013-09-10',
  age: 12,
  isSingaporeCitizen: true,
  nationality: 'Singapore Citizen',
  parentNationality: 'Singapore Citizen',
  monthlyHouseholdIncome: 2400,
  householdMembers: 5,

}

export const MOCK_SCHOOL_ADMIN = {
  name: 'School Admin · SSS',
  schoolId: 'MOE-SCH-01',
}

export const FAS_COURSE_OPTIONS = [
  'Math Enrichment 2026',
  'Science Lab 2026',
  'English Workshop',
  'Coding Bootcamp',
  'Art Studio 2026',
  'CCA Leadership Programme',
]

const catalog = [
  'Citizenship Grant',
  'Household Income Subsidy',
  'Study Grant',
  'Bursary Award',
  'Transport Assistance',
  'Meal Subsidy',
  'Uniform Grant',
  'Special Needs Support',
  'Merit-cum-Need Bursary',
  'Low-Income Family Aid',
  'Single-Parent Support',
  'Large Family Grant',
  'Textbook Subsidy',
  'Digital Device Grant',
  'CCA Activity Fund',
  'Exam Fee Waiver',
  'Enrichment Programme Aid',
  'Boarding Assistance',
  'Emergency Financial Aid',
  'Rural Student Support',
  'School Excursion Fund',
  'Sports Development Grant',
  'Music & Arts Bursary',
  'Tuition Support Scheme',
  'Graduation Fee Waiver',
  'Field Trip Subsidy',
  'Learning Materials Grant',
  'Internet Connectivity Aid',
  'Health & Wellness Fund',
  'Career Guidance Support',
  'STEM Programme Grant',
  'Language Immersion Aid',
  'Vocational Training Fund',
  'Disability Access Support',
  'Orphan & Ward Bursary',
  'Refugee Student Aid',
  'Overseas Study Grant',
  'Library Resource Fund',
  'Counselling Support Aid',
  'Scholarship Top-up Grant',
]

const schemeStatus = (index) => {
  if (index % 11 === 0) return FAS_STATUS.Draft
  if (index % 8 === 0) return FAS_STATUS.Inactive
  return FAS_STATUS.Active
}

const slug = (value) =>
  String(value || 'template')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+S$/g, '')

const schemeDocs = (name) => {
  const low = name.toLowerCase()
  const docs = [
    {
      id: 'doc-income',
      name: 'Household Income Declaration Form',
      templateName: 'income_declaration_template.docx',
      templateUrl: '/templates/fas/income_declaration_template.docx',
    },
    {
      id: 'doc-identity',
      name: 'Identity Document (NRIC / Birth Cert)',
      templateName: 'identity_proof_guide.docx',
      templateUrl: '/templates/fas/identity_proof_guide.docx',
    },
  ]

  if (/special needs|disability/.test(low)) {
    docs.push({
      id: 'doc-medical',
      name: 'Medical / Assessment Report',
      templateName: 'medical_report_template.docx',
      templateUrl: '/templates/fas/medical_report_template.docx',
    })
  } else if (/transport/.test(low)) {
    docs.push({
      id: 'doc-address',
      name: 'Proof of Residential Address',
      templateName: 'address_proof_guide.docx',
      templateUrl: '/templates/fas/address_proof_guide.docx',
    })
  } else if (/orphan|ward|refugee/.test(low)) {
    docs.push({
      id: 'doc-guardian',
      name: 'Guardianship / Status Document',
      templateName: 'guardianship_form.docx',
      templateUrl: '/templates/fas/guardianship_form.docx',
    })
  }

  docs.push({
    id: 'doc-payslip',
    name: 'Recent Payslip / Income Statement (3 months)',
    templateName: 'payslip_checklist.docx',
    templateUrl: '/templates/fas/payslip_checklist.docx',
  })

  return docs
}

const buildConditions = (name, index) => {
  const low = name.toLowerCase()
  const citizenOnly = /citizenship|special needs|disability|orphan|refugee/.test(low)

  if (/single-parent|large family|health|wellness/.test(low)) {
    return createFasConditionGroupFromFlat(
      [
        {
          id: 'cond-' + index + '-parent-nationality',
          field: 'parentNationality',
          value: 'Singapore Citizen',
        },
        { id: 'cond-' + index + '-pci', field: 'pci', value: 1000 },
      ],
      ['AND']
    )
  }

  if (/meal|uniform|textbook|transport/.test(low)) {
    return createFasConditionGroupFromFlat(
      [
        { id: 'cond-' + index + '-age', field: 'studentAge', value: 12 },
        { id: 'cond-' + index + '-income', field: 'income', value: 4000 },
      ],
      ['AND']
    )
  }

  if (citizenOnly) {
    return createFasConditionGroupFromFlat([
      { id: 'cond-' + index + '-nationality', field: 'nationality', value: 'Singapore Citizen' },
    ])
  }

  const tier = index % 4
  const incomeMax = [2500, 3500, 4500, 6000][tier]
  const pciMax = [625, 875, 1125, 1500][tier]

  return createFasConditionGroupFromFlat(
    [
      { id: 'cond-' + index + '-income', field: 'income', value: incomeMax },
      { id: 'cond-' + index + '-pci', field: 'pci', value: pciMax },
    ],
    ['OR']
  )
}

const buildTiers = (index) => {
  if (index % 6 === 2) {
    return [
      {
        id: `tier-${index}-1`,
        name: 'Tier 1',
        conditionText: 'PCI ≤ 690',
        maxPci: 690,
        perComponent: true,
        value: '',
        courseValue: 100,
        miscValue: 0,
      },
      {
        id: `tier-${index}-2`,
        name: 'Tier 2',
        conditionText: 'PCI 691-1,000',
        maxPci: 1000,
        perComponent: true,
        value: '',
        courseValue: 50,
        miscValue: 0,
      },
    ]
  }

  if (index % 5 === 0) {
    return [
      {
        id: `tier-${index}-1`,
        name: 'Tier 1',
        conditionText: 'PCI ≤ 500',
        maxPci: 500,
        perComponent: false,
        value: 500,
        courseValue: '',
        miscValue: '',
      },
      {
        id: `tier-${index}-2`,
        name: 'Tier 2',
        conditionText: 'PCI 501-800',
        maxPci: 800,
        perComponent: false,
        value: 300,
        courseValue: '',
        miscValue: '',
      },
    ]
  }

  return [
    {
      id: `tier-${index}-1`,
      name: 'Tier 1',
      conditionText: 'PCI ≤ 690',
      maxPci: 690,
      perComponent: false,
      value: 50,
      courseValue: '',
      miscValue: '',
    },
    {
      id: `tier-${index}-2`,
      name: 'Tier 2',
      conditionText: 'PCI 691-1,000',
      maxPci: 1000,
      perComponent: false,
      value: 30,
      courseValue: '',
      miscValue: '',
    },
  ]
}

export const createEmptyScheme = (id) => ({
  id,
  schoolId: MOCK_SCHOOL_ADMIN.schoolId,
  name: '',
  description: '',
  status: FAS_STATUS.Draft,
  subsidyType: 'percent',
  endDate: '',
  validityMonths: 12,
  linkedCourses: [],
  rootConditionGroup: createFasConditionGroupFromFlat(
    [
      { id: id + '-cond-1', field: 'nationality', value: 'Singapore Citizen' },
      { id: id + '-cond-2', field: 'pci', value: '' },
    ],
    ['AND']
  ),
  tiers: [
    {
      id: `${id}-tier-1`,
      name: 'Tier 1',
      conditionText: '',
      maxPci: '',
      perComponent: false,
      value: '',
      courseValue: '',
      miscValue: '',
    },
  ],
  documents: [
    {
      id: `${id}-doc-income`,
      name: 'Household Income Declaration Form',
      templateName: 'income_declaration_template.docx',
      templateUrl: '/templates/fas/income_declaration_template.docx',
    },
    {
      id: `${id}-doc-identity`,
      name: 'Identity Document (NRIC / Birth Cert)',
      templateName: 'identity_proof_guide.docx',
      templateUrl: '/templates/fas/identity_proof_guide.docx',
    },
  ],
})

export const initialSchemes = catalog.map((name, index) => {
  const conditionSet = buildConditions(name, index)
  const courseOffset = index % FAS_COURSE_OPTIONS.length

  return {
    id: `FAS-${String(index + 1).padStart(3, '0')}`,
    schoolId: MOCK_SCHOOL_ADMIN.schoolId,
    name,
    description: '',
    status: schemeStatus(index),
    subsidyType: index % 5 === 0 ? 'fixed' : 'percent',
    endDate: '',
    validityMonths: [6, 12, 18, 24][index % 4],
    linkedCourses: [
      FAS_COURSE_OPTIONS[courseOffset],
      FAS_COURSE_OPTIONS[(courseOffset + 2) % FAS_COURSE_OPTIONS.length],
    ],
    rootConditionGroup: conditionSet,
    tiers: buildTiers(index),
    documents: schemeDocs(name).map((doc, docIndex) => ({
      ...doc,
      id: `${slug(name)}-${docIndex + 1}`,
    })),
  }
})

const dateFromDay = (month, day) => `2026-${month}-${String((day % 27) + 1).padStart(2, '0')}`

const addMonthsToDate = (dateString, months) => {
  const [year, month, day] = String(dateString || '')
    .split('-')
    .map(Number)

  if (!year || !month || !day) return ''

  const totalMonths = month - 1 + Number(months || 12)
  const targetYear = year + Math.floor(totalMonths / 12)
  const targetMonthIndex = ((totalMonths % 12) + 12) % 12
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetYear, targetMonthIndex + 1, 0)
  ).getUTCDate()
  const targetDay = Math.min(day, lastDayOfTargetMonth)

  return `${targetYear}-${String(targetMonthIndex + 1).padStart(2, '0')}-${String(
    targetDay
  ).padStart(2, '0')}`
}

const applicationFromScheme = ({
  number,
  schemeIndex,
  status,
  accountNumber = MOCK_ACCOUNT_HOLDER.accountNumber,
  applicantName = MOCK_ACCOUNT_HOLDER.name,
  submittedAt,
  approvedAt,
  reason,
  data,
  courses = [],
}) => {
  const scheme = initialSchemes[schemeIndex]
  const defaultData = {
    age: MOCK_ACCOUNT_HOLDER.age,
    nationality: MOCK_ACCOUNT_HOLDER.nationality,
    parentNationality: MOCK_ACCOUNT_HOLDER.parentNationality,
    income: MOCK_ACCOUNT_HOLDER.monthlyHouseholdIncome,
    members: MOCK_ACCOUNT_HOLDER.householdMembers,
    pci: Math.round(MOCK_ACCOUNT_HOLDER.monthlyHouseholdIncome / MOCK_ACCOUNT_HOLDER.householdMembers),
  }
  const validFrom = submittedAt
  const calculatedEndDate = addMonthsToDate(validFrom, scheme.validityMonths)

  return {
    id: number,
    schemeId: scheme.id,
    schoolId: MOCK_SCHOOL_ADMIN.schoolId,
    accountNumber,
    applicantName,
    submittedAt,
    status,
    approvedAt,
    validFrom,
    endDate: calculatedEndDate,
    tierId: status === FAS_APPLICATION_STATUS.Approved ? scheme.tiers[0]?.id : undefined,
    reason,
    courses,
    data: { ...defaultData, ...data },
    attachments: scheme.documents.slice(0, 2).map((doc) => ({
      documentId: doc.id,
      fileName: `${slug(doc.name)}.pdf`,
    })),
  }
}

export const initialApplications = [
  applicationFromScheme({
    number: 'APP-1011',
    schemeIndex: 1,
    status: FAS_APPLICATION_STATUS.Pending,
    applicantName: 'Le Van C',
    submittedAt: '2026-02-09',
    data: { income: 3500, members: 4, pci: 875 },
  }),
  applicationFromScheme({
    number: 'APP-1012',
    schemeIndex: 2,
    status: FAS_APPLICATION_STATUS.Pending,
    accountNumber: 'ACC-1002',
    applicantName: 'Tran Thi B',
    submittedAt: '2026-02-11',
    data: { income: 2400, members: 5, pci: 480 },
  }),
  applicationFromScheme({
    number: 'APP-1013',
    schemeIndex: 0,
    status: FAS_APPLICATION_STATUS.Pending,
    accountNumber: 'ACC-1015',
    applicantName: 'Pham Van D',
    submittedAt: '2026-02-10',
    data: { income: 0, members: 0, pci: 0 },
  }),
  applicationFromScheme({
    number: 'APP-1014',
    schemeIndex: 4,
    status: FAS_APPLICATION_STATUS.Pending,
    accountNumber: 'ACC-1031',
    applicantName: 'Nguyen Thi E',
    submittedAt: '2026-02-12',
    data: { income: 2100, members: 5, pci: 420 },
  }),
  applicationFromScheme({
    number: 'APP-1015',
    schemeIndex: 1,
    status: FAS_APPLICATION_STATUS.Pending,
    accountNumber: 'ACC-1044',
    applicantName: 'Vo Van F',
    submittedAt: '2026-02-13',
    data: { income: 5200, members: 3, pci: 1733 },
  }),
  applicationFromScheme({
    number: 'APP-1009',
    schemeIndex: 0,
    status: FAS_APPLICATION_STATUS.Approved,
    accountNumber: 'ACC-0991',
    applicantName: 'Bui Van H',
    submittedAt: '2026-02-02',
    approvedAt: '2026-02-04',
    courses: ['Math Enrichment 2026'],
  }),
  applicationFromScheme({
    number: 'APP-1008',
    schemeIndex: 2,
    status: FAS_APPLICATION_STATUS.Approved,
    accountNumber: 'ACC-0985',
    applicantName: 'Tan Wei',
    submittedAt: '2026-02-01',
    approvedAt: '2026-02-03',
    courses: ['Science Lab 2026', 'English Workshop'],
  }),
  applicationFromScheme({
    number: 'APP-1005',
    schemeIndex: 4,
    status: FAS_APPLICATION_STATUS.Approved,
    accountNumber: 'ACC-0962',
    applicantName: 'Goh Mei',
    submittedAt: '2025-12-10',
    approvedAt: '2025-12-12',
  }),
  applicationFromScheme({
    number: 'APP-1007',
    schemeIndex: 1,
    status: FAS_APPLICATION_STATUS.Rejected,
    accountNumber: 'ACC-0980',
    applicantName: 'Ho Thi K',
    submittedAt: '2026-01-30',
    reason: 'Income documents incomplete.',
    data: { income: 0, members: 4, pci: 0 },
  }),
  applicationFromScheme({
    number: 'APP-1006',
    schemeIndex: 3,
    status: FAS_APPLICATION_STATUS.Rejected,
    accountNumber: 'ACC-0979',
    applicantName: 'Lim Jia',
    submittedAt: '2026-01-29',
    reason: 'Income exceeds the limit.',
    data: { income: 6000, members: 3, pci: 2000 },
  }),
  ...Array.from({ length: 7 }, (_, index) =>
    applicationFromScheme({
      number: `APP-7${101 + index}`,
      schemeIndex: 5 + index,
      status: FAS_APPLICATION_STATUS.Pending,
      submittedAt: dateFromDay('02', index),
    })
  ),
  ...Array.from({ length: 8 }, (_, index) =>
    applicationFromScheme({
      number: `APP-7${201 + index}`,
      schemeIndex: 14 + index,
      status: FAS_APPLICATION_STATUS.Approved,
      submittedAt: dateFromDay('01', index),
      approvedAt: dateFromDay('01', index + 3),
      courses:
        index % 3 === 0
          ? []
          : index % 2 === 0
            ? ['Coding Bootcamp']
            : ['Art Studio 2026', 'Science Lab 2026'],
    })
  ),
  ...Array.from({ length: 6 }, (_, index) =>
    applicationFromScheme({
      number: `APP-7${301 + index}`,
      schemeIndex: 24 + index,
      status: FAS_APPLICATION_STATUS.Rejected,
      submittedAt: dateFromDay('01', index + 13),
      reason: [
        'Income documents incomplete.',
        'Profile does not meet the criteria.',
        'Income exceeds the limit.',
        'Documents have expired.',
      ][index % 4],
    })
  ),
]

export const createInitialFasState = () => ({
  version: 8,
  schemes: initialSchemes,
  applications: initialApplications,
  auditLogs: [],
})
