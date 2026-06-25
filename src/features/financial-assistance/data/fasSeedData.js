export const FAS_FIELD_OPTIONS = [
  { value: 'studentAge', label: 'Student age' },
  { value: 'nationality', label: 'Nationality' },
  { value: 'parentNationality', label: "Parent's Nationality" },
  { value: 'pci', label: 'Per-Capita Income' },
  { value: 'income', label: 'Gross Household Income' },
]

export const FAS_FIELD_LABELS = FAS_FIELD_OPTIONS.reduce(
  (acc, item) => ({ ...acc, [item.value]: item.label }),
  {}
)

export const FAS_STATUS = {
  Active: 'active',
  Inactive: 'inactive',
  Draft: 'draft',
}

export const FAS_APPLICATION_STATUS = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
}

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
    .replace(/^_+|_+$/g, '')

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
    return {
      conditions: [
        { id: `cond-${index}-parent-nationality`, field: 'parentNationality', value: 'Singapore Citizen' },
        { id: `cond-${index}-pci`, field: 'pci', value: 1000 },
      ],
      connectors: ['AND'],
    }
  }

  if (/meal|uniform|textbook|transport/.test(low)) {
    return {
      conditions: [
        { id: `cond-${index}-age`, field: 'studentAge', value: 12 },
        { id: `cond-${index}-income`, field: 'income', value: 4000 },
      ],
      connectors: ['AND'],
    }
  }

  if (citizenOnly) {
    return {
      conditions: [{ id: `cond-${index}-nationality`, field: 'nationality', value: 'Singapore Citizen' }],
      connectors: [],
    }
  }

  const tier = index % 4
  const incomeMax = [2500, 3500, 4500, 6000][tier]
  const pciMax = [625, 875, 1125, 1500][tier]

  return {
    conditions: [
      { id: `cond-${index}-income`, field: 'income', value: incomeMax },
      { id: `cond-${index}-pci`, field: 'pci', value: pciMax },
    ],
    connectors: ['OR'],
  }
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
  conditions: [
    { id: `${id}-cond-1`, field: 'nationality', value: 'Singapore Citizen' },
    { id: `${id}-cond-2`, field: 'pci', value: '' },
  ],
  connectors: ['AND'],
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
    conditions: conditionSet.conditions,
    connectors: conditionSet.connectors,
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
  version: 6,
  schemes: initialSchemes,
  applications: initialApplications,
  auditLogs: [],
})
