'use client';
import { useEffect, useState, useCallback } from 'react';
import { Pill, Plus, Trash2, X, Sun, Moon, Sparkles, Check } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getMedications, saveMedication, updateMedication, deleteMedication } from '@/lib/storage';

const VITAMIN_TIMING: Record<string, { bestTime: string; reason: string; withFood: boolean }> = {
  'Vitamin D': { bestTime: 'Morning', reason: 'Best absorbed with sunlight and fatty meals. May disrupt sleep if taken at night.', withFood: true },
  'Vitamin B12': { bestTime: 'Morning', reason: 'Boosts energy. Can interfere with sleep if taken in the evening.', withFood: false },
  'Vitamin C': { bestTime: 'Morning/Afternoon', reason: 'Split doses improve absorption. Avoid near bedtime.', withFood: false },
  'Vitamin A': { bestTime: 'Morning', reason: 'Fat-soluble, take with a meal containing healthy fats.', withFood: true },
  'Vitamin E': { bestTime: 'Evening', reason: 'Fat-soluble, take with dinner. Antioxidant properties work during sleep.', withFood: true },
  'Vitamin K': { bestTime: 'Evening', reason: 'Fat-soluble, best with meal. Works synergistically with Vitamin D.', withFood: true },
  'Iron': { bestTime: 'Morning', reason: 'Best absorbed on empty stomach. Avoid with calcium or dairy.', withFood: false },
  'Calcium': { bestTime: 'Evening', reason: 'Promotes better sleep. Separate from iron by 2+ hours.', withFood: true },
  'Magnesium': { bestTime: 'Evening', reason: 'Promotes muscle relaxation and better sleep quality.', withFood: true },
  'Zinc': { bestTime: 'Morning', reason: 'Best on empty stomach. Take with light food if nausea occurs.', withFood: false },
  'Omega-3': { bestTime: 'Morning', reason: 'Take with fatty meal for absorption. Can cause fishy aftertaste at night.', withFood: true },
  'Probiotics': { bestTime: 'Morning', reason: 'Best on empty stomach 30 min before breakfast.', withFood: false },
  'Fiber': { bestTime: 'Morning', reason: 'Take with plenty of water. Best before meals for blood sugar control.', withFood: true },
  'CoQ10': { bestTime: 'Morning', reason: 'Fat-soluble and energizing. May cause insomnia if taken late.', withFood: true },
  'Folic Acid': { bestTime: 'Morning', reason: 'B vitamin for energy. Take on empty stomach.', withFood: false },
  'Biotin': { bestTime: 'Morning', reason: 'Water-soluble B vitamin. Morning is best for consistency.', withFood: false },
  'Metformin': { bestTime: 'With meals', reason: 'Take with meals to reduce GI side effects. Evening dose helps dawn phenomenon.', withFood: true },
  'Berberine': { bestTime: 'Before meals', reason: 'Take 30 min before meals for optimal blood sugar control.', withFood: false },
  'Chromium': { bestTime: 'Morning', reason: 'Take with breakfast to help regulate blood sugar throughout the day.', withFood: true },
  'Alpha Lipoic Acid': { bestTime: 'Morning', reason: 'Best on empty stomach, 30 min before meals for nerve health.', withFood: false },
  'Cinnamon Extract': { bestTime: 'Before meals', reason: 'Take before meals to help post-meal glucose management.', withFood: true },
  'Turmeric': { bestTime: 'With meals', reason: 'Needs black pepper and fat for absorption. Take with lunch or dinner.', withFood: true },
  'Curcumin': { bestTime: 'With meals', reason: 'Fat-soluble, needs black pepper and fat for absorption.', withFood: true },
  'Melatonin': { bestTime: 'Night', reason: 'Take 30-60 minutes before desired sleep time.', withFood: false },
  'Ashwagandha': { bestTime: 'Evening', reason: 'Promotes relaxation. Best in evening for stress reduction and sleep.', withFood: true },
};

