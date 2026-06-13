'use client';
import { useEffect, useState, useCallback } from 'react';
import { Clock, FileDown } from 'lucide-react';
import Nav from '@/components/Nav';
import { getGlucose, getLabs, getMeds, calcHbA1c } from '@/lib/store';

type DT='all'|'glucose'|'labs'|'meds';type DR='7d'|'30d'|'90d'|'1y'|'all';

export default function History() {
  const [dt,setDt]=useState<DT>('all');const [dr,setDr]=useState<DR>('30d');
  const [g,setG]=useState<any[]>([]);const [l,setL]=useState<any[]>([]);const [m,setM]=useState<any[]>([]);
  const load=useCallback(()=>{setG(getGlucose());setL(getLabs());setM(getMeds());},[]);
  useEffect(()=>{load();},[load]);

  const start=()=>{const n=new Date();switch(dr){case'7d':return new Date(n.getTime()-7*864e5);case'30d':return new Date(n.getTime()-30*864e5);case'90d':return new Date(n.getTime()-90*864e5);case'1y':return new Date(n.getFullYear()-1,n.getMonth(),n.getDate());case'all':return new Date(2000,0,1);}};
  const fg=g.filter((r:any)=>new Date(r.timestamp)>=start()).sort((a:any,b:any)=>new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime());
  const fl=l.filter((r:any)=>new Date(r.date)>=start()).sort((a:any,b:any)=>new Date(b.date).getTime()-new Date(a.date).getTime());
  const fm=m.filter((x:any)=>x.isActive);

  const pdf=()=>{
    const w=window.open('','_blank');
    if(!w)return;
    let h=`<!DOCTYPE html><html><head><title>GlucoTrack Pro Report</title><style>
    body{font-family:-apple-system,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;color:#1e293b;font-size:13px}
    h1{color:#0284c7;border-bottom:3px solid #0ea5e9;padding-bottom:10px}
    h2{color:#0369a1;margin-top:30px;border-bottom:1px solid #e0f2fe;padding-bottom:6px}
    table{width:100%;border-collapse:collapse;margin:10px 0}
    th{background:#f0f9ff;text-align:left;padding:8px;font-size:11px;color:#0369a1}
    td{padding:6px 8px;border-bottom:1px solid #f1f5f9;font-size:12px}
    .green{color:#16a34a}.yellow{color:#ca8a04}.red{color:#dc2626}
    .header{background:#0284c7;color:white;padding:20px;border-radius:12px;margin-bottom:20px}
    .header p{margin:4px 0;opacity:0.9;font-size:13px}
    .header h1{color:white;border:none;margin:0;padding:0}
    @media print{body{padding:20px}}
    </style></head><body>`;
    h+=`<div class="header"><h1>GlucoTrack Pro — Health Report</h1><p>Patient: Mikail KOCAK</p><p>Generated: ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p></div>`;

    if(fg.length&&(dt==='all'||dt==='glucose')){
      const v=fg.map((r:any)=>r.value);const a=v.reduce((s:number,n:number)=>s+n,0)/v.length;
      h+=`<h2>🩸 Glucose Readings</h2><p><strong>Avg:</strong> ${Math.round(a)} mg/dL | <strong>HbA1c:</strong> ${calcHbA1c(a)}% | <strong>Count:</strong> ${fg.length}</p>`;
      h+=`<table><tr><th>Date</th><th>Value</th><th>Context</th></tr>`;
      fg.slice(0,60).forEach((r:any)=>{h+=`<tr><td>${new Date(r.timestamp).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td><td>${r.value} mg/dL</td><td>${r.mealContext}</td></tr>`;});
      h+=`</table>`;
    }
    if(fl.length&&(dt==='all'||dt==='labs')){
      h+=`<h2>🔬 Lab Results</h2><table><tr><th>Test</th><th>Value</th><th>Reference</th><th>Status</th></tr>`;
      fl.forEach((r:any)=>{const c=r.status==='normal'?'green':r.status==='borderline'?'yellow':'red';h+=`<tr><td>${r.name}</td><td>${r.value} ${r.unit}</td><td>${r.referenceMin}–${r.referenceMax}</td><td class="${c}">${r.status.toUpperCase()}</td></tr>`;});
      h+=`</table>`;
    }
    if(fm.length&&(dt==='all'||dt==='meds')){
      h+=`<h2>💊 Medications</h2><table><tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Time</th></tr>`;
      fm.forEach((x:any)=>{h+=`<tr><td>${x.name}</td><td>${x.dosage||'-'}</td><td>${x.frequency}</td><td>${x.timeOfDay?.join(', ')||'-'}</td></tr>`;});
      h+=`</table>`;
    }
    h+=`</body></html>`;
    w.document.write(h);w.document.close();
    setTimeout(()=>{w.print();},500);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><Clock size={22} className="text-white"/><h1 className="text-xl font-bold text-white">History</h1></div>
          <button onClick={pdf} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-bold"><FileDown size={14}/>PDF</button>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 mt-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-3">{[{k:'all',l:'All'},{k:'glucose',l:'🩸'},{k:'labs',l:'🔬'},{k:'meds',l:'💊'}].map(f=><button key={f.k} onClick={()=>setDt(f.k as DT)} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg ${dt===f.k?'bg-white text-sky-600 shadow-sm':'text-gray-400'}`}>{f.l}</button>)}</div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">{[{k:'7d',l:'7D'},{k:'30d',l:'30D'},{k:'90d',l:'90D'},{k:'1y',l:'1Y'},{k:'all',l:'All'}].map(r=><button key={r.k} onClick={()=>setDr(r.k as DR)} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg ${dr===r.k?'bg-white text-sky-600 shadow-sm':'text-gray-400'}`}>{r.l}</button>)}</div>

        {(dt==='all'||dt==='glucose')&&fg.length>0&&<div className="mb-5"><p className="text-[10px] font-bold text-gray-400 uppercase mb-2">🩸 Glucose ({fg.length})</p><div className="space-y-1">{fg.slice(0,30).map((r:any)=>(
          <div key={r.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg"><div className={`w-2 h-2 rounded-full ${r.value<70?'bg-red-400':r.value<=140?'bg-emerald-400':r.value<=180?'bg-amber-400':'bg-red-400'}`}/><span className="font-bold text-sm flex-1">{r.value}<span className="text-xs text-gray-400 font-normal ml-1">mg/dL</span></span><span className="text-[10px] text-gray-400">{new Date(r.timestamp).toLocaleDateString([],{month:'short',day:'numeric'})}</span></div>
        ))}</div></div>}

        {(dt==='all'||dt==='labs')&&fl.length>0&&<div className="mb-5"><p className="text-[10px] font-bold text-gray-400 uppercase mb-2">🔬 Labs ({fl.length})</p><div className="space-y-1">{fl.map((r:any)=>(
          <div key={r.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg"><div className={`w-2 h-2 rounded-full ${r.status==='normal'?'bg-emerald-400':r.status==='borderline'?'bg-amber-400':'bg-red-400'}`}/><span className="font-bold text-sm flex-1">{r.name}<span className="text-xs text-gray-400 font-normal ml-1">{r.value} {r.unit}</span></span><span className={`text-[10px] font-bold ${r.status==='normal'?'text-emerald-600':r.status==='borderline'?'text-amber-600':'text-red-600'}`}>{r.status}</span></div>
        ))}</div></div>}

        {(dt==='all'||dt==='meds')&&fm.length>0&&<div className="mb-5"><p className="text-[10px] font-bold text-gray-400 uppercase mb-2">💊 Meds ({fm.length})</p><div className="space-y-1">{fm.map((x:any)=>(
          <div key={x.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg"><div className="w-2 h-2 rounded-full bg-sky-400"/><span className="font-bold text-sm flex-1">{x.name}<span className="text-xs text-gray-400 font-normal ml-1">{x.dosage}</span></span><span className="text-[10px] text-gray-400">{x.timeOfDay?.join(',')}</span></div>
        ))}</div></div>}

        {!fg.length&&!fl.length&&<div className="text-center py-10"><p className="text-4xl mb-2">📋</p><p className="text-gray-400 text-sm">No records</p></div>}
      </div>
      <Nav/>
    </div>
  );
}
