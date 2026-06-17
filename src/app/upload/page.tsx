'use client'

import { useState, useRef } from 'react'
import { format } from 'date-fns'
import {
  Upload, FileText, ImageIcon, X, Check, Droplets,
  Trash2, Loader2, Camera,
} from 'lucide-react'
import { useHealthData } from '@/hooks/useHealthData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  LAB_CATEGORIES, SUGAR_UNITS, TIME_OF_DAY, MEAL_TYPE,
  getSugarStatus, getCategoryById,
} from '@/lib/health-categories'
import { useToast } from '@/components/toast-provider'
import { cn } from '@/lib/utils'

// Downscale large images to keep localStorage usage sane (~1280px max edge, JPEG q0.7)
function processFile(file: File): Promise<{ dataUrl: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read error'))
    reader.onload = () => {
      const result = reader.result as string
      if (!file.type.startsWith('image/')) {
        resolve({ dataUrl: result, type: file.type || 'application/octet-stream' })
        return
      }
      const img = new Image()
      img.onload = () => {
        const maxEdge = 1280
        let { width, height } = img
        if (width > maxEdge || height > maxEdge) {
          const scale = maxEdge / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve({ dataUrl: result, type: file.type }); return }
        ctx.drawImage(img, 0, 0, width, height)
        resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.7), type: 'image/jpeg' })
      }
      img.onerror = () => resolve({ dataUrl: result, type: file.type })
      img.src = result
    }
    reader.readAsDataURL(file)
  })
}

export default function UploadPage() {
  const {
    labResults, addLabResult, deleteLabResult,
    sugarReadings, addSugarReading,
  } = useHealthData()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<'lab' | 'glucose'>('lab')
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Lab form
  const [labForm, setLabForm] = useState({
    title: '', category: 'blood_work', date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [preview, setPreview] = useState<{ dataUrl: string; type: string } | null>(null)

  // Glucose form
  const [sugarForm, setSugarForm] = useState({
    value: '', unit: 'mg/dL', date: format(new Date(), 'yyyy-MM-dd'),
    timeOfDay: 'morning', mealType: 'fasting', notes: '',
  })

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setProcessing(true)
    try {
      const processed = await processFile(file)
      setPreview(processed)
      if (!labForm.title) {
        setLabForm(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }))
      }
      addToast('File ready. Add details and save.', 'success')
    } catch {
      addToast('Could not read that file', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const saveLab = () => {
    if (!labForm.title.trim()) return addToast('Please enter a title', 'warning')
    addLabResult({
      title: labForm.title.trim(),
      category: labForm.category,
      date: new Date(labForm.date).toISOString(),
      fileUrl: preview?.dataUrl,
      fileType: preview?.type,
    })
    addToast('Lab report saved', 'success')
    setLabForm({ title: '', category: 'blood_work', date: format(new Date(), 'yyyy-MM-dd') })
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const saveGlucose = () => {
    if (!sugarForm.value) return addToast('Please enter a glucose value', 'warning')
    addSugarReading({
      value: parseFloat(sugarForm.value),
      unit: sugarForm.unit,
      date: new Date(sugarForm.date).toISOString(),
      timeOfDay: sugarForm.timeOfDay,
      mealType: sugarForm.mealType,
      notes: sugarForm.notes,
    })
    addToast('Glucose reading saved', 'success')
    setSugarForm({
      value: '', unit: sugarForm.unit, date: format(new Date(), 'yyyy-MM-dd'),
      timeOfDay: 'morning', mealType: 'fasting', notes: '',
    })
  }

  const glucoseStatus = sugarForm.value
    ? getSugarStatus(parseFloat(sugarForm.value), sugarForm.unit)
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Upload</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add lab reports, Stelo CGM screenshots, and glucose readings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('lab')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border',
            tab === 'lab' ? 'bg-primary text-white border-primary' : 'bg-muted text-muted-foreground border-transparent hover:border-border'
          )}
        >
          <FileText className="w-4 h-4" /> Lab Report
        </button>
        <button
          onClick={() => setTab('glucose')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border',
            tab === 'glucose' ? 'bg-primary text-white border-primary' : 'bg-muted text-muted-foreground border-transparent hover:border-border'
          )}
        >
          <Droplets className="w-4 h-4" /> Glucose Reading
        </button>
      </div>

      {tab === 'lab' && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">Upload Lab Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {processing ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm">Processing file...</p>
                </div>
              ) : preview ? (
                <div className="flex flex-col items-center gap-3">
                  {preview.type.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview.dataUrl} alt="Preview" className="max-h-48 rounded-lg shadow-sm" />
                  ) : (
                    <div className="flex items-center gap-2 text-sm"><FileText className="w-6 h-6 text-primary" /> PDF ready</div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="text-xs text-red-500 flex items-center gap-1 hover:underline"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Drop file or click to upload</p>
                  <p className="text-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Image or
                    <FileText className="w-3 h-3" /> PDF
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <Label>Title</Label>
                <Input
                  value={labForm.title}
                  onChange={(e) => setLabForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Complete Blood Count — June"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={labForm.category}
                  onChange={(e) => setLabForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {LAB_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={labForm.date}
                  onChange={(e) => setLabForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Camera className="w-3.5 h-3.5" />
              Tip: screenshots from your CGM app are stored locally on your device only.
            </div>

            <Button onClick={saveLab} className="w-full gap-2 bg-gradient-to-r from-primary to-sky-400 hover:opacity-90">
              <Check className="w-4 h-4" /> Save Lab Report
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 'glucose' && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">Add Glucose Reading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Value</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={sugarForm.value}
                  onChange={(e) => setSugarForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="95"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select
                  value={sugarForm.unit}
                  onChange={(e) => setSugarForm(prev => ({ ...prev, unit: e.target.value }))}
                >
                  {SUGAR_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </Select>
              </div>
            </div>

            {glucoseStatus && (
              <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge style={{ backgroundColor: glucoseStatus.color, color: '#fff' }}>{glucoseStatus.status}</Badge>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Time of Day</Label>
                <Select
                  value={sugarForm.timeOfDay}
                  onChange={(e) => setSugarForm(prev => ({ ...prev, timeOfDay: e.target.value }))}
                >
                  {TIME_OF_DAY.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </div>
              <div>
                <Label>Meal Context</Label>
                <Select
                  value={sugarForm.mealType}
                  onChange={(e) => setSugarForm(prev => ({ ...prev, mealType: e.target.value }))}
                >
                  {MEAL_TYPE.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={sugarForm.date}
                  onChange={(e) => setSugarForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={sugarForm.notes}
                onChange={(e) => setSugarForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="What did you eat? How did you feel?"
                rows={2}
              />
            </div>

            <Button onClick={saveGlucose} className="w-full gap-2 bg-gradient-to-r from-primary to-sky-400 hover:opacity-90">
              <Droplets className="w-4 h-4" /> Save Reading
            </Button>

            {sugarReadings.length > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {sugarReadings.length} glucose reading{sugarReadings.length === 1 ? '' : 's'} stored
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lab list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Lab Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {labResults.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No lab reports yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {labResults.map(lab => {
                const cat = getCategoryById(lab.category)
                return (
                  <div key={lab.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:shadow-sm transition-all group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '15' }}>
                      <FileText className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lab.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(lab.date), 'MMM d, yyyy')}</p>
                    </div>
                    <Badge style={{ backgroundColor: cat.color, color: '#fff' }} className="text-[10px]">{cat.label}</Badge>
                    <button
                      onClick={() => { deleteLabResult(lab.id); addToast('Lab report deleted', 'info') }}
                      className="p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
