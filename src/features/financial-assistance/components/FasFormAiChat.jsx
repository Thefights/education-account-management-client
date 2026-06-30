import { useState, useRef, useEffect, useMemo } from 'react'
import { Input, Button, Spin } from 'antd'
import { RobotOutlined, UserOutlined, SendOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

// Mock API for testing
const mockChatWithDynamicFas = async ({ message, questions, current_answers }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerMsg = message.toLowerCase()
      let reply = "I understand. I've noted that down."
      let suggested_fields = {}

      if (lowerMsg.includes('income') || lowerMsg.includes('decreased') || lowerMsg.includes('lost')) {
        reply = "I'm sorry to hear about the change in your financial situation. I've drafted a response explaining this primary reason for you to review."
        // Find a question that looks like "primary reason"
        const reasonQ = questions.find(q => q.questionText.toLowerCase().includes('reason'))
        if (reasonQ && !current_answers[reasonQ.id]) {
          suggested_fields[reasonQ.id] = "My household income has recently decreased due to unexpected circumstances, making it difficult to cover educational expenses."
        }
      } else if (lowerMsg.includes('medical') || lowerMsg.includes('health') || lowerMsg.includes('sick')) {
        reply = "I understand there are medical conditions in your family. I have drafted an answer for the medical conditions question."
        const medicalQ = questions.find(q => q.questionText.toLowerCase().includes('medical'))
        if (medicalQ && !current_answers[medicalQ.id]) {
          suggested_fields[medicalQ.id] = "A family member is currently undergoing medical treatment, which has increased our monthly household expenses."
        }
      } else {
        reply = "Thank you for the information. Is there any other specific circumstance you would like to include in your application?"
      }

      resolve({
        reply,
        suggested_fields
      })
    }, 1200)
  })
}

const FasFormAiChat = ({
  scheme,
  additionalAnswers,
  onApplySuggestion,
  onApplyAllSuggestions
}) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! Describe your circumstances in your own words. I will suggest answers for the additional questions below for you to review before applying them.' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState({})
  
  const messagesEndRef = useRef(null)

  const visibleSuggestions = useMemo(() => {
    if (!scheme?.additionalQuestions) return []
    return Object.entries(suggestions).filter(([qId]) => 
      scheme.additionalQuestions.some(q => String(q.id) === String(qId))
    )
  }, [suggestions, scheme])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, suggestions])

  const handleSend = async (e, quickText) => {
    e?.preventDefault()
    const textToSend = quickText || inputValue
    if (!textToSend.trim() || isLoading) return

    setMessages(prev => [...prev, { role: 'user', content: textToSend }])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await mockChatWithDynamicFas({
        message: textToSend,
        questions: scheme.additionalQuestions || [],
        current_answers: additionalAnswers
      })

      setMessages(prev => [...prev, { role: 'assistant', content: response.reply }])
      
      if (response.suggested_fields && Object.keys(response.suggested_fields).length > 0) {
        setSuggestions(prev => ({
          ...prev,
          ...response.suggested_fields
        }))
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error occurred while connecting to the AI service.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const applySuggestion = (questionId, value) => {
    onApplySuggestion(questionId, value)
    setSuggestions(prev => {
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }

  const rejectSuggestion = (questionId) => {
    setSuggestions(prev => {
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }

  const handleApplyAll = () => {
    const newAnswers = {}
    visibleSuggestions.forEach(([qId, val]) => {
      newAnswers[qId] = val
    })
    onApplyAllSuggestions(newAnswers)
    setSuggestions({})
  }

  return (
    <div className="flex flex-col" style={{ height: '100%', minHeight: '400px' }}>
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 mt-0.5">
                <RobotOutlined />
              </div>
            )}
            <div className={`px-4 py-2.5 max-w-[85%] whitespace-pre-wrap text-[14px] leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-teal-400 text-white rounded-2xl rounded-br-sm' 
                : 'bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500 mt-0.5">
                <UserOutlined />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 mt-0.5">
              <RobotOutlined />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-gray-100 rounded-bl-sm flex items-center shadow-sm h-[42px]">
              <Spin size="small" />
              <span className="ml-2.5 text-[14px] text-gray-500">Processing...</span>
            </div>
          </div>
        )}

        {/* Suggestions Box */}
        {visibleSuggestions.length > 0 && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-indigo-800 font-semibold m-0 flex items-center gap-2">
                <span className="text-xl">✨</span> AI Suggestions
              </h4>
              {visibleSuggestions.length > 1 && (
                <Button size="small" type="primary" onClick={handleApplyAll}>
                  Apply All
                </Button>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {visibleSuggestions.map(([qId, value]) => {
                const q = scheme.additionalQuestions.find(x => String(x.id) === String(qId))
                return (
                  <div key={qId} className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                    <div className="text-gray-500 text-xs mb-1 font-medium">{q?.questionText}</div>
                    <div className="text-gray-800 mb-3 italic">"{value}"</div>
                    <div className="flex gap-2 justify-end">
                      <Button size="small" icon={<CloseCircleOutlined />} onClick={() => rejectSuggestion(qId)}>Dismiss</Button>
                      <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => applySuggestion(qId, value)}>Apply</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center flex-shrink-0">
        <Input
          placeholder="Describe your situation..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSend}
          disabled={isLoading}
          className="rounded-full px-4 py-2"
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={isLoading}
          disabled={!inputValue.trim() || isLoading}
        />
      </div>
    </div>
  )
}

export default FasFormAiChat
