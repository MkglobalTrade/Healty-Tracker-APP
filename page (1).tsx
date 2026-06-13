'use client';
import { useEffect, useState } from 'react';
import { Calendar, Heart, ChevronRight } from 'lucide-react';
import Nav from '@/components/Nav';
import { getProfile, getGlucose, calcHbA1c, getMeds } from '@/lib/store';

export default function Home() {
  const [p, setP] = useState({ name: 'Mikail KOCAK', birthDate: '1979-07-23', photoUrl: '' });
  const [avg, setAvg] = useState<number|null>(null);
  const [hba, setHba] = useState<number|null>(null);
  const [cnt, setCnt] = useState(0);
  const [meds, setMeds] = useState(0);
  const [greet, setGreet] = useState('Good Morning');

  useEffect(() => {
    setP(getProfile());
    const h = new Date().getHours();
    setGreet(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    const r = getGlucose(); const d = new Date().toISOString().split('T')[0];
    const t = r.filter((x: any) => x.timestamp.startsWith(d));
    if (t.length) { const v = t.map((x: any) => x.value); const a = v.reduce((s: number, n: number) => s+n, 0)/v.length; setAvg(Math.round(a)); setHba(calcHbA1c(a)); }
    setCnt(t.length); setMeds(getMeds().filter((m: any) => m.isActive).length);
  }, []);

  const age = (() => { const b = new Date('1979-07-23'); const n = new Date(); let a = n.getFullYear()-b.getFullYear(); if (n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate())) a--; return a; })();
  const bday = (() => { const b = new Date('1979-07-23'); const n = new Date(); const x = new Date(n.getFullYear(),b.getMonth(),b.getDate()); if(x<n) x.setFullYear(x.getFullYear()+1); return Math.ceil((x.getTime()-n.getTime())/864e5); })();

  const Card = ({l,v,u,c}:{l:string,v:any,u?:string,c:string})=>(
    <div className={`rounded-2xl border p-3 ${c}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{l}</p>
      <div className="flex items-baseline gap-1 mt-1"><span className="text-xl font-bold">{v}</span>{u&&<span className="text-xs opacity-60">{u}</span>}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-14 pb-8 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div><p className="text-sky-100 text-sm">{greet} 👋</p><h1 className="text-2xl font-bold text-white">{p.name}</h1></div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/30">
              {p.photoUrl ? <img src={p.photoUrl} alt="" className="w-full h-full object-cover rounded-xl"/> : <span className="text-xl font-bold text-white">MK</span>}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/15 rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2"><Calendar size={14} className="text-white"/><span className="text-sky-100 text-[10px] font-bold uppercase">Age</span></div>
              <p className="text-white text-lg font-bold mt-1">{age} <span className="text-xs text-sky-200">years</span></p>
              <p className="text-sky-200 text-[10px]">Born July 23, 1979</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2"><Heart size={14} className="text-white"/><span className="text-sky-100 text-[10px] font-bold uppercase">Birthday</span></div>
              <p className="text-white text-lg font-bold mt-1">{bday} <span className="text-xs text-sky-200">days</span></p>
              <p className="text-sky-200 text-[10px]">Until next birthday</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 mt-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Today</p>
        <div className="grid grid-cols-2 gap-3">
          <Card l="Avg Glucose" v={avg??'—'} u="mg/dL" c={avg?(avg<=140?'bg-emerald-50 text-emerald-700 border-emerald-100':avg<=180?'bg-amber-50 text-amber-700 border-amber-100':'bg-red-50 text-red-700 border-red-100'):'bg-sky-50 text-sky-700 border-sky-100'}/>
          <Card l="Est HbA1c" v={hba??'—'} u="%" c={hba?(hba<=6.5?'bg-emerald-50 text-emerald-700 border-emerald-100':hba<=7.5?'bg-amber-50 text-amber-700 border-amber-100':'bg-red-50 text-red-700 border-red-100'):'bg-sky-50 text-sky-700 border-sky-100'}/>
          <Card l="Readings" v={cnt} c="bg-sky-50 text-sky-700 border-sky-100"/>
          <Card l="Active Meds" v={meds} c="bg-sky-50 text-sky-700 border-sky-100"/>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-3">Quick Actions</p>
        <div className="space-y-2">
          {[{l:'Log Glucose',e:'🩸',h:'/tracker'},{l:'Upload Lab Results',e:'🔬',h:'/labs'},{l:'Medications',e:'💊',h:'/meds'},{l:'Ask AI Doctor',e:'🤖',h:'/ai-doctor'},{l:'Medical News',e:'📰',h:'/news'}].map(a=>(
            <a key={a.l} href={a.h} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xl">{a.e}</span><span className="flex-1 font-semibold text-gray-800 text-sm">{a.l}</span><ChevronRight size={16} className="text-gray-300"/>
            </a>
          ))}
        </div>
        <div className="mt-6 p-4 bg-sky-50 rounded-2xl border border-sky-100">
          <p className="font-bold text-sky-800 text-sm mb-2">📊 Glucose Targets</p>
          {[{l:'Fasting',r:'80–130',c:'bg-emerald-400'},{l:'Before Meal',r:'80–130',c:'bg-sky-400'},{l:'After Meal',r:'< 180',c:'bg-amber-400'},{l:'Bedtime',r:'100–140',c:'bg-indigo-400'}].map(t=>(
            <div key={t.l} className="flex items-center gap-2 py-1"><div className={`w-2 h-2 rounded-full ${t.c}`}/><span className="text-xs text-gray-600 flex-1">{t.l}</span><span className="text-xs font-bold text-gray-800">{t.r}</span></div>
          ))}
        </div>
      </div>
      <Nav/>
    </div>
  );
}
