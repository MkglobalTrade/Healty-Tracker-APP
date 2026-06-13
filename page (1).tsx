'use client';

import { useEffect, useState, useCallback } from 'react';
import { Activity, Plus, Trash2, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import {
  getGlucoseReadings,
  saveGlucoseReading,
  deleteGlucoseReading,
  calculateHbA1c,
} from '@/lib/storage';

type ViewPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export default function TrackerPage() {
  const [readings, setReadings] = useState<any[]>([]);
  const [period, setPeriod] = useState<ViewPeriod>('daily');
  const [showAdd, setShowAdd] = useState(false);
  const [newReading, setNewReading] = useState({
    value: '',
    mealContext: 'fasting' as string,
    notes: '',
  });

  const loadData = useCallback(() => {
    const allReadings = getGlucoseReadings();
    setReadings(allReadings.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getFilteredReadings = useCallback(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarterly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }

    return readings.filter((r: any) => new Date(r.timestamp) >= startDate);
  }, [readings, period]);

  const getChartData = useCallback(() => {
    const filtered = getFilteredReadings();
    return filtered
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((r: any) => ({
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        value: r.value,
        context: r.mealContext,
      }));
  }, [getFilteredReadings]);

  const getStats = useCallback(() => {
    const filtered = getFilteredReadings();
    if (filtered.length === 0) return null;
    const values = filtered.map((r: any) => r.value);
    const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    return {
      average: Math.round(avg),
      min: Math.min(...values),
      max: Math.max(...values),
      hbA1c: calculateHbA1c(avg),
      count: filtered.length,
    };
  }, [getFilteredReadings]);

  const handleAdd = () => {
    if (!newReading.value) return;
    const reading = {
      id: Date.now().toString(),
      value: Number(newReading.value),
      timestamp: new Date().toISOString(),
      mealContext: newReading.mealContext,
      notes: newReading.notes,
    };
    saveGlucoseReading(reading);
    setShowAdd(false);
    setNewReading({ value: '', mealContext: 'fasting', notes: '' });
    loadData();
  };

  const handleDelete = (id: string) => {
    deleteGlucoseReading(id);
    loadData();
  };

  const stats = getStats();
  const chartData = getChartData();
  const filteredReadings = getFilteredReadings();

  const periods: { key: ViewPeriod; label: string }[] = [
    { key: 'daily', label: 'Day' },
    { key: 'weekly', label: 'Week' },
    { key: 'monthly', label: 'Month' },
    { key: 'quarterly', label: 'Quarter' },
    { key: 'yearly', label: 'Year' },
  ];

  const mealIcons: Record<string, string> = {
    fasting: '🌅',
    before_meal: '🍽️',
    after_meal: '🥗',
    bedtime: '🌙',
    other: '📝',
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <PageHeader
        title="Glucose Tracker"
        subtitle="Monitor your blood sugar levels"
        icon={<Activity size={20} className="text-white" />}
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
        {/* Period Selector */}
        <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1 mb-5">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                period === p.key
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <StatCard
              label={`${period === 'daily' ? 'Daily' : period.charAt(0).toUpperCase() + period.slice(1)} Avg`}
              value={stats.average}
              unit="mg/dL"
              icon={<Activity size={16} />}
              color={stats.average <= 140 ? 'green' : stats.average <= 180 ? 'yellow' : 'red'}
            />
            <StatCard
              label="Est. HbA1c"
              value={stats.hbA1c}
              unit="%"
              icon={<TrendingUp size={16} />}
              color={stats.hbA1c <= 6.5 ? 'green' : stats.hbA1c <= 7.5 ? 'yellow' : 'red'}
            />
            <StatCard label="Low" value={stats.min} unit="mg/dL" icon={<TrendingDown size={16} />} color="blue" />
            <StatCard label="High" value={stats.max} unit="mg/dL" icon={<TrendingUp size={16} />} color={stats.max > 180 ? 'red' : 'blue'} />
          </div>
        )}

        {!stats && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📊</div>
            <p className="text-gray-400 font-medium">No readings for this period</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm active:bg-sky-600 transition-colors"
            >
              Add First Reading
            </button>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Glucose Trend
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey={period === 'daily' ? 'time' : 'date'}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[40, 300]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.96)',
                      border: '1px solid #e0f2fe',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} label={{ value: 'High', fontSize: 9, fill: '#ef4444' }} />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} label={{ value: 'Low', fontSize: 9, fill: '#ef4444', position: 'insideBottomLeft' }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fill="url(#glucoseGradient)"
                    dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* HbA1c Visual */}
        {stats && (
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 mb-5 border border-sky-100">
            <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-4">
              Estimated HbA1c Level
            </h3>
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#e0f2fe"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke={stats.hbA1c <= 6.5 ? '#22c55e' : stats.hbA1c <= 7.5 ? '#eab308' : '#ef4444'}
                    strokeWidth="10"
                    strokeDasharray={`${Math.min((stats.hbA1c / 14) * 251.2, 251.2)} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">{stats.hbA1c}</span>
                  <span className="text-[9px] text-gray-400 font-semibold">%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs text-gray-600">Normal: ≤ 6.5%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-xs text-gray-600">At Risk: 6.5–7.5%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="text-xs text-gray-600">High: &gt; 7.5%</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  *Estimate based on average glucose readings
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Readings List */}
        {filteredReadings.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Recent Readings ({filteredReadings.length})
            </h3>
            <div className="space-y-2">
              {filteredReadings.slice(0, 20).map((reading: any) => (
                <div
                  key={reading.id}
                  className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">
                    {mealIcons[reading.mealContext] || '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-gray-800">{reading.value}</span>
                      <span className="text-xs text-gray-400">mg/dL</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          reading.value < 70
                            ? 'bg-red-100 text-red-600'
                            : reading.value <= 140
                            ? 'bg-emerald-100 text-emerald-600'
                            : reading.value <= 180
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {reading.value < 70
                          ? 'Low'
                          : reading.value <= 140
                          ? 'Normal'
                          : reading.value <= 180
                          ? 'Elevated'
                          : 'High'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(reading.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {reading.mealContext.replace('_', ' ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(reading.id)}
                    className="p-2 text-gray-300 active:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Reading Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 page-transition">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Log Glucose Reading</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 text-gray-400 active:text-gray-600">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Blood Glucose (mg/dL)</label>
                <input
                  type="number"
                  value={newReading.value}
                  onChange={(e) => setNewReading({ ...newReading, value: e.target.value })}
                  placeholder="e.g., 120"
                  className="w-full mt-2 p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">When</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { key: 'fasting', label: '🌅 Fasting', emoji: '🌅' },
                    { key: 'before_meal', label: '🍽️ Before', emoji: '🍽️' },
                    { key: 'after_meal', label: '🥗 After', emoji: '🥗' },
                    { key: 'bedtime', label: '🌙 Bedtime', emoji: '🌙' },
                    { key: 'other', label: '📝 Other', emoji: '📝' },
                  ].map((ctx) => (
                    <button
                      key={ctx.key}
                      onClick={() => setNewReading({ ...newReading, mealContext: ctx.key })}
                      className={`py-3 rounded-xl text-xs font-semibold transition-all ${
                        newReading.mealContext === ctx.key
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {ctx.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes (optional)</label>
                <input
                  type="text"
                  value={newReading.notes}
                  onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="w-full mt-2 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!newReading.value}
                className="w-full py-4 bg-sky-500 text-white rounded-xl font-bold text-base active:bg-sky-600 transition-colors disabled:opacity-40 disabled:active:bg-sky-500 shadow-lg shadow-sky-200"
              >
                Save Reading
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
