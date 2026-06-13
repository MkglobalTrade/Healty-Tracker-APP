'use client';

import { useEffect, useState, useCallback } from 'react';
import { FlaskConical, Plus, Trash2, X, Upload, Camera, FileText } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { getLabResults, saveLabResult, deleteLabResult } from '@/lib/storage';

interface LabResult {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  status: 'normal' | 'borderline' | 'high' | 'low' | 'critical';
  date: string;
  source: 'manual' | 'photo' | 'pdf';
  notes?: string;
}

const COMMON_LABS = [
  { name: 'Glucose', unit: 'mg/dL', min: 70, max: 100 },
  { name: 'HbA1c', unit: '%', min: 4.0, max: 5.6 },
  { name: 'Total Cholesterol', unit: 'mg/dL', min: 0, max: 200 },
  { name: 'LDL Cholesterol', unit: 'mg/dL', min: 0, max: 100 },
  { name: 'HDL Cholesterol', unit: 'mg/dL', min: 40, max: 60 },
  { name: 'Triglycerides', unit: 'mg/dL', min: 0, max: 150 },
  { name: 'Creatinine', unit: 'mg/dL', min: 0.6, max: 1.2 },
  { name: 'BUN', unit: 'mg/dL', min: 7, max: 20 },
  { name: 'eGFR', unit: 'mL/min', min: 60, max: 120 },
  { name: 'ALT', unit: 'U/L', min: 7, max: 56 },
  { name: 'AST', unit: 'U/L', min: 10, max: 40 },
  { name: 'TSH', unit: 'mIU/L', min: 0.4, max: 4.0 },
  { name: 'Vitamin D', unit: 'ng/mL', min: 30, max: 100 },
  { name: 'B12', unit: 'pg/mL', min: 200, max: 900 },
  { name: 'Sodium', unit: 'mEq/L', min: 136, max: 145 },
  { name: 'Potassium', unit: 'mEq/L', min: 3.5, max: 5.0 },
  { name: 'Hemoglobin', unit: 'g/dL', min: 13.5, max: 17.5 },
  { name: 'WBC', unit: 'x10³/µL', min: 4.5, max: 11.0 },
  { name: 'Platelets', unit: 'x10³/µL', min: 150, max: 400 },
  { name: 'Uric Acid', unit: 'mg/dL', min: 3.5, max: 7.2 },
];

function getStatus(value: number, min: number, max: number): LabResult['status'] {
  const range = max - min;
  const lowerBorderline = min - range * 0.1;
  const upperBorderline = max + range * 0.1;

  if (value < min * 0.7 || value > max * 1.3) return 'critical';
  if (value < lowerBorderline) return 'low';
  if (value > upperBorderline) return 'high';
  if (value < min || value > max) return 'borderline';
  return 'normal';
}

const statusConfig = {
  normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Normal', icon: '✅' },
  borderline: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Borderline', icon: '⚠️' },
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'High', icon: '🔴' },
  low: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Low', icon: '🔴' },
  critical: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300', label: 'Critical', icon: '🚨' },
};

