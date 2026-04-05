'use client'

import { useState } from 'react'
import { X, Upload, Download, CheckCircle2, AlertCircle, Table2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DataField {
  key: string
  label: string
  type: 'text' | 'number' | 'percent' | 'select'
  options?: string[]
  required: boolean
  unit?: string
  hint?: string
  validation?: string
}

export interface DataRequirement {
  label: string
  desc: string
  ok: boolean
}

interface Props {
  title: string
  description: string
  fields: DataField[]
  requirements: DataRequirement[]
  templateName: string
  templateHeaders: string[]
  onClose: () => void
  onSave?: (data: Record<string, string>) => void
}

function downloadCsv(filename: string, headers: string[], sample: string[][]) {
  const rows = [headers, ...sample].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function DataEntryModal({ title, description, fields, requirements, templateName, templateHeaders, onClose, onSave }: Props) {
  const [tab, setTab] = useState<'manual' | 'upload'>('manual')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const sampleRow = fields.map(f => {
    if (f.type === 'percent') return '45'
    if (f.type === 'number') return '100'
    if (f.type === 'select' && f.options) return f.options[0]
    return 'Sample value'
  })

  function validate() {
    const errs: Record<string, string> = {}
    fields.forEach(f => {
      if (f.required && !formData[f.key]) {
        errs[f.key] = 'Required'
      }
      if (f.type === 'percent' && formData[f.key]) {
        const v = Number(formData[f.key])
        if (isNaN(v) || v < 0 || v > 100) errs[f.key] = 'Must be 0–100'
      }
      if (f.type === 'number' && formData[f.key]) {
        if (isNaN(Number(formData[f.key]))) errs[f.key] = 'Must be a number'
      }
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave?.(formData)
    onClose()
  }

  function handleUpload() {
    setUploadState('uploading')
    setTimeout(() => setUploadState('done'), 1800)
  }

  const completedReqs = requirements.filter(r => r.ok).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-gray-900 font-bold text-base">{title}</h2>
            <p className="text-gray-400 text-xs mt-0.5">{description}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 ml-4 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Data Requirements */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-widest">Data Requirements</p>
            <span className="text-[11px] text-neon-green font-semibold">{completedReqs}/{requirements.length} met</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {requirements.map((r) => (
              <div key={r.label} className="flex items-start gap-1.5">
                {r.ok
                  ? <CheckCircle2 className="w-3 h-3 text-neon-green shrink-0 mt-0.5" />
                  : <AlertCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />}
                <div>
                  <span className="text-[11px] text-gray-600 font-medium">{r.label}</span>
                  <p className="text-[10px] text-gray-400 leading-tight">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1 px-6 pt-4">
          {(['manual', 'upload'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn('px-4 py-1.5 rounded-lg text-xs font-semibold transition-all', tab === t ? 'bg-neon-green text-white' : 'text-gray-400 hover:text-gray-700 bg-gray-100')}
            >
              {t === 'manual' ? 'Enter Manually' : 'Upload Excel'}
            </button>
          ))}
          <button
            onClick={() => downloadCsv(templateName + '.csv', templateHeaders, [sampleRow])}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 text-xs hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            <Download className="w-3 h-3" />
            Download Template
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {tab === 'manual' && (
            <div className="grid grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key} className={f.type === 'text' ? 'col-span-2' : ''}>
                  <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">
                    {f.label}
                    {f.required && <span className="text-red-400 ml-1">*</span>}
                    {f.unit && <span className="text-gray-300 ml-1 normal-case font-normal">({f.unit})</span>}
                  </label>
                  {f.type === 'select' ? (
                    <select
                      value={formData[f.key] ?? ''}
                      onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                      className={cn('w-full border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-neon-green/50', errors[f.key] ? 'border-red-300' : 'border-gray-200')}
                    >
                      <option value="">Select…</option>
                      {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'text' ? 'text' : 'number'}
                      min={f.type === 'percent' ? 0 : undefined}
                      max={f.type === 'percent' ? 100 : undefined}
                      placeholder={f.hint ?? (f.type === 'percent' ? '0–100' : '')}
                      value={formData[f.key] ?? ''}
                      onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                      className={cn('w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-neon-green/50 placeholder:text-gray-300', errors[f.key] ? 'border-red-300' : 'border-gray-200')}
                    />
                  )}
                  {errors[f.key] && <p className="text-red-400 text-[10px] mt-1">{errors[f.key]}</p>}
                  {f.validation && !errors[f.key] && <p className="text-gray-300 text-[10px] mt-1">{f.validation}</p>}
                </div>
              ))}
            </div>
          )}

          {tab === 'upload' && (
            <div className="space-y-4">
              {uploadState === 'idle' && (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-neon-green/30 transition-colors cursor-pointer"
                  onClick={handleUpload}
                >
                  <Table2 className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium mb-1">Drop your Excel / CSV file here</p>
                  <p className="text-gray-300 text-xs mb-4">Must match the downloadable template format</p>
                  <span className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500 text-xs font-semibold">Browse File</span>
                </div>
              )}
              {uploadState === 'uploading' && (
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-8 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 text-sm font-medium">Validating and importing…</p>
                </div>
              )}
              {uploadState === 'done' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    <p className="text-sm text-gray-700 font-semibold">File validated — ready to import</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Preview (first 3 rows)</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-gray-100">{templateHeaders.map(h => <th key={h} className="px-2 py-1.5 text-left text-gray-400 font-medium whitespace-nowrap">{h}</th>)}</tr></thead>
                        <tbody>{[sampleRow].map((r, i) => <tr key={i} className="border-b border-gray-50">{r.map((c, j) => <td key={j} className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{c}</td>)}</tr>)}</tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {uploadState === 'error' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">File format does not match template. Please download and use the template.</p>
                </div>
              )}

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Required Columns</p>
                <div className="flex flex-wrap gap-1.5">
                  {templateHeaders.map(h => (
                    <span key={h} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-500">{h}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors">
            Cancel
          </button>
          {tab === 'manual' && (
            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors">
              Save Data
            </button>
          )}
          {tab === 'upload' && uploadState === 'done' && (
            <button onClick={onClose} className="px-5 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors">
              <Upload className="w-3.5 h-3.5 inline mr-1.5" />Import Data
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
