/**
 * Fortuna — Distribution tRPC Router
 * Phase 6 · Manages survey distribution jobs (email + WhatsApp)
 */

import { z } from 'zod'
import { router, publicProcedure } from '../init'

const RecipientSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
})

export const distributionRouter = router({
  /**
   * Send survey invitations via email and/or WhatsApp
   */
  send: publicProcedure
    .input(
      z.object({
        waveId: z.string(),
        projectName: z.string().optional(),
        waveLabel: z.string().optional(),
        surveyUrl: z.string().url('Must be a valid URL'),
        channels: z.array(z.enum(['email', 'whatsapp'])).min(1, 'Select at least one channel'),
        recipients: z.array(RecipientSchema).min(1, 'At least one recipient required'),
        subject: z.string().optional(),
        fromName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { waveId, surveyUrl, channels, recipients, projectName, waveLabel, subject, fromName } =
        input

      const results: {
        channel: 'email' | 'whatsapp'
        summary: { total: number; sent: number; failed: number }
      }[] = []

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

      // ─── Email channel ──────────────────────────────────────────────────────
      if (channels.includes('email')) {
        const emailRecipients = recipients.filter((r) => r.email)
        if (emailRecipients.length > 0) {
          const res = await fetch(`${baseUrl}/api/distribution/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              waveId,
              recipients: emailRecipients.map((r) => ({ email: r.email!, name: r.name })),
              surveyUrl,
              projectName,
              waveLabel,
              subject,
              fromName,
            }),
          })
          const data = await res.json()
          results.push({ channel: 'email', summary: data.summary ?? { total: 0, sent: 0, failed: 0 } })
        }
      }

      // ─── WhatsApp channel ───────────────────────────────────────────────────
      if (channels.includes('whatsapp')) {
        const waRecipients = recipients.filter((r) => r.phone)
        if (waRecipients.length > 0) {
          const res = await fetch(`${baseUrl}/api/distribution/whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              waveId,
              recipients: waRecipients.map((r) => ({ phone: r.phone!, name: r.name })),
              surveyUrl,
            }),
          })
          const data = await res.json()
          results.push({
            channel: 'whatsapp',
            summary: data.summary ?? { total: 0, sent: 0, failed: 0 },
          })
        }
      }

      const totalSent = results.reduce((s, r) => s + r.summary.sent, 0)
      const totalFailed = results.reduce((s, r) => s + r.summary.failed, 0)

      return {
        waveId,
        channels: results,
        totalSent,
        totalFailed,
        success: totalFailed === 0,
      }
    }),

  /**
   * Preview a parsed recipient list from CSV text
   * CSV format: name,email,phone (header row required)
   */
  parseRecipientCsv: publicProcedure
    .input(z.object({ csv: z.string() }))
    .mutation(({ input }) => {
      const lines = input.csv.trim().split('\n')
      if (lines.length < 2) {
        return { recipients: [], errors: ['CSV must have a header row and at least one data row'] }
      }

      const header = lines[0].toLowerCase().split(',').map((h) => h.trim())
      const nameIdx = header.indexOf('name')
      const emailIdx = header.indexOf('email')
      const phoneIdx = header.indexOf('phone')

      if (emailIdx === -1 && phoneIdx === -1) {
        return {
          recipients: [],
          errors: ['CSV must have at least an "email" or "phone" column'],
        }
      }

      const recipients: { name?: string; email?: string; phone?: string }[] = []
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
        const recipient: { name?: string; email?: string; phone?: string } = {}

        if (nameIdx >= 0 && cols[nameIdx]) recipient.name = cols[nameIdx]
        if (emailIdx >= 0 && cols[emailIdx]) {
          const email = cols[emailIdx]
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            recipient.email = email
          } else {
            errors.push(`Row ${i + 1}: invalid email "${email}"`)
          }
        }
        if (phoneIdx >= 0 && cols[phoneIdx]) recipient.phone = cols[phoneIdx]

        if (recipient.email || recipient.phone) {
          recipients.push(recipient)
        } else if (!errors.some((e) => e.includes(`Row ${i + 1}`))) {
          errors.push(`Row ${i + 1}: no valid email or phone found`)
        }
      }

      return { recipients, errors }
    }),
})
