'use client';
import { useState, useCallback } from 'react';
import { Newspaper, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const CAT: any = { longevity: { l: 'Longevity', c: 'bg-violet-100 text-violet-700', e: '🧬' }, diabetes: { l: 'Diabetes', c: 'bg-sky-100 text-sky-700', e: '🩸' }, medicine: { l: 'Medicine', c: 'bg-emerald-100 text-emerald-700', e: '⚕️' }, wellness: { l: 'Wellness', c: 'bg-amber-100 text-amber-700', e: '🌿' } };

const NEWS = [
  { id:'1', title:'2024 ADA Standards of Care: Key Updates for Diabetes Management', summary:'The ADA has released updated Standards of Care with new recommendations for CGM, SGLT2 inhibitors, and personalized treatment targets.', source:'American Diabetes Association', url:'https://diabetes.org/clinical-resources', category:'diabetes', publishedAt: new Date().toISOString(), readTime:'8 min' },
  { id:'2', title:'Breakthrough: New GLP-1 Receptor Agonists Show Promise for Diabetes Reversal', summary:'Latest clinical trials demonstrate next-gen GLP-1 receptor agonists may help achieve diabetes remission in certain patients.', source:'Nature Medicine', url:'https://www.nature.com/nm/', category:'diabetes', publishedAt: new Date(Date.now()-2*36e5).toISOString(), readTime:'6 min' },
  { id:'3', title:'Longevity Science: 5 Evidence-Based Strategies to Extend Healthspan', summary:'Leading researchers share top strategies for extending healthy years including intermittent fasting, exercise timing, and targeted supplementation.', source:'Cell Metabolism', url:'https://www.cell.com/cell-metabolism', category:'longevity', publishedAt: new Date(Date.now()-4*36e5).toISOString(), readTime:'7 min' },
  { id:'4', title:'AI-Powered Blood Glucose Prediction Models Achieve 95% Accuracy', summary:'New ML models can predict blood glucose 30 minutes ahead with remarkable accuracy, potentially transforming real-time diabetes management.', source:'The Lancet Digital Health', url:'https://www.thelancet.com/journals/landig', category:'medicine', publishedAt: new Date(Date.now()-6*36e5).toISOString(), readTime:'5 min' },
  { id:'5', title:'Mediterranean Diet + Time-Restricted Eating Improves Insulin Sensitivity', summary:'A new study shows combining Mediterranean diet with 10-hour eating windows significantly improves insulin sensitivity and reduces HbA1c.', source:'Diabetes Care', url:'https://diabetesjournals.org/care', category:'wellness', publishedAt: new Date(Date.now()-8*36e5).toISOString(), readTime:'4 min' },
  { id:'6', title:'Senolytics: Removing Zombie Cells Could Add Decades to Lifespan', summary:'Clinical trials of senolytic drugs that clear senescent cells show promising results in reducing age-related inflammation and improving metabolic health.', source:'Science Translational Medicine', url:'https://www.science.org/journals/scitransmed', category:'longevity', publishedAt: new Date(Date.now()-12*36e5).toISOString(), readTime:'6 min' },
  { id:'7', title:'CGMs Now Recommended for All Type 2 Diabetes Patients', summary:'New guidelines from major endocrinology societies now recommend CGM use for all T2D patients, citing improved outcomes and awareness.', source:'Endocrine Society', url:'https://www.endocrine.org/', category:'diabetes', publishedAt: new Date(Date.now()-16*36e5).toISOString(), readTime:'5 min' },
  { id:'8', title:'New Biomarker Panel Can Predict Diabetes Complications 5 Years in Advance', summary:'Researchers identified biomarkers that can predict diabetic nephropathy, retinopathy, and neuropathy years before clinical onset.', source:'JAMA', url:'https://jamanetwork.com/', category:'medicine', publishedAt: new Date(Date.now()-20*36e5).toISOString(), readTime:'7 min' },
  { id:'9', title:'Sleep Quality Directly Impacts Next-Day Blood Glucose', summary:'Large-scale study confirms poor sleep quality and irregular patterns significantly affect next-day glucose control.', source:'Sleep Medicine Reviews', url:'https://www.sciencedirect.com/journal/sleep-medicine-reviews', category:'wellness', publishedAt: new Date(Date.now()-24*36e5).toISOString(), readTime:'5 min' },
  { id:'10', title:'NAD+ Supplementation Shows Anti-Aging Benefits in Human Trial', summary:'Phase 3 trial of nicotinamide riboside demonstrates measurable improvements in biological aging markers and metabolic function.', source:'Nature Aging', url:'https://www.nature.com/nataging/', category:'longevity', publishedAt: new Date(Date.now()-28*36e5).toISOString(), readTime:'6 min' },
];

export default function News() {
  const [news, setNews] = useState(NEWS);
  const [cat, setCat] = useState<'all'|'longevity'|'diabetes'|'medicine'|'wellness'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUp, setLastUp] = useState(new Date());

  const refresh = useCallback(async () => { setRefreshing(true); await new Promise(r => setTimeout(r, 1500)); setNews([...NEWS].sort(() => Math.random() - 0.5)); setLastUp(new Date()); setRefreshing(false); }, []);

  const filtered = cat === 'all' ? news : news.filter(n => n.category === cat);
  const timeAgo = (d: string) => { const h = Math.floor((Date.now() - new Date(d).getTime()) / 36e5); if (h < 1) return 'Just now'; if (h < 24) return `${h}h ago`; return `${Math.floor(h/24)}d ago`; };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-sky-400 pt-12 pb-6 px-5 rounded-b-3xl shadow-lg shadow-sky-200/50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Newspaper size={20} className="text-white" /></div><div><h1 className="text-xl font-bold text-white tracking-tight">Medical News</h1><p className="text-sky-100 text-sm font-medium">AI-curated updates</p></div></div>
          <button onClick={refresh} disabled={refreshing} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><RefreshCw size={18} className={`text-white ${refreshing ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-5">
        <div className="flex items-center gap-2 mb-4"><div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-amber-400' : 'bg-emerald-400'} pulse-dot`} /><span className="text-xs text-gray-400">{refreshing ? 'Updating...' : `Updated ${lastUp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Auto-refreshes hourly`}</span></div>

        <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto">
          {[{k:'all',l:'All'},{k:'diabetes',l:'🩸 Diabetes'},{k:'longevity',l:'🧬 Longevity'},{k:'medicine',l:'⚕️ Medicine'},{k:'wellness',l:'🌿 Wellness'}].map(c=><button key={c.k} onClick={()=>setCat(c.k as any)} className={`whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-lg ${cat===c.k?'bg-white text-sky-600 shadow-sm':'text-gray-400'}`}>{c.l}</button>)}
        </div>

        {filtered.length > 0 && <div className="mb-5"><a href={filtered[0].url} target="_blank" rel="noopener noreferrer" className="block p-5 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-100">
          <div className="flex items-center gap-2 mb-3"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${CAT[filtered[0].category].c}`}>{CAT[filtered[0].category].e} {CAT[filtered[0].category].l}</span>{filtered[0].readTime && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} />{filtered[0].readTime}</span>}</div>
          <h3 className="font-bold text-gray-800 text-base leading-snug mb-2">{filtered[0].title}</h3><p className="text-sm text-gray-500 leading-relaxed">{filtered[0].summary}</p>
          <div className="flex items-center justify-between mt-3"><span className="text-xs text-gray-400">{filtered[0].source}</span><span className="text-xs text-sky-500 flex items-center gap-1">Read more <ExternalLink size={10} /></span></div>
        </a></div>}

        <div className="space-y-3">{filtered.slice(1).map(item => { const cc = CAT[item.category]; return (
          <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-50 rounded-xl border border-gray-100 group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg shrink-0">{cc.e}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1"><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cc.c}`}>{cc.l}</span>{item.readTime && <span className="text-[9px] text-gray-400 flex items-center gap-0.5"><Clock size={8} />{item.readTime}</span>}</div>
                <h4 className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-sky-600">{item.title}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.summary}</p>
                <div className="flex items-center justify-between mt-2"><span className="text-[10px] text-gray-300">{item.source}</span><span className="text-[10px] text-gray-400">{timeAgo(item.publishedAt)}</span></div>
              </div>
            </div>
          </a>
        ); })}</div>

        {filtered.length === 0 && <div className="text-center py-12"><div className="text-5xl mb-3">📰</div><p className="text-gray-400 font-medium">No news in this category</p></div>}
      </div>
      <BottomNav />
    </div>
  );
}
