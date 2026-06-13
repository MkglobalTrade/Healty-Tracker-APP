'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pill, Plus, Trash2, X, Sun, Moon, Sparkles, Check, Edit3 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { getMedications, saveMedication, updateMedication, deleteMedication, getApiKey } from '@/lib/storage';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  category: 'medication' | 'vitamin' | 'supplement' | 'insulin';
  aiRecommendedTime?: string;
  isActive: boolean;
  notes?: string;
}

// AI Vitamin Timing Recommendations (built-in knowledge)
const VITAMIN_TIMING: Record<string, { bestTime: string; reason: string; withFood: boolean }> = {
  'Vitamin D': { bestTime: 'Morning', reason: 'Best absorbed with sunlight exposure and fatty meals. May disrupt sleep if taken at night.', withFood: true },
  'Vitamin B12': { bestTime: 'Morning', reason: 'Boosts energy and metabolism. Can interfere with sleep if taken in the evening.', withFood: false },
  'Vitamin C': { bestTime: 'Morning/Afternoon', reason: 'Can be taken anytime, but split doses improve absorption. Avoid near bedtime.', withFood: false },
  'Vitamin A': { bestTime: 'Morning', reason: 'Fat-soluble vitamin, take with a meal containing healthy fats.', withFood: true },
  'Vitamin E': { bestTime: 'Evening', reason: 'Fat-soluble, take with dinner. Also has antioxidant properties that work during sleep.', withFood: true },
  'Vitamin K': { bestTime: 'Evening', reason: 'Fat-soluble, best taken with a meal. Works synergistically with Vitamin D.', withFood: true },
  'Iron': { bestTime: 'Morning', reason: 'Best absorbed on empty stomach. Avoid taking with calcium or dairy.', withFood: false },
  'Calcium': { bestTime: 'Evening', reason: 'Better absorbed in smaller doses. Promotes better sleep. Separate from iron by 2+ hours.', withFood: true },
  'Magnesium': { bestTime: 'Evening', reason: 'Promotes muscle relaxation and better sleep quality. Best taken before bed.', withFood: true },
  'Zinc': { bestTime: 'Morning', reason: 'Best absorbed on empty stomach. Can cause nausea, so take with light food if needed.', withFood: false },
  'Omega-3': { bestTime: 'Morning', reason: 'Take with a fatty meal for optimal absorption. Can cause fishy aftertaste at night.', withFood: true },
  'Probiotics': { bestTime: 'Morning', reason: 'Best taken on empty stomach 30 min before breakfast for maximum survival through stomach acid.', withFood: false },
  'Fiber': { bestTime: 'Morning', reason: 'Take with plenty of water. Best before meals to aid digestion and blood sugar control.', withFood: true },
  'CoQ10': { bestTime: 'Morning', reason: 'Fat-soluble and energizing. Take with food. May cause insomnia if taken late.', withFood: true },
  'Folic Acid': { bestTime: 'Morning', reason: 'B vitamin that supports energy. Take on empty stomach for best absorption.', withFood: false },
  'Biotin': { bestTime: 'Morning', reason: 'Water-soluble B vitamin. Take anytime but morning is best for consistency.', withFood: false },
  'Metformin': { bestTime: 'With meals', reason: 'Take with meals to reduce GI side effects. Evening dose helps with dawn phenomenon.', withFood: true },
  'Berberine': { bestTime: 'Before meals', reason: 'Take 30 minutes before meals for optimal blood sugar control effect.', withFood: false },
  'Chromium': { bestTime: 'Morning', reason: 'Take with breakfast to help regulate blood sugar throughout the day.', withFood: true },
  'Alpha Lipoic Acid': { bestTime: 'Morning', reason: 'Best absorbed on empty stomach. Take 30 min before meals for nerve health benefits.', withFood: false },
  'Cinnamon Extract': { bestTime: 'Before meals', reason: 'Take before meals to help with post-meal glucose management.', withFood: true },
  'Turmeric/Curcumin': { bestTime: 'With meals', reason: 'Fat-soluble, needs black pepper and fat for absorption. Take with lunch or dinner.', withFood: true },
  'Melatonin': { bestTime: 'Night', reason: 'Take 30-60 minutes before desired sleep time.', withFood: false },
  'Ashwagandha': { bestTime: 'Evening', reason: 'Adaptogen that promotes relaxation. Best taken in the evening for stress reduction and sleep support.', withFood: true },
};

