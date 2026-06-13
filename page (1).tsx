'use client';
import { useEffect, useState, useCallback } from 'react';
import { Clock, FileDown } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getGlucoseReadings, getLabResults, getMedications, calculateHbA1c } from '@/lib/storage';

type DT = 'all' | 'glucose' | 'labs' | 'meds';
type DR = '7d' | '30d' | '90d' | '1y' | 'all';

export default function History() {
  const [dataType, setDataType] = useState<DT>('all');
  const [dateRange, setDateRange] = useState<DR>('30d');
  const [allGlucose, setAllGlucose] = useState<any[]>([]);
  const [allLabs, setAllLabs] = useState<any[]>([]);
  const [allMeds, setAllMeds] = useState<any[]>([]);

  const load = useCallback(() => { setAllGlucose(getGlucoseReadings()); setAllLabs(getLabResults()); setAllMeds(getMedications()); }, []);
  useEffect(() => { load(); }, [load]);

  const getStart = () => { const n = new Date(); switch (dateRange) { case '7d': return new Date(n.getTime()-7*864e5); case '30d': return new Date(n.getTime()-30*864e5); case '90d': return new Date(n.getTime()-90*864e5); case '1y': return new Date(n.getFullYear()-1,n.getMonth(),n.getDate()); case 'all': return new Date(2000,0,1); } };
  const fG = allGlucose.filter((r: any) => new Date(r.timestamp) >= getStart()).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const fL = allLabs.filter((r: any) => new Date(r.date) >= getStart()).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const fM = allMeds.filter((m: any) => m.isActive);
  const total = (dataType === 'all' || dataType === 'glucose' ? fG.length : 0) + (dataType === 'all' || dataType === 'labs' ? fL.length : 0) + (dataType === 'all' || dataType === 'meds' ? fM.length : 0);

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF(); const pw = doc.internal.pageSize.getWidth(); let y = 20;
    doc.setFillColor(2,132,199); doc.rect(0,0,pw,35,'F'); doc.setTextColor(255,255,255); doc.setFontSize(20); doc.setFont('helvetica','bold'); doc.text('GlucoTrack Pro — Health Report',15,18);
    doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.text(`Generated: ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}`,15,27); doc.text('Patient: Mikail KOCAK',15,32);
    y = 45; doc.setTextColor(30,41,59);
    if (fG.length && (dataType==='all'||dataType==='glucose')) {
      doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.text('Blood Glucose Readings',15,y); y+=8;
      const v=fG.map((r:any)=>r.value); const a=v.reduce((s:number,n:number)=>s+n,0)/v.length;
      doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139); doc.text(`Period Average: ${Math.round(a)} mg/dL | Est. HbA1c: ${calculateHbA1c(a)}% | Total: ${fG.length}`,15,y); y+=8;
      doc.setFillColor(241,245,249); doc.rect(15,y-4,pw-30,8,'F'); doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(100,116,139); doc.text('Date & Time',17,y); doc.text('Value',80,y); doc.text('Context',110,y); y+=6;
      doc.setFont('helvetica','normal'); doc.setTextColor(30,41,59);
      fG.slice(0,50).forEach((r:any)=>{if(y>270){doc.addPage();y=20;}doc.text(new Date(r.timestamp).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}),17,y);doc.text(`${r.value} mg/dL`,80,y);doc.text(r.mealContext||'',110,y);y+=5;}); y+=8;
    }
    if (fL.length && (dataType==='all'||dataType==='labs')) {
      if(y>240){doc.addPage();y=20;} doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(30,41,59); doc.text('Lab Results',15,y); y+=8;
      doc.setFillColor(241,245,249); doc.rect(15,y-4,pw-30,8,'F'); doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(100,116,139); doc.text('Test',17,y); doc.text('Value',70,y); doc.text('Ref',100,y); doc.text('Status',140,y); doc.text('Date',170,y); y+=6;
      doc.setFont('helvetica','normal'); doc.setTextColor(30,41,59);
      fL.forEach((r:any)=>{if(y>270){doc.addPage();y=20;}doc.text(r.name,17,y);doc.text(`${r.value} ${r.unit}`,70,y);doc.text(`${r.referenceMin}-${r.referenceMax}`,100,y);doc.text(r.status.toUpperCase(),140,y);doc.text(r.date,170,y);y+=5;}); y+=8;
    }
    if (fM.length && (dataType==='all'||dataType==='meds')) {
      if(y>240){doc.addPage();y=20;} doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(30,41,59); doc.text('Current Medications',15,y); y+=8;
      doc.setFillColor(241,245,249); doc.rect(15,y-4,pw-30,8,'F'); doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(100,116,139); doc.text('Name',17,y); doc.text('Dosage',70,y); doc.text('Frequency',100,y); doc.text('Time',135,y); y+=6;
      doc.setFont('helvetica','normal'); doc.setTextColor(30,41,59);
      fM.forEach((m:any)=>{if(y>270){doc.addPage();y=20;}doc.text(m.name,17,y);doc.text(m.dosage||'-',70,y);doc.text(m.frequency,100,y);doc.text(m.timeOfDay?.join(', ')||'-',135,y);y+=5;});
    }
    const pc = doc.getNumberOfPages(); for(let i=1;i<=pc;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(148,163,184);doc.text(`GlucoTrack Pro — Page ${i}/${pc}`,pw/2-20,290);}
    doc.save(`GlucoTrack_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const SC: any = { normal: 'bg-emerald-400', borderline: 'bg-amber-400', high: 'bg-red-400', low: 'bg-red-400', critical: 'bg-red-400' };
  const ST: any = { normal: 'text-emerald-600', borderline: 'text-amber-600', high: 'text-red-600', low: 'text-red-600', critical: 'text-red-700' };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-sky-400 pt-12 pb-6 px-5 rounded-b-3xl shadow-lg shadow-sky-200/50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Clock size={20} className="text-white" /></div><div><h1 className="text-xl font-bold text-white tracking-tight">History</h1><p className="text-sky-100 text-sm font-medium">{total} records</p></div></div>
          <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl text-white text-xs font-semibold"><FileDown size={14} />PDF</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-5">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {[{ k:'all',l:'All' },{ k:'glucose',l:'🩸' },{ k:'labs',l:'🔬' },{ k:'meds',l:'💊' }].map(f=><button key={f.k} onClick={()=>setDataType(f.k as DT)} className={`flex-1 py-2 text-xs font-semibold rounded-lg ${dataType===f.k?'bg-white text-sky-600 shadow-sm':'text-gray-400'}`}>{f.l}</button>)}
        </div>
        <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1 mb-5">
          {[{k:'7d',l:'7D'},{k:'30d',l:'30D'},{k:'90d',l:'90D'},{k:'1y',l:'1Y'},{k:'all',l:'All'}].map(r=><button key={r.k} onClick={()=>setDateRange(r.k as DR)} className={`flex-1 py-2 text-xs font-semibold rounded-lg ${dateRange===r.k?'bg-white text-sky-600 shadow-sm':'text-gray-400'}`}>{r.l}</button>)}
        </div>

        {(dataType==='all'||dataType==='glucose')&&fG.length>0&&<div className="mb-6"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🩸 Glucose ({fG.length})</h3><div className="space-y-1.5">{fG.slice(0,50).map((r:any)=><div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><div className={`w-2.5 h-2.5 rounded-full ${r.value<70?'bg-red-400':r.value<=140?'bg-emerald-400':r.value<=180?'bg-amber-400':'bg-red-400'}`}/><div className="flex-1"><span className="font-semibold text-gray-800 text-sm">{r.value}</span><span className="text-xs text-gray-400 ml-1">mg/dL</span></div><div className="text-right"><p className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleDateString([],{month:'short',day:'numeric'})}</p><p className="text-[10px] text-gray-300">{new Date(r.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p></div></div>)}</div></div>}

        {(dataType==='all'||dataType==='labs')&&fL.length>0&&<div className="mb-6"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🔬 Labs ({fL.length})</h3><div className="space-y-1.5">{fL.map((r:any)=><div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><div className={`w-2.5 h-2.5 rounded-full ${SC[r.status]||'bg-gray-400'}`}/><div className="flex-1"><span className="font-semibold text-gray-800 text-sm">{r.name}</span><span className="text-xs text-gray-400 ml-2">{r.value} {r.unit}</span></div><span className={`text-xs font-semibold ${ST[r.status]||'text-gray-400'}`}>{r.status}</span></div>)}</div></div>}

        {(dataType==='all'||dataType==='meds')&&fM.length>0&&<div className="mb-6"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">💊 Medications ({fM.length})</h3><div className="space-y-1.5">{fM.map((m:any)=><div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><div className="w-2.5 h-2.5 rounded-full bg-sky-400"/><div className="flex-1"><span className="font-semibold text-gray-800 text-sm">{m.name}</span><span className="text-xs text-gray-400 ml-2">{m.dosage}</span></div><span className="text-xs text-gray-400">{m.timeOfDay?.join(', ')}</span></div>)}</div></div>}

        {total===0&&<div className="text-center py-12"><div className="text-5xl mb-3">📋</div><p className="text-gray-400 font-medium">No records for this period</p></div>}
      </div>
      <BottomNav />
    </div>
  );
}
