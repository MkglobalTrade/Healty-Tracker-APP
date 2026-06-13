'use client';
import { useEffect, useState, useRef } from 'react';
import { Bot, Send, X, Trash2, Settings, AlertTriangle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getChatHistory, saveChatMessage, clearChatHistory, getApiKey, saveApiKey } from '@/lib/storage';

const SYS = `You are Dr. AI, a knowledgeable and caring virtual health assistant specializing in diabetes management, metabolic health, and general wellness. You are advising Mikail KOCAK, a patient with diabetes born July 23, 1979.

IMPORTANT:
- Provide medically accurate information based on current guidelines
- Always remind user you are AI, not a replacement for their actual doctor
- For emergencies, direct them to call 911
- Be empathetic, clear, professional
- Use mg/dL for glucose
- Reference ADA, AHA guidelines when appropriate
- Keep responses concise but thorough
- If outside your scope, recommend consulting a healthcare provider`;

export default function AIDoctor() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMessages(getChatHistory()); setApiKey(getApiKey()); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    const updated = [...messages, userMsg];
    setMessages(updated); saveChatMessage(userMsg); setInput(''); setLoading(true); setError('');
    try {
      if (!apiKey) throw new Error('API key not set. Tap ⚙️ to add your OpenAI API key.');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: SYS }, ...updated.map((m: any) => ({ role: m.role, content: m.content }))], temperature: 0.7, max_tokens: 1000 }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `API Error: ${res.status}`); }
      const data = await res.json();
      const content = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant', content, timestamp: new Date().toISOString() };
      setMessages([...updated, aiMsg]); saveChatMessage(aiMsg);
    } catch (e: any) { setError(e.message || 'Failed to get response'); }
    finally { setLoading(false); }
  };

  const quickQs = ["What's a healthy fasting glucose?", 'How does exercise affect blood sugar?', 'Best foods to lower blood sugar?', 'What is HbA1c and why does it matter?', 'How to manage dawn phenomenon?', 'Vitamins important for diabetics?'];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-sky-400 pt-12 pb-6 px-5 rounded-b-3xl shadow-lg shadow-sky-200/50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Bot size={20} className="text-white" /></div><div><h1 className="text-xl font-bold text-white tracking-tight">AI Doctor</h1><p className="text-sky-100 text-sm font-medium">Virtual health assistant</p></div></div>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Settings size={18} className="text-white" /></button>
            <button onClick={() => { clearChatHistory(); setMessages([]); }} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Trash2 size={18} className="text-white" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full px-5 mt-3">
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100"><AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" /><p className="text-[11px] text-amber-700 leading-relaxed">AI Doctor provides general health information only. Always consult your healthcare provider for medical decisions. In emergencies, call 911.</p></div>
      </div>

      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-5 mt-4 pb-48">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-4"><Bot size={36} className="text-sky-500" /></div>
            <h3 className="font-bold text-gray-800 text-lg">Welcome, Mikail</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">Ask me anything about diabetes, medications, nutrition, or health.</p>
            <div className="mt-6 space-y-2"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Questions</p>
              <div className="grid grid-cols-1 gap-2 mt-2">{quickQs.map(q => <button key={q} onClick={() => setInput(q)} className="text-left p-3 bg-gray-50 rounded-xl text-sm text-gray-600 hover:bg-sky-50 active:bg-sky-100 border border-gray-100">{q}</button>)}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">{messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl ${m.role === 'user' ? 'bg-sky-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                {m.role === 'assistant' && <div className="flex items-center gap-1.5 mb-1.5"><Bot size={12} className="text-sky-500" /><span className="text-[10px] font-semibold text-sky-500">Dr. AI</span></div>}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
                <p className={`text-[10px] mt-1.5 ${m.role === 'user' ? 'text-sky-200' : 'text-gray-400'}`}>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
            {loading && <div className="flex justify-start"><div className="bg-gray-100 p-4 rounded-2xl rounded-bl-md"><div className="flex gap-1.5"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div></div></div>}
            {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 safe-bottom">
        <div className="max-w-lg mx-auto px-4 py-3"><div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask Dr. AI..." className="flex-1 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" disabled={loading} />
          <button onClick={send} disabled={!input.trim() || loading} className="w-12 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center active:bg-sky-600 disabled:opacity-40 shadow-lg shadow-sky-200 shrink-0"><Send size={18} /></button>
        </div></div>
      </div>

      {showSettings && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-in">
          <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold text-gray-800">AI Settings</h2><button onClick={() => setShowSettings(false)} className="p-2 text-gray-400"><X size={22} /></button></div>
          <div className="space-y-4">
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">OpenAI API Key</label><input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." className="w-full mt-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono" /><p className="text-[11px] text-gray-400 mt-2">Stored locally only. Get your key at <a href="https://platform.openai.com/api-keys" target="_blank" className="text-sky-500 underline">platform.openai.com</a></p></div>
            <button onClick={() => { saveApiKey(apiKey); setShowSettings(false); }} className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-base active:bg-sky-600 shadow-lg shadow-sky-200">Save Settings</button>
          </div>
        </div>
      </div>}
      <BottomNav />
    </div>
  );
}
