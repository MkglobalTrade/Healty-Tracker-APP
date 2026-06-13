'use client';
import { useEffect, useState, useRef } from 'react';
import { Bot, Send, X, Trash2, Settings, AlertTriangle } from 'lucide-react';
import Nav from '@/components/Nav';
import { getChat, saveChat, clearChat, getApiKey, saveApiKey } from '@/lib/store';

const SYS = 'You are Dr. AI, a virtual health assistant specializing in diabetes management. Patient: Mikail KOCAK, born July 23 1979, has diabetes. Provide medically accurate info. Always remind you are AI not a doctor. For emergencies say call 911. Use mg/dL. Keep responses concise. Reference ADA guidelines. If unsure, recommend consulting their doctor.';

export default function AIDoctor() {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [inp, setInp] = useState('');
  const [load, setLoad] = useState(false);
  const [set, setSet] = useState(false);
  const [key, setKey] = useState('');
  const [err, setErr] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(()=>{setMsgs(getChat());setKey(getApiKey());},[]);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:'smooth'});},[msgs]);

  const send = async()=>{
    if(!inp.trim()||load)return;
    const u={id:Date.now().toString(),role:'user',content:inp.trim(),timestamp:new Date().toISOString()};
    const up=[...msgs,u];setMsgs(up);saveChat(u);setInp('');setLoad(true);setErr('');
    try{
      if(!key)throw new Error('No API key. Tap ⚙️ to add your OpenAI key.');
      const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'system',content:SYS},...up.map((m:any)=>({role:m.role,content:m.content}))],temperature:0.7,max_tokens:800})});
      if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error?.message||`Error ${r.status}`);}
      const d=await r.json();const c=d.choices[0]?.message?.content||'Sorry, no response.';
      const a={id:(Date.now()+1).toString(),role:'assistant',content:c,timestamp:new Date().toISOString()};
      setMsgs([...up,a]);saveChat(a);
    }catch(e:any){setErr(e.message||'Failed');}finally{setLoad(false);}
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><Bot size={22} className="text-white"/><h1 className="text-xl font-bold text-white">AI Doctor</h1></div>
          <div className="flex gap-2"><button onClick={()=>setSet(true)} className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center"><Settings size={16} className="text-white"/></button><button onClick={()=>{clearChat();setMsgs([]);}} className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center"><Trash2 size={16} className="text-white"/></button></div>
        </div>
      </div>
      <div className="max-w-lg mx-auto w-full px-4 mt-3"><div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100"><AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0"/><p className="text-[10px] text-amber-700">AI provides general info only. Always consult your doctor. Emergency? Call 911.</p></div></div>
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 mt-3 pb-44">
        {msgs.length===0?(
          <div className="text-center py-6"><div className="w-16 h-16 mx-auto rounded-2xl bg-sky-100 flex items-center justify-center mb-3"><Bot size={28} className="text-sky-500"/></div><h3 className="font-bold text-lg">Hi Mikail 👋</h3><p className="text-gray-400 text-sm mt-1">Ask about diabetes, medications, nutrition...</p>
            <div className="mt-5 space-y-1.5">{["What's a healthy fasting glucose?",'Best foods for blood sugar?','How does exercise affect glucose?','What is HbA1c?','Vitamins for diabetics?','How to manage dawn phenomenon?'].map(q=><button key={q} onClick={()=>setInp(q)} className="w-full text-left p-2.5 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">{q}</button>)}</div>
          </div>
        ):<div className="space-y-2.5">{msgs.map((m:any)=>(
          <div key={m.id} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${m.role==='user'?'bg-sky-500 text-white rounded-br-sm':'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
              {m.role==='assistant'&&<div className="flex items-center gap-1 mb-1"><Bot size={10} className="text-sky-500"/><span className="text-[9px] font-bold text-sky-500">Dr. AI</span></div>}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>))}
          {load&&<div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm"><div className="flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"/><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}/><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}/></div></div></div>}
          {err&&<div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{err}</div>}
          <div ref={ref}/>
        </div>}
      </div>
      <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-2.5"><div className="flex gap-2">
          <input type="text" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask Dr. AI..." className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" disabled={load}/>
          <button onClick={send} disabled={!inp.trim()||load} className="w-11 h-11 bg-sky-500 text-white rounded-xl flex items-center justify-center disabled:opacity-40 shrink-0"><Send size={16}/></button>
        </div></div>
      </div>
      {set&&<div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"><div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-in">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Settings</h2><button onClick={()=>setSet(false)} className="p-2 text-gray-400"><X size={20}/></button></div>
        <label className="text-[10px] font-bold text-gray-400 uppercase">OpenAI API Key</label>
        <input type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="sk-..." className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"/>
        <p className="text-[10px] text-gray-400 mt-1.5">Stored locally only. Get key at <a href="https://platform.openai.com/api-keys" target="_blank" className="text-sky-500 underline">platform.openai.com</a></p>
        <button onClick={()=>{saveApiKey(key);setSet(false);}} className="w-full mt-4 py-3 bg-sky-500 text-white rounded-xl font-bold">Save</button>
      </div></div>}
      <Nav/>
    </div>
  );
}
