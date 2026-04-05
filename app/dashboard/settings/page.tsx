'use client'

import { useState } from 'react'
import type { ElementType } from 'react'
import { Check, Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingsTab = 'appearance' | 'layout' | 'regional' | 'privacy'

const THEMES = [
  { id: 'green-white',   name: 'Fortuna Default',  primary: '#0FA958', bg: '#ffffff', preview: 'bg-white border-2 border-neon-green' },
  { id: 'blue-white',    name: 'Ocean',             primary: '#3b82f6', bg: '#ffffff', preview: 'bg-white border-2 border-blue-500' },
  { id: 'violet-white',  name: 'Iris',              primary: '#8b5cf6', bg: '#ffffff', preview: 'bg-white border-2 border-violet-500' },
  { id: 'amber-white',   name: 'Sunrise',           primary: '#f59e0b', bg: '#ffffff', preview: 'bg-white border-2 border-amber-500' },
  { id: 'green-dark',    name: 'Dark Forest',       primary: '#0FA958', bg: '#1a1a1a', preview: 'bg-gray-900 border-2 border-neon-green' },
  { id: 'blue-dark',     name: 'Midnight',          primary: '#3b82f6', bg: '#1a1a1a', preview: 'bg-gray-900 border-2 border-blue-500' },
]

const DENSITIES = [
  { id: 'compact',  label: 'Compact',  desc: 'More data, less padding' },
  { id: 'default',  label: 'Default',  desc: 'Balanced whitespace' },
  { id: 'relaxed',  label: 'Relaxed',  desc: 'More breathing room' },
]

const FONTS = ['Inter', 'Geist', 'DM Sans', 'Manrope']
const LANGUAGES = [{ code: 'en', label: 'English' }, { code: 'id', label: 'Bahasa Indonesia' }]
const CURRENCIES = ['IDR — Indonesian Rupiah', 'USD — US Dollar', 'SGD — Singapore Dollar']
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
const TIMEZONES = ['Asia/Jakarta (WIB, GMT+7)', 'Asia/Makassar (WITA, GMT+8)', 'Asia/Jayapura (WIT, GMT+9)', 'UTC']

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('appearance')
  const [selectedTheme, setSelectedTheme] = useState('green-white')
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('light')
  const [density, setDensity] = useState('default')
  const [font, setFont] = useState('Inter')
  const [sidebarPos, setSidebarPos] = useState<'left' | 'right'>('left')
  const [language, setLanguage] = useState('en')
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [dateFormat, setDateFormat] = useState(DATE_FORMATS[0])
  const [timezone, setTimezone] = useState(TIMEZONES[0])
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'appearance', label: 'Appearance' },
    { key: 'layout',     label: 'Layout' },
    { key: 'regional',   label: 'Regional' },
    { key: 'privacy',    label: 'Data & Privacy' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Fortuna</p>
        <h1 className="text-gray-900 text-2xl font-bold">Settings</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px',
              tab === t.key
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── APPEARANCE ── */}
      {tab === 'appearance' && (
        <div className="space-y-6">
          {/* Theme presets */}
          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">Theme</p>
            <p className="text-gray-400 text-xs mb-4">Choose a preset colour scheme for the app.</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={cn(
                    'w-full aspect-square rounded-xl relative transition-all',
                    t.preview,
                    selectedTheme === t.id ? 'ring-2 ring-offset-2 ring-neon-green' : 'hover:scale-105'
                  )}>
                    <div className="absolute inset-0 flex items-end p-1.5">
                      <div className="w-full h-1 rounded-full" style={{ backgroundColor: t.primary }} />
                    </div>
                    {selectedTheme === t.id && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-neon-green flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 text-center leading-tight">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom accent */}
          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">Custom Accent Colour</p>
            <p className="text-gray-400 text-xs mb-3">Override the accent colour of the selected theme.</p>
            <div className="flex items-center gap-3">
              <input type="color" defaultValue="#0FA958" className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <input type="text" defaultValue="#0FA958" className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-neon-green/50 w-28 font-mono" />
              <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors">Reset</button>
            </div>
          </div>

          {/* Mode */}
          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">Mode</p>
            <p className="text-gray-400 text-xs mb-3">Light, dark, or follow system preference.</p>
            <div className="flex gap-2">
              {([
                { key: 'light',  label: 'Light',  Icon: Sun },
                { key: 'dark',   label: 'Dark',   Icon: Moon },
                { key: 'system', label: 'System', Icon: Monitor },
              ] as { key: 'light' | 'dark' | 'system'; label: string; Icon: ElementType }[]).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all',
                    mode === key
                      ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LAYOUT ── */}
      {tab === 'layout' && (
        <div className="space-y-6">
          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">Density</p>
            <p className="text-gray-400 text-xs mb-3">Control how compact the UI feels.</p>
            <div className="space-y-2">
              {DENSITIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDensity(d.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all',
                    density === d.id
                      ? 'bg-neon-green/5 border-neon-green/30'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div>
                    <p className={cn('text-sm font-semibold', density === d.id ? 'text-neon-green' : 'text-gray-700')}>{d.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{d.desc}</p>
                  </div>
                  {density === d.id && <Check className="w-4 h-4 text-neon-green" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">Font Family</p>
            <p className="text-gray-400 text-xs mb-3">UI typeface for labels, values, and body text.</p>
            <div className="flex flex-wrap gap-2">
              {FONTS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFont(f)}
                  className={cn(
                    'px-4 py-2 rounded-lg border text-xs font-semibold transition-all',
                    font === f
                      ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">Sidebar Position</p>
            <p className="text-gray-400 text-xs mb-3">Choose where the navigation sidebar appears.</p>
            <div className="flex gap-2">
              {(['left', 'right'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSidebarPos(pos)}
                  className={cn(
                    'px-5 py-2 rounded-lg border text-xs font-semibold capitalize transition-all',
                    sidebarPos === pos
                      ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── REGIONAL ── */}
      {tab === 'regional' && (
        <div className="space-y-5">
          <SelectField label="Language" value={language} onChange={setLanguage} options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))} />
          <SelectField label="Currency" desc="Used for cost and revenue inputs across the app." value={currency} onChange={setCurrency} options={CURRENCIES.map(c => ({ value: c, label: c }))} />
          <SelectField label="Date Format" value={dateFormat} onChange={setDateFormat} options={DATE_FORMATS.map(d => ({ value: d, label: d }))} />
          <SelectField label="Timezone" desc="Used for wave timestamps and scheduling." value={timezone} onChange={setTimezone} options={TIMEZONES.map(t => ({ value: t, label: t }))} />
        </div>
      )}

      {/* ── DATA & PRIVACY ── */}
      {tab === 'privacy' && (
        <div className="space-y-5">
          {[
            { title: 'Usage Analytics', desc: 'Share anonymous usage data to help improve Fortuna. No personal or survey data is included.', defaultOn: true },
            { title: 'Error Reporting', desc: 'Automatically send crash reports and error logs to the development team.', defaultOn: true },
            { title: 'Session Recording', desc: 'Allow session replays for UX research. Only UI interactions are captured.', defaultOn: false },
          ].map((item) => (
            <ToggleRow key={item.title} title={item.title} desc={item.desc} defaultOn={item.defaultOn} />
          ))}

          <div className="border-t border-gray-100 pt-5 space-y-3">
            <p className="text-gray-700 text-sm font-semibold">Data Management</p>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-left">
              <div>
                <p className="text-sm text-gray-700 font-medium">Export All Data</p>
                <p className="text-xs text-gray-400">Download a full export of your projects, surveys and reports.</p>
              </div>
              <span className="text-xs text-gray-400 font-semibold">ZIP →</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-left">
              <div>
                <p className="text-sm text-red-600 font-medium">Delete Account</p>
                <p className="text-xs text-red-400">Permanently remove all data. This action cannot be undone.</p>
              </div>
              <span className="text-xs text-red-400 font-semibold">Delete →</span>
            </button>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors">
          Discard
        </button>
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition-all',
            saved
              ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
              : 'bg-neon-green text-white hover:bg-neon-green/90'
          )}
        >
          {saved && <Check className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function SelectField({ label, desc, value, onChange, options }: {
  label: string; desc?: string; value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <p className="text-gray-700 text-sm font-semibold mb-0.5">{label}</p>
      {desc && <p className="text-gray-400 text-xs mb-2">{desc}</p>}
      {!desc && <div className="mb-2" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-neon-green/50"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function ToggleRow({ title, desc, defaultOn }: { title: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex-1">
        <p className="text-sm text-gray-700 font-medium">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={cn(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 mt-0.5',
          on ? 'bg-neon-green' : 'bg-gray-200'
        )}
      >
        <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm', on ? 'translate-x-4' : 'translate-x-0.5')} />
      </button>
    </div>
  )
}
