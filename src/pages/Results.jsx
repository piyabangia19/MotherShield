import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { runAgents } from '../agents/orchestrator'
import { exportDangerSignsCard, exportReferralPDF } from '../utils/pdfExport'

export default function Results() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const savedRef = useRef(false)
  const state = location.state ?? {}
  const vitals = state.vitals ?? state
  const patient = state.patient ?? {}

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const runResult = await runAgents(vitals, patient)
        if (!cancelled) {
          setResult(runResult)
        }
      } catch (error) {
        if (!cancelled) {
          setResult({
            riskResult: {
              riskLevel: 'HIGH',
              explanation: `Failed to run assessment: ${error?.message ?? 'Unknown error'}`
            },
            referralLetter: '',
            facilities: [],
            alertSent: { success: false }
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [location.state, patient, vitals])

  const riskResult = result?.riskResult ?? result
  const riskLevel = riskResult?.riskLevel ?? 'MEDIUM'
  const isHighOrCritical = riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
  const patientForPdf = useMemo(
    () => ({
      age: vitals?.patientAge,
      gestationalWeeks: vitals?.gestationalWeeks,
      previousBirths: vitals?.previousBirths,
      previousComplications: vitals?.previousComplications,
      name: patient?.name || 'Patient',
      systolicBP: vitals?.systolicBP,
      diastolicBP: vitals?.diastolicBP,
      hemoglobin: vitals?.hemoglobin,
      bodyTemp: vitals?.bodyTemp
    }),
    [patient?.name, vitals]
  )

  useEffect(() => {
    if (!result || savedRef.current) return
    const history = JSON.parse(localStorage.getItem('motherShieldAssessments') || '[]')
    history.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      riskLevel,
      vitals,
      explanation: riskResult?.explanation ?? '',
      facilities: result?.facilities ?? []
    })
    localStorage.setItem('motherShieldAssessments', JSON.stringify(history.slice(0, 100)))
    savedRef.current = true
  }, [result, riskLevel, vitals, riskResult?.explanation])

  function handleGetDirections(facility) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleShareWhatsapp() {
    const summary = `MotherShield risk result for ${patientForPdf.name}: ${riskLevel}. ${riskResult?.explanation ?? ''}`
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank')
  }

  function handleScheduleFollowUp() {
    const days = Number(riskResult?.followUpDays ?? 3)
    const target = new Date()
    target.setDate(target.getDate() + days)
    const data = JSON.parse(localStorage.getItem('motherShieldFollowUps') || '[]')
    data.unshift({
      id: Date.now(),
      patientName: patientForPdf.name,
      riskLevel,
      date: target.toISOString(),
      completed: false
    })
    localStorage.setItem('motherShieldFollowUps', JSON.stringify(data.slice(0, 100)))
    alert(`Follow-up saved for ${target.toDateString()}`)
  }

  const bannerClass =
    riskLevel === 'CRITICAL'
      ? 'bg-gradient-to-r from-red-700 to-red-500 text-white animate-pulse'
      : riskLevel === 'HIGH'
        ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white'
        : riskLevel === 'MEDIUM'
          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900'
          : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white'

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-200 border-t-red-700" />
            <div className="text-slate-700 font-medium animate-pulse">Running AI analysis...</div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-5">
          <div className={`rounded-2xl p-6 shadow-sm ${bannerClass}`}>
            <div className="text-sm font-semibold uppercase tracking-wide opacity-90">Risk Level</div>
            <div className="text-4xl font-extrabold leading-tight">
              {riskLevel === 'CRITICAL' ? '⚠ CRITICAL' : `${riskLevel} RISK`}
            </div>
          </div>

          <div className="app-card p-6">
            <div className="text-lg font-semibold text-slate-900 mb-2">🤖 AI Explanation</div>
            <p className="text-slate-700 text-[16px] whitespace-pre-wrap">
              {riskResult?.explanation ||
                (riskResult
                  ? JSON.stringify(riskResult, null, 2)
                  : 'No explanation available.')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => exportReferralPDF(patientForPdf, riskResult, result?.referralLetter)}
              className="px-4 py-2 rounded-lg bg-[#C62828] text-white font-semibold"
            >
              Download Referral PDF
            </button>
            <button
              type="button"
              onClick={() => exportDangerSignsCard(patientForPdf, riskResult)}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold"
            >
              Download Danger Signs Card
            </button>
            <button
              type="button"
              onClick={handleShareWhatsapp}
              className="px-4 py-2 rounded-lg bg-[#2E7D32] text-white font-semibold"
            >
              Share via WhatsApp
            </button>
          </div>

          {isHighOrCritical && (
            <div className="app-card p-6">
              <div className="text-lg font-semibold text-slate-900 mb-4">Referral Letter</div>
              <div className="max-h-72 overflow-auto rounded-lg bg-slate-50 border border-slate-100 p-4">
                <pre className="whitespace-pre-wrap text-slate-800 text-sm">
                  {result?.referralLetter || '(Referral letter not available.)'}
                </pre>
              </div>
            </div>
          )}

          <div className="app-card p-6">
            <div className="text-lg font-semibold text-slate-900 mb-4">Nearest Maternity Hospitals</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(result?.facilities ?? []).slice(0, 3).map((facility, idx) => (
                <div key={`${facility.name}-${idx}`} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-semibold text-slate-900">{facility.name}</div>
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 whitespace-nowrap">
                      {facility.distance ?? 'N/A'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mb-1">{facility.state}, {facility.district}</div>
                  <div className="text-sm text-slate-700 mb-2">
                    Phone:{' '}
                    <a className="text-blue-700 hover:underline" href={`tel:${facility.phone}`}>
                      {facility.phone ?? 'N/A'}
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${facility.hasICU ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      ICU {facility.hasICU ? 'Available' : 'Unavailable'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${facility.hasBloodBank ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      Blood Bank {facility.hasBloodBank ? 'Available' : 'Unavailable'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      Beds: {facility.beds ?? 'N/A'}
                    </span>
                  </div>

                  <button type="button" onClick={() => handleGetDirections(facility)} className="w-full px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm">
                    Get Directions
                  </button>
                </div>
              ))}
            </div>
            {(!result?.facilities || result.facilities.length === 0) && (
              <div className="text-sm text-gray-500 mt-4">No facilities available for the current risk level.</div>
            )}
          </div>

          <button
            type="button"
            onClick={handleScheduleFollowUp}
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-[#1A237E] text-white font-semibold"
          >
            Schedule Follow-up
          </button>

          {isHighOrCritical && result?.alertSent?.success && (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 border border-green-200 font-semibold">
              SMS sent successfully
            </div>
          )}
        </div>
      )}
    </div>
  )
}