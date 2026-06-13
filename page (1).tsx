'use client';
import { useEffect, useState, useCallback } from 'react';
import { Activity, Plus, Trash2, TrendingUp, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import BottomNav from '@/components/BottomNav';
import { getGlucoseReadings, saveGlucoseReading, deleteGlucoseReading, calculateHbA1c } from '@/lib/storage';

type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export default function Tracker() {
  const [readings, setReadings] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('daily');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ value: '', mealContext: 'fasting', notes: '' });

  const load = useCallback(() => { setReadings(getGlucoseReadings().sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())); }, []);
  useEffect(() => { load(); }, [load]);

  const getStart = () => { const n = new Date(); switch (period) { case 'daily': return new Date(n.getFullYear(), n.getMonth(), n.getDate()); case 'weekly': return new Date(n.getTime() - 7*864e5); case 'monthly': return new Date(n.getFullYear(), n.getMonth()-1, n.getDate()); case 'quarterly': return new Date(n.getFullYear(), n.getMonth()-3, n.getDate()); case 'yearly': return new Date(n.getFullYear()-1, n.getMonth(), n.getDate()); } };
  const filtered = readings.filter((r: any) => new Date(r.timestamp) >= getStart());
  const chart = filtered.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((r: any) => ({ time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }), value: r.value }));
  const stats = filtered.length ? (() => { const v = filtered.map((r: any) => r.value); const a = v.reduce((s: number, n: number) => s+n, 0)/v.length; return { avg: Math.round(a), min: Math.min(...v), max: Math.max(...v), hba1c: calculateHbA1c(a), count: v.length }; })() : null;

  const handleAdd = () => { if (!form.value) return; saveGlucoseReading({ id: Date.now().toString(), value: Number(form.value), timestamp: new Date().toISOString(), mealContext: form.mealContext, notes: form.notes }); setShowAdd(false); setForm({ value: '', mealContext: 'fasting', notes: '' }); load(); };

  const cm = (v: number, g: number, y: number) => v <= g ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : v <= y ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100';
  const icons: any = { fasting: '🌅', before_meal: '🍽️', after_meal: '🥗', bedtime: '🌙', other: '📝' };
  const periods: { k: Period; l: string }[] = [{ k: 'daily', l: 'Day' }, { k: 'weekly', l: 'Week' }, { k: 'monthly', l: 'Month' }, { k: 'quarterly', l: 'Quarter' }, { k: 'yearly', l: 'Year' }];
  const meals = [{ k: 'fasting', l: '🌅 Fasting' }, { k: 'before_meal', l: '🍽️ Before' }, { k: 'after_meal', l: '🥗 After' }, { k: 'bedtime', l: '🌙 Bed' }, { k: 'other', l: '📝 Other' }];

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-sky-400 pt-12 pb-6 px-5 rounded-b-3xl shadow-lg shadow-sky-200/50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Activity size={20} className="text-white" /></div><div><h1 className="text-xl font-bold text-white tracking-tight">Glucose Tracker</h1><p className="text-sky-100 text-sm font-medium">Monitor your blood sugar</p></div></div>
          <button onClick={() => setShowAdd(true)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Plus size={20} className="text-white" /></button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-5">
        <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1 mb-5">
          {periods.map(p => <button key={p.k} onClick={() => setPeriod(p.k)} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${period === p.k ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-400'}`}>{p.l}</button>)}
        </div>

        {stats && <div className="grid grid-cols-2 gap-3 mb-5">
          <div className={`rounded-2xl border p-3.5 ${cm(stats.avg, 140, 180)}`}><p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Avg Glucose</p><div className="flex items-baseline gap-1 mt-1"><span className="text-2xl font-bold">{stats.avg}</span><span className="text-xs opacity-70">mg/dL</span></div></div>
          <div className={`rounded-2xl border p-3.5 ${cm(stats.hba1c, 6.5, 7.5)}`}><p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Est. HbA1c</p><div className="flex items-baseline gap-1 mt-1"><span className="text-2xl font-bold">{stats.hba1c}</span><span className="text-xs opacity-70">%</span></div></div>
          <div className="rounded-2xl border p-3.5 bg-sky-50 text-sky-700 border-sky-100"><p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Low</p><div className="flex items-baseline gap-1 mt-1"><span className="text-2xl font-bold">{stats.min}</span><span className="text-xs opacity-70">mg/dL</span></div></div>
          <div className={`rounded-2xl border p-3.5 ${stats.max > 180 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-sky-50 text-sky-700 border-sky-100'}`}><p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">High</p><div className="flex items-baseline gap-1 mt-1"><span className="text-2xl font-bold">{stats.max}</span><span className="text-xs opacity-70">mg/dL</span></div></div>
        </div>}

        {!stats && <div className="text-center py-12"><div className="text-5xl mb-3">📊</div><p className="text-gray-400 font-medium">No readings for this period</p><button onClick={() => setShowAdd(true)} className="mt-4 px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm">Add First Reading</button></div>}

        {chart.length > 0 && <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Glucose Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs><linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={period === 'daily' ? 'time' : 'date'} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 300]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.96)', border: '1px solid #e0f2fe', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} label={{ value: 'High', fontSize: 9, fill: '#ef4444' }} />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} label={{ value: 'Low', fontSize: 9, fill: '#ef4444', position: 'insideBottomLeft' }} />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gG)" dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>}

        {stats && <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 mb-5 border border-sky-100">
          <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-4">Estimated HbA1c Level</h3>
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90"><circle cx="50" cy="50" r="40" fill="none" stroke="#e0f2fe" strokeWidth="10" /><circle cx="50" cy="50" r="40" fill="none" stroke={stats.hba1c <= 6.5 ? '#22c55e' : stats.hba1c <= 7.5 ? '#eab308' : '#ef4444'} strokeWidth="10" strokeDasharray={`${Math.min((stats.hba1c/14)*251.2, 251.2)} 251.2`} strokeLinecap="round" /></svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-bold text-gray-800">{stats.hba1c}</span><span className="text-[9px] text-gray-400 font-semibold">%</span></div>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400" /><span className="text-xs text-gray-600">Normal: ≤ 6.5%</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400" /><span className="text-xs text-gray-600">At Risk: 6.5–7.5%</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-xs text-gray-600">High: &gt; 7.5%</span></div>
              <p className="text-[10px] text-gray-400 mt-2">*Estimate based on average glucose</p>
            </div>
          </div>
        </div>}

        {filtered.length > 0 && <div className="mb-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent ({filtered.length})</h3>
          <div className="space-y-2">{filtered.slice(0, 20).map((r: any) => (
            <div key={r.id} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">{icons[r.mealContext] || '📝'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2"><span className="font-bold text-gray-800">{r.value}</span><span className="text-xs text-gray-400">mg/dL</span><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.value < 70 ? 'bg-red-100 text-red-600' : r.value <= 140 ? 'bg-emerald-100 text-emerald-600' : r.value <= 180 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>{r.value < 70 ? 'Low' : r.value <= 140 ? 'Normal' : r.value <= 180 ? 'Elevated' : 'High'}</span></div>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {r.mealContext.replace('_', ' ')}</p>
              </div>
              <button onClick={() => { deleteGlucoseReading(r.id); load(); }} className="p-2 text-gray-300 active:text-red-400"><Trash2 size={16} /></button>
            </div>
          ))}</div>
        </div>}
      </div>

      {showAdd && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-in">
          <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-gray-800">Log Glucose</h2><button onClick={() => setShowAdd(false)} className="p-2 text-gray-400"><X size={22} /></button></div>
          <div className="space-y-4">
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Blood Glucose (mg/dL)</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="e.g., 120" className="w-full mt-2 p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-400" autoFocus /></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">When</label><div className="grid grid-cols-3 gap-2 mt-2">{meals.map(m => <button key={m.k} onClick={() => setForm({ ...form, mealContext: m.k })} className={`py-3 rounded-xl text-xs font-semibold ${form.mealContext === m.k ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'bg-gray-100 text-gray-500'}`}>{m.l}</button>)}</div></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</label><input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." className="w-full mt-2 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" /></div>
            <button onClick={handleAdd} disabled={!form.value} className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-base active:bg-sky-600 disabled:opacity-40 shadow-lg shadow-sky-200">Save Reading</button>
          </div>
        </div>
      </div>}
      <BottomNav />
    </div>
  );
}
