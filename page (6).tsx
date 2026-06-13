'use client';
import { useEffect, useState, useCallback } from 'react';
import { Pill, Plus, Trash2, X, Sparkles, Check } from 'lucide-react';
import Nav from '@/components/Nav';
import { getMeds, saveMed, updateMed, delMed } from '@/lib/store';

const VT:Record<string,{t:string;r:string;f:boolean}>={
  'Vitamin D':{t:'Morning',r:'Best with sunlight & fatty meals. May disrupt sleep at night.',f:true},'Vitamin B12':{t:'Morning',r:'Boosts energy. Can interfere with sleep at night.',f:false},'Vitamin C':{t:'Morning/Afternoon',r:'Split doses improve absorption.',f:false},'Iron':{t:'Morning',r:'Best on empty stomach. Avoid with calcium.',f:false},'Calcium':{t:'Evening',r:'Promotes sleep. Separate from iron 2+ hours.',f:true},'Magnesium':{t:'Evening',r:'Promotes relaxation and sleep.',f:true},'Zinc':{t:'Morning',r:'Best on empty stomach.',f:false},'Omega-3':{t:'Morning',r:'Take with fatty meal. Can cause aftertaste at night.',f:true},'Probiotics':{t:'Morning',r:'30 min before breakfast on empty stomach.',f:false},'CoQ10':{t:'Morning',r:'Fat-soluble, energizing. May cause insomnia late.',f:true},'Fiber':{t:'Morning',r:'With water, before meals for blood sugar control.',f:true},'Metformin':{t:'With meals',r:'Take with meals to reduce GI effects. Evening helps dawn phenomenon.',f:true},'Berberine':{t:'Before meals',r:'30 min before meals for blood sugar control.',f:false},'Chromium':{t:'Morning',r:'With breakfast to regulate blood sugar all day.',f:true},'Alpha Lipoic Acid':{t:'Morning',r:'On empty stomach, 30 min before meals.',f:false},'Cinnamon Extract':{t:'Before meals',r:'Before meals for post-meal glucose.',f:true},'Turmeric':{t:'With meals',r:'Needs black pepper & fat for absorption.',f:true},'Melatonin':{t:'Night',r:'30-60 min before sleep.',f:false},'Ashwagandha':{t:'Evening',r:'Promotes relaxation and sleep.',f:true},'Biotin':{t:'Morning',r:'Water-soluble B vitamin. Morning for consistency.',f:false},'Folic Acid':{t:'Morning',r:'B vitamin for energy. On empty stomach.',f:false},'Vitamin A':{t:'Morning',r:'Fat-soluble, take with healthy fats.',f:true},'Vitamin E':{t:'Evening',r:'Fat-soluble, take with dinner.',f:true},'Vitamin K':{t:'Evening',r:'Fat-soluble, works with Vitamin D.',f:true},'Curcumin':{t:'With meals',r:'Needs black pepper & fat for absorption.',f:true},
};

const aiRec=(n:string)=>{const l=n.toLowerCase();for(const[k,v]of Object.entries(VT)){if(l.includes(k.toLowerCase())||k.toLowerCase().includes(l))return v;}return null;};
const FREQS=[{k:'once_daily',l:'Once daily'},{k:'twice_daily',l:'Twice daily'},{k:'three_times',l:'3x daily'},{k:'as_needed',l:'As needed'},{k:'weekly',l:'Weekly'}];

