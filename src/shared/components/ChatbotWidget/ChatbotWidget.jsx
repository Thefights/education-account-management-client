import { useState, useRef, useEffect } from 'react'
import { FloatButton, Input, Button, Spin, theme } from 'antd'
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons'
import { ApiUrls } from '@/shared/api/apiUrls'
import useFetch from '@/shared/hooks/useFetch'
import useAxiosSubmit from '@/shared/hooks/useAxiosSubmit'
import { useNavigate } from 'react-router-dom'
import { routeUrls } from '@/shared/config/routeUrls'
import useTranslation from '@/shared/hooks/useTranslation'

const AI_SUPPORT_REQUEST_MARKER = '[AI_SUPPORT_REQUEST_PROMPT]'
const pendingRequestParams = { statuses: [1], sort: 'createdAt desc', page: 1, pageSize: 1 }

const ChatbotWidget = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('sfs_chatbot_history')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse chatbot history:', e)
      }
    }
    return [
      {
        role: 'assistant',
        content: 'Hello! I am the SFS e-Service Assistant. How can I help you today?',
      },
    ]
  })

  useEffect(() => {
    sessionStorage.setItem('sfs_chatbot_history', JSON.stringify(messages))
  }, [messages])
  const [inputValue, setInputValue] = useState('')
  const [isAiBlockedByRequest, setIsAiBlockedByRequest] = useState(false)
  const { token } = theme.useToken()

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const statusFetch = useFetch(isOpen ? ApiUrls.AI_CHAT.STATUS : '', {}, [isOpen], isOpen)
  const pendingRequestFetch = useFetch(
    isOpen ? ApiUrls.AI_SUPPORT_REQUESTS.INDEX : '',
    pendingRequestParams,
    [isOpen],
    isOpen
  )
  const chatSubmit = useAxiosSubmit({
    url: ApiUrls.AI_CHAT.CHAT,
    method: 'POST',
    onError: (error) => {
      console.error('Chat API Error:', error)

      const status = error.response?.status || error.status
      if (status === 403) {
        setIsAiBlockedByRequest(true)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'The AI system is currently under maintenance. You cannot send messages at this time.',
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Sorry, I am having trouble connecting to the server right now. Please try again later.',
          },
        ])
      }
    },
  })

  const isAiEnabled =
    !isAiBlockedByRequest &&
    !statusFetch.error &&
    (statusFetch.data?.isEnabled ?? true)

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage = { role: 'user', content: inputValue.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')

    // Prepare history payload for API (excluding the current user message)
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content?.replace(AI_SUPPORT_REQUEST_MARKER, '').trim(),
    }))

    const response = await chatSubmit.submit({
      overrideData: {
        message: userMessage.content,
        history: historyPayload,
      },
    })

    if (response && response.answer) {
      setMessages((prev) => [...prev, { role: 'assistant', content: response.answer }])
    }
  }

  const handleComposerKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent?.isComposing) return
    event.preventDefault()
    handleSend()
  }

  const toggleChat = () => setIsOpen(!isOpen)

  const isChatSending = chatSubmit.loading
  const isComposerDisabled = statusFetch.loading || isChatSending || !isAiEnabled
  const pendingRequest = pendingRequestFetch.data?.collection?.[0]

  return (
    <>
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24, width: 56, height: 56 }}
        onClick={toggleChat}
        tooltip="Ask Assistant"
        aria-label="Toggle Chatbot"
      />

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden transition-all"
          style={{
            height: '500px',
            maxHeight: '80vh',
            background: token.colorBgElevated,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {/* Header */}
          <div
            className="flex-shrink-0 flex justify-between items-center py-2 px-3 shadow-sm z-10"
            style={{
              background: 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))',
              color: '#fff',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 border border-white/40 shadow-sm backdrop-blur-sm">
                <RobotOutlined className="text-[16px] text-white opacity-100" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[15px] tracking-wide">SFS Help Assistant</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isAiEnabled ? 'bg-green-300' : 'bg-red-400'}`}
                  ></span>
                  <span className="text-[10px] uppercase tracking-wider opacity-90 font-medium">
                    {isAiEnabled ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <div
              onClick={toggleChat}
              aria-label="Close Chat"
              className="cursor-pointer hover:bg-black/10 transition-colors flex items-center justify-center rounded-full w-8 h-8"
            >
              <CloseOutlined style={{ color: '#fff', fontSize: '16px' }} />
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
            style={{ background: token.colorBgLayout }}
          >
            {messages.map((msg, idx) => {
              const hasSupportPrompt = msg.content?.includes(AI_SUPPORT_REQUEST_MARKER)
              const cleanContent = msg.content?.replace(AI_SUPPORT_REQUEST_MARKER, '').trim()

              return (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="w-[42px] h-[42px] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ background: token.colorFillAlter, color: token.colorPrimary }}
                  >
                    <RobotOutlined className="text-lg" />
                  </div>
                )}

                <div className="flex flex-col gap-2 max-w-[75%]">
                  <div
                    className={`px-4 py-2.5 whitespace-pre-wrap text-[14px] leading-relaxed shadow ${
                      msg.role === 'user'
                        ? 'rounded-2xl rounded-br-sm'
                        : 'rounded-2xl rounded-bl-sm border border-slate-300 dark:border-slate-600'
                    }`}
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, var(--app-primary), var(--app-secondary))'
                          : token.colorBgElevated,
                      color: msg.role === 'user' ? '#fff' : token.colorText,
                    }}
                  >
                    {cleanContent}
                  </div>
                  
                  {hasSupportPrompt && msg.role === 'assistant' && (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: token.borderRadiusLG,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        background: pendingRequest
                          ? token.colorBgElevated
                          : token.colorPrimaryBg,
                        boxShadow: pendingRequest ? token.boxShadowTertiary : 'none',
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: token.borderRadiusLG,
                            background: pendingRequest
                              ? token.colorWarningBg
                              : token.colorBgContainer,
                          }}
                        >
                          {pendingRequest ? (
                            <ClockCircleOutlined style={{ color: token.colorWarning }} />
                          ) : (
                            <CustomerServiceOutlined style={{ color: token.colorPrimary }} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="font-medium" style={{ color: token.colorText }}>
                            {pendingRequest
                              ? t('ai_support_request.text.pending_exists')
                              : t('ai_support_request.action.send_to_admin')}
                          </div>
                          <div
                            className="text-xs mt-1 leading-relaxed"
                            style={{ color: token.colorTextSecondary }}
                          >
                            {pendingRequest
                              ? t('ai_support_request.text.pending_cta_help')
                              : t('ai_support_request.text.fallback_cta_help')}
                          </div>
                        </div>
                      </div>
                      <Button
                        type={pendingRequest ? 'default' : 'primary'}
                        size="small"
                        block
                        disabled={pendingRequestFetch.loading || Boolean(pendingRequestFetch.error)}
                        style={
                          pendingRequest
                            ? {
                                marginTop: 10,
                                color: token.colorPrimary,
                                borderColor: token.colorPrimaryBorder,
                                background: token.colorBgContainer,
                                boxShadow: 'none',
                              }
                            : { marginTop: 10 }
                        }
                        onClick={() => {
                          const previousUserMsg = messages[idx - 1]
                          const target = routeUrls.BASE_ROUTE.ACCOUNT_HOLDER(
                            routeUrls.AI_SUPPORT_REQUESTS.INDEX
                          )
                          if (pendingRequest) {
                            navigate(target)
                          } else if (previousUserMsg && previousUserMsg.role === 'user') {
                            navigate(target, {
                              state: {
                                aiSupportRequestDraft: {
                                  questionMessage: previousUserMsg.content,
                                },
                              },
                            })
                          }
                          setIsOpen(false)
                        }}
                      >
                        <span className="flex items-center justify-between w-full">
                          <span>
                            {pendingRequest
                              ? t('ai_support_request.action.view_pending')
                              : t('ai_support_request.action.send_to_admin')}
                          </span>
                          <ArrowRightOutlined />
                        </span>
                      </Button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div
                    className="w-[42px] h-[42px] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ background: token.colorFillAlter, color: token.colorTextSecondary }}
                  >
                    <UserOutlined className="text-lg" />
                  </div>
                )}
              </div>
            )})}
            {isChatSending && !chatSubmit.loading && (
              <div className="flex gap-3 justify-start">
                <div
                  className="w-[42px] h-[42px] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ background: token.colorFillAlter, color: token.colorPrimary }}
                >
                  <RobotOutlined className="text-lg" />
                </div>
                <div
                  className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-600 rounded-bl-sm flex items-center shadow h-[42px]"
                  style={{ background: token.colorBgElevated }}
                >
                  <Spin size="small" />
                  <span
                    className="ml-2.5 text-[14px] font-medium"
                    style={{ color: token.colorTextSecondary }}
                  >
                    Typing...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input Area */}
          <div
            className="p-3 border-t flex-shrink-0 relative"
            style={{
              background: token.colorBgElevated,
              borderTopColor: token.colorBorderSecondary,
            }}
          >
            <div
              className="flex items-end gap-2 rounded-[24px] border px-2 py-1.5 transition-all focus-within:shadow-sm"
              style={{
                background: token.colorBgContainer,
                borderColor: token.colorBorder,
              }}
            >
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 5 }}
                placeholder={isAiEnabled ? 'Ask a question...' : 'Assistant is currently disabled'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleComposerKeyDown}
                disabled={isComposerDisabled}
                variant="borderless"
                aria-label="Assistant question input"
                style={{
                  minWidth: 0,
                  padding: '7px 8px',
                  lineHeight: 1.5,
                  resize: 'none',
                  background: 'transparent',
                }}
              />
              <Button
                type="primary"
                shape="circle"
                icon={
                  <SendOutlined
                    className={inputValue.trim() && !isChatSending ? '-mt-0.5 ml-0.5' : ''}
                  />
                }
                onClick={handleSend}
                loading={isChatSending}
                disabled={!inputValue.trim() || isComposerDisabled}
                aria-label="Send message"
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center transition-transform ${
                  inputValue.trim() ? 'shadow-md hover:scale-105' : ''
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatbotWidget
