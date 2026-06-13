'use client';
import { useState, useCallback } from 'react';
import { Newspaper, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import Nav from '@/components/Nav';

const CAT:any={longevity:{l:'Longevity',c:'bg-violet-100 text-violet-700',e:'🧬'},diabetes:{l:'Diabetes',c:'bg-sky-100 text-sky-700',e:'🩸'},medicine:{l:'Medicine',c:'bg-emerald-100 text-emerald-700',e:'⚕️'},wellness:{l:'Wellness',c:'bg-amber-100 text-amber-700',e:'🌿'}};

const DATA=[
  {id:'1',title:'ADA Standards of Care: Key Updates for Diabetes Management',summary:'Updated recommendations for CGM, SGLT2 inhibitors, and personalized treatment targets.',source:'ADA',url:'https://diabetes.org/clinical-resources',category:'diabetes',at:new Date().toISOString(),rt:'8 min'},
  {id:'2',title:'New GLP-1 Agonists Show Promise for Diabetes Reversal',summary:'Next-gen GLP-1 receptor agonists may help achieve diabetes remission in certain patients.',source:'Nature Medicine',url:'https://nature.com/nm',category:'diabetes',at:new Date(Date.now()-2*36e5).toISOString(),rt:'6 min'},
  {id:'3',title:'5 Evidence-Based Strategies to Extend Healthspan',summary:'Top strategies: intermittent fasting, exercise timing, targeted supplementation.',source:'Cell Metabolism',url:'https://cell.com/cell-metabolism',category:'longevity',at:new Date(Date.now()-4*36e5).toISOString(),rt:'7 min'},
  {id:'4',title:'AI Blood Glucose Prediction Achieves 95% Accuracy',summary:'ML models predict blood glucose 30 minutes ahead, transforming real-time management.',source:'Lancet Digital Health',url:'https://thelancet.com',category:'medicine',at:new Date(Date.now()-6*36e5).toISOString(),rt:'5 min'},
  {id:'5',title:'Mediterranean Diet + Time-Restricted Eating Improves Insulin Sensitivity',summary:'10-hour eating window with Mediterranean diet reduces HbA1c significantly.',source:'Diabetes Care',url:'https://diabetesjournals.org/care',category:'wellness',at:new Date(Date.now()-8*36e5).toISOString(),rt:'4 min'},
  {id:'6',title:'Senolytics: Removing Zombie Cells Could Add Decades to Lifespan',summary:'Senolytic drugs clear senescent cells, reducing age-related inflammation.',source:'Science Transl Med',url:'https://science.org',category:'longevity',at:new Date(Date.now()-12*36e5).toISOString(),rt:'6 min'},
  {id:'7',title:'CGMs Now Recommended for All Type 2 Diabetes Patients',summary:'Major societies now recommend CGM for all T2D, not just insulin users.',source:'Endocrine Society',url:'https://endocrine.org',category:'diabetes',at:new Date(Date.now()-16*36e5).toISOString(),rt:'5 min'},
  {id:'8',title:'New Biomarker Panel Predicts Diabetes Complications 5 Years Early',summary:'Biomarkers predict nephropathy, retinopathy, neuropathy before clinical onset.',source:'JAMA',url:'https://jamanetwork.com',category:'medicine',at:new Date(Date.now()-20*36e5).toISOString(),rt:'7 min'},
  {id:'9',title:'Sleep Quality Directly Impacts Next-Day Blood Glucose',summary:'Poor sleep quality and irregular patterns significantly affect glucose control.',source:'Sleep Med Reviews',url:'https://sciencedirect.com',category:'wellness',at:new Date(Date.now()-24*36e5).toISOString(),rt:'5 min'},
  {id:'10',title:'NAD+ Supplementation Shows Anti-Aging Benefits in Human Trial',summary:'Nicotinamide riboside improves biological aging markers and metabolic function.',source:'Nature Aging',url:'https://nature.com/nataging',category:'longevity',at:new Date(Date.now()-28*36e5).toISOString(),rt:'6 min'},
];

export default function News() {
  const [news,setNews]=useState(DATA);const [cat,setCat]=useState<'all'|'longevity'|'diabetes'|'medicine'|'wellness'>('all');const [ref,setRef]=useState(false);
  const refresh=useCallback(async()=>{setRef(true);await new Promise(r=>setTimeout(r,1200));setNews([...DATA].sort(()=>Math.random()-0.5));setRef(false);},[]);
  const filt=cat==='all'?news:news.filter(n=>n.category===cat);
  const ago=(d:string)=>{const h=Math.floor((Date.now()-new Date(d).getTime())/36e5);if(h<1)return'Now';if(h<24)return`${h}h`;return`${Math.floor(h/24)}d`;};

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><Newspaper size={22} className="text-white"/><h1 className="text-xl font-bold text-white">Medical News</h1></div>
          <button onClick={refresh} disabled={ref} className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center"><RefreshCw size={16} className={`text-white ${ref?'animate-spin':''}`}/></button>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-5 mt-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 overflow-x-auto">{[{k:'all',l:'All'},{k:'diabetes',l:'🩸'},{k:'longevity',l:'🧬'},{k:'medicine',l:'⚕️'},{k:'wellness',l:'🌿'}].map(c=>(
          <button key={c.k} onClick={()=>setCat(c.k as any)} className={`whitespace-nowrap px-3 py-1.5 text-[11px] font-bold rounded-lg ${cat===c.k?'bg-white text-sky-600 shadow-sm':'text-gray-400'}`}>{c.l}</button>
        ))}</div>
        {filt.length>0&&<a href={filt[0].url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100 mb-4">
          <div className="flex items-center gap-2 mb-2"><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${CAT[filt[0].category].c}`}>{CAT[filt[0].category].e} {CAT[filt[0].category].l}</span>{filt[0].rt&&<span className="text-[9px] text-gray-400 flex items-center gap-0.5"><Clock size={8}/>{filt[0].rt}</span>}</div>
          <h3 className="font-bold text-sm leading-snug mb-1">{filt[0].title}</h3><p className="text-xs text-gray-500">{filt[0].summary}</p>
          <div className="flex justify-between mt-2"><span className="text-[10px] text-gray-400">{filt[0].source}</span><span className="text-[10px] text-sky-500 flex items-center gap-0.5">Read<ExternalLink size={8}/></span></div>
        </a>}
        <div className="space-y-2">{filt.slice(1).map(n=>{const cc=CAT[n.category];return(
          <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">{cc.e}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5"><span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${cc.c}`}>{cc.l}</span><span className="text-[8px] text-gray-400">{ago(n.at)}</span></div>
                <h4 className="font-bold text-xs leading-snug">{n.title}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{n.summary}</p>
                <span className="text-[9px] text-gray-300">{n.source}</span>
              </div>
            </div>
          </a>
        );})}</div>
      </div>
      <Nav/>
    </div>
  );
}
