import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  AuditOutlined,
  BankOutlined,
  DashboardOutlined,
  IdcardOutlined,
  ProfileOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons'

const SystemAdminLayout = () => {
  const { t } = useTranslation()
  const menuSections = [
    {
      items: [
        {
          key: 'dashboard',
          label: t('dashboard.navigation.label'),
          icon: DashboardOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.DASHBOARD.INDEX),
        },
        {
          key: 'school-management',
          label: t('school_management.menu_label'),
          icon: BankOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.SCHOOL_MANAGEMENT.INDEX),
        },
        {
          key: 'admin-management',
          label: t('admin_management.menu_label'),
          icon: TeamOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.ADMIN_MANAGEMENT.INDEX),
        },
        {
          key: 'education-accounts',
          label: t('navigation.education_accounts'),
          icon: IdcardOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.EDUCATION_ACCOUNTS.INDEX),
        },
        {
          key: 'account-creation-report',
          label: t('navigation.account-creation-report'),
          icon: ScheduleOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.ACCOUNT_CREATION_REPORT.INDEX),
        },
        {
          key: 'logs',
          label: t('navigation.logs'),
          icon: AuditOutlined,
          of: [
            {
              key: 'audit-logs',
              label: t('navigation.audit_logs'),
              url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.LOGS.AUDIT),
            },
            {
              key: 'management-action-logs',
              label: t('management_action_log.title.management'),
              icon: ProfileOutlined,
              url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.LOGS.MANAGEMENT_ACTIONS),
              matchPrefix: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.LOGS.MANAGEMENT_ACTIONS),
            },
          ],
        },
      ],
    },
    {
      placement: 'bottom',
      items: [
        {
          key: 'application-setting',
          label: t('application_setting.menu_label'),
          icon: SettingOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.APPLICATION_SETTING.INDEX),
        },
      ],
    },
  ]

  return (
    <RoleDashboardLayout
      homeUrl={routeUrls.BASE_ROUTE.SYSTEM_ADMIN()}
      menuSections={menuSections}
    />
  )
}

export default SystemAdminLayout
