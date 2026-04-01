import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import thresholds from '../data/thresholds.json'

export default function Intake() {
  const navigate = useNavigate()

  const [systolicBP, setSystolicBP] = useState('')
  const [diastolicBP, setDiastolicBP] = useState('')
  const [hemoglobin, setHemoglobin] = useState('')
  const [gestationalWeeks, setGestationalWeeks] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [previousBirths, setPreviousBirths] = useState('')
  const [previousComplications, setPreviousComplications] = useState('')
  const [bodyTemp, setBodyTemp] = useState('')
  const [patientName, setPatientName] = useState('')
  const [familyPhone, setFamilyPhone] = useState('')
  const [userLat, setUserLat] = useState(null)
  const [userLng, setUserLng] = useState(null)
  const [locationStatus, setLocationStatus] = useState('Location not shared yet')
  const [submitting, setSubmitting] = useState(false)

  function getStatus(field, value) {
    const num = Number(value)
    if (!Number.isFinite(num)) return 'Normal'

    if (field === 'hemoglobin') {
      if (num < thresholds.hemoglobin.warning) return 'Danger'
      if (num < thresholds.hemoglobin.normal) return 'Warning'
      return 'Normal'
    }
    if (field === 'gestationalWeeks') {
      if (num < thresholds.gestationalWeeks.preterm) return 'Warning'
      return 'Normal'
    }
    if (field === 'patientAge') {
      if (num < thresholds.patientAge.youngRisk || num > thresholds.patientAge.oldRisk) return 'Warning'
      return 'Normal'
    }
    if (thresholds[field]?.danger !== undefined && num >= thresholds[field].danger) return 'Danger'
    if (thresholds[field]?.warning !== undefined && num >= thresholds[field].warning) return 'Warning'
    return 'Normal'
  }

  function statusClasses(status) {
    if (status === 'Danger') return 'border-l-red-600 bg-red-50'
    if (status === 'Warning') return 'border-l-amber-500 bg-amber-50'
    return 'border-l-green-600 bg-green-50'
  }

  function pillClasses(status) {
    if (status === 'Danger') return 'bg-red-100 text-red-700'
    if (status === 'Warning') return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported in this browser')
      return
    }

    setLocationStatus('Fetching current location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude)
        setUserLng(position.coords.longitude)
        setLocationStatus('Location captured successfully')
      },
      () => {
        setLocationStatus('Unable to fetch location. You can still continue with default location.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    const vitals = {
      systolicBP: Number(systolicBP),
      diastolicBP: Number(diastolicBP),
      hemoglobin: Number(hemoglobin),
      gestationalWeeks: Number(gestationalWeeks),
      patientAge: Number(patientAge),
      previousBirths: Number(previousBirths),
      previousComplications,
      bodyTemp: Number(bodyTemp)
    }

    const patient = {
      name: patientName.trim(),
      familyPhone: familyPhone.trim(),
      patientAge: Number(patientAge),
      userLat,
      userLng,
      ...vitals
    }

    setTimeout(() => {
      navigate('/results', {
        state: {
          vitals,
          patient
        }
      })
    }, 400)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-[680px] app-card p-8 md:p-10">
        <h1 className="text-3xl font-bold mb-1 text-[#1A237E]">New Patient Assessment 🩺</h1>
        <p className="text-sm text-slate-600 mb-6">Enter patient vitals below</p>
        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 p-3 flex items-center justify-between gap-3">
          <div className="text-sm text-blue-800">{locationStatus}</div>
          <button
            type="button"
            onClick={handleGetLocation}
            className="px-3 py-1.5 rounded-md bg-[#1A237E] text-white text-sm hover:bg-indigo-900"
          >
            Use My Location
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Patient Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Family Phone
              </label>
              <input
                type="tel"
                value={familyPhone}
                onChange={(e) => setFamilyPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-3"
              />
            </div>

            <div className={`border-l-4 rounded-md p-2 ${statusClasses(getStatus('systolicBP', systolicBP))}`}>
              <label className="block text-sm font-medium text-gray-700">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                value={systolicBP}
                onChange={(e) => setSystolicBP(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-3"
              />
              <p className="mt-1 text-xs text-gray-500">Normal resting systolic BP is about 90-120 mmHg.</p>
              <span className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${pillClasses(getStatus('systolicBP', systolicBP))}`}>
                {getStatus('systolicBP', systolicBP)}
              </span>
            </div>

            <div className={`border-l-4 rounded-md p-2 ${statusClasses(getStatus('diastolicBP', diastolicBP))}`}>
              <label className="block text-sm font-medium text-gray-700">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                value={diastolicBP}
                onChange={(e) => setDiastolicBP(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-3"
              />
              <p className="mt-1 text-xs text-gray-500">Normal resting diastolic BP is about 60-80 mmHg.</p>
              <span className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${pillClasses(getStatus('diastolicBP', diastolicBP))}`}>
                {getStatus('diastolicBP', diastolicBP)}
              </span>
            </div>

            <div className={`border-l-4 rounded-md p-2 ${statusClasses(getStatus('hemoglobin', hemoglobin))}`}>
              <label className="block text-sm font-medium text-gray-700">
                Hemoglobin (g/dL)
              </label>
              <input
                type="number"
                value={hemoglobin}
                onChange={(e) => setHemoglobin(e.target.value)}
                step="0.1"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-3"
              />
              <span className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${pillClasses(getStatus('hemoglobin', hemoglobin))}`}>
                {getStatus('hemoglobin', hemoglobin)}
              </span>
            </div>

            <div className={`border-l-4 rounded-md p-2 ${statusClasses(getStatus('gestationalWeeks', gestationalWeeks))}`}>
              <label className="block text-sm font-medium text-gray-700">
                Gestational Age (weeks)
              </label>
              <input
                type="number"
                value={gestationalWeeks}
                onChange={(e) => setGestationalWeeks(e.target.value)}
                step="0.1"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-3"
              />
              <span className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${pillClasses(getStatus('gestationalWeeks', gestationalWeeks))}`}>
                {getStatus('gestationalWeeks', gestationalWeeks)}
              </span>
            </div>

            <div className={`border-l-4 rounded-md p-2 ${statusClasses(getStatus('patientAge', patientAge))}`}>
              <label className="block text-sm font-medium text-gray-700">
                Patient Age
              </label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-3"
              />
              <span className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${pillClasses(getStatus('patientAge', patientAge))}`}>
                {getStatus('patientAge', patientAge)}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Previous Births
              </label>
              <input
                type="number"
                value={previousBirths}
                onChange={(e) => setPreviousBirths(e.target.value)}
                step="1"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Previous Complications (if any)
              </label>
              <input
                type="text"
                value={previousComplications}
                onChange={(e) => setPreviousComplications(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-3"
              />
            </div>

            <div className={`md:col-span-2 border-l-4 rounded-md p-2 ${statusClasses(getStatus('bodyTemp', bodyTemp))}`}>
              <label className="block text-sm font-medium text-gray-700">
                Body Temperature (°C)
              </label>
              <input
                type="number"
                value={bodyTemp}
                onChange={(e) => setBodyTemp(e.target.value)}
                step="0.1"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-3"
              />
              <span className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${pillClasses(getStatus('bodyTemp', bodyTemp))}`}>
                {getStatus('bodyTemp', bodyTemp)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#C62828] hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-lg flex items-center justify-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                Analyzing vitals...
              </>
            ) : (
              'Assess Risk Now →'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}