import { callAI } from '../hooks/useAI'

export async function assessRisk(vitals) {
  const systemPrompt =
    'You are a maternal health specialist. Analyze these vitals and respond with ONLY a raw JSON object, no markdown, no code blocks, no extra text. Just the JSON.\n' +
    '\n' +
    'Format: {"riskLevel":"HIGH","explanation":"Blood pressure 168/112 indicates severe preeclampsia. Hemoglobin 6.8 shows severe anaemia.","complications":["Eclampsia","Haemorrhage"],"immediateActions":["Refer to hospital immediately","Call 108"],"followUpDays":1}\n' +
    '\n' +
    'riskLevel must be one of: LOW, MEDIUM, HIGH, CRITICAL. Be aggressive with risk assessment — high BP + low hemoglobin + young age = CRITICAL.'

  const safeVitals = vitals ?? {}
  const vitalsText = Object.entries(safeVitals)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  try {
    const responseText = await callAI(systemPrompt, `Patient vitals:\n${vitalsText}`)
    const cleaned = responseText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed?.riskLevel)
        ? parsed.riskLevel
        : 'HIGH',
      explanation: typeof parsed?.explanation === 'string' ? parsed.explanation : 'No explanation provided.',
      complications: Array.isArray(parsed?.complications) ? parsed.complications : [],
      immediateActions: Array.isArray(parsed?.immediateActions) ? parsed.immediateActions : [],
      followUpDays: Number.isFinite(parsed?.followUpDays) ? parsed.followUpDays : 1
    }
  } catch {
    return {
      riskLevel: 'HIGH',
      explanation:
        'I could not reliably interpret the provided vitals. Based on this uncertainty, the safest approach is to treat the situation as high risk and seek prompt clinical review.',
      complications: ['Uncertain clinical risk due to parsing/response format issues'],
      immediateActions: [
        'Contact a clinician or emergency service for urgent assessment',
        'Re-check vital measurements and confirm units'
      ],
      followUpDays: 1
    }
  }
}

