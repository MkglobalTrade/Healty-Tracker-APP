'use client';

import { useEffect, useState, useRef } from 'react';
import { Bot, Send, X, Trash2, Settings, AlertTriangle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { getChatHistory, saveChatMessage, clearChatHistory, getApiKey, saveApiKey, getUserProfile } from '@/lib/storage';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SYSTEM_PROMPT = `You are Dr. AI, a knowledgeable and caring virtual health assistant specializing in diabetes management, metabolic health, and general wellness. You are advising Mikail KOCAK, a patient with diabetes born on July 23, 1979.

IMPORTANT GUIDELINES:
- Always provide medically accurate information based on current guidelines
- Always remind the user that you are an AI assistant, not a replacement for their actual doctor
- For emergency situations, always direct them to call emergency services (911)
- Be empathetic, clear, and professional
- Use easy-to-understand language
- When discussing blood glucose levels, use mg/dL units
- Reference relevant medical guidelines (ADA, AHA, etc.) when appropriate
- For diabetes-specific questions, reference ADA Standards of Care
- Keep responses concise but thorough
- If asked about something outside your scope, recommend consulting a healthcare provider

You can help with:
- Blood glucose management questions
- Medication timing and interactions
- Diet and nutrition advice for diabetes
- Exercise recommendations
- Understanding lab results
- General health and longevity questions
- Stress management and mental health support`;

export default function AIDoctorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = getChatHistory();
    setMessages(history);
    setApiKey(getApiKey());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatMessage(userMessage);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      if (!apiKey) {
        throw new Error('API key not configured. Tap ⚙️ to add your OpenAI API key.');
      }

      const apiMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...updatedMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString(),
      };

      setMessages([...updatedMessages, assistantMessage]);
      saveChatMessage(assistantMessage);
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    clearChatHistory();
    setMessages([]);
  };

  const handleSaveApiKey = () => {
    saveApiKey(apiKey);
    setShowSettings(false);
  };

  const quickQuestions = [
    "What's a healthy fasting glucose level?",
    'How does exercise affect blood sugar?',
    'Best foods to lower blood sugar?',
    'What is HbA1c and why does it matter?',
    'How to manage dawn phenomenon?',
    'Vitamins important for diabetics?',
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PageHeader
        title="AI Doctor"
        subtitle="Your virtual health assistant"
        icon={<Bot size={20} className="text-white" />}
        rightAction={
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm active:bg-white/30 transition-colors"
            >
              <Settings size={18} className="text-white" />
            </button>
            <button
              onClick={handleClear}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm active:bg-white/30 transition-colors"
            >
              <Trash2 size={18} className="text-white" />
            </button>
          </div>
        }
      />

      {/* Disclaimer */}
      <div className="max-w-lg mx-auto w-full px-5 mt-3">
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-700 leading-relaxed">
            AI Doctor provides general health information only. Always consult your healthcare provider for medical decisions. In emergencies, call 911.
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-5 mt-4 pb-48">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-4">
              <Bot size={36} className="text-sky-500" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Welcome, Mikail</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
              Ask me anything about diabetes management, medications, nutrition, or general health.
            </p>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Questions</p>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-left p-3 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-sky-50 active:bg-sky-100 transition-colors border border-gray-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-sky-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Bot size={12} className="text-sky-500" />
                      <span className="text-[10px] font-semibold text-sky-500">Dr. AI</span>
                    </div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                  <p
                    className={`text-[10px] mt-1.5 ${
                      msg.role === 'user' ? 'text-sky-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 safe-bottom">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask Dr. AI anything..."
              className="flex-1 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center active:bg-sky-600 transition-colors disabled:opacity-40 shadow-lg shadow-sky-200 shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* API Key Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-transition">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">AI Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 text-gray-400">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full mt-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-2">
                  Your API key is stored locally on your device and never sent to our servers.
                  Get your key at{' '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" className="text-sky-500 underline">
                    platform.openai.com
                  </a>
                </p>
              </div>

              <button
                onClick={handleSaveApiKey}
                className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-base active:bg-sky-600 transition-colors shadow-lg shadow-sky-200"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