export default function Meds() {
  const [meds, setMeds] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all'|'day'|'night'>('all');
  const [form, setForm] = useState({name:'',dosage:'',frequency:'once_daily',timeOfDay:['morning'],category:'medication',notes:''});

  const load = useCallback(()=>setMeds(getMeds()),[]);
  useEffect(()=>{load();},[load]);

  const add = ()=>{if(!form.name)return;const ai=aiRec(form.name);saveMed({id:Date.now().toString(),name:form.name,dosage:form.dosage,frequency:form.frequency,timeOfDay:form.timeOfDay,category:form.category,aiTip:ai?`${ai.t} — ${ai.r}${ai.f?' (With food)':' (Empty stomach)'}`:undefined,isActive:true,notes:form.notes});setOpen(false);setForm({name:'',dosage:'',frequency:'once_daily',timeOfDay:['morning'],category:'medication',notes:''});load();};
  const toggleTime=(t:string)=>setForm({...form,timeOfDay:form.timeOfDay.includes(t)?form.timeOfDay.filter(x=>x!==t):[...form.timeOfDay,t]});

  const active = meds.filter((m:any)=>m.isActive);
  const sections = [
    {title:'🌅 Morning',items:active.filter((m:any)=>m.timeOfDay?.includes('morning'))},
    {title:'☀️ Afternoon',items:active.filter((m:any)=>m.timeOfDay?.includes('afternoon'))},
    {title:'🌆 Evening',items:active.filter((m:any)=>m.timeOfDay?.includes('evening'))},
    {title:'🌙 Night',items:active.filter((m:any)=>m.timeOfDay?.includes('night'))},
  ];
  const inactive = meds.filter((m:any)=>!m.isActive);
  const show = filter==='all'?sections:filter==='day'?sections.slice(0,2):sections.slice(2);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><Pill size={22} className="text-white"/><h1 className="text-xl font-bold text-white">Medications</h1></div>
          <button onClick={()=>setOpen(true)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Plus size={20} className="text-white"/></button>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 mt-4">
        <div className="flex gap-2 mb-4">
          {[{k:'all',l:'All'},{k:'day',l:'☀️ Day'},{k:'night',l:'🌙 Night'}].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k as any)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${filter===f.k?'bg-sky-500 text-white':'bg-gray-100 text-gray-500'}`}>{f.l}</button>
          ))}
        </div>
        {meds.length>0?show.map(s=>s.items.length>0&&(
          <div key={s.title} className="mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{s.title}</p>
            <div className="space-y-2">{s.items.map((m:any)=>(
              <div key={m.id} className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{m.category==='insulin'?'💉':m.category==='vitamin'?'🧬':m.category==='supplement'?'🌿':'💊'}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm">{m.name}</span>{m.dosage&&<span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-1">{m.dosage}</span>}
                    {m.aiTip&&<span className="ml-1 text-[9px] font-bold text-sky-500 bg-sky-50 px-1 py-0.5 rounded-full"><Sparkles size={9} className="inline"/> AI</span>}
                    <p className="text-[10px] text-gray-400 mt-0.5">{FREQS.find(f=>f.k===m.frequency)?.l} · {m.timeOfDay?.join(', ')}</p>
                    {m.aiTip&&<div className="mt-2 p-2 bg-sky-50 rounded-lg border border-sky-100"><p className="text-[10px] text-sky-700"><span className="font-bold">✨ AI:</span> {m.aiTip}</p></div>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={()=>{updateMed(m.id,{isActive:!m.isActive});load();}} className={`p-1 ${m.isActive?'text-emerald-500':'text-gray-300'}`}><Check size={16}/></button>
                    <button onClick={()=>{delMed(m.id);load();}} className="p-1 text-gray-300"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}</div></div>
        )):(filter==='all'&&<div className="text-center py-10"><p className="text-4xl mb-2">💊</p><p className="text-gray-400 text-sm">No medications</p><button onClick={()=>setOpen(true)} className="mt-3 px-5 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold">Add</button></div>)}
        {filter==='all'&&inactive.length>0&&<div className="mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase mb-2">💤 Inactive</p><div className="space-y-2">{inactive.map((m:any)=>(
          <div key={m.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-60 flex items-center gap-3"><span className="text-lg">💊</span><div className="flex-1"><span className="font-bold text-sm text-gray-500">{m.name}</span></div><button onClick={()=>{updateMed(m.id,{isActive:true});load();}} className="p-1 text-gray-300"><Check size={16}/></button><button onClick={()=>{delMed(m.id);load();}} className="p-1 text-gray-300"><Trash2 size={14}/></button></div>
        ))}</div></div>}
      </div>
      {open&&<div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"><div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-in max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Add Medication</h2><button onClick={()=>setOpen(false)} className="p-2 text-gray-400"><X size={20}/></button></div>
        <div className="space-y-3">
          <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g., Metformin, Vitamin D" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" autoFocus/>
          {form.name&&aiRec(form.name)&&<div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100"><p className="text-xs font-bold text-sky-600"><Sparkles size={10} className="inline"/> AI: Take in <strong>{aiRec(form.name)!.t}</strong></p><p className="text-[10px] text-sky-700 mt-0.5">{aiRec(form.name)!.r}</p><p className="text-[10px] text-sky-600 mt-0.5">{aiRec(form.name)!.f?'🍽️ Take with food':'💧 Empty stomach'}</p></div>}
          <div className="grid grid-cols-2 gap-2"><input type="text" value={form.dosage} onChange={e=>setForm({...form,dosage:e.target.value})} placeholder="Dosage (500mg)" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"/>
            <select value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">{FREQS.map(f=><option key={f.k} value={f.k}>{f.l}</option>)}</select></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Category</p><div className="grid grid-cols-4 gap-1">{['💊 Med','🧬 Vit','🌿 Supp','💉 Ins'].map((c,i)=>{const k=['medication','vitamin','supplement','insulin'][i];return<button key={k} onClick={()=>setForm({...form,category:k})} className={`py-2 rounded-lg text-[10px] font-bold ${form.category===k?'bg-sky-500 text-white':'bg-gray-100 text-gray-500'}`}>{c}</button>;})}</div></div>
          <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Time</p><div className="grid grid-cols-4 gap-1">{[{k:'morning',l:'🌅 AM'},{k:'afternoon',l:'☀️ Mid'},{k:'evening',l:'🌆 PM'},{k:'night',l:'🌙 Bed'}].map(t=>(<button key={t.k} onClick={()=>toggleTime(t.k)} className={`py-2 rounded-lg text-[10px] font-bold ${form.timeOfDay.includes(t.k)?'bg-sky-500 text-white':'bg-gray-100 text-gray-500'}`}>{t.l}</button>))}</div></div>
          <button onClick={add} disabled={!form.name} className="w-full py-3.5 bg-sky-500 text-white rounded-xl font-bold disabled:opacity-40">Add Medication</button>
        </div>
      </div></div>}
      <Nav/>
    </div>
  );
}
