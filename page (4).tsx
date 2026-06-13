'use client';
import { useEffect, useState, useCallback } from 'react';
import { FlaskConical, Plus, Trash2, X, Upload, Camera, FileText } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getLabResults, saveLabResult, deleteLabResult } from '@/lib/storage';

const LABS = [
  { name: 'Glucose', unit: 'mg/dL', min: 70, max: 100 }, { name: 'HbA1c', unit: '%', min: 4.0, max: 5.6 },
  { name: 'Total Cholesterol', unit: 'mg/dL', min: 0, max: 200 }, { name: 'LDL', unit: 'mg/dL', min: 0, max: 100 },
  { name: 'HDL', unit: 'mg/dL', min: 40, max: 60 }, { name: 'Triglycerides', unit: 'mg/dL', min: 0, max: 150 },
  { name: 'Creatinine', unit: 'mg/dL', min: 0.6, max: 1.2 }, { name: 'BUN', unit: 'mg/dL', min: 7, max: 20 },
  { name: 'eGFR', unit: 'mL/min', min: 60, max: 120 }, { name: 'ALT', unit: 'U/L', min: 7, max: 56 },
  { name: 'AST', unit: 'U/L', min: 10, max: 40 }, { name: 'TSH', unit: 'mIU/L', min: 0.4, max: 4.0 },
  { name: 'Vitamin D', unit: 'ng/mL', min: 30, max: 100 }, { name: 'B12', unit: 'pg/mL', min: 200, max: 900 },
  { name: 'Sodium', unit: 'mEq/L', min: 136, max: 145 }, { name: 'Potassium', unit: 'mEq/L', min: 3.5, max: 5.0 },
  { name: 'Hemoglobin', unit: 'g/dL', min: 13.5, max: 17.5 }, { name: 'WBC', unit: 'x10³/µL', min: 4.5, max: 11.0 },
  { name: 'Platelets', unit: 'x10³/µL', min: 150, max: 400 }, { name: 'Uric Acid', unit: 'mg/dL', min: 3.5, max: 7.2 },
];

const getStatus = (v: number, min: number, max: number) => {
  const r = max - min;
  if (v < min * 0.7 || v > max * 1.3) return 'critical';
  if (v < min - r * 0.1) return 'low';
  if (v > max + r * 0.1) return 'high';
  if (v < min || v > max) return 'borderline';
  return 'normal';
};

const SC: any = { normal: { bg: 'bg-emerald-50', b: 'border-emerald-200', t: 'text-emerald-700', l: '✅ Normal' }, borderline: { bg: 'bg-amber-50', b: 'border-amber-200', t: 'text-amber-700', l: '⚠️ Borderline' }, high: { bg: 'bg-red-50', b: 'border-red-200', t: 'text-red-700', l: '🔴 High' }, low: { bg: 'bg-red-50', b: 'border-red-200', t: 'text-red-700', l: '🔴 Low' }, critical: { bg: 'bg-red-100', b: 'border-red-300', t: 'text-red-900', l: '🚨 Critical' } };

