'use client'

import { useState } from 'react'
import type { ElementType } from 'react'
import {
  Check, Sun, Moon, Monitor, Database, KeyRound, Bot, Mail, MessageCircle,
  BarChart3, ChevronDown, Eye, EyeOff, AlertCircle, CheckCircle2, ExternalLink, Copy,
  Zap, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingsTab = 'appearance' | 'layout' | 'regional' | 'integrations' | 'privacy'

// ─── Appearance config ────────────────────────────────────────────────────────

const THEMES = [
  { id: 'green-white',  name: 'Fortuna Default', primary: '#0FA958', preview: 'bg-white border-2 border-neon-green' },
  { id: 'blue-white',   name: 'Ocean',           primary: '#3b82f6', preview: 'bg-white border-2 border-blue-500' },
  { id: 'violet-white', name: 'Iris',            primary: '#8b5cf6', preview: 'bg-white border-2 border-violet-500' },
  { id: 'amber-white',  name: 'Sunrise',         primary: '#f59e0b', preview: 'bg-white border-2 border-amber-500' },
  { id: 'green-dark',   name: 'Dark Forest',     primary: '#0FA958', preview: 'bg-gray-900 border-2 border-neon-green' },
  { id: 'blue-dark',    name: 'Midnight',        primary: '#3b82f6', preview: 'bg-gray-900 border-2 border-blue-500' },
]
const DENSITIES = [
  { id: 'compact', label: 'Compact', desc: 'More data, less padding' },
  { id: 'default', label: 'Default', desc: 'Balanced whitespace' },
  { id: 'relaxed', label: 'Relaxed', desc: 'More breathing room' },
]
const FONTS      = ['Inter', 'Geist', 'DM Sans', 'Manrope']
const LANGUAGES  = [{ code: 'en', label: 'English' }, { code: 'id', label: 'Bahasa Indonesia' }]
const CURRENCIES = ['IDR — Indonesian Rupiah', 'USD — US Dollar', 'SGD — Singapore Dollar']
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
const TIMEZONES    = ['Asia/Jakarta (WIB, GMT+7)', 'Asia/Makassar (WITA, GMT+8)', 'Asia/Jayapura (WIT, GMT+9)', 'UTC']

// ─── Integration definitions ──────────────────────────────────────────────────

interface IntegrationField {
  key: string
  label: string
  placeholder: string
  secret?: boolean
  hint?: string
  copyable?: boolean
}

interface Integration {
  id: string
  name: string
  description: string
  icon: ElementType
  iconBg: string
  iconColor: string
  docsUrl: string
  status: 'connected' | 'partial' | 'not_configured'
  category: string
  fields: IntegrationField[]
  notes?: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'database',
    name: 'PostgreSQL Database',
    description: 'Stores all your projects, waves, brands, CEPs, and survey results. Required for live data — app runs with demo data without it.',
    icon: Database,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    docsUrl: 'https://supabase.com/docs/guides/database',
    status: 'not_configured',
    category: 'Core',
    fields: [
      {
        key: 'DATABASE_URL',
        label: 'Database URL',
        placeholder: 'postgresql://user:password@host:5432/dbname',
        secret: true,
        hint: 'Supports Supabase, Neon, Railway, or any PostgreSQL instance.',
      },
    ],
    notes: 'After saving, run: npx prisma migrate dev --name init',
  },
  {
    id: 'clerk',
    name: 'Clerk Authentication',
    description: 'User login, sign-up, and session management. Without this, the app runs without auth in demo mode.',
    icon: KeyRound,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
    docsUrl: 'https://clerk.com/docs',
    status: 'not_configured',
    category: 'Core',
    fields: [
      {
        key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        label: 'Publishable Key',
        placeholder: 'pk_live_…',
        hint: 'Found in Clerk Dashboard → API Keys.',
      },
      {
        key: 'CLERK_SECRET_KEY',
        label: 'Secret Key',
        placeholder: 'sk_live_…',
        secret: true,
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics Service (Python)',
    description: 'Local FastAPI microservice for KPI calculation (MPen, MMS, NS, SoM) and Double Jeopardy normalization. Without it, KPIs are estimated client-side.',
    icon: BarChart3,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    docsUrl: 'https://fastapi.tiangolo.com',
    status: 'not_configured',
    category: 'Core',
    fields: [
      {
        key: 'ANALYTICS_SERVICE_URL',
        label: 'Service URL',
        placeholder: 'http://localhost:8000',
        hint: 'Start locally: cd analytics-service && uvicorn main:app --reload',
      },
    ],
    notes: 'pip install -r analytics-service/requirements.txt',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Powers the AI CEP Generator (generate + critique modes) and category twin matching. Demo mode returns sample CEPs without a key.',
    icon: Bot,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    docsUrl: 'https://console.anthropic.com',
    status: 'not_configured',
    category: 'AI',
    fields: [
      {
        key: 'ANTHROPIC_API_KEY',
        label: 'API Key',
        placeholder: 'sk-ant-…',
        secret: true,
        hint: 'Get your key at console.anthropic.com → API Keys.',
      },
    ],
    notes: 'Uses claude-opus-4-6. Each CEP generation call uses ~1,500–4,000 tokens.',
  },
  {
    id: 'resend',
    name: 'Resend (Email)',
    description: 'Sends branded survey invitation emails to respondents. Primary email delivery provider — fast, reliable, free tier available.',
    icon: Mail,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    docsUrl: 'https://resend.com/docs',
    status: 'not_configured',
    category: 'Distribution',
    fields: [
      {
        key: 'RESEND_API_KEY',
        label: 'API Key',
        placeholder: 're_…',
        secret: true,
        hint: 'Get your key at resend.com → API Keys. Free tier: 3,000 emails/month.',
      },
      {
        key: 'EMAIL_FROM',
        label: 'Sender Email',
        placeholder: 'survey@yourdomain.com',
        hint: 'Must be a verified domain in Resend.',
      },
    ],
  },
  {
    id: 'smtp',
    name: 'SMTP (Email Fallback)',
    description: 'Alternative email delivery via any SMTP server (Gmail, Outlook, Mailgun, etc.). Used automatically if Resend is not configured.',
    icon: Mail,
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-500',
    docsUrl: 'https://nodemailer.com',
    status: 'not_configured',
    category: 'Distribution',
    fields: [
      { key: 'SMTP_HOST', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
      { key: 'SMTP_PORT', label: 'SMTP Port', placeholder: '587', hint: '587 for TLS, 465 for SSL' },
      { key: 'SMTP_USER', label: 'Username', placeholder: 'you@gmail.com' },
      { key: 'SMTP_PASS', label: 'Password / App Password', placeholder: '••••••••', secret: true },
    ],
    notes: 'Gmail: use an App Password (not your account password). Enable 2FA first.',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp (Meta Cloud API)',
    description: 'Sends survey invitations via WhatsApp Business. Requires a Meta Business account, verified phone number, and an approved message template.',
    icon: MessageCircle,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
    status: 'not_configured',
    category: 'Distribution',
    fields: [
      {
        key: 'WHATSAPP_PHONE_NUMBER_ID',
        label: 'Phone Number ID',
        placeholder: '1234567890',
        hint: 'Found in Meta Business Dashboard → WhatsApp → Phone Numbers.',
      },
      {
        key: 'WHATSAPP_ACCESS_TOKEN',
        label: 'System User Token',
        placeholder: 'EAABs…',
        secret: true,
        hint: 'Generate a permanent token from a System User — not a temporary user token.',
      },
      {
        key: 'WHATSAPP_TEMPLATE_NAME',
        label: 'Approved Template Name',
        placeholder: 'survey_invite',
        hint: 'Template must be approved by Meta before use. Approval takes 1–3 days.',
      },
      {
        key: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
        label: 'Webhook Verify Token',
        placeholder: 'fortuna-webhook-verify',
        hint: 'Any secret string — used to verify Meta webhook callbacks.',
        copyable: true,
      },
    ],
    notes: 'Webhook URL to register in Meta: https://yourdomain.com/api/distribution/webhook',
  },
]

const CATEGORIES = ['Core', 'AI', 'Distribution']

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('integrations')
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
    { key: 'integrations', label: 'Integrations & API' },
    { key: 'appearance',   label: 'Appearance' },
    { key: 'layout',       label: 'Layout' },
    { key: 'regional',     label: 'Regional' },
    { key: 'privacy',      label: 'Data & Privacy' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Fortuna</p>
        <h1 className="text-gray-900 text-2xl font-bold">Settings</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap',
              tab === t.key
                ? 'border-neon-green text-neon-green'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── INTEGRATIONS ── */}
      {tab === 'integrations' && (
        <div className="space-y-8">
          {/* Status overview */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-gray-700 text-sm font-semibold mb-4">Connection Status</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Database',     color: 'text-amber-500', bg: 'bg-amber-50',      dot: 'bg-amber-400', status: 'Demo Mode' },
                { label: 'Auth',         color: 'text-amber-500', bg: 'bg-amber-50',      dot: 'bg-amber-400', status: 'Demo Mode' },
                { label: 'AI (Claude)',  color: 'text-red-500',   bg: 'bg-red-50',        dot: 'bg-red-400',   status: 'Not configured' },
                { label: 'Distribution',color: 'text-red-500',   bg: 'bg-red-50',        dot: 'bg-red-400',   status: 'Not configured' },
              ].map((s) => (
                <div key={s.label} className={cn('rounded-lg px-3 py-2.5', s.bg)}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
                    <span className={cn('text-[10px] font-bold uppercase tracking-wide', s.color)}>{s.status}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">
              The app runs in <strong>demo mode</strong> for any unconfigured integration. Set env vars in <code className="bg-gray-100 px-1 rounded text-gray-600">.env.local</code> and restart the dev server.
            </p>
          </div>

          {/* Integration cards by category */}
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">{cat}</p>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-3">
                {INTEGRATIONS.filter((i) => i.category === cat).map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>
          ))}

          {/* .env.local quick copy */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-700 text-sm font-semibold">.env.local template</p>
              <button
                onClick={() => navigator.clipboard.writeText(ENV_TEMPLATE)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Copy className="w-3 h-3" />
                Copy all
              </button>
            </div>
            <pre className="text-[11px] text-gray-500 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
              {ENV_TEMPLATE}
            </pre>
          </div>
        </div>
      )}

      {/* ── APPEARANCE ── */}
      {tab === 'appearance' && (
        <div className="space-y-6">
          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">Theme</p>
            <p className="text-gray-400 text-xs mb-4">Choose a preset colour scheme.</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => setSelectedTheme(t.id)} className="flex flex-col items-center gap-2 group">
                  <div className={cn('w-full aspect-square rounded-xl relative transition-all', t.preview, selectedTheme === t.id ? 'ring-2 ring-offset-2 ring-neon-green' : 'hover:scale-105')}>
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

          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">Custom Accent Colour</p>
            <p className="text-gray-400 text-xs mb-3">Override the accent colour of the selected theme.</p>
            <div className="flex items-center gap-3">
              <input type="color" defaultValue="#0FA958" className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <input type="text" defaultValue="#0FA958" className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-neon-green/50 w-28 font-mono" />
              <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors">Reset</button>
            </div>
          </div>

          <div>
            <p className="text-gray-700 text-sm font-semibold mb-1">Mode</p>
            <p className="text-gray-400 text-xs mb-3">Light, dark, or follow system preference.</p>
            <div className="flex gap-2">
              {([
                { key: 'light',  label: 'Light',  Icon: Sun },
                { key: 'dark',   label: 'Dark',   Icon: Moon },
                { key: 'system', label: 'System', Icon: Monitor },
              ] as { key: 'light' | 'dark' | 'system'; label: string; Icon: ElementType }[]).map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setMode(key)} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all', mode === key ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
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
                <button key={d.id} onClick={() => setDensity(d.id)} className={cn('w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all', density === d.id ? 'bg-neon-green/5 border-neon-green/30' : 'border-gray-200 bg-white hover:border-gray-300')}>
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
                <button key={f} onClick={() => setFont(f)} className={cn('px-4 py-2 rounded-lg border text-xs font-semibold transition-all', font === f ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
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
                <button key={pos} onClick={() => setSidebarPos(pos)} className={cn('px-5 py-2 rounded-lg border text-xs font-semibold capitalize transition-all', sidebarPos === pos ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
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
          <SelectField label="Currency" desc="Used for cost and revenue inputs." value={currency} onChange={setCurrency} options={CURRENCIES.map(c => ({ value: c, label: c }))} />
          <SelectField label="Date Format" value={dateFormat} onChange={setDateFormat} options={DATE_FORMATS.map(d => ({ value: d, label: d }))} />
          <SelectField label="Timezone" desc="Used for wave timestamps and scheduling." value={timezone} onChange={setTimezone} options={TIMEZONES.map(t => ({ value: t, label: t }))} />
        </div>
      )}

      {/* ── DATA & PRIVACY ── */}
      {tab === 'privacy' && (
        <div className="space-y-5">
          {[
            { title: 'Usage Analytics', desc: 'Share anonymous usage data to help improve Fortuna. No personal or survey data is included.', defaultOn: true },
            { title: 'Error Reporting', desc: 'Automatically send crash reports and error logs.', defaultOn: true },
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
                <p className="text-xs text-red-400">Permanently remove all data. This cannot be undone.</p>
              </div>
              <span className="text-xs text-red-400 font-semibold">Delete →</span>
            </button>
          </div>
        </div>
      )}

      {/* Save bar — hidden on integrations tab (each card saves individually) */}
      {tab !== 'integrations' && (
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors">
            Discard
          </button>
          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition-all',
              saved ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' : 'bg-neon-green text-white hover:bg-neon-green/90'
            )}
          >
            {saved && <Check className="w-3.5 h-3.5" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Integration Card ─────────────────────────────────────────────────────────

function IntegrationCard({ integration }: { integration: Integration }) {
  const [expanded, setExpanded] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)

  const Icon = integration.icon
  const filledCount = integration.fields.filter((f) => values[f.key]?.trim()).length
  const allFilled = filledCount === integration.fields.length
  const anyFilled = filledCount > 0

  const displayStatus =
    allFilled ? 'connected' : anyFilled ? 'partial' : 'not_configured'

  const statusConfig = {
    connected:      { label: 'Connected',      color: 'text-neon-green', dot: 'bg-neon-green' },
    partial:        { label: 'Partially set',  color: 'text-amber-500',  dot: 'bg-amber-400' },
    not_configured: { label: 'Not configured', color: 'text-gray-400',   dot: 'bg-gray-300' },
  }[displayStatus]

  function handleSave() {
    setSaved(true)
    setTestResult(null)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    await new Promise((r) => setTimeout(r, 1200))
    setTesting(false)
    // Simulate: connected if all fields filled
    setTestResult(allFilled ? 'ok' : 'fail')
  }

  return (
    <div className={cn('rounded-xl border bg-white transition-all', expanded ? 'border-gray-300' : 'border-gray-200')}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', integration.iconBg)}>
          <Icon className={cn('w-4 h-4', integration.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-gray-900 text-sm font-semibold">{integration.name}</p>
            <span className="flex items-center gap-1">
              <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dot)} />
              <span className={cn('text-[10px] font-semibold uppercase tracking-wide', statusConfig.color)}>
                {statusConfig.label}
              </span>
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed line-clamp-1">{integration.description}</p>
        </div>

        <ChevronDown className={cn('w-4 h-4 text-gray-300 shrink-0 transition-transform', expanded && 'rotate-180')} />
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {/* Description */}
          <p className="text-gray-500 text-xs leading-relaxed">{integration.description}</p>

          {/* Fields */}
          <div className="space-y-3">
            {integration.fields.map((field) => (
              <ApiKeyField
                key={field.key}
                field={field}
                value={values[field.key] ?? ''}
                onChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
              />
            ))}
          </div>

          {/* Notes */}
          {integration.notes && (
            <div className="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 font-mono">{integration.notes}</p>
            </div>
          )}

          {/* Test result */}
          {testResult && (
            <div className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium',
              testResult === 'ok'
                ? 'bg-neon-green/5 border border-neon-green/20 text-neon-green'
                : 'bg-red-50 border border-red-200 text-red-600'
            )}>
              {testResult === 'ok'
                ? <><CheckCircle2 className="w-3.5 h-3.5" /> Connection successful</>
                : <><AlertCircle className="w-3.5 h-3.5" /> Connection failed — check your credentials</>
              }
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleTest}
              disabled={!anyFilled || testing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={cn('w-3 h-3', testing && 'animate-spin')} />
              {testing ? 'Testing…' : 'Test connection'}
            </button>

            <button
              onClick={handleSave}
              disabled={!anyFilled}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                saved
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                  : 'bg-neon-green text-white hover:bg-neon-green/90'
              )}
            >
              {saved ? <><Check className="w-3 h-3" /> Saved to .env.local</> : 'Save keys'}
            </button>

            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Setup guide <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── API Key field with show/hide and copy ────────────────────────────────────

function ApiKeyField({
  field,
  value,
  onChange,
}: {
  field: IntegrationField
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (value) {
      navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-gray-600">{field.label}</label>
        <code className="text-[10px] text-gray-300 font-mono">{field.key}</code>
      </div>
      <div className="relative">
        <input
          type={field.secret && !show ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 font-mono focus:outline-none focus:border-neon-green/50 pr-16"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {field.copyable && value && (
            <button onClick={handleCopy} className="p-1 text-gray-300 hover:text-gray-600 transition-colors" title="Copy">
              {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
          {field.secret && (
            <button onClick={() => setShow(!show)} className="p-1 text-gray-300 hover:text-gray-600 transition-colors" title={show ? 'Hide' : 'Show'}>
              {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
      {field.hint && <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{field.hint}</p>}
    </div>
  )
}

// ─── Reusable helpers ─────────────────────────────────────────────────────────

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
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-neon-green/50">
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
      <button onClick={() => setOn(!on)} className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 mt-0.5', on ? 'bg-neon-green' : 'bg-gray-200')}>
        <span className={cn('inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm', on ? 'translate-x-4' : 'translate-x-0.5')} />
      </button>
    </div>
  )
}

// ─── .env.local template ──────────────────────────────────────────────────────

const ENV_TEMPLATE = `# ── Database
DATABASE_URL=""

# ── Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""

# ── Analytics Service
ANALYTICS_SERVICE_URL=http://localhost:8000

# ── Anthropic Claude (AI CEP Generator)
ANTHROPIC_API_KEY=""

# ── Email — Resend (primary)
RESEND_API_KEY=""
EMAIL_FROM="survey@yourdomain.com"

# ── Email — SMTP (fallback)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""

# ── WhatsApp (Meta Cloud API)
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_TEMPLATE_NAME="survey_invite"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="fortuna-webhook-verify"

# ── App
NEXT_PUBLIC_APP_URL="http://localhost:3000"`
