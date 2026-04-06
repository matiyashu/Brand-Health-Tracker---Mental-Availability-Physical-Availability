/**
 * Fortuna — Email Survey Distribution
 * Phase 6 · Resend (primary) + nodemailer SMTP (fallback)
 *
 * POST /api/distribution/email
 * Body: { waveId, recipients, surveyUrl, subject?, fromName? }
 *
 * .env.local keys:
 *   RESEND_API_KEY          — Resend API key (preferred)
 *   SMTP_HOST               — SMTP server host (fallback)
 *   SMTP_PORT               — SMTP port (default 587)
 *   SMTP_USER               — SMTP username
 *   SMTP_PASS               — SMTP password
 *   EMAIL_FROM              — Sender email address
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface EmailRequest {
  waveId: string
  recipients: { email: string; name?: string }[]
  surveyUrl: string
  subject?: string
  fromName?: string
  projectName?: string
  waveLabel?: string
}

interface SendResult {
  email: string
  messageId?: string
  status: 'sent' | 'failed'
  error?: string
}

export async function POST(req: NextRequest) {
  let body: EmailRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    waveId,
    recipients,
    surveyUrl,
    subject = 'You\'re invited — share your brand feedback',
    fromName = 'Fortuna Research',
    projectName = 'Brand Health Survey',
    waveLabel = '',
  } = body

  if (!waveId || !recipients?.length || !surveyUrl) {
    return NextResponse.json(
      { error: 'waveId, recipients, and surveyUrl are required' },
      { status: 400 }
    )
  }

  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM ?? 'survey@fortuna-brandhealth.com'

  // Demo mode
  if (!resendKey && !process.env.SMTP_HOST) {
    return NextResponse.json(buildDemoResponse(recipients))
  }

  const results: SendResult[] = []

  if (resendKey) {
    // ─── Resend path ─────────────────────────────────────────────────────────
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(resendKey)

      // Batch: Resend supports up to 100 recipients per call, but we send individually
      // so each email gets personalised content
      const BATCH_SIZE = 20
      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE)
        const promises = batch.map((recipient) =>
          resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: recipient.email,
            subject,
            html: buildEmailHtml({
              recipientName: recipient.name ?? 'Valued Respondent',
              surveyUrl,
              projectName,
              waveLabel,
              fromName,
            }),
          })
        )
        const settled = await Promise.allSettled(promises)
        settled.forEach((r, idx) => {
          if (r.status === 'fulfilled' && !r.value.error) {
            results.push({ email: batch[idx].email, messageId: r.value.data?.id, status: 'sent' })
          } else {
            const err = r.status === 'rejected' ? String(r.reason) : String(r.value.error)
            results.push({ email: batch[idx].email, status: 'failed', error: err })
          }
        })

        if (i + BATCH_SIZE < recipients.length) {
          await new Promise((r) => setTimeout(r, 500))
        }
      }
    } catch (err) {
      console.error('[email] Resend error:', err)
      return NextResponse.json({ error: 'Email sending failed', detail: String(err) }, { status: 500 })
    }
  } else {
    // ─── Nodemailer SMTP path ─────────────────────────────────────────────────
    try {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      for (const recipient of recipients) {
        try {
          const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: recipient.email,
            subject,
            html: buildEmailHtml({
              recipientName: recipient.name ?? 'Valued Respondent',
              surveyUrl,
              projectName,
              waveLabel,
              fromName,
            }),
          })
          results.push({ email: recipient.email, messageId: info.messageId, status: 'sent' })
        } catch (err) {
          results.push({ email: recipient.email, status: 'failed', error: String(err) })
        }
      }
    } catch (err) {
      return NextResponse.json({ error: 'SMTP connection failed', detail: String(err) }, { status: 500 })
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

// ─── Email HTML template ──────────────────────────────────────────────────────

function buildEmailHtml({
  recipientName,
  surveyUrl,
  projectName,
  waveLabel,
  fromName,
}: {
  recipientName: string
  surveyUrl: string
  projectName: string
  waveLabel: string
  fromName: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${projectName} Survey</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:32px 40px;">
            <div style="font-size:22px;font-weight:700;color:#0FA958;letter-spacing:-0.5px;">Fortuna</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:4px;">Brand Health Research</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="font-size:16px;color:#1a1a1a;margin:0 0 12px;">Dear ${recipientName},</p>
            <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 24px;">
              You have been selected to participate in the <strong>${projectName}</strong>${waveLabel ? ` (${waveLabel})` : ''} survey.
              Your feedback helps brands better understand and serve category buyers like you.
            </p>
            <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 32px;">
              The survey takes approximately <strong>5-8 minutes</strong> and all responses are anonymous.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="border-radius:8px;background:#0FA958;">
                  <a href="${surveyUrl}" target="_blank"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                    Start Survey &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size:12px;color:#9ca3af;margin:24px 0 0;">
              Or copy this link into your browser:<br/>
              <a href="${surveyUrl}" style="color:#0FA958;">${surveyUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="font-size:11px;color:#9ca3af;margin:0;">
              This invitation was sent by ${fromName} on behalf of the brand health research programme.
              If you did not expect this email, you may safely disregard it.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

// ─── Demo response ────────────────────────────────────────────────────────────

function buildDemoResponse(recipients: { email: string; name?: string }[]) {
  return {
    waveId: 'demo',
    summary: { total: recipients.length, sent: recipients.length, failed: 0 },
    results: recipients.map((r, i) => ({
      email: r.email,
      messageId: `demo-msg-${Date.now()}-${i}@fortuna`,
      status: 'sent',
    })),
    demo: true,
    note: 'Email not configured. Set RESEND_API_KEY or SMTP_HOST/USER/PASS in .env.local',
  }
}