const CATS = [{ k: 'medication', l: '💊 Medication' }, { k: 'vitamin', l: '🧬 Vitamin' }, { k: 'supplement', l: '🌿 Supplement' }, { k: 'insulin', l: '💉 Insulin' }];
const FREQS = [{ k: 'once_daily', l: 'Once daily' }, { k: 'twice_daily', l: 'Twice daily' }, { k: 'three_times', l: '3x daily' }, { k: 'as_needed', l: 'As needed' }, { k: 'weekly', l: 'Weekly' }];
const TIMES = [{ k: 'morning', l: '🌅 Morning' }, { k: 'afternoon', l: '☀️ Afternoon' }, { k: 'evening', l: '🌆 Evening' }, { k: 'night', l: '🌙 Night' }];

const getAiRec = (name: string) => { const l = name.toLowerCase(); for (const [k, v] of Object.entries(VITAMIN_TIMING)) { if (l.includes(k.toLowerCase()) || k.toLowerCase().includes(l)) return v; } return null; };

export default function Medications() {
  const [meds, setMeds] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'day' | 'night'>('all');
  const [form, setForm] = useState({ name: '', dosage: '', frequency: 'once_daily', timeOfDay: ['morning'] as string[], category: 'medication', notes: '' });

  const load = useCallback(() => { setMeds(getMedications()); }, []);
  useEffect(() => { load(); }, [load]);

  const handleAdd = () => {
    if (!form.name) return;
    const ai = getAiRec(form.name);
    saveMedication({ id: Date.now().toString(), name: form.name, dosage: form.dosage, frequency: form.frequency, timeOfDay: form.timeOfDay, category: form.category, aiRecommendedTime: ai ? `${ai.bestTime} — ${ai.reason}${ai.withFood ? ' (Take with food)' : ' (Empty stomach)'}` : undefined, isActive: true, notes: form.notes });
    setShowAdd(false); setForm({ name: '', dosage: '', frequency: 'once_daily', timeOfDay: ['morning'], category: 'medication', notes: '' }); load();
  };

  const toggleTime = (t: string) => setForm({ ...form, timeOfDay: form.timeOfDay.includes(t) ? form.timeOfDay.filter(x => x !== t) : [...form.timeOfDay, t] });
  const active = meds.filter((m: any) => m.isActive);
  const morning = active.filter((m: any) => m.timeOfDay?.includes('morning'));
  const afternoon = active.filter((m: any) => m.timeOfDay?.includes('afternoon'));
  const evening = active.filter((m: any) => m.timeOfDay?.includes('evening'));
  const night = active.filter((m: any) => m.timeOfDay?.includes('night'));
  const inactive = meds.filter((m: any) => !m.isActive);

  const Section = ({ title, items }: { title: string; items: any[] }) => items.length > 0 && (
    <div className="mb-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-2">{items.map((m: any) => (
        <div key={m.id} className={`p-4 rounded-xl border ${m.isActive ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-lg shrink-0">{m.category === 'insulin' ? '💉' : m.category === 'vitamin' ? '🧬' : m.category === 'supplement' ? '🌿' : '💊'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><span className="font-semibold text-gray-800 text-sm">{m.name}</span>{m.dosage && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{m.dosage}</span>}{m.aiRecommendedTime && <span className="flex items-center gap-0.5 text-[10px] font-semibold text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded-full"><Sparkles size={10} />AI</span>}</div>
              <p className="text-xs text-gray-400 mt-0.5">{FREQS.find(f => f.k === m.frequency)?.l}</p>
              {m.aiRecommendedTime && <div className="mt-2 p-2.5 bg-sky-50 rounded-lg border border-sky-100"><p className="text-[11px] text-sky-700 leading-relaxed"><span className="font-semibold">✨ AI Tip:</span> {m.aiRecommendedTime}</p></div>}
              {m.notes && <p className="text-xs text-gray-400 mt-1 italic">{m.notes}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => { updateMedication(m.id, { isActive: !m.isActive }); load(); }} className={`p-1.5 rounded-lg ${m.isActive ? 'text-emerald-500' : 'text-gray-300'}`}><Check size={18} /></button>
              <button onClick={() => { deleteMedication(m.id); load(); }} className="p-1.5 text-gray-300 active:text-red-400"><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
      ))}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-sky-400 pt-12 pb-6 px-5 rounded-b-3xl shadow-lg shadow-sky-200/50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Pill size={20} className="text-white" /></div><div><h1 className="text-xl font-bold text-white tracking-tight">Medications</h1><p className="text-sky-100 text-sm font-medium">{active.length} active</p></div></div>
          <button onClick={() => setShowAdd(true)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Plus size={20} className="text-white" /></button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-5">
        <div className="flex gap-2 mb-5">
          {[{ k: 'all', l: 'All' }, { k: 'day', l: '☀️ Day' }, { k: 'night', l: '🌙 Night' }].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k as any)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold ${filter === f.k ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'bg-gray-100 text-gray-500'}`}>{f.l}</button>
          ))}
        </div>

        {meds.length > 0 ? <>
          <Section title="🌅 Morning" items={filter === 'night' ? [] : morning} />
          <Section title="☀️ Afternoon" items={filter === 'night' ? [] : afternoon} />
          <Section title="🌆 Evening" items={filter === 'day' ? [] : evening} />
          <Section title="🌙 Night" items={filter === 'day' ? [] : night} />
          <Section title="💤 Inactive" items={filter === 'all' ? inactive : []} />
        </> : (
          <div className="text-center py-12"><div className="text-5xl mb-3">💊</div><p className="text-gray-400 font-medium">No medications added</p><button onClick={() => setShowAdd(true)} className="mt-4 px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm">Add Medication</button></div>
        )}
      </div>

      {showAdd && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-in max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold text-gray-800">Add Medication</h2><button onClick={() => setShowAdd(false)} className="p-2 text-gray-400"><X size={22} /></button></div>
          <div className="space-y-4">
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Metformin, Vitamin D" className="w-full mt-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" autoFocus />
              {form.name && getAiRec(form.name) && <div className="mt-2 p-3 bg-sky-50 rounded-xl border border-sky-100"><p className="text-xs font-semibold text-sky-600 flex items-center gap-1 mb-1"><Sparkles size={12} />AI Recommendation</p><p className="text-xs text-sky-700">Best time: <strong>{getAiRec(form.name)!.bestTime}</strong></p><p className="text-[11px] text-sky-600 mt-0.5">{getAiRec(form.name)!.reason}</p><p className="text-[11px] text-sky-600 mt-0.5">{getAiRec(form.name)!.withFood ? '🍽️ Take with food' : '💧 Take on empty stomach'}</p></div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dosage</label><input type="text" value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} placeholder="500mg" className="w-full mt-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" /></div>
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequency</label><select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} className="w-full mt-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">{FREQS.map(f => <option key={f.k} value={f.k}>{f.l}</option>)}</select></div>
            </div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label><div className="grid grid-cols-4 gap-2 mt-1.5">{CATS.map(c => <button key={c.k} onClick={() => setForm({ ...form, category: c.k })} className={`py-2.5 rounded-xl text-[11px] font-semibold ${form.category === c.k ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'bg-gray-100 text-gray-500'}`}>{c.l}</button>)}</div></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time of Day</label><div className="grid grid-cols-4 gap-2 mt-1.5">{TIMES.map(t => <button key={t.k} onClick={() => toggleTime(t.k)} className={`py-2.5 rounded-xl text-[11px] font-semibold ${form.timeOfDay.includes(t.k) ? 'bg-sky-500 text-white shadow-md shadow-sky-200' : 'bg-gray-100 text-gray-500'}`}>{t.l}</button>)}</div></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</label><input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional..." className="w-full mt-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" /></div>
            <button onClick={handleAdd} disabled={!form.name} className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-base active:bg-sky-600 disabled:opacity-40 shadow-lg shadow-sky-200">Add Medication</button>
          </div>
        </div>
      </div>}
      <BottomNav />
    </div>
  );
}