export default function Labs() {
  const [results, setResults] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<typeof LABS[0] | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', value: '', referenceMin: '', referenceMax: '', unit: '', date: new Date().toISOString().split('T')[0], notes: '', source: 'manual' });

  const load = useCallback(() => { setResults(getLabResults().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())); }, []);
  useEffect(() => { load(); }, [load]);

  const handleAdd = () => {
    if (!form.name || !form.value) return;
    const v = Number(form.value), min = Number(form.referenceMin), max = Number(form.referenceMax);
    saveLabResult({ id: Date.now().toString(), name: form.name, value: v, unit: form.unit, referenceMin: min, referenceMax: max, status: getStatus(v, min, max), date: form.date, source: form.source, notes: form.notes });
    setShowAdd(false); setSelected(null); setForm({ name: '', value: '', referenceMin: '', referenceMax: '', unit: '', date: new Date().toISOString().split('T')[0], notes: '', source: 'manual' }); load();
  };

  const grouped = results.reduce((acc: any, r: any) => { (acc[r.date] = acc[r.date] || []).push(r); return acc; }, {});
  const nc = results.filter((r: any) => r.status === 'normal').length;
  const bc = results.filter((r: any) => r.status === 'borderline').length;
  const rc = results.filter((r: any) => ['high', 'low', 'critical'].includes(r.status)).length;

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-sky-400 pt-12 pb-6 px-5 rounded-b-3xl shadow-lg shadow-sky-200/50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><FlaskConical size={20} className="text-white" /></div><div><h1 className="text-xl font-bold text-white tracking-tight">Lab Results</h1><p className="text-sky-100 text-sm font-medium">Track your lab work</p></div></div>
          <button onClick={() => setShowAdd(true)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Plus size={20} className="text-white" /></button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-5">
        {results.length > 0 && <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center"><p className="text-2xl font-bold text-emerald-600">{nc}</p><p className="text-[10px] font-semibold text-emerald-500 uppercase">Normal</p></div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center"><p className="text-2xl font-bold text-amber-600">{bc}</p><p className="text-[10px] font-semibold text-amber-500 uppercase">Borderline</p></div>
          <div className="bg-red-50 rounded-xl p-3 border border-red-100 text-center"><p className="text-2xl font-bold text-red-600">{rc}</p><p className="text-[10px] font-semibold text-red-500 uppercase">Attention</p></div>
        </div>}

        {Object.keys(grouped).length > 0 ? Object.entries(grouped).map(([date, labs]: [string, any]) => (
          <div key={date} className="mb-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{new Date(date + 'T12:00:00').toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
            <div className="space-y-2">{labs.map((r: any) => { const s = SC[r.status] || SC.normal; return (
              <div key={r.id} className={`p-4 rounded-xl border ${s.bg} ${s.b}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><span className="font-semibold text-gray-800 text-sm">{r.name}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.t}`}>{s.l}</span></div>
                    <div className="flex items-baseline gap-2 mt-1.5"><span className="text-xl font-bold text-gray-800">{r.value}</span><span className="text-xs text-gray-400">{r.unit}</span></div>
                    <p className="text-[10px] text-gray-400 mt-1">Ref: {r.referenceMin}–{r.referenceMax} {r.unit}</p>
                    {r.notes && <p className="text-xs text-gray-500 mt-1 italic">{r.notes}</p>}
                  </div>
                  <button onClick={() => { deleteLabResult(r.id); load(); }} className="p-1.5 text-gray-300 active:text-red-400"><Trash2 size={14} /></button>
                </div>
                <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${r.status === 'normal' ? 'bg-emerald-400' : r.status === 'borderline' ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${Math.min(((r.value - r.referenceMin) / (r.referenceMax - r.referenceMin)) * 100, 100)}%` }} /></div>
              </div>
            ); })}</div>
          </div>
        )) : (
          <div className="text-center py-12"><div className="text-5xl mb-3">🔬</div><p className="text-gray-400 font-medium">No lab results yet</p><button onClick={() => setShowAdd(true)} className="mt-4 px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm">Add Lab Result</button></div>
        )}
      </div>

      {showAdd && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-in max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold text-gray-800">Add Lab Result</h2><button onClick={() => { setShowAdd(false); setSelected(null); }} className="p-2 text-gray-400"><X size={22} /></button></div>
          <div className="flex gap-2 mb-5">
            {[{ k: 'manual', l: 'Manual', i: <FileText size={16} /> }, { k: 'photo', l: 'Photo', i: <Camera size={16} /> }, { k: 'pdf', l: 'PDF', i: <Upload size={16} /> }].map(s => (
              <button key={s.k} onClick={() => setForm({ ...form, source: s.k })} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold ${form.source === s.k ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'bg-gray-100 text-gray-500'}`}>{s.i}{s.l}</button>
            ))}
          </div>
          {!selected && <div className="mb-4">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lab test..." className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1">{LABS.filter(l => l.name.toLowerCase().includes(search.toLowerCase())).map(l => (
              <button key={l.name} onClick={() => { setSelected(l); setForm({ ...form, name: l.name, unit: l.unit, referenceMin: l.min.toString(), referenceMax: l.max.toString() }); }} className="w-full text-left p-3 bg-gray-50 rounded-xl text-sm hover:bg-sky-50 active:bg-sky-100"><span className="font-medium text-gray-800">{l.name}</span><span className="text-xs text-gray-400 ml-2">({l.min}–{l.max} {l.unit})</span></button>
            ))}</div>
          </div>}
          {selected && <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-sky-50 rounded-xl"><span className="font-semibold text-sky-800 text-sm">{selected.name}</span><button onClick={() => { setSelected(null); setForm({ ...form, name: '', unit: '', referenceMin: '', referenceMax: '' }); }} className="text-xs text-sky-500 font-semibold">Change</button></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="Enter value" className="w-full mt-1.5 p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-400" autoFocus /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref Min</label><input type="number" value={form.referenceMin} onChange={e => setForm({ ...form, referenceMin: e.target.value })} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" /></div>
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref Max</label><input type="number" value={form.referenceMax} onChange={e => setForm({ ...form, referenceMax: e.target.value })} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" /></div>
            </div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" /></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</label><input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional..." className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" /></div>
            <button onClick={handleAdd} disabled={!form.value || !form.name} className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-base active:bg-sky-600 disabled:opacity-40 shadow-lg shadow-sky-200">Save Lab Result</button>
          </div>}
        </div>
      </div>}
      <BottomNav />
    </div>
  );
}
