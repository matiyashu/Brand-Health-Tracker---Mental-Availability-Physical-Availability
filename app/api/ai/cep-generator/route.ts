/**
 * Fortuna — AI CEP Generator
 * Phase 5 · Uses Anthropic Claude to generate CBM-compliant Category Entry Points
 *
 * POST /api/ai/cep-generator
 * Body: { category, country, focalBrand, existingCeps?, mode }
 * mode: 'generate' | 'critique'
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are a CBM (Category-Based Marketing) brand strategy expert trained in
Ehrenberg-Bass principles. Your role is to generate or critique Category Entry Points (CEPs)
for brand health tracking surveys.

STRICT RULES — NEVER violate:
1. CEPs must be binary pick-any format only (no Likert, no scales)
2. CEPs must use plain attribute wording — NEVER modified forms like "most", "best", "more", "least", "worst"
3. CEPs must describe CATEGORY occasions and needs, not brand features
4. CEPs should be framed in the buyer's perspective ("When I...", "For when I...", "A brand that...")
5. Portfolio composition: 60-70% Category Entry Points, ≤30% Baseline competencies, ≤20% Secondary attributes
6. All CEPs must map to a 7W dimension: WHO, WHAT, WHEN, WHERE, WHY, WITH_WHAT, WITH_WHOM

CBM methodology: Design for the category, Analyze for the buyer (non-buyers + light buyers first),
Report for the brand (DJ-normalized comparisons).

Output format: Return a JSON array. Each item has:
{
  "text": "CEP wording (concise, plain language, no superlatives)",
  "type": "CEP" | "BASELINE" | "SECONDARY",
  "dimension": "WHO" | "WHAT" | "WHEN" | "WHERE" | "WHY" | "WITH_WHAT" | "WITH_WHOM",
  "rationale": "1-sentence explanation of why this CEP is relevant for this category"
}`

const CRITIQUE_PROMPT = `You are a CBM compliance auditor. Review the provided CEPs and identify:
1. Any wording violations (superlatives: most, best, more, least, worst, first, only)
2. Portfolio composition issues (should be 60-70% CEP, ≤30% BASELINE, ≤20% SECONDARY)
3. CEPs that describe brand features rather than category occasions
4. Missing 7W dimensions

Return JSON: { "issues": [{"cep": "text", "issue": "description", "severity": "error"|"warning", "suggestion": "fix"}], "compositionCheck": { "cepPct": number, "baselinePct": number, "secondaryPct": number, "compliant": boolean } }`

interface GenerateRequest {
  category: string
  country: string
  focalBrand?: string
  competitorBrands?: string[]
  existingCeps?: { text: string; type: string; dimension?: string }[]
  mode: 'generate' | 'critique'
  count?: number // number of CEPs to generate (default 15)
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Demo mode — return sample CEPs
    return NextResponse.json(buildDemoCeps())
  }

  let body: GenerateRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { category, country, focalBrand, competitorBrands, existingCeps, mode, count = 15 } = body

  if (!category || !country) {
    return NextResponse.json({ error: 'category and country are required' }, { status: 400 })
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey })

    let userMessage: string

    if (mode === 'critique' && existingCeps?.length) {
      userMessage = `Please critique these CEPs for the "${category}" category in ${country}:

${JSON.stringify(existingCeps, null, 2)}

Focus on CBM compliance, wording violations, and portfolio composition.`
    } else {
      userMessage = `Generate ${count} Category Entry Points for brand health tracking in the "${category}" category in ${country}.
${focalBrand ? `Focal brand: ${focalBrand}` : ''}
${competitorBrands?.length ? `Competitor brands: ${competitorBrands.join(', ')}` : ''}
${existingCeps?.length ? `\nExisting CEPs to avoid duplicating:\n${existingCeps.map((c) => c.text).join('\n')}` : ''}

Generate a portfolio mix: approximately ${Math.round(count * 0.65)} CEPs, ${Math.round(count * 0.25)} BASELINE, ${Math.round(count * 0.1)} SECONDARY.
Cover all 7W dimensions across the CEPs. Return only the JSON array.`
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: mode === 'critique' ? CRITIQUE_PROMPT : SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Extract JSON from response (Claude may wrap in markdown)
    const jsonMatch = textBlock.text.match(/```json\n?([\s\S]*?)\n?```/) ||
      textBlock.text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
    const jsonStr = jsonMatch ? jsonMatch[1] ?? jsonMatch[0] : textBlock.text

    const parsed = JSON.parse(jsonStr)
    return NextResponse.json({ result: parsed, mode, usage: message.usage })
  } catch (err) {
    console.error('[ai/cep-generator] Error:', err)
    return NextResponse.json(
      { error: 'AI generation failed', detail: String(err) },
      { status: 500 }
    )
  }
}

// ─── Demo response (no API key) ───────────────────────────────────────────────

function buildDemoCeps() {
  return {
    result: [
      { text: 'Accepted at places I regularly shop', type: 'CEP', dimension: 'WHERE', rationale: 'Captures physical availability in retail occasions' },
      { text: 'Good for everyday purchases', type: 'CEP', dimension: 'WHEN', rationale: 'High-frequency usage occasion' },
      { text: 'Earns rewards on regular spending', type: 'CEP', dimension: 'WHY', rationale: 'Motivation-based CEP for repeat usage' },
      { text: 'Easy to use when paying online', type: 'CEP', dimension: 'WHERE', rationale: 'Digital channel occasion' },
      { text: 'Suitable for travel and overseas use', type: 'CEP', dimension: 'WHEN', rationale: 'Travel occasion' },
      { text: 'Good for splitting bills with others', type: 'CEP', dimension: 'WITH_WHOM', rationale: 'Social spending occasion' },
      { text: 'Useful for large or planned purchases', type: 'CEP', dimension: 'WHAT', rationale: 'High-value transaction occasion' },
      { text: 'Works well with my mobile wallet', type: 'CEP', dimension: 'WITH_WHAT', rationale: 'Technology integration occasion' },
      { text: 'For when I want to manage my monthly budget', type: 'CEP', dimension: 'WHY', rationale: 'Financial management motivation' },
      { text: 'Gives me peace of mind on transactions', type: 'BASELINE', dimension: 'WHY', rationale: 'Security expectation — table stakes' },
      { text: 'Has clear and fair fees', type: 'BASELINE', dimension: 'WHAT', rationale: 'Transparency expectation' },
      { text: 'Easy to contact customer support', type: 'BASELINE', dimension: 'WHO', rationale: 'Service baseline competency' },
      { text: 'Trusted by people like me', type: 'CEP', dimension: 'WHO', rationale: 'Social identity CEP' },
      { text: 'Has a good loyalty or cashback programme', type: 'SECONDARY', dimension: 'WHY', rationale: 'Secondary equity driver' },
      { text: 'Recommended by family or friends', type: 'CEP', dimension: 'WITH_WHOM', rationale: 'Social influence CEP' },
    ],
    mode: 'generate',
    demo: true,
  }
}
