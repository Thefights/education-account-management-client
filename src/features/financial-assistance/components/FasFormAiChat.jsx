import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Alert, Button, Input, Modal, Progress, Spin, Tag, Tooltip } from 'antd'
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

const getSessionId = (schemeId) => {
  const key = `dynamic-fas-session-${schemeId}`
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
  isSending,
  isResetting,
  onSendMessage,
  onResetSession,
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
  const dismissedSuggestionsRef = useRef({})
  const messagesEndRef = useRef(null)

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
      isSending ||
      !questions.length ||
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

  const handleReset = async () => {
    if (isSending || isResetting) return
    setError('')

    try {
      const response = await onResetSession(sessionId)
      if (!response) {
        throw new Error('Could not reset the AI session.')
      }
      setMessages([
        {
          role: 'assistant',
          content: 'The conversation has been reset. Your existing form answers were preserved.',
        },
        {
          role: 'status',
          content: 'Conversation reset. Form answers preserved.',
        },
      ])
      setSuggestions({})
      setAssistantState(null)
      setConfirmationQueue([])
      setLastFailedMessage('')
      dismissedSuggestionsRef.current = {}
    } catch (requestError) {
      setError(requestError.message || 'Could not reset the AI session.')
    }
  }

  return (
    <>
      <div className="fas-ai-chat">
        <header className="fas-ai-chat-header">
          <div className="fas-ai-identity">
            <span className="fas-ai-avatar">
              <RobotOutlined />
            </span>
            <div className="fas-ai-title-row">
              <strong>FAS Form Assistant</strong>
              <span className="fas-ai-presence">
                <i /> Online
              </span>
            </div>
          </div>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            loading={isResetting}
            disabled={isSending}
            onClick={handleReset}
          >
            Reset
          </Button>
        </header>

        <div className="fas-ai-progress">
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
                  <div className="fas-ai-bubble">{chatMessage.content}</div>
                </div>
              )
            )}

            {isSending && (
              <div className="fas-ai-message assistant">
                <span className="fas-ai-message-avatar">
                  <RobotOutlined />
                </span>
                <div className="fas-ai-bubble fas-ai-typing" aria-label="AI is processing">
                  <Spin size="small" />
                  <span>Typing...</span>
                </div>
              </div>
            )}
          </div>

          {isReviewRequired && (
            <section className="fas-ai-suggestions" aria-label="AI suggestions">
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
                    className="fas-ai-suggestion-card"
                    key={`pending-${pendingUpdate.questionId}`}
                  >
                    <div className="fas-ai-suggestion-meta">
                      <span>Question {questionNumberMap[pendingUpdate.questionId]}</span>
                      <Tag color="gold">Confirmation required</Tag>
                    </div>
                    <h5>{pendingUpdate.questionText}</h5>
                    <div className="fas-ai-current-answer">
                      <span>Current answer</span>
                      <p>{pendingUpdate.currentValue || 'No current answer'}</p>
                    </div>
                    <div className="fas-ai-proposed-answer">
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
                    <article className="fas-ai-suggestion-card" key={questionId}>
                      <div className="fas-ai-suggestion-meta">
                        <span>Question {questionNumberMap[questionId]}</span>
                        <Tag color="gold">Awaiting review</Tag>
                      </div>
                      <h5>{question?.questionText}</h5>
                      {currentValue && currentValue !== value && (
                        <div className="fas-ai-current-answer">
                          <span>Current answer</span>
                          <p>{currentValue}</p>
                        </div>
                      )}
                      <div className="fas-ai-proposed-answer">
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

        <footer className="fas-ai-composer-wrap">
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
                disabled={isSending || !questions.length || isComposerLocked}
                onChange={(event) => setInputValue(event.target.value)}
                onPressEnter={handleSend}
              />
              <Button
                type="primary"
                shape="circle"
                aria-label="Send message"
                icon={<SendOutlined />}
                loading={isSending}
                disabled={!inputValue.trim() || isSending || !questions.length || isComposerLocked}
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
            <div className="is-new">
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
