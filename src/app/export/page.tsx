'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { FileDown, Download, FileText, Droplets, HeartPulse, Pill, Calendar, Loader2, Check } from 'lucide-react'
import { useHealthData } from '@/hooks/useHealthData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSugarStatus, getBPStatus, getCategoryById } from '@/lib/health-categories'
import { cn } from '@/lib/utils'

export default function ExportPage() {
  const {
    sugarReadings,
    bpReadings,
    labResults,
    medications,
    medLogs,
    getSugarStats,
    getBPStats,
  } = useHealthData()

  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const sugarStats = getSugarStats(30)
  const bpStats = getBPStats(30)

  const generatePDF = async () => {
    setGenerating(true)
    
    // Dynamic import for jspdf to avoid SSR issues
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(14, 165, 233)
    doc.text('VitaTrack Health Report', pageWidth / 2, y, { align: 'center' })
    y += 10

    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, y, { align: 'center' })
    y += 15

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text('This report contains your personal health data. Share with your healthcare provider.', 20, y)
    y += 10

    // Summary Section
    doc.setFontSize(14)
    doc.setTextColor(14, 165, 233)
    doc.text('Summary', 20, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`• Total Glucose Readings: ${sugarReadings.length}`, 20, y)
    y += 6
    doc.text(`• Total BP Readings: ${bpReadings.length}`, 20, y)
    y += 6
    doc.text(`• Active Medications: ${medications.filter(m => m.active).length}`, 20, y)
    y += 6
    doc.text(`• Lab Reports: ${labResults.length}`, 20, y)
    y += 10

    // 30-Day Stats
    if (sugarStats || bpStats) {
      doc.setFontSize(14)
      doc.setTextColor(14, 165, 233)
      doc.text('30-Day Statistics', 20, y)
      y += 8

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      if (sugarStats) {
        doc.text(`• Average Glucose: ${Math.round(sugarStats.avg)} mg/dL (Range: ${Math.round(sugarStats.min)}-${Math.round(sugarStats.max)})`, 20, y)
        y += 6
      }
      if (bpStats) {
        doc.text(`• Average BP: ${bpStats.avgSystolic}/${bpStats.avgDiastolic} mmHg`, 20, y)
        y += 6
      }
      y += 6
    }

    // Glucose Readings
    if (sugarReadings.length > 0) {
      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFontSize(14)
      doc.setTextColor(249, 115, 22)
      doc.text('Glucose Readings', 20, y)
      y += 8

      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      sugarReadings.slice(0, 20).forEach((reading) => {
        if (y > 280) { doc.addPage(); y = 20 }
        const status = getSugarStatus(reading.value, reading.unit)
        doc.text(`${format(new Date(reading.date), 'MMM d')} - ${reading.value} ${reading.unit} (${status.status}) - ${reading.timeOfDay}, ${reading.mealType}`, 20, y)
        y += 5
      })
      y += 5
    }

    // BP Readings
    if (bpReadings.length > 0) {
      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFontSize(14)
      doc.setTextColor(239, 68, 68)
      doc.text('Blood Pressure Readings', 20, y)
      y += 8

      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      bpReadings.slice(0, 20).forEach((reading) => {
        if (y > 280) { doc.addPage(); y = 20 }
        const status = getBPStatus(reading.systolic, reading.diastolic)
        doc.text(`${format(new Date(reading.date), 'MMM d')} - ${reading.systolic}/${reading.diastolic} mmHg (${status.status}) - ${reading.timeOfDay}${reading.pulse ? `, Pulse: ${reading.pulse}` : ''}`, 20, y)
        y += 5
      })
      y += 5
    }

    // Medications
    if (medications.length > 0) {
      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFontSize(14)
      doc.setTextColor(139, 92, 246)
      doc.text('Medications', 20, y)
      y += 8

      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      medications.filter(m => m.active).forEach((med) => {
        if (y > 280) { doc.addPage(); y = 20 }
        doc.text(`• ${med.name} - ${med.dosage} (${med.frequency})${med.notes ? ` - ${med.notes}` : ''}`, 20, y)
        y += 5
      })
      y += 5
    }

    // Lab Reports
    if (labResults.length > 0) {
      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFontSize(14)
      doc.setTextColor(59, 130, 246)
      doc.text('Lab Reports', 20, y)
      y += 8

      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      labResults.forEach((lab) => {
        if (y > 280) { doc.addPage(); y = 20 }
        const cat = getCategoryById(lab.category)
        doc.text(`• ${lab.title} [${cat.label}] - ${format(new Date(lab.date), 'MMM d, yyyy')}`, 20, y)
        y += 5
      })
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Generated by VitaTrack - Not a medical document. Consult your doctor.', 20, doc.internal.pageSize.getHeight() - 10)

    doc.save(`vitatrack-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    setGenerating(false)
    setGenerated(true)
    setTimeout(() => setGenerated(false), 3000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Export Data</h1>
          <p className="text-sm text-muted-foreground">Download your health data as PDF</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{sugarReadings.length}</p>
              <p className="text-xs text-muted-foreground">Glucose readings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{bpReadings.length}</p>
              <p className="text-xs text-muted-foreground">BP readings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Pill className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{medications.filter(m => m.active).length}</p>
              <p className="text-xs text-muted-foreground">Active medications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{labResults.length}</p>
              <p className="text-xs text-muted-foreground">Lab reports</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileDown className="w-5 h-5 text-primary" />
            Generate PDF Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a comprehensive PDF report containing all your health data. Perfect for sharing with your healthcare provider or keeping personal records.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>Glucose readings with trends</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>Blood pressure history</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>Medication list</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>Lab report inventory</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>30-day statistics</span>
            </div>
          </div>

          <Button
            onClick={generatePDF}
            disabled={generating || (sugarReadings.length === 0 && bpReadings.length === 0 && medications.length === 0 && labResults.length === 0)}
            className="w-full gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : generated ? (
              <>
                <Check className="w-4 h-4" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Health Report PDF
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Glucose</CardTitle>
          </CardHeader>
          <CardContent>
            {sugarReadings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="space-y-1">
                {sugarReadings.slice(0, 5).map(r => {
                  const status = getSugarStatus(r.value, r.unit)
                  return (
                    <div key={r.id} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="font-medium">{r.value} {r.unit}</span>
                      <span className="text-muted-foreground">{format(new Date(r.date), 'MMM d')}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent BP</CardTitle>
          </CardHeader>
          <CardContent>
            {bpReadings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="space-y-1">
                {bpReadings.slice(0, 5).map(r => {
                  const status = getBPStatus(r.systolic, r.diastolic)
                  return (
                    <div key={r.id} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="font-medium">{r.systolic}/{r.diastolic}</span>
                      <span className="text-muted-foreground">{format(new Date(r.date), 'MMM d')}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
