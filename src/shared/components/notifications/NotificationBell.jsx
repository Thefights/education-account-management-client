import { ApiUrls } from '@/shared/api/apiUrls'
import axiosConfig from '@/shared/api/axiosClient'
import { getAccessToken } from '@/shared/api/authTokenStore'
import { envConfig } from '@/shared/config/envConfig'
import { EnumConfig } from '@/shared/config/enumConfig'
import { routeUrls } from '@/shared/config/routeUrls'
import { useLocalStorage } from '@/shared/hooks/useStorage'
import useTranslation from '@/shared/hooks/useTranslation'
import { formatDatetimeStringBasedOnCurrentLanguage } from '@/shared/utils/formatDateUtil'
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import * as signalR from '@microsoft/signalr'
import { Badge, Button, Empty, Flex, Popover, Space, Spin, Tag, Tooltip, Typography, theme } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const notificationPageSize = 10
const notificationListParams = { pageSize: notificationPageSize, sort: 'createdAt desc' }

const normalizeBaseUrl = (baseUrl = '') => baseUrl.replace(/\/+$/, '')

const getHubUrl = () => {
  const baseUrl = normalizeBaseUrl(envConfig.api.baseUrl).replace(/\/api\/v\d+$/i, '')
  return baseUrl ? `${baseUrl}/hubs/notifications` : ''
}

const mergeNotification = (items, notification) => {
  if (!notification?.id) return items
  const exists = items.some((item) => item.id === notification.id)
  if (exists) return items.map((item) => (item.id === notification.id ? notification : item))
  return [notification, ...items].slice(0, Math.max(items.length, notificationPageSize))
}

const getSeverityMeta = (severity, token) => {
  switch (severity) {
    case 'Success':
      return { color: 'success', iconColor: token.colorSuccess, icon: <CheckOutlined /> }
    case 'Warning':
      return { color: 'warning', iconColor: token.colorWarning, icon: <ExclamationCircleOutlined /> }
    case 'Error':
      return { color: 'error', iconColor: token.colorError, icon: <ExclamationCircleOutlined /> }
    case 'Info':
    default:
      return { color: 'processing', iconColor: token.colorInfo, icon: <InfoCircleOutlined /> }
  }
}

const getRoleBaseRoute = (role) => {
  switch (role) {
    case EnumConfig.RoleEnum.SystemAdmin:
      return routeUrls.BASE_ROUTE.SYSTEM_ADMIN()
    case EnumConfig.RoleEnum.FinanceAdmin:
      return routeUrls.BASE_ROUTE.FINANCE_ADMIN()
    case EnumConfig.RoleEnum.SchoolAdmin:
      return routeUrls.BASE_ROUTE.SCHOOL_ADMIN()
    case EnumConfig.RoleEnum.AccountHolder:
      return routeUrls.BASE_ROUTE.ACCOUNT_HOLDER()
    default:
      return '/'
  }
}

const resolveNotificationRoute = (notification, role) => {
  const entityType = notification?.relatedEntityType
  const entityId = notification?.relatedEntityId
  const notificationType = notification?.type

  if (notificationType === 'AiSupportRequestReply') {
    return routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.AI_SUPPORT_REQUESTS.INDEX)
  }

  if (entityType === 'EducationAccountSweepReport') {
    return routeUrls.BASE_ROUTE.SYSTEM_ADMIN(routeUrls.ACCOUNT_CREATION_REPORT.INDEX)
  }

  if (entityType === 'TopupExecution') {
    const target = entityId
      ? routeUrls.TOPUP_MANAGEMENT.HISTORY_DETAIL(entityId)
      : routeUrls.TOPUP_MANAGEMENT.HISTORY
    return routeUrls.BASE_ROUTE.FINANCE_ADMIN(target)
  }

  if (entityType === 'FasApplication') {
    if (role === EnumConfig.RoleEnum.AccountHolder) {
      return routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.MY_FAS.MANAGEMENT)
    }
    return routeUrls.BASE_ROUTE.SCHOOL_ADMIN(routeUrls.FAS_ADMIN.APPLICATIONS)
  }

  if (entityType === 'Payment' || entityType === 'Charge') {
    return routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TUITION_PAYMENT.INDEX)
  }

  if (entityType === 'EducationCreditTransaction') {
    return routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(routeUrls.TRANSACTION_HISTORY.INDEX)
  }

  return getRoleBaseRoute(role)
}

