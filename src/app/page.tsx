'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  Droplets, HeartPulse, Pill, FileText,
  ArrowRight, Sparkles, Plus, Upload,
} from 'lucide-react'
import { useHealthData } from '@/hooks/useHealthData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/StatsCard'
import { SugarChart, BPChart } from '@/components/HealthChart'
import { QuickActions } from '@/components/QuickActions'
import { PersonalBanner } from '@/components/PersonalBanner'
import { getSugarStatus, getBPStatus, getCategoryById } from '@/lib/health-categories'
import Link from 'next/link'

export default function HomePage() {
  const {
    sugarReadings,
    bpReadings,
    labResults,
    getSugarStats,
    getBPStats,
    getTodayMedications,
  } = useHealthData()

  const sugarStats = getSugarStats(7)
  const todayMeds = getTodayMedications()
  const latestSugar = sugarReadings[0]
  const latestBP = bpReadings[0]

  const sugarChartData = useMemo(() =>
    sugarReadings.slice(0, 14).map(r => ({
      date: r.date,
      value: r.value,
      unit: r.unit,
    })),
    [sugarReadings]
  )

  const bpChartData = useMemo(() =>
    bpReadings.slice(0, 14).map(r => ({
      date: r.date,
      systolic: r.systolic,
      diastolic: r.diastolic,
    })),
    [bpReadings]
  )

  const recentLabs = labResults.slice(0, 3)
  const pendingMeds = todayMeds.filter(m => !m.morningTaken || !m.eveningTaken)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Personal Banner */}
      <PersonalBanner />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Latest Glucose"
          value={latestSugar ? `${latestSugar.value}` : '--'}
          subtitle={latestSugar ? `${latestSugar.unit} — ${getSugarStatus(latestSugar.value, latestSugar.unit).status}` : 'No data'}
          icon={<Droplets className="w-5 h-5" style={{ color: latestSugar ? getSugarStatus(latestSugar.value, latestSugar.unit).color : '#6b7280' }} />}
          color={latestSugar ? getSugarStatus(latestSugar.value, latestSugar.unit).color : '#6b7280'}
          trend={sugarStats ? { value: Math.round((sugarStats.avg - (sugarReadings[6]?.value || sugarStats.avg)) / sugarStats.avg * 100), label: 'vs last week' } : undefined}
        />
        <StatsCard
          title="Latest BP"
          value={latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
          subtitle={latestBP ? getBPStatus(latestBP.systolic, latestBP.diastolic).status : 'No data'}
          icon={<HeartPulse className="w-5 h-5" style={{ color: latestBP ? getBPStatus(latestBP.systolic, latestBP.diastolic).color : '#6b7280' }} />}
          color={latestBP ? getBPStatus(latestBP.systolic, latestBP.diastolic).color : '#6b7280'}
        />
        <StatsCard
          title="Pending Meds"
          value={pendingMeds.length}
          subtitle={pendingMeds.length === 0 ? 'All caught up!' : `${pendingMeds.length} remaining`}
          icon={<Pill className="w-5 h-5 text-purple-500" />}
          color="#8b5cf6"
        />
        <StatsCard
          title="Lab Reports"
          value={labResults.length}
          subtitle={`${recentLabs.length} recent`}
          icon={<FileText className="w-5 h-5 text-blue-500" />}
          color="#3b82f6"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts Section */}
      {(sugarChartData.length > 0 || bpChartData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sugarChartData.length > 0 && <SugarChart data={sugarChartData} />}
          {bpChartData.length > 0 && <BPChart data={bpChartData} />}
        </div>
      )}

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medications Today */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-500" />
              Today&apos;s Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayMeds.length === 0 ? (
              <div className="text-center py-6">
                <Pill className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No medications for today</p>
                <Link href="/medications/">
                  <Button variant="outline" size="sm" className="mt-3 gap-1">
                    <Plus className="w-3 h-3" /> Add Medication
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {todayMeds.map(med => (
                  <div key={med.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${med.morningTaken && med.eveningTaken ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm font-medium">{med.name}</span>
                      <span className="text-xs text-muted-foreground">{med.dosage}</span>
                    </div>
                    <div className="flex gap-1">
                      {(med.frequency === 'morning' || med.frequency === 'both') && (
                        <Badge variant={med.morningTaken ? 'success' : 'secondary'} className="text-[10px]">
                          {med.morningTaken ? '✓ AM' : 'AM'}
                        </Badge>
                      )}
                      {(med.frequency === 'evening' || med.frequency === 'both') && (
                        <Badge variant={med.eveningTaken ? 'success' : 'secondary'} className="text-[10px]">
                          {med.eveningTaken ? '✓ PM' : 'PM'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {pendingMeds.length > 0 && (
                  <Link href="/medications/">
                    <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                      Take medications <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Labs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Recent Lab Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLabs.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No lab reports yet</p>
                <Link href="/upload/">
                  <Button variant="outline" size="sm" className="mt-3 gap-1">
                    <Upload className="w-3 h-3" /> Upload Report
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLabs.map(lab => {
                  const cat = getCategoryById(lab.category)
                  return (
                    <div key={lab.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:shadow-sm transition-all">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '15' }}>
                        <FileText className="w-4 h-4" style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lab.title}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(lab.date), 'MMM d, yyyy')}</p>
                      </div>
                      <Badge style={{ backgroundColor: cat.color, color: '#fff' }} className="text-[10px]">
                        {cat.label}
                      </Badge>
                    </div>
                  )
                })}
                <Link href="/upload/">
                  <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                    View all reports <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dr. AI Teaser */}
      <Card className="bg-gradient-to-r from-primary/5 to-sky-400/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Ask Dr. AI</h3>
                <p className="text-sm text-muted-foreground">Get personalized health insights based on your data</p>
              </div>
            </div>
            <Link href="/dr-ai/">
              <Button className="gap-2 bg-gradient-to-r from-primary to-sky-400 hover:opacity-90">
                Chat Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
