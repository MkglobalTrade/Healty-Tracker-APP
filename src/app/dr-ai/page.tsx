'use client'

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Send, Brain, User, Loader2, Trash2, HeartPulse, Sparkles, AlertTriangle } from 'lucide-react'
import { useHealthData } from '@/hooks/useHealthData'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { askDoctor } from '@/lib/ai'
import { cn } from '@/lib/utils'

export default function DrAIPage() {
  const { chatMessages, addChatMessage, clearChat, sugarReadings, bpReadings, labResults, medications } = useHealthData()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState('main-session')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sessionMessages = chatMessages.filter(m => m.sessionId === sessionId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [sessionMessages])

  // Build context from user's health data
  const buildContext = () => {
    const latestSugar = sugarReadings[0]
    const latestBP = bpReadings[0]
    const activeMeds = medications.filter(m => m.active).map(m => m.name).join(', ')
    const recentLabs = labResults.slice(0, 3).map(l => `${l.title} (${l.category})`).join(', ')
    
    return `Latest glucose: ${latestSugar ? `${latestSugar.value} ${latestSugar.unit}` : 'N/A'}
Latest BP: ${latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : 'N/A'}
Active medications: ${activeMeds || 'None'}
Recent labs: ${recentLabs || 'None'}
Total readings: ${sugarReadings.length} glucose, ${bpReadings.length} BP`
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMsg = input.trim()
    setInput('')
    addChatMessage({ role: 'user', content: userMsg, sessionId })
    setLoading(true)

    try {
      const context = buildContext()
      const response = await askDoctor(userMsg, context)
      addChatMessage({ role: 'assistant', content: response.content, sessionId })
    } catch {
      addChatMessage({
        role: 'assistant',
        content: 'I apologize, I encountered an error. Please try again or check your connection.',
        sessionId,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    'What does my latest glucose reading mean?',
    'Is my blood pressure normal?',
    'How can I improve my longevity?',
    'Explain my lab results',
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Dr. AI</h1>
          <p className="text-sm text-muted-foreground">Your personal health assistant</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => clearChat(sessionId)}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear Chat
        </Button>
      </div>

      {/* Disclaimer */}
      <Card className="mb-4 bg-yellow-50 border-yellow-200">
        <CardContent className="p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-xs text-yellow-800">
            Dr. AI provides general information only. Always consult a healthcare provider for diagnosis and treatment.
          </p>
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
        {sessionMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-health-accent flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Welcome to Dr. AI</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Ask me about your health data, symptoms, medications, or general wellness questions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q)
                    textareaRef.current?.focus()
                  }}
                  className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary-50 text-left text-sm transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {sessionMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                msg.role === 'user' ? 'bg-primary-100' : 'bg-gradient-to-br from-primary-400 to-health-accent'
              )}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-primary-700" />
              ) : (
                <Brain className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-muted rounded-bl-md'
              )}
            >
              <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                {msg.content}
              </div>
              <p className={cn(
                'text-xs mt-1',
                msg.role === 'user' ? 'text-primary-200' : 'text-muted-foreground'
              )}>
                {format(new Date(msg.timestamp), 'h:mm a')}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-health-accent flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Dr. AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Dr. AI about your health..."
          rows={1}
          className="min-h-[44px] max-h-[120px] resize-none"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="h-auto px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
