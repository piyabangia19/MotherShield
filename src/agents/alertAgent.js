export async function sendAlert(patientName, riskLevel, facilityName, familyPhone) {
  const sid = import.meta.env.VITE_TWILIO_SID
  const token = import.meta.env.VITE_TWILIO_TOKEN
  const from = import.meta.env.VITE_TWILIO_FROM

  if (!sid || sid === 'paste_your_sid_here') {
    return { success: false, reason: 'Twilio not configured' }
  }

  if (!familyPhone) {
    return { success: false, reason: 'Missing family phone number' }
  }

  try {
    if (!token || !from) {
      throw new Error('Missing Twilio credentials in VITE_TWILIO_SID/VITE_TWILIO_TOKEN/VITE_TWILIO_FROM')
    }

    if (typeof btoa !== 'function') {
      throw new Error('btoa is not available in this runtime')
    }

    const auth = btoa(`${sid}:${token}`)

    const message =
      `URGENT: ${patientName} has been assessed as ${riskLevel} risk. ` +
      `Please take her to ${facilityName} immediately. - MotherShield`

    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
    const form = new URLSearchParams({
      To: familyPhone,
      From: from,
      Body: message
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`Twilio API error: ${response.status} ${response.statusText} ${errorText}`)
    }

    return { success: true }
  } catch (error) {
    return { success: false, reason: error?.message ?? 'Twilio request failed' }
  }
}

