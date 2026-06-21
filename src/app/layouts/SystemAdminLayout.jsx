import RoleDashboardLayout from '@/app/layouts/RoleDashboardLayout'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'
import {
  AuditOutlined,
  BankOutlined,
  IdcardOutlined,
  RobotOutlined,
  ScheduleOutlined,
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
          key: 'audit-logs',
          label: t('navigation.audit_logs'),
          icon: AuditOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.AUDIT_LOGS.INDEX),
        },
        {
          key: 'ai-assistant-setting',
          label: t('ai_assistant_setting.menu_label'),
          icon: RobotOutlined,
          url: routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.AI_ASSISTANT_SETTING.INDEX),
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
