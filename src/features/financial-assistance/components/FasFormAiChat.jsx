import {
  CheckOutlined,
  CloseOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Alert, Button, Input, Modal, Progress, Spin, Tag, Tooltip, theme } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content:
    'Hello! Describe your circumstances in your own words. I will suggest answers for you to review before applying them.',
}

const getQuestionId = (question) => String(question?.apiId ?? question?.id ?? '')

const getSchemeId = (scheme) => String(scheme?.apiId ?? scheme?.id ?? scheme?.schemeId ?? '')

const createSessionId = (schemeId) =>
  `fas-${schemeId}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`

const getSessionStorageKey = (schemeId) => `dynamic-fas-session-${schemeId}`

const getSessionId = (schemeId) => {
  const key = getSessionStorageKey(schemeId)
  const existing = sessionStorage.getItem(key)
  if (existing) return existing

  const sessionId = createSessionId(schemeId)
  sessionStorage.setItem(key, sessionId)
  return sessionId
}

const normalizeQuestionType = (type) =>
  ['text', 'textarea', 'select'].includes(type) ? type : 'textarea'

const FasFormAiChat = ({
  scheme,
  additionalAnswers,
  isAiEnabled = true,
  isStatusLoading = false,
  isSending,
  onSendMessage,
  onResetSession,
  onResetSessionDuringUnload,
  onApplySuggestion,
  onApplyAllSuggestions,
}) => {
  const schemeId = getSchemeId(scheme)
  const sessionId = useMemo(() => getSessionId(schemeId), [schemeId])
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState({})
  const [assistantState, setAssistantState] = useState(null)
  const [confirmationQueue, setConfirmationQueue] = useState([])
  const [error, setError] = useState('')
  const [lastFailedMessage, setLastFailedMessage] = useState('')
  const [reviewDecision, setReviewDecision] = useState('')
  const { token } = theme.useToken()
  const dismissedSuggestionsRef = useRef({})
  const messagesEndRef = useRef(null)
  const resetSessionRef = useRef(onResetSession)
  const resetSessionDuringUnloadRef = useRef(onResetSessionDuringUnload)
  const hasRequestedResetRef = useRef(false)

  const questions = useMemo(
    () =>
      (scheme?.additionalQuestions || [])
        .map((question) => {
          const questionId = Number(question.apiId ?? question.id)
          if (!Number.isInteger(questionId) || questionId <= 0) return null

          return {
            question_id: questionId,
            question_text: question.questionText,
            is_required: Boolean(question.isRequired),
            description: question.description || null,
            type: normalizeQuestionType(question.type),
            options: Array.isArray(question.options) ? question.options : [],
          }
        })
        .filter(Boolean),
    [scheme]
  )

  const questionMap = useMemo(
    () =>
      Object.fromEntries(
        (scheme?.additionalQuestions || []).map((question) => [getQuestionId(question), question])
      ),
    [scheme]
  )

  const questionNumberMap = useMemo(
    () =>
      Object.fromEntries(
        (scheme?.additionalQuestions || []).map((question, index) => [
          getQuestionId(question),
          index + 1,
        ])
      ),
    [scheme]
  )

  const visibleSuggestions = useMemo(
    () => Object.entries(suggestions).filter(([questionId]) => Boolean(questionMap[questionId])),
    [questionMap, suggestions]
  )

  const pendingUpdate = useMemo(() => {
    const questionId = String(assistantState?.pending_update_question_id || '')
    const field = assistantState?.questions?.[questionId]

    if (!questionId || field?.status !== 'pending_update' || !field.pending_value) return null

    return {
      questionId,
      questionText: field.question_text || questionMap[questionId]?.questionText,
      currentValue: String(field.value || additionalAnswers?.[questionId] || ''),
      newValue: String(field.pending_value),
    }
  }, [additionalAnswers, assistantState, questionMap])

  const isReviewRequired = visibleSuggestions.length > 0 || Boolean(pendingUpdate)
  const isComposerLocked = isReviewRequired

  const progress = useMemo(() => {
    const requiredQuestions = (scheme?.additionalQuestions || []).filter(
      (question) => question.isRequired
    )
    const completed = requiredQuestions.filter((question) => {
      const questionId = getQuestionId(question)
      return (
        String(additionalAnswers?.[questionId] || '').trim() ||
        String(suggestions?.[questionId] || '').trim()
      )
    }).length

    return { completed, total: requiredQuestions.length }
  }, [additionalAnswers, scheme, suggestions])

  const activeConfirmation = confirmationQueue[0] || null
  const isAiUnavailable = !isStatusLoading && !isAiEnabled
  const isComposerBlocked = isSending || !questions.length || isStatusLoading || isAiUnavailable
  const isComposerDisabled = isComposerBlocked || isComposerLocked

  useEffect(() => {
    resetSessionRef.current = onResetSession
  }, [onResetSession])

  useEffect(() => {
    resetSessionDuringUnloadRef.current = onResetSessionDuringUnload
  }, [onResetSessionDuringUnload])

  useEffect(() => {
    const resetSessionSilently = (preferUnloadHandler = false) => {
      if (hasRequestedResetRef.current || !sessionId) return

      const resetSession =
        preferUnloadHandler && resetSessionDuringUnloadRef.current
          ? resetSessionDuringUnloadRef.current
          : resetSessionRef.current

      if (!resetSession) return

      hasRequestedResetRef.current = true
      Promise.resolve(resetSession(sessionId)).catch(() => {})
      sessionStorage.removeItem(getSessionStorageKey(schemeId))
    }

    const handlePageHide = () => resetSessionSilently(true)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      resetSessionSilently(false)
    }
  }, [schemeId, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [isSending, messages, suggestions])

  const addStatusMessage = (message) => {
    setMessages((current) => [...current, { role: 'status', content: message }])
  }

  const currentAnswers = () =>
    Object.fromEntries(
      questions.map((question) => [
        String(question.question_id),
        String(additionalAnswers?.[String(question.question_id)] || ''),
      ])
    )

  const handleSend = async (
    event,
    quickText,
    { appendUserMessage = true, allowDuringReview = false, suppressAssistantMessage = false } = {}
  ) => {
    event?.preventDefault?.()
    const messageText = String(quickText ?? inputValue).trim()
    if (
      !messageText ||
      isComposerBlocked ||
      (isComposerLocked && !allowDuringReview)
    ) {
      return null
    }

    if (appendUserMessage) {
      setMessages((current) => [...current, { role: 'user', content: messageText }])
    }
    setInputValue('')
    setError('')

    try {
      const response = await onSendMessage({
        session_id: sessionId,
        fas_scheme_id: Number(schemeId),
        message: messageText,
        questions,
        current_answers: currentAnswers(),
      })

      if (!response) {
        throw new Error('Could not connect to the AI service.')
      }

      const responsePendingQuestionId = String(
        response.assistant_state?.pending_update_question_id || ''
      )
      const responsePendingField = response.assistant_state?.questions?.[responsePendingQuestionId]
      const isPendingConfirmation =
        responsePendingField?.status === 'pending_update' && responsePendingField.pending_value

      if (!suppressAssistantMessage && !isPendingConfirmation && response.reply) {
        setMessages((current) => [...current, { role: 'assistant', content: response.reply }])
      }
      setAssistantState(response.assistant_state || null)

      const nextSuggestions = Object.fromEntries(
        Object.entries(response.suggested_fields || {}).filter(
          ([questionId, value]) =>
            questionMap[questionId] && dismissedSuggestionsRef.current[questionId] !== value
        )
      )
      setSuggestions(nextSuggestions)
      setLastFailedMessage('')
      return response
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the AI service.')
      setLastFailedMessage(appendUserMessage ? messageText : '')
      return null
    }
  }

  const submitPendingDecision = async (decision) => {
    if (!pendingUpdate || reviewDecision || isSending) return

    setReviewDecision(decision)
    const response = await handleSend(undefined, decision === 'approve' ? 'Yes' : 'No', {
      appendUserMessage: false,
      allowDuringReview: true,
      suppressAssistantMessage: true,
    })

    if (response) {
      if (decision === 'approve') {
        onApplySuggestion(pendingUpdate.questionId, pendingUpdate.newValue)
        setSuggestions((current) => {
          const next = { ...current }
          delete next[pendingUpdate.questionId]
          return next
        })
        delete dismissedSuggestionsRef.current[pendingUpdate.questionId]
      }

      addStatusMessage(
        decision === 'approve'
          ? 'Updated answer applied.'
          : 'Kept the current answer. The proposed update was dismissed.'
      )
    }
    setReviewDecision('')
  }

  const removeSuggestion = (questionId) => {
    setSuggestions((current) => {
      const next = { ...current }
      delete next[questionId]
      return next
    })
  }

  const commitSuggestion = (questionId, value) => {
    onApplySuggestion(questionId, value)
    removeSuggestion(questionId)
    delete dismissedSuggestionsRef.current[questionId]
    addStatusMessage('Answer applied.')
  }

  const requiresConfirmation = (questionId, value) => {
    const currentValue = String(additionalAnswers?.[questionId] || '').trim()
    const confirmedByChat = assistantState?.questions?.[questionId]?.source === 'confirmed_update'

    return currentValue && currentValue !== value && !confirmedByChat
  }

  const applySuggestion = (questionId, value) => {
    if (requiresConfirmation(questionId, value)) {
      setConfirmationQueue([
        {
          questionId,
          currentValue: String(additionalAnswers?.[questionId] || '').trim(),
          newValue: value,
        },
      ])
      return
    }

    commitSuggestion(questionId, value)
  }

  const rejectSuggestion = (questionId, value) => {
    dismissedSuggestionsRef.current[questionId] = value
    removeSuggestion(questionId)
    addStatusMessage('Suggestion dismissed. The form was not changed.')
  }

  const handleApplyAll = () => {
    const answersToApply = {}
    const conflicts = []

    visibleSuggestions.forEach(([questionId, value]) => {
      if (requiresConfirmation(questionId, value)) {
        conflicts.push({
          questionId,
          currentValue: String(additionalAnswers?.[questionId] || '').trim(),
          newValue: value,
        })
      } else {
        answersToApply[questionId] = value
      }
    })

    if (Object.keys(answersToApply).length) {
      onApplyAllSuggestions(answersToApply)
      setSuggestions((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([questionId]) => !(questionId in answersToApply))
        )
      )
    }

    if (conflicts.length) {
      setConfirmationQueue(conflicts)
      addStatusMessage(
        `Applied ${Object.keys(answersToApply).length} suggestions. ${conflicts.length} need confirmation.`
      )
    } else {
      addStatusMessage(`Applied ${Object.keys(answersToApply).length} suggestions.`)
    }
  }

  const advanceConfirmation = () => {
    setConfirmationQueue((current) => current.slice(1))
  }

  const confirmUpdate = () => {
    if (!activeConfirmation) return
    commitSuggestion(activeConfirmation.questionId, activeConfirmation.newValue)
    advanceConfirmation()
  }

  const keepCurrentAnswer = () => {
    addStatusMessage('Kept the current answer. The suggestion is still available for review.')
    advanceConfirmation()
  }

  const componentStyles = `
    .fas-ai-chat {
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
      color: ${token.colorText};
      display: flex;
      flex-direction: column;
      font-size: 14px;
      line-height: 1.45;
      min-height: 420px;
      overflow: hidden;
      width: 100%;
    }

    .fas-ai-chat-header {
      align-items: center;
      border-bottom: 1px solid ${token.colorBorderSecondary};
      display: flex;
      justify-content: space-between;
      padding: 14px 16px;
    }

    .fas-ai-identity,
    .fas-ai-message,
    .fas-ai-composer {
      align-items: center;
      display: flex;
      gap: 10px;
      min-width: 0;
    }

    .fas-ai-avatar,
    .fas-ai-message-avatar {
      align-items: center;
      background: ${token.colorPrimaryBg};
      border: 1px solid ${token.colorPrimaryBorder};
      border-radius: 999px;
      color: ${token.colorPrimary};
      display: inline-flex;
      flex: 0 0 auto;
      justify-content: center;
    }

    .fas-ai-avatar {
      font-size: 17px;
      height: 34px;
      width: 34px;
    }

    .fas-ai-message-avatar {
      font-size: 13px;
      height: 26px;
      width: 26px;
    }

    .fas-ai-title-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .fas-ai-title-row strong {
      color: ${token.colorText};
      font-size: 14px;
      font-weight: 700;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fas-ai-presence {
      align-items: center;
      color: ${token.colorTextSecondary};
      display: inline-flex;
      font-size: 12px;
      gap: 6px;
    }

    .fas-ai-presence i {
      background: ${isAiUnavailable ? token.colorWarning : token.colorSuccess};
      border-radius: 50%;
      display: inline-block;
      height: 7px;
      width: 7px;
    }

    .fas-ai-progress {
      display: grid;
      gap: 8px;
      grid-template-columns: auto minmax(64px, 1fr) auto;
      padding: 12px 16px;
    }

    .fas-ai-progress span,
    .fas-ai-progress strong {
      color: ${token.colorTextSecondary};
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .fas-ai-scroll-area {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 12px;
      max-height: 430px;
      min-height: 220px;
      overflow-y: auto;
      padding: 14px;
    }

    .fas-ai-messages {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .fas-ai-message.user {
      flex-direction: row-reverse;
    }

    .fas-ai-bubble {
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
      flex: 1;
      max-width: 100%;
      padding: 10px 12px;
      word-break: break-word;
    }

    .fas-ai-message.user .fas-ai-bubble {
      background: ${token.colorPrimaryBg} !important;
      border-color: ${token.colorPrimaryBorder} !important;
    }

    .fas-ai-typing {
      align-items: center;
      display: inline-flex;
      gap: 8px;
    }

    .fas-ai-status-alert {
      font-size: 13px;
    }

    .fas-ai-suggestions {
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
    }

    .fas-ai-suggestions-head,
    .fas-ai-suggestion-meta,
    .fas-ai-suggestion-actions {
      align-items: center;
      display: flex;
      gap: 8px;
      justify-content: space-between;
    }

    .fas-ai-kicker {
      color: ${token.colorPrimary};
      display: block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .fas-ai-suggestions h4,
    .fas-ai-suggestion-card h5,
    .fas-ai-current-answer p,
    .fas-ai-proposed-answer p {
      margin: 0;
    }

    .fas-ai-suggestions h4 {
      color: ${token.colorText};
      font-size: 14px;
      margin-top: 2px;
    }

    .fas-ai-suggestion-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .fas-ai-suggestion-card {
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px;
    }

    .fas-ai-suggestion-meta span,
    .fas-ai-current-answer span,
    .fas-ai-proposed-answer span,
    .fas-ai-confirmation span {
      color: ${token.colorTextSecondary};
      font-size: 12px;
    }

    .fas-ai-suggestion-card h5 {
      color: ${token.colorText};
      font-size: 13px;
      font-weight: 700;
    }

    .fas-ai-current-answer,
    .fas-ai-proposed-answer,
    .fas-ai-confirmation .is-new {
      border-radius: ${token.borderRadius}px;
      padding: 10px;
    }

    .fas-ai-current-answer p,
    .fas-ai-proposed-answer p,
    .fas-ai-confirmation p {
      color: ${token.colorText};
      font-size: 13px;
    }

    .fas-ai-composer-wrap {
      border-top: 1px solid ${token.colorBorderSecondary};
      padding: 12px;
    }

    .fas-ai-composer .ant-input {
      min-width: 0;
    }

    .fas-ai-composer .ant-btn {
      flex: 0 0 auto;
    }

    .fas-ai-confirmation {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .fas-ai-confirm-question {
      font-weight: 700;
    }
  `

  return (
    <>
      <style>{componentStyles}</style>
      <div className="fas-ai-chat" style={{ background: token.colorBgLayout }}>
        <header className="fas-ai-chat-header">
          <div className="fas-ai-identity">
            <span className="fas-ai-avatar">
              <RobotOutlined />
            </span>
            <div className="fas-ai-title-row">
              <strong>FAS Form Assistant</strong>
              <span className="fas-ai-presence">
                <i /> {isStatusLoading ? 'Checking' : isAiUnavailable ? 'Unavailable' : 'Online'}
              </span>
            </div>
          </div>
        </header>

        <div className="fas-ai-progress" style={{ background: token.colorBgElevated, borderBottomColor: token.colorBorderSecondary }}>
          <span>Required answers</span>
          <Progress
            percent={progress.total ? (progress.completed / progress.total) * 100 : 100}
            showInfo={false}
            size="small"
          />
          <strong>
            {progress.completed}/{progress.total}
          </strong>
        </div>

        <div className="fas-ai-scroll-area">
          {isStatusLoading && (
            <Alert
              className="fas-ai-status-alert"
              type="info"
              showIcon
              message="Checking AI assistant availability..."
            />
          )}

          {isAiUnavailable && (
            <Alert
              className="fas-ai-status-alert"
              type="warning"
              showIcon
              message="AI assistant is currently unavailable."
            />
          )}

          <div className="fas-ai-messages" aria-live="polite">
            {messages.map((chatMessage, index) =>
              chatMessage.role === 'status' ? (
                <Alert
                  className="fas-ai-status-alert"
                  key={`${chatMessage.role}-${index}`}
                  type="success"
                  showIcon
                  message={chatMessage.content}
                />
              ) : (
                <div
                  className={`fas-ai-message ${chatMessage.role}`}
                  key={`${chatMessage.role}-${index}`}
                >
                  <span className="fas-ai-message-avatar">
                    {chatMessage.role === 'assistant' ? <RobotOutlined /> : <UserOutlined />}
                  </span>
                  <div className="fas-ai-bubble" style={{ background: token.colorBgElevated, color: token.colorText, borderColor: token.colorBorderSecondary }}>{chatMessage.content}</div>
                </div>
              )
            )}

            {isSending && (
              <div className="fas-ai-message assistant">
                <span className="fas-ai-message-avatar">
                  <RobotOutlined />
                </span>
                <div className="fas-ai-bubble fas-ai-typing" aria-label="AI is processing" style={{ background: token.colorBgElevated, borderColor: token.colorBorderSecondary, color: token.colorTextSecondary }}>
                  <Spin size="small" />
                  <span>Typing...</span>
                </div>
              </div>
            )}
          </div>

          {isReviewRequired && (
            <section className="fas-ai-suggestions" aria-label="AI suggestions" style={{ background: token.colorBgLayout, borderColor: token.colorBorderSecondary }}>
              <div className="fas-ai-suggestions-head">
                <div>
                  <span className="fas-ai-kicker">Ready for review</span>
                  <h4>Suggested answers</h4>
                </div>
                {visibleSuggestions.length > 1 && (
                  <Button size="small" type="primary" onClick={handleApplyAll}>
                    Approve all
                  </Button>
                )}
              </div>

              <div className="fas-ai-suggestion-list">
                {pendingUpdate && (
                  <article
                    className="fas-ai-suggestion-card" style={{ background: token.colorBgContainer, borderColor: token.colorBorderSecondary }}
                    key={`pending-${pendingUpdate.questionId}`}
                  >
                    <div className="fas-ai-suggestion-meta">
                      <span>Question {questionNumberMap[pendingUpdate.questionId]}</span>
                      <Tag color="gold">Confirmation required</Tag>
                    </div>
                    <h5>{pendingUpdate.questionText}</h5>
                    <div className="fas-ai-current-answer" style={{ background: token.colorBgLayout }}>
                      <span>Current answer</span>
                      <p>{pendingUpdate.currentValue || 'No current answer'}</p>
                    </div>
                    <div className="fas-ai-proposed-answer" style={{ background: token.colorBgLayout }}>
                      <span>Proposed update</span>
                      <p>{pendingUpdate.newValue}</p>
                    </div>
                    <div className="fas-ai-suggestion-actions">
                      <Button
                        size="small"
                        icon={<CloseOutlined />}
                        loading={reviewDecision === 'dismiss'}
                        disabled={Boolean(reviewDecision)}
                        onClick={() => submitPendingDecision('dismiss')}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        icon={<CheckOutlined />}
                        loading={reviewDecision === 'approve'}
                        disabled={Boolean(reviewDecision)}
                        onClick={() => submitPendingDecision('approve')}
                      >
                        Approve answer
                      </Button>
                    </div>
                  </article>
                )}
                {visibleSuggestions.map(([questionId, value]) => {
                  const question = questionMap[questionId]
                  const currentValue = String(additionalAnswers?.[questionId] || '').trim()

                  return (
                    <article className="fas-ai-suggestion-card" style={{ background: token.colorBgContainer, borderColor: token.colorBorderSecondary }} key={questionId}>
                      <div className="fas-ai-suggestion-meta">
                        <span>Question {questionNumberMap[questionId]}</span>
                        <Tag color="gold">Awaiting review</Tag>
                      </div>
                      <h5>{question?.questionText}</h5>
                      {currentValue && currentValue !== value && (
                        <div className="fas-ai-current-answer" style={{ background: token.colorBgLayout }}>
                          <span>Current answer</span>
                          <p>{currentValue}</p>
                        </div>
                      )}
                      <div className="fas-ai-proposed-answer" style={{ background: token.colorBgLayout }}>
                        <span>AI suggestion</span>
                        <p>{value}</p>
                      </div>
                      <div className="fas-ai-suggestion-actions">
                        <Button
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() => rejectSuggestion(questionId, value)}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="small"
                          type="primary"
                          icon={<CheckOutlined />}
                          onClick={() => applySuggestion(questionId, value)}
                        >
                          Approve answer
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {error && (
            <Alert
              type="error"
              showIcon
              message="AI assistant is unavailable"
              description={error}
              action={
                lastFailedMessage ? (
                  <Button
                    size="small"
                    onClick={(event) =>
                      handleSend(event, lastFailedMessage, { appendUserMessage: false })
                    }
                  >
                    Retry
                  </Button>
                ) : null
              }
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="fas-ai-composer-wrap" style={{ background: token.colorBgElevated, borderTopColor: token.colorBorderSecondary }}>
          <Tooltip
            title={
              isComposerLocked
                ? 'Please approve or dismiss the suggested answers before continuing the chat.'
                : null
            }
            placement="top"
          >
            <div className={`fas-ai-composer${isComposerLocked ? ' is-review-locked' : ''}`}>
              <Input
                aria-label="Message FAS Form Assistant"
                value={inputValue}
                placeholder={
                  isComposerLocked
                    ? 'Review the suggested answers to continue...'
                    : 'Describe your circumstances...'
                }
                disabled={isComposerDisabled}
                onChange={(event) => setInputValue(event.target.value)}
                onPressEnter={handleSend}
              />
              <Button
                type="primary"
                shape="circle"
                aria-label="Send message"
                icon={<SendOutlined />}
                loading={isSending}
                disabled={!inputValue.trim() || isComposerDisabled}
                onClick={handleSend}
              />
            </div>
          </Tooltip>
        </footer>
      </div>

      <Modal
        open={Boolean(activeConfirmation)}
        title="Confirm answer update"
        centered
        closable={false}
        maskClosable={false}
        footer={[
          <Button key="keep" onClick={keepCurrentAnswer}>
            Keep current answer
          </Button>,
          <Button key="confirm" type="primary" onClick={confirmUpdate}>
            Confirm update
          </Button>,
        ]}
      >
        {activeConfirmation && (
          <div className="fas-ai-confirmation">
            <p className="fas-ai-confirm-question">
              {questionMap[activeConfirmation.questionId]?.questionText}
            </p>
            <div>
              <span>Current answer</span>
              <p>{activeConfirmation.currentValue}</p>
            </div>
            <div className="is-new" style={{ background: token.colorBgLayout }}>
              <span>New AI suggestion</span>
              <p>{activeConfirmation.newValue}</p>
            </div>
            {confirmationQueue.length > 1 && (
              <small>{confirmationQueue.length - 1} more updates need review.</small>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default FasFormAiChat
