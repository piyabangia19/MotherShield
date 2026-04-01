import { assessRisk } from './riskAgent'
import { draftReferral } from './referralAgent'
import { findNearestFacility } from './facilityAgent'
import { sendAlert } from './alertAgent'

export async function runAgents(vitals, patient = {}) {
  const facilities = await findNearestFacility()
  const riskResult = await assessRisk(vitals)
  const mergedPatient = { ...(vitals ?? {}), ...(patient ?? {}) }

  const riskLevel = riskResult?.riskLevel
  const isHighOrCritical = riskLevel === 'HIGH' || riskLevel === 'CRITICAL'
  const nearestFacilityName = facilities?.[0]?.name ?? 'nearest hospital'

  if (isHighOrCritical) {
    const [referralResult, alertResult] = await Promise.allSettled([
      draftReferral(mergedPatient, riskResult),
      sendAlert(
        mergedPatient?.name,
        riskResult?.riskLevel,
        nearestFacilityName,
        mergedPatient?.familyPhone
      )
    ])

    const referralLetter = referralResult.status === 'fulfilled' ? referralResult.value : ''
    const alertSent = alertResult.status === 'fulfilled' ? alertResult.value : { success: false }

    return {
      riskResult,
      referralLetter,
      facilities,
      alertSent
    }
  }

  return {
    riskResult,
    referralLetter: '',
    facilities,
    alertSent: { success: false }
  }
}

