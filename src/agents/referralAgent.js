import { callAI } from '../hooks/useAI'

export async function draftReferral(patient, riskResult) {
  const systemPrompt =
    'You are a medical documentation specialist. Write a formal referral letter for a high-risk pregnant patient.'

  const safePatient = patient ?? {}
  const safeRisk = riskResult ?? {}

  const patientAge = safePatient.patientAge ?? safePatient.age ?? ''

  const vitalsText = Object.entries(safePatient)
    .filter(([key]) => key !== 'age' && key !== 'patientAge')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  const complications = Array.isArray(safeRisk.complications) ? safeRisk.complications : []
  const complicationsText = complications.map((c) => `- ${c}`).join('\n')

  const riskLevel = safeRisk.riskLevel ?? ''

  const userMessage = [
    `Patient Age: ${patientAge}`,
    '',
    'All Vitals:',
    vitalsText || '(none provided)',
    '',
    `Risk Level: ${riskLevel}`,
    'Complications:',
    complicationsText || '(none provided)'
  ].join('\n')

  const letter = await callAI(systemPrompt, userMessage)
  return letter
}

