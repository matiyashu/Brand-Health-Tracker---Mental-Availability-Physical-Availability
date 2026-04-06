/**
 * Fortuna — WhatsApp Survey Distribution
 * Phase 6 · Meta WhatsApp Business Cloud API
 *
 * POST /api/distribution/whatsapp
 * Body: { waveId, recipients, templateName?, surveyUrl, message? }
 *
 * Requirements (set in .env.local):
 *   WHATSAPP_PHONE_NUMBER_ID — from Meta Business Dashboard
 *   WHATSAPP_ACCESS_TOKEN    — permanent system user token
 *   WHATSAPP_TEMPLATE_NAME   — approved template name (default: 'survey_invite')
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const META_API_VERSION = 'v19.0'
const META_BASE = `https://graph.facebook.com/${META_API_VERSION}`

interface WhatsAppRequest {
  waveId: string
  recipients: { phone: string; name?: string }[]
  surveyUrl: string
  templateName?: string
  templateLanguage?: string
  message?: string // Used if template is not configured (session messages only)
}

interface SendResult {
  phone: string
  messageId?: string
  status: 'sent' | 'failed'
  error?: string
}

export async function POST(req: NextRequest) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const defaultTemplate = process.env.WHATSAPP_TEMPLATE_NAME ?? 'survey_invite'

  if (!phoneNumberId || !accessToken) {
    // Demo mode — simulate send
    const body: WhatsAppRequest = await req.json().catch(() => ({}))
    return NextResponse.json(buildDemoResponse(body.recipients ?? []))
  }

  let body: WhatsAppRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    waveId,
    recipients,
    surveyUrl,
    templateName = defaultTemplate,
    templateLanguage = 'en',
  } = body

  if (!waveId || !recipients?.length || !surveyUrl) {
    return NextResponse.json(
      { error: 'waveId, recipients, and surveyUrl are required' },
      { status: 400 }
    )
  }

  // Normalize phone numbers (E.164 format, strip non-digits)
  const normalised = recipients.map((r) => ({
    ...r,
    phone: r.phone.replace(/[^0-9]/g, ''),
  }))

  const results: SendResult[] = []

  // Send in batches of 10 to respect rate limits
  const BATCH_SIZE = 10
  for (let i = 0; i < normalised.length; i += BATCH_SIZE) {
    const batch = normalised.slice(i, i + BATCH_SIZE)
    const promises = batch.map((recipient) =>
      sendWhatsAppTemplate({
        phoneNumberId,
        accessToken,
        to: recipient.phone,
        templateName,
        templateLanguage,
        recipientName: recipient.name ?? 'Respondent',
        surveyUrl,
      })
    )
    const batchResults = await Promise.allSettled(promises)
    batchResults.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        results.push({ phone: batch[idx].phone, ...result.value })
      } else {
        results.push({ phone: batch[idx].phone, status: 'failed', error: String(result.reason) })
      }
    })

    // Rate limit pause between batches
    if (i + BATCH_SIZE < normalised.length) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  const sent = results.filter((r) => r.status === 'sent').length
  const failed = results.filter((r) => r.status === 'failed').length

  return NextResponse.json({
    waveId,
    summary: { total: recipients.length, sent, failed },
    results,
  })
}

// ─── Send a single WhatsApp template message ──────────────────────────────────

async function sendWhatsAppTemplate({
  phoneNumberId,
  accessToken,
  to,
  templateName,
  templateLanguage,
  recipientName,
  surveyUrl,
}: {
  phoneNumberId: string
  accessToken: string
  to: string
  templateName: string
  templateLanguage: string
  recipientName: string
  surveyUrl: string
}): Promise<{ status: 'sent' | 'failed'; messageId?: string; error?: string }> {
  const url = `${META_BASE}/${phoneNumberId}/messages`

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: templateLanguage },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: recipientName },
            { type: 'text', text: surveyUrl },
          ],
        },
        // CTA button component — Meta template must have a URL button
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: surveyUrl }],
        },
      ],
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    return {
      status: 'failed',
      error: data.error?.message ?? `HTTP ${res.status}`,
    }
  }

  return {
    status: 'sent',
    messageId: data.messages?.[0]?.id,
  }
}

// ─── Demo response ────────────────────────────────────────────────────────────

function buildDemoResponse(recipients: { phone: string; name?: string }[]) {
  return {
    waveId: 'demo',
    summary: { total: recipients.length, sent: recipients.length, failed: 0 },
    results: recipients.map((r, i) => ({
      phone: r.phone,
      messageId: `wamid.demo_${Date.now()}_${i}`,
      status: 'sent',
    })),
    demo: true,
    note: 'WhatsApp not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env.local',
  }
}