const CATEGORIES = [
  { key: 'medication', label: 'Medication', emoji: '💊' },
  { key: 'vitamin', label: 'Vitamin', emoji: '🧬' },
  { key: 'supplement', label: 'Supplement', emoji: '🌿' },
  { key: 'insulin', label: 'Insulin', emoji: '💉' },
];

const FREQUENCIES = [
  { key: 'once_daily', label: 'Once daily' },
  { key: 'twice_daily', label: 'Twice daily' },
  { key: 'three_times', label: '3x daily' },
  { key: 'as_needed', label: 'As needed' },
  { key: 'weekly', label: 'Weekly' },
];

const TIMES_OF_DAY = [
  { key: 'morning', label: 'Morning', emoji: '🌅' },
  { key: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { key: 'evening', label: 'Evening', emoji: '🌆' },
  { key: 'night', label: 'Night', emoji: '🌙' },
];

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'day' | 'night'>('all');
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: 'once_daily',
    timeOfDay: ['morning'] as string[],
    category: 'medication' as string,
    notes: '',
  });

  const loadData = useCallback(() => {
    const all = getMedications();
    setMedications(all);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getAiRecommendation = (name: string): { bestTime: string; reason: string; withFood: boolean } | null => {
    const lower = name.toLowerCase();
    for (const [key, value] of Object.entries(VITAMIN_TIMING)) {
      if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
        return value;
      }
    }
    return null;
  };

  const handleAdd = () => {
    if (!newMed.name) return;
    const aiRec = getAiRecommendation(newMed.name);
    const med: Medication = {
      id: Date.now().toString(),
      name: newMed.name,
      dosage: newMed.dosage,
      frequency: newMed.frequency,
      timeOfDay: newMed.timeOfDay,
      category: newMed.category as Medication['category'],
      aiRecommendedTime: aiRec ? `${aiRec.bestTime} — ${aiRec.reason}${aiRec.withFood ? ' (Take with food)' : ' (Take on empty stomach)'}` : undefined,
      isActive: true,
      notes: newMed.notes,
    };

    saveMedication(med);
    setShowAdd(false);
    setNewMed({
      name: '',
      dosage: '',
      frequency: 'once_daily',
      timeOfDay: ['morning'],
      category: 'medication',
      notes: '',
    });
    loadData();
  };

  const handleToggleActive = (id: string) => {
    const med = medications.find((m) => m.id === id);
    if (med) {
      updateMedication(id, { isActive: !med.isActive });
      loadData();
    }
  };

  const handleDelete = (id: string) => {
    deleteMedication(id);
    loadData();
  };

  const toggleTimeOfDay = (time: string) => {
    if (newMed.timeOfDay.includes(time)) {
      setNewMed({ ...newMed, timeOfDay: newMed.timeOfDay.filter((t) => t !== time) });
    } else {
      setNewMed({ ...newMed, timeOfDay: [...newMed.timeOfDay, time] });
    }
  };

  const filteredMeds = medications.filter((med) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'day') return med.timeOfDay.some((t) => ['morning', 'afternoon'].includes(t));
    return med.timeOfDay.some((t) => ['evening', 'night'].includes(t));
  });

  const activeMeds = medications.filter((m) => m.isActive);
  const morningMeds = medications.filter((m) => m.isActive && m.timeOfDay.includes('morning'));
  const afternoonMeds = medications.filter((m) => m.isActive && m.timeOfDay.includes('afternoon'));
  const eveningMeds = medications.filter((m) => m.isActive && m.timeOfDay.includes('evening'));
  const nightMeds = medications.filter((m) => m.isActive && m.timeOfDay.includes('night'));

  const MedSection = ({ title, emoji, meds: sectionMeds }: { title: string; emoji: string; meds: Medication[] }) => {
    if (sectionMeds.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span>{emoji}</span> {title}
        </h3>
        <div className="space-y-2">
          {sectionMeds.map((med) => {
            const cat = CATEGORIES.find((c) => c.key === med.category);
            const aiRec = med.aiRecommendedTime;
            return (
              <div
                key={med.id}
                className={`p-4 rounded-xl border transition-all ${
                  med.isActive
                    ? 'bg-white border-gray-100 shadow-sm'
                    : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-lg shrink-0">
                    {cat?.emoji || '💊'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{med.name}</span>
                      {med.dosage && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {med.dosage}
                        </span>
                      )}
                      {aiRec && (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded-full">
                          <Sparkles size={10} />
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {FREQUENCIES.find((f) => f.key === med.frequency)?.label}
                    </p>
                    {aiRec && (
                      <div className="mt-2 p-2.5 bg-sky-50 rounded-lg border border-sky-100">
                        <p className="text-[11px] text-sky-700 leading-relaxed">
                          <span className="font-semibold">✨ AI Tip:</span> {aiRec}
                        </p>
                      </div>
                    )}
                    {med.notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">{med.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleToggleActive(med.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        med.isActive ? 'text-emerald-500' : 'text-gray-300'
                      }`}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="p-1.5 text-gray-300 active:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <PageHeader
        title="Medications"
        subtitle={`${activeMeds.length} active · ${medications.length} total`}
        icon={<Pill size={20} className="text-white" />}
        rightAction={
          <button
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm active:bg-white/30 transition-colors"
          >
            <Plus size={20} className="text-white" />
          </button>
        }
      />

      <div className="max-w-lg mx-auto px-5 mt-5">
        {medications.length > 0 ? (
          <>
            {/* Day/Night Filter */}
            <div className="flex gap-2 mb-5">
              {[
                { key: 'all', label: 'All', icon: null },
                { key: 'day', label: '☀️ Daytime', icon: <Sun size={14} /> },
                { key: 'night', label: '🌙 Night', icon: <Moon size={14} /> },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeFilter === f.key
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Medication Sections */}
            {activeFilter === 'all' ? (
              <>
                <MedSection title="Morning" emoji="🌅" meds={morningMeds} />
                <MedSection title="Afternoon" emoji="☀️" meds={afternoonMeds} />
                <MedSection title="Evening" emoji="🌆" meds={eveningMeds} />
                <MedSection title="Night" emoji="🌙" meds={nightMeds} />
                {medications.filter((m) => !m.isActive).length > 0 && (
                  <MedSection title="Inactive" emoji="💤" meds={medications.filter((m) => !m.isActive)} />
                )}
              </>
            ) : (
              <MedSection
                title={activeFilter === 'day' ? 'Daytime Meds' : 'Nighttime Meds'}
                emoji={activeFilter === 'day' ? '☀️' : '🌙'}
                meds={filteredMeds}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">💊</div>
            <p className="text-gray-400 font-medium">No medications added</p>
            <p className="text-gray-300 text-sm mt-1">Add your medications and supplements</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm active:bg-sky-600 transition-colors"
            >
              Add Medication
            </button>
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-transition max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Add Medication</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 text-gray-400">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="e.g., Metformin, Vitamin D, Magnesium"
                  className="w-full mt-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  autoFocus
                />
                {/* AI Preview */}
                {newMed.name && getAiRecommendation(newMed.name) && (
                  <div className="mt-2 p-3 bg-sky-50 rounded-xl border border-sky-100">
                    <p className="text-xs font-semibold text-sky-600 flex items-center gap-1 mb-1">
                      <Sparkles size={12} /> AI Recommendation
                    </p>
                    <p className="text-xs text-sky-700">
                      Best time: <strong>{getAiRecommendation(newMed.name)!.bestTime}</strong>
                    </p>
                    <p className="text-[11px] text-sky-600 mt-0.5">
                      {getAiRecommendation(newMed.name)!.reason}
                    </p>
                    <p className="text-[11px] text-sky-600 mt-0.5">
                      {getAiRecommendation(newMed.name)!.withFood ? '🍽️ Take with food' : '💧 Take on empty stomach'}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dosage</label>
                  <input
                    type="text"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    placeholder="e.g., 500mg, 1 tablet"
                    className="w-full mt-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequency</label>
                  <select
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    className="w-full mt-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setNewMed({ ...newMed, category: cat.key })}
                      className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        newMed.category === cat.key
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time of Day</label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {TIMES_OF_DAY.map((time) => (
                    <button
                      key={time.key}
                      onClick={() => toggleTimeOfDay(time.key)}
                      className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        newMed.timeOfDay.includes(time.key)
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {time.emoji} {time.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes (optional)</label>
                <input
                  type="text"
                  value={newMed.notes}
                  onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full mt-1.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!newMed.name}
                className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-base active:bg-sky-600 transition-colors disabled:opacity-40 shadow-lg shadow-sky-200"
              >
                Add Medication
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