const NotificationBell = ({ profile }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const [themeMode] = useLocalStorage('theme', 'light')
  const isDarkMode = themeMode === 'dark'
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationTotal, setNotificationTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hoveredNotificationId, setHoveredNotificationId] = useState(null)
  const notificationPageRef = useRef(1)
  const loadingMoreRef = useRef(false)
  const unreadCountRef = useRef(0)
  const accessToken = getAccessToken()

  useEffect(() => {
    unreadCountRef.current = unreadCount
  }, [unreadCount])

  const applyNotifications = useCallback((nextNotifications, { append = false } = {}) => {
    const nextItems = Array.isArray(nextNotifications) ? nextNotifications : []

    setNotifications((current) => {
      const currentIds = new Set(current.map((item) => item?.id).filter(Boolean))
      const mergedItems = append
        ? [...current, ...nextItems.filter((item) => item?.id && !currentIds.has(item.id))]
        : nextItems

      return mergedItems
    })
  }, [])

  const fetchNotifications = useCallback(
    async ({ showLoading = true, page = 1, append = false } = {}) => {
      if (showLoading) setLoading(true)
      if (append) {
        loadingMoreRef.current = true
        setLoadingMore(true)
      }
      try {
        const response = await axiosConfig.get(ApiUrls.NOTIFICATION.INDEX, {
          params: { ...notificationListParams, page },
        })
        const nextItems = response?.data?.collection || []
        setNotificationTotal(Number(response?.data?.totalCount || nextItems.length))
        notificationPageRef.current = page
        applyNotifications(nextItems, { append })
      } finally {
        if (showLoading) setLoading(false)
        if (append) {
          loadingMoreRef.current = false
          setLoadingMore(false)
        }
      }
    },
    [applyNotifications]
  )

  const fetchUnreadCount = useCallback(async ({ refreshOnIncrease = false } = {}) => {
    try {
      const response = await axiosConfig.get(ApiUrls.NOTIFICATION.UNREAD_COUNT)
      const nextCount = Number(response?.data?.count || 0)

      if (refreshOnIncrease && nextCount > unreadCountRef.current) {
        fetchNotifications({ showLoading: false })
      }

      setUnreadCount(nextCount)
    } catch {
      setUnreadCount(0)
    }
  }, [fetchNotifications])

  useEffect(() => {
    queueMicrotask(() => {
      fetchNotifications({ showLoading: false })
      fetchUnreadCount()
    })
  }, [fetchNotifications, fetchUnreadCount])

  useEffect(() => {
    const hubUrl = getHubUrl()
    if (!accessToken || !hubUrl) return undefined

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken() || accessToken,
      })
      .withAutomaticReconnect()
      .build()

    connection.on('notificationCreated', (notification) => {
      setNotifications((current) => {
        const nextNotifications = mergeNotification(current, notification)
        return nextNotifications
      })
      setNotificationTotal((current) => current + 1)
      setUnreadCount((current) => current + 1)
      fetchUnreadCount()
    })

    connection.on('notificationUnreadCountChanged', (payload) => {
      const nextCount = Number(payload?.count || 0)
      if (nextCount > unreadCountRef.current) {
        fetchNotifications({ showLoading: false })
      }
      setUnreadCount(nextCount)
    })

    connection.onreconnected(() => {
      fetchNotifications({ showLoading: false })
      fetchUnreadCount()
    })

    connection.start().catch(() => undefined)

    return () => {
      connection.stop().catch(() => undefined)
    }
  }, [accessToken, fetchNotifications, fetchUnreadCount])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchUnreadCount({ refreshOnIncrease: true })
    }, 15000)

    return () => window.clearInterval(intervalId)
  }, [fetchUnreadCount])

  const markAsRead = useCallback(
    async (notification) => {
      if (!notification?.id || notification.isRead) return

      await axiosConfig.post(ApiUrls.NOTIFICATION.READ(notification.id))
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
      )
      fetchUnreadCount()
    },
    [fetchUnreadCount]
  )

  const markAllAsRead = useCallback(async () => {
    await axiosConfig.post(ApiUrls.NOTIFICATION.READ_ALL)
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
    setUnreadCount(0)
    fetchUnreadCount()
  }, [fetchUnreadCount])

  const loadMoreNotifications = useCallback(() => {
    if (loadingMoreRef.current || notifications.length >= notificationTotal) return

    fetchNotifications({
      showLoading: false,
      page: notificationPageRef.current + 1,
      append: true,
    })
  }, [fetchNotifications, notificationTotal, notifications.length])

  const handleNotificationScroll = useCallback(
    (event) => {
      const target = event.currentTarget
      const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight

      if (remainingScroll < 80) {
        loadMoreNotifications()
      }
    },
    [loadMoreNotifications]
  )

  const deleteNotification = useCallback(
    async (notification) => {
      if (!notification?.id) return

      await axiosConfig.delete(ApiUrls.NOTIFICATION.DELETE(notification.id))
      setNotifications((current) => {
        const nextNotifications = current.filter((item) => item.id !== notification.id)
        return nextNotifications
      })
      setNotificationTotal((current) => Math.max(current - 1, 0))
      fetchUnreadCount()
    },
    [fetchUnreadCount]
  )

  const handleOpenChange = useCallback(
    (nextOpen) => {
      setOpen(nextOpen)
      if (nextOpen) {
        fetchNotifications()
        fetchUnreadCount()
      }
    },
    [fetchNotifications, fetchUnreadCount]
  )

  const handleItemClick = useCallback(
    async (notification) => {
      await markAsRead(notification)
      setOpen(false)
      navigate(resolveNotificationRoute(notification, profile?.role))
    },
    [markAsRead, navigate, profile?.role]
  )

  const content = useMemo(
    () => (
      <div style={{ width: 420, maxWidth: 'calc(100vw - 32px)' }}>
        <Flex
          align="center"
          justify="space-between"
          style={{
            paddingBottom: 12,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Space size={8}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('notification.title')}
            </Typography.Title>
            <Tag color={unreadCount > 0 ? 'processing' : 'default'} style={{ marginInlineEnd: 0 }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
            </Tag>
          </Space>
          <Button
            type="link"
            size="small"
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
            style={{ paddingInline: 0, fontWeight: 500 }}
          >
            {t('notification.mark_all_read')}
          </Button>
        </Flex>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '28px 0 12px' }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('notification.empty')} />
          </div>
        ) : (
          <Flex
            vertical
            onScroll={handleNotificationScroll}
            gap={10}
            style={{
              maxHeight: 440,
              overflowY: 'auto',
              paddingTop: 12,
              paddingRight: 4,
            }}
          >
            {notifications.map((item) => {
              const severity = getSeverityMeta(item.severity, token)
              const isUnread = !item.isRead
              const isHovered = hoveredNotificationId === item.id
              const unreadBackground = isDarkMode
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(14, 165, 233, 0.08))'
                : 'linear-gradient(135deg, rgba(239, 246, 255, 0.98), rgba(248, 251, 255, 0.98))'
              const readBackground = isDarkMode
                ? 'rgba(255, 255, 255, 0.03)'
                : token.colorBgContainer
              const unreadBorder = isDarkMode
                ? 'rgba(96, 165, 250, 0.36)'
                : 'rgba(37, 99, 235, 0.18)'
              const cardBorder = isUnread ? unreadBorder : token.colorBorderSecondary

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setHoveredNotificationId(item.id)}
                  onMouseLeave={() => setHoveredNotificationId(null)}
                  style={{
                    cursor: 'pointer',
                    padding: 14,
                    background: isUnread ? unreadBackground : readBackground,
                    borderRadius: 14,
                    border: `1px solid ${cardBorder}`,
                    boxShadow: isHovered
                      ? '0 14px 34px rgba(15, 23, 42, 0.12)'
                      : isUnread
                        ? '0 8px 22px rgba(37, 99, 235, 0.08)'
                        : '0 4px 14px rgba(15, 23, 42, 0.04)',
                    transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                    transition: 'all 160ms ease',
                  }}
                >
                  <Flex align="flex-start" gap={12}>
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        width: 34,
                        height: 34,
                        flex: '0 0 34px',
                        borderRadius: 12,
                        color: severity.iconColor,
                        background: isDarkMode
                          ? 'rgba(255, 255, 255, 0.08)'
                          : `${severity.iconColor}16`,
                      }}
                    >
                      <span style={{ fontSize: 18, lineHeight: 1 }}>
                        {severity.icon}
                      </span>
                    </Flex>
                    <Flex vertical gap={8} style={{ flex: 1, minWidth: 0 }}>
                      <Flex align="flex-start" justify="space-between" gap={8}>
                        <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
                          <Typography.Text
                            strong={isUnread}
                            ellipsis
                            style={{ color: token.colorText, lineHeight: 1.35 }}
                          >
                            {item.title}
                          </Typography.Text>
                          <Space size={6} wrap>
                            <Tag
                              color={severity.color}
                              bordered={false}
                              style={{ marginInlineEnd: 0, borderRadius: 999 }}
                            >
                              {item.severity || 'Info'}
                            </Tag>
                            {isUnread ? (
                              <Tag
                                color="blue"
                                bordered={false}
                                style={{ marginInlineEnd: 0, borderRadius: 999 }}
                              >
                                New
                              </Tag>
                            ) : null}
                          </Space>
                        </Flex>
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(event) => {
                            event.stopPropagation()
                            deleteNotification(item)
                          }}
                          style={{
                            opacity: isHovered ? 1 : 0.72,
                            borderRadius: 8,
                            flex: '0 0 auto',
                          }}
                        />
                      </Flex>
                      <Typography.Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ margin: 0, lineHeight: 1.5 }}
                      >
                        {item.message}
                      </Typography.Paragraph>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {formatDatetimeStringBasedOnCurrentLanguage(item.createdAt)}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                </div>
              )
            })}
            {loadingMore ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
                <Spin size="small" />
              </div>
            ) : null}
          </Flex>
        )}
      </div>
    ),
    [
      deleteNotification,
      handleItemClick,
      handleNotificationScroll,
      hoveredNotificationId,
      isDarkMode,
      loading,
      loadingMore,
      markAllAsRead,
      notifications,
      t,
      token,
      unreadCount,
    ]
  )

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={handleOpenChange}
      content={content}
      arrow
    >
      <Tooltip title={t('notification.title')}>
        <Badge count={unreadCount} size="small" overflowCount={99}>
          <Button
            type="text"
            size="large"
            aria-label={t('notification.title')}
            icon={<BellOutlined />}
            style={{ borderRadius: 10, border: '1px solid var(--app-border-color)' }}
          />
        </Badge>
      </Tooltip>
    </Popover>
  )
}

export default NotificationBell
