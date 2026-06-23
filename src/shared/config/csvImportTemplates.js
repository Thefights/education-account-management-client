export const csvImportTemplates = {
  admins: {
    filename: 'admin-import-template.csv',
    headers: ['Role', 'AzureObjectId', 'FullName', 'Nric', 'Email', 'PhoneNumber', 'SchoolId'],
    sampleRows: [
      [
        'FinanceAdmin',
        '11111111-1111-1111-1111-111111111111',
        'Sample Finance Admin',
        'S1234567D',
        'sample.finance.admin@example.com',
        '+6591234567',
        '',
      ],
    ],
  },
  schools: {
    filename: 'school-import-template.csv',
    headers: ['SchoolName', 'Address', 'PhoneNumber', 'Email'],
    sampleRows: [
      [
        'Sample Academy',
        '1 Example Road, Singapore 123456',
        '+6561234567',
        'contact@example.edu.sg',
      ],
    ],
  },
  courses: {
    filename: 'course-import-template.csv',
    headers: [
      'CourseName',
      'Description',
      'CourseFeeAmount',
      'MiscFeeAmount',
      'EnrollmentDueDate',
      'FasApplicationDueDate',
      'StartDate',
      'EndDate',
    ],
    sampleRows: [
      [
        'Sample Mathematics Course',
        'Introductory mathematics course',
        1200,
        100,
        '2026-08-01T10:00:00+08:00',
        '2026-08-08T10:00:00+08:00',
        '2026-08-15T10:00:00+08:00',
        '2026-12-15T10:00:00+08:00',
      ],
    ],
  },
  educationAccounts: {
    filename: 'education-account-import-template.csv',
    headers: ['Nric', 'Reason'],
    sampleRows: [
      ['S1234567D', 'Eligible citizen included through the manual batch import process.'],
    ],
  },
  manualTopup: {
    filename: 'manual-topup-template.csv',
    headers: ['AccountNumber'],
    sampleRows: [['EDU-2026-00000000001']],
  },
  schoolStudents: {
    filename: 'school-student-import-template.csv',
    headers: ['Nric'],
    sampleRows: [['S1234567D']],
  },
}
