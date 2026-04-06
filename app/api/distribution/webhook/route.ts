/**
 * Fortuna — WhatsApp Webhook Handler
 * Phase 6 · Receives delivery receipts and survey link clicks from Meta
 *
 * GET  /api/distribution/webhook  — Meta webhook verification
 * POST /api/distribution/webhook  — Incoming message/status events
 *
 * Set in Meta App Dashboard:
 *   Webhook URL:    https://yourdomain.com/api/distribution/webhook
 *   Verify Token:   WHATSAPP_WEBHOOK_VERIFY_TOKEN (set in .env.local)
 *   Subscribe to:   messages, message_status_updates
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// ─── GET — Meta webhook verification challenge ────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? 'fortuna-webhook-verify'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[webhook] WhatsApp webhook verified')
    return new NextResponse(challenge ?? '', { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ─── POST — Incoming events ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: WhatsAppWebhookPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Acknowledge immediately (Meta requires < 5s response)
  const events = extractEvents(body)
  processEvents(events).catch((err) => console.error('[webhook] Processing error:', err))

  return NextResponse.json({ status: 'ok' })
}

// ─── Extract events from Meta payload ────────────────────────────────────────

interface WhatsAppWebhookPayload {
  object: string
  entry: {
    id: string
    changes: {
      value: {
        messaging_product: string
        metadata: { display_phone_number: string; phone_number_id: string }
        statuses?: { id: string; status: string; timestamp: string; recipient_id: string }[]
        messages?: { id: string; from: string; timestamp: string; type: string; text?: { body: string } }[]
      }
      field: string
    }[]
  }[]
}

interface WebhookEvent {
  type: 'status_update' | 'incoming_message'
  messageId?: string
  phone?: string
  status?: string
  timestamp?: string
  text?: string
}

function extractEvents(payload: WhatsAppWebhookPayload): WebhookEvent[] {
  const events: WebhookEvent[] = []

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value

      // Delivery status updates
      for (const status of value.statuses ?? []) {
        events.push({
          type: 'status_update',
          messageId: status.id,
          phone: status.recipient_id,
          status: status.status, // 'sent' | 'delivered' | 'read' | 'failed'
          timestamp: status.timestamp,
        })
      }

      // Incoming messages (survey replies)
      for (const message of value.messages ?? []) {
        events.push({
          type: 'incoming_message',
          messageId: message.id,
          phone: message.from,
          text: message.text?.body,
          timestamp: message.timestamp,
        })
      }
    }
  }

  return events
}

// ─── Process events asynchronously ───────────────────────────────────────────

async function processEvents(events: WebhookEvent[]) {
  if (!events.length) return

  // Log events — in production, write to DB or analytics service
  for (const event of events) {
    if (event.type === 'status_update') {
      console.log(
        `[webhook] Message ${event.messageId} to ${event.phone}: ${event.status}`
      )
      // TODO: Update distribution log in DB
      // await prisma.distributionLog.updateMany({
      //   where: { messageId: event.messageId },
      //   data: { status: event.status, updatedAt: new Date() }
      // })
    } else if (event.type === 'incoming_message') {
      console.log(`[webhook] Reply from ${event.phone}: ${event.text}`)
      // Auto-reply or route to support
    }
  }
}
