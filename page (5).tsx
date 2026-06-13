'use client';
import { useEffect, useState, useCallback } from 'react';
import { FlaskConical, Plus, Trash2, X } from 'lucide-react';
import Nav from '@/components/Nav';
import { getLabs, saveLab, delLab } from '@/lib/store';

const LABS = [
  {name:'Glucose',unit:'mg/dL',min:70,max:100},{name:'HbA1c',unit:'%',min:4.0,max:5.6},{name:'Total Cholesterol',unit:'mg/dL',min:0,max:200},{name:'LDL',unit:'mg/dL',min:0,max:100},{name:'HDL',unit:'mg/dL',min:40,max:60},{name:'Triglycerides',unit:'mg/dL',min:0,max:150},{name:'Creatinine',unit:'mg/dL',min:0.6,max:1.2},{name:'BUN',unit:'mg/dL',min:7,max:20},{name:'eGFR',unit:'mL/min',min:60,max:120},{name:'ALT',unit:'U/L',min:7,max:56},{name:'AST',unit:'U/L',min:10,max:40},{name:'TSH',unit:'mIU/L',min:0.4,max:4.0},{name:'Vitamin D',unit:'ng/mL',min:30,max:100},{name:'B12',unit:'pg/mL',min:200,max:900},{name:'Sodium',unit:'mEq/L',min:136,max:145},{name:'Potassium',unit:'mEq/L',min:3.5,max:5.0},{name:'Hemoglobin',unit:'g/dL',min:13.5,max:17.5},{name:'WBC',unit:'x10³/µL',min:4.5,max:11.0},{name:'Platelets',unit:'x10³/µL',min:150,max:400},{name:'Uric Acid',unit:'mg/dL',min:3.5,max:7.2}
];

const status = (v:number,mn:number,mx:number)=>{const r=mx-mn;if(v<mn*0.7||v>mx*1.3)return'critical';if(v<mn-r*0.1)return'low';if(v>mx+r*0.1)return'high';if(v<mn||v>mx)return'borderline';return'normal';};
const SC:any={normal:{bg:'bg-emerald-50',b:'border-emerald-200',l:'✅ Normal'},borderline:{bg:'bg-amber-50',b:'border-amber-200',l:'⚠️ Borderline'},high:{bg:'bg-red-50',b:'border-red-200',l:'🔴 High'},low:{bg:'bg-red-50',b:'border-red-200',l:'🔴 Low'},critical:{bg:'bg-red-100',b:'border-red-300',l:'🚨 Critical'}};

export default function Labs() {
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<typeof LABS[0]|null>(null);
  const [search, setSearch] = useState('');
  const [fv, setFv] = useState('');
  const [fd, setFd] = useState(new Date().toISOString().split('T')[0]);

  const load = useCallback(()=>setResults(getLabs().sort((a:any,b:any)=>new Date(b.date).getTime()-new Date(a.date).getTime())),[]);
  useEffect(()=>{load();},[load]);

  const add = ()=>{if(!sel||!fv)return;const v=Number(fv);saveLab({id:Date.now().toString(),name:sel.name,value:v,unit:sel.unit,referenceMin:sel.min,referenceMax:sel.max,status:status(v,sel.min,sel.max),date:fd});setOpen(false);setSel(null);setFv('');load();};
  const grouped = results.reduce((a:any,r:any)=>{(a[r.date]=a[r.date]||[]).push(r);return a;},{});
  const nc=results.filter((r:any)=>r.status==='normal').length, bc=results.filter((r:any)=>r.status==='borderline').length, rc=results.filter((r:any)=>['high','low','critical'].includes(r.status)).length;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><FlaskConical size={22} className="text-white"/><h1 className="text-xl font-bold text-white">Lab Results</h1></div>
          <button onClick={()=>setOpen(true)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Plus size={20} className="text-white"/></button>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 mt-4">
        {results.length>0&&<div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100 text-center"><p className="text-xl font-bold text-emerald-600">{nc}</p><p className="text-[9px] font-bold text-emerald-500 uppercase">Normal</p></div>
          <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-100 text-center"><p className="text-xl font-bold text-amber-600">{bc}</p><p className="text-[9px] font-bold text-amber-500 uppercase">Borderline</p></div>
          <div className="bg-red-50 rounded-xl p-2.5 border border-red-100 text-center"><p className="text-xl font-bold text-red-600">{rc}</p><p className="text-[9px] font-bold text-red-500 uppercase">Attention</p></div>
        </div>}
        {Object.keys(grouped).length>0?Object.entries(grouped).map(([date,labs]:[string,any])=>(
          <div key={date} className="mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{new Date(date+'T12:00:00').toLocaleDateString([],{weekday:'short',month:'long',day:'numeric'})}</p>
            <div className="space-y-2">{labs.map((r:any)=>{const s=SC[r.status]||SC.normal;return(
              <div key={r.id} className={`p-3.5 rounded-xl border ${s.bg} ${s.b}`}>
                <div className="flex items-start justify-between"><div><span className="font-bold text-sm text-gray-800">{r.name}</span><span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s.bg} ${s.l.includes('✅')?'text-emerald-600':s.l.includes('⚠️')?'text-amber-600':'text-red-600'}`}>{s.l}</span><div className="mt-1"><span className="text-xl font-bold">{r.value}</span><span className="text-xs text-gray-400 ml-1">{r.unit}</span></div><p className="text-[10px] text-gray-400 mt-0.5">Ref: {r.referenceMin}–{r.referenceMax} {r.unit}</p></div>
                <button onClick={()=>{delLab(r.id);load();}} className="p-1 text-gray-300"><Trash2 size={14}/></button></div>
              </div>);})}</div></div>
        )):<div className="text-center py-10"><p className="text-4xl mb-2">🔬</p><p className="text-gray-400 text-sm">No lab results</p><button onClick={()=>setOpen(true)} className="mt-3 px-5 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold">Add Result</button></div>}
      </div>
      {open&&<div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"><div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-in max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Add Lab Result</h2><button onClick={()=>{setOpen(false);setSel(null);}} className="p-2 text-gray-400"><X size={20}/></button></div>
        {!sel&&<><input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search lab test..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 mb-3"/>
        <div className="max-h-60 overflow-y-auto space-y-1">{LABS.filter(l=>l.name.toLowerCase().includes(search.toLowerCase())).map(l=>(
          <button key={l.name} onClick={()=>{setSel(l);}} className="w-full text-left p-3 bg-gray-50 rounded-xl text-sm hover:bg-sky-50"><span className="font-medium">{l.name}</span><span className="text-xs text-gray-400 ml-2">({l.min}–{l.max} {l.unit})</span></button>
        ))}</div></>}
        {sel&&<><div className="flex items-center justify-between p-3 bg-sky-50 rounded-xl mb-4"><span className="font-bold text-sky-800 text-sm">{sel.name}</span><button onClick={()=>setSel(null)} className="text-xs text-sky-500 font-bold">Change</button></div>
          <input type="number" value={fv} onChange={e=>setFv(e.target.value)} placeholder="Value" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-sky-400 mb-3" autoFocus/>
          <input type="date" value={fd} onChange={e=>setFd(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 mb-4"/>
          <button onClick={add} disabled={!fv} className="w-full py-3.5 bg-sky-500 text-white rounded-xl font-bold disabled:opacity-40">Save</button>
        </>}
      </div></div>}
      <Nav/>
    </div>
  );
}
