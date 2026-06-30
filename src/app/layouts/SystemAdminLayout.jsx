import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  AuditOutlined,
  BankOutlined,
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
          key: 'sweep-reports',
          label: t('navigation.batch_reports'),
          icon: ScheduleOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.SWEEP_REPORTS.INDEX),
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
