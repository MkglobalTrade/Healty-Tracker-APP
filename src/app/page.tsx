'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Droplets, HeartPulse, Pill, FileText, TrendingUp, Activity, Calendar, ArrowRight } from 'lucide-react'
import { useHealthData } from '@/hooks/useHealthData'
import { StatsCard } from '@/components/StatsCard'
import { QuickActions } from '@/components/QuickActions'
import { SugarChart, BPChart } from '@/components/HealthChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSugarStatus, getBPStatus, getCategoryById } from '@/lib/health-categories'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const {
    sugarReadings,
    bpReadings,
    labResults,
    medications,
    getSugarStats,
    getBPStats,
    getTodaySugar,
    getTodayBP,
    getTodayMedications,
    getLabsByCategory,
  } = useHealthData()

  const sugarStats = getSugarStats(7)
  const bpStats = getBPStats(7)
  const todaySugar = getTodaySugar()
  const todayBP = getTodayBP()
  const todayMeds = getTodayMedications()
  const labsByCategory = getLabsByCategory()

  const latestSugar = sugarReadings[0]
  const latestBP = bpReadings[0]

  const sugarChartData = useMemo(() => {
    return sugarReadings.slice(0, 14).map(r => ({
      date: r.date,
      value: r.value,
      unit: r.unit,
    }))
  }, [sugarReadings])

  const bpChartData = useMemo(() => {
    return bpReadings.slice(0, 14).map(r => ({
      date: r.date,
      systolic: r.systolic,
      diastolic: r.diastolic,
    }))
  }, [bpReadings])

  const activeMedsCount = medications.filter(m => m.active).length
  const pendingMeds = todayMeds.filter(m => !m.morningTaken || !m.eveningTaken).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>
        <Button onClick={() => router.push('/dr-ai')} className="gap-2">
          <Activity className="w-4 h-4" />
          Ask Dr. AI
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Latest Glucose"
          value={latestSugar ? `${latestSugar.value} ${latestSugar.unit}` : 'No data'}
          subtitle={latestSugar ? getSugarStatus(latestSugar.value, latestSugar.unit).status : 'Add a reading'}
          icon={<Droplets className="w-5 h-5" style={{ color: latestSugar ? getSugarStatus(latestSugar.value, latestSugar.unit).color : '#6b7280' }} />}
          color={latestSugar ? getSugarStatus(latestSugar.value, latestSugar.unit).color : '#6b7280'}
          onClick={() => router.push('/upload')}
        />
        <StatsCard
          title="Blood Pressure"
          value={latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : 'No data'}
          subtitle={latestBP ? getBPStatus(latestBP.systolic, latestBP.diastolic).status : 'Add a reading'}
          icon={<HeartPulse className="w-5 h-5" style={{ color: latestBP ? getBPStatus(latestBP.systolic, latestBP.diastolic).color : '#6b7280' }} />}
          color={latestBP ? getBPStatus(latestBP.systolic, latestBP.diastolic).color : '#6b7280'}
          onClick={() => router.push('/blood-pressure')}
        />
        <StatsCard
          title="Medications"
          value={`${activeMedsCount} Active`}
          subtitle={pendingMeds > 0 ? `${pendingMeds} pending today` : 'All caught up!'}
          icon={<Pill className="w-5 h-5 text-purple-500" />}
          color="#8b5cf6"
          onClick={() => router.push('/medications')}
        />
        <StatsCard
          title="Lab Reports"
          value={labResults.length}
          subtitle={`${Object.keys(labsByCategory).length} categories`}
          icon={<FileText className="w-5 h-5 text-blue-500" />}
          color="#3b82f6"
          onClick={() => router.push('/upload')}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sugarChartData.length > 0 && (
          <SugarChart data={sugarChartData} />
        )}
        {bpChartData.length > 0 && (
          <BPChart data={bpChartData} />
        )}
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sugar Readings Today */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Glucose Readings</h4>
            {todaySugar.length === 0 ? (
              <p className="text-sm text-muted-foreground">No readings today. <Button variant="link" className="h-auto p-0" onClick={() => router.push('/upload')}>Add one</Button></p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {todaySugar.map((reading) => {
                  const status = getSugarStatus(reading.value, reading.unit)
                  return (
                    <div
                      key={reading.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-sm font-medium">{reading.value} {reading.unit}</span>
                      <span className="text-xs text-muted-foreground">{reading.timeOfDay}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: status.color }}>
                        {status.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* BP Today */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Blood Pressure</h4>
            {todayBP.length === 0 ? (
              <p className="text-sm text-muted-foreground">No readings today. <Button variant="link" className="h-auto p-0" onClick={() => router.push('/blood-pressure')}>Add one</Button></p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {todayBP.map((reading) => {
                  const status = getBPStatus(reading.systolic, reading.diastolic)
                  return (
                    <div
                      key={reading.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-sm font-medium">{reading.systolic}/{reading.diastolic}</span>
                      <span className="text-xs text-muted-foreground">{reading.timeOfDay}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: status.color }}>
                        {status.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Medications Today */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Medications</h4>
            {todayMeds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active medications. <Button variant="link" className="h-auto p-0" onClick={() => router.push('/medications')}>Add one</Button></p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {todayMeds.map((med) => (
                  <div
                    key={med.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg',
                      med.morningTaken && med.eveningTaken ? 'bg-green-50' : 'bg-muted'
                    )}
                  >
                    <Pill className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{med.name}</span>
                    <span className="text-xs text-muted-foreground">{med.dosage}</span>
                    <div className="flex gap-1">
                      {(med.frequency === 'morning' || med.frequency === 'both') && (
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          med.morningTaken ? 'bg-green-500 text-white' : 'bg-yellow-100 text-yellow-700'
                        )}>
                          {med.morningTaken ? '✓ AM' : 'AM'}
                        </span>
                      )}
                      {(med.frequency === 'evening' || med.frequency === 'both') && (
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          med.eveningTaken ? 'bg-green-500 text-white' : 'bg-yellow-100 text-yellow-700'
                        )}>
                          {med.eveningTaken ? '✓ PM' : 'PM'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lab Categories */}
      {labResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Lab Results by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(labsByCategory).map(([category, labs]) => {
                const cat = getCategoryById(category)
                return (
                  <div
                    key={category}
                    className="p-3 rounded-lg border border-border hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => router.push('/upload')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{labs.length}</p>
                    <p className="text-xs text-muted-foreground">reports</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-Day Stats */}
      {(sugarStats || bpStats) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              7-Day Averages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sugarStats && (
                <div className="p-4 rounded-lg bg-orange-50">
                  <p className="text-sm text-muted-foreground mb-1">Glucose Average</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round(sugarStats.avg)} <span className="text-sm font-normal">mg/dL</span>
                  </p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-green-600">Min: {Math.round(sugarStats.min)}</span>
                    <span className="text-red-600">Max: {Math.round(sugarStats.max)}</span>
                    <span className="text-muted-foreground">{sugarStats.count} readings</span>
                  </div>
                </div>
              )}
              {bpStats && (
                <div className="p-4 rounded-lg bg-red-50">
                  <p className="text-sm text-muted-foreground mb-1">BP Average</p>
                  <p className="text-3xl font-bold text-red-600">
                    {bpStats.avgSystolic}/{bpStats.avgDiastolic}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-muted-foreground">{bpStats.count} readings</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