export default function LabsPage() {
  const [results, setResults] = useState<LabResult[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLab, setSelectedLab] = useState<typeof COMMON_LABS[0] | null>(null);
  const [newResult, setNewResult] = useState({
    name: '',
    value: '',
    referenceMin: '',
    referenceMax: '',
    unit: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    source: 'manual' as 'manual' | 'photo' | 'pdf',
  });
  const [searchLab, setSearchLab] = useState('');

  const loadData = useCallback(() => {
    const all = getLabResults();
    setResults(all.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectLab = (lab: typeof COMMON_LABS[0]) => {
    setSelectedLab(lab);
    setNewResult({
      ...newResult,
      name: lab.name,
      unit: lab.unit,
      referenceMin: lab.min.toString(),
      referenceMax: lab.max.toString(),
    });
  };

  const handleAdd = () => {
    if (!newResult.name || !newResult.value) return;
    const value = Number(newResult.value);
    const min = Number(newResult.referenceMin);
    const max = Number(newResult.referenceMax);

    const result: LabResult = {
      id: Date.now().toString(),
      name: newResult.name,
      value,
      unit: newResult.unit,
      referenceMin: min,
      referenceMax: max,
      status: getStatus(value, min, max),
      date: newResult.date,
      source: newResult.source,
      notes: newResult.notes,
    };

    saveLabResult(result);
    setShowAdd(false);
    setSelectedLab(null);
    setNewResult({
      name: '',
      value: '',
      referenceMin: '',
      referenceMax: '',
      unit: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      source: 'manual',
    });
    loadData();
  };

  const handleDelete = (id: string) => {
    deleteLabResult(id);
    loadData();
  };

  const filteredLabs = COMMON_LABS.filter((lab) =>
    lab.name.toLowerCase().includes(searchLab.toLowerCase())
  );

  // Group results by date
  const groupedResults = results.reduce((acc: any, result: LabResult) => {
    if (!acc[result.date]) acc[result.date] = [];
    acc[result.date].push(result);
    return acc;
  }, {});

  // Summary counts
  const normalCount = results.filter((r) => r.status === 'normal').length;
  const borderlineCount = results.filter((r) => r.status === 'borderline').length;
  const highCount = results.filter((r) => ['high', 'low', 'critical'].includes(r.status)).length;

  return (
    <div className="min-h-screen bg-white pb-24">
      <PageHeader
        title="Lab Results"
        subtitle="Track and analyze your lab work"
        icon={<FlaskConical size={20} className="text-white" />}
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
        {/* Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
              <p className="text-2xl font-bold text-emerald-600">{normalCount}</p>
              <p className="text-[10px] font-semibold text-emerald-500 uppercase">Normal</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
              <p className="text-2xl font-bold text-amber-600">{borderlineCount}</p>
              <p className="text-[10px] font-semibold text-amber-500 uppercase">Borderline</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 border border-red-100 text-center">
              <p className="text-2xl font-bold text-red-600">{highCount}</p>
              <p className="text-[10px] font-semibold text-red-500 uppercase">Attention</p>
            </div>
          </div>
        )}

        {/* Results by Date */}
        {Object.keys(groupedResults).length > 0 ? (
          Object.entries(groupedResults).map(([date, labs]: [string, any]) => (
            <div key={date} className="mb-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {new Date(date + 'T12:00:00').toLocaleDateString([], {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <div className="space-y-2">
                {labs.map((result: LabResult) => {
                  const sc = statusConfig[result.status];
                  return (
                    <div
                      key={result.id}
                      className={`p-4 rounded-xl border ${sc.bg} ${sc.border} card-hover`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{sc.icon}</span>
                            <span className="font-semibold text-gray-800 text-sm">{result.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                              {sc.label}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="text-xl font-bold text-gray-800">{result.value}</span>
                            <span className="text-xs text-gray-400">{result.unit}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                            Reference: {result.referenceMin}–{result.referenceMax} {result.unit}
                          </p>
                          {result.notes && (
                            <p className="text-xs text-gray-500 mt-1 italic">{result.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(result.id)}
                          className="p-1.5 text-gray-300 active:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Visual bar indicator */}
                      <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            result.status === 'normal'
                              ? 'bg-emerald-400'
                              : result.status === 'borderline'
                              ? 'bg-amber-400'
                              : 'bg-red-400'
                          }`}
                          style={{
                            width: `${Math.min(
                              ((result.value - result.referenceMin) / (result.referenceMax - result.referenceMin)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔬</div>
            <p className="text-gray-400 font-medium">No lab results yet</p>
            <p className="text-gray-300 text-sm mt-1">Add your first result to start tracking</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm active:bg-sky-600 transition-colors"
            >
              Add Lab Result
            </button>
          </div>
        )}
      </div>

      {/* Add Lab Result Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-transition max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Add Lab Result</h2>
              <button onClick={() => { setShowAdd(false); setSelectedLab(null); }} className="p-2 text-gray-400">
                <X size={22} />
              </button>
            </div>

            {/* Source Selection */}
            <div className="flex gap-2 mb-5">
              {[
                { key: 'manual', label: 'Manual', icon: <FileText size={16} /> },
                { key: 'photo', label: 'Photo', icon: <Camera size={16} /> },
                { key: 'pdf', label: 'PDF', icon: <Upload size={16} /> },
              ].map((src) => (
                <button
                  key={src.key}
                  onClick={() => setNewResult({ ...newResult, source: src.key as any })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all ${
                    newResult.source === src.key
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {src.icon}
                  {src.label}
                </button>
              ))}
            </div>

            {/* Lab Search */}
            {!selectedLab && (
              <div className="mb-4">
                <input
                  type="text"
                  value={searchLab}
                  onChange={(e) => setSearchLab(e.target.value)}
                  placeholder="Search lab test..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                  {filteredLabs.map((lab) => (
                    <button
                      key={lab.name}
                      onClick={() => handleSelectLab(lab)}
                      className="w-full text-left p-3 bg-gray-50 rounded-xl text-sm hover:bg-sky-50 active:bg-sky-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">{lab.name}</span>
                      <span className="text-xs text-gray-400 ml-2">({lab.min}–{lab.max} {lab.unit})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedLab && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-sky-50 rounded-xl">
                  <span className="font-semibold text-sky-800 text-sm">{selectedLab.name}</span>
                  <button
                    onClick={() => {
                      setSelectedLab(null);
                      setNewResult({ ...newResult, name: '', unit: '', referenceMin: '', referenceMax: '' });
                    }}
                    className="text-xs text-sky-500 font-semibold"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Result Value</label>
                  <input
                    type="number"
                    value={newResult.value}
                    onChange={(e) => setNewResult({ ...newResult, value: e.target.value })}
                    placeholder="Enter value"
                    className="w-full mt-1.5 p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref Min</label>
                    <input
                      type="number"
                      value={newResult.referenceMin}
                      onChange={(e) => setNewResult({ ...newResult, referenceMin: e.target.value })}
                      className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref Max</label>
                    <input
                      type="number"
                      value={newResult.referenceMax}
                      onChange={(e) => setNewResult({ ...newResult, referenceMax: e.target.value })}
                      className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={newResult.date}
                    onChange={(e) => setNewResult({ ...newResult, date: e.target.value })}
                    className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes (optional)</label>
                  <input
                    type="text"
                    value={newResult.notes}
                    onChange={(e) => setNewResult({ ...newResult, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                <button
                  onClick={handleAdd}
                  disabled={!newResult.value || !newResult.name}
                  className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-base active:bg-sky-600 transition-colors disabled:opacity-40 shadow-lg shadow-sky-200"
                >
                  Save Lab Result
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
