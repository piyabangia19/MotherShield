import { Link } from 'react-router-dom'

function getAssessments() {
  return JSON.parse(localStorage.getItem('motherShieldAssessments') || '[]')
}

function getFollowUps() {
  return JSON.parse(localStorage.getItem('motherShieldFollowUps') || '[]')
}

export default function Dashboard() {
  const assessments = getAssessments()
  const followUps = getFollowUps()
  const now = new Date()

  const counts = assessments.reduce(
    (acc, item) => {
      acc.total += 1
      if (item.riskLevel === 'CRITICAL') acc.critical += 1
      if (item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL') acc.referred += 1
      acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1
      return acc
    },
    { total: 0, critical: 0, referred: 0, pending: followUps.filter((f) => !f.completed).length, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
  )

  const bars = [
    { label: 'LOW', value: counts.LOW, color: '#2E7D32' },
    { label: 'MEDIUM', value: counts.MEDIUM, color: '#F59E0B' },
    { label: 'HIGH', value: counts.HIGH, color: '#EA580C' },
    { label: 'CRITICAL', value: counts.CRITICAL, color: '#C62828' }
  ]
  const maxBar = Math.max(...bars.map((b) => b.value), 1)

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-[#1A237E]">Health Worker Dashboard</h1>
            <p className="text-slate-500">{now.toDateString()}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="app-card p-4"><div className="text-slate-500 text-sm">Total Assessments</div><div className="text-2xl font-bold">{counts.total}</div></div>
          <div className="app-card p-4"><div className="text-slate-500 text-sm">Critical Cases</div><div className="text-2xl font-bold text-[#C62828]">{counts.critical}</div></div>
          <div className="app-card p-4"><div className="text-slate-500 text-sm">Referred This Month</div><div className="text-2xl font-bold">{counts.referred}</div></div>
          <div className="app-card p-4"><div className="text-slate-500 text-sm">Pending Follow-ups</div><div className="text-2xl font-bold">{counts.pending}</div></div>
        </section>

        <section className="app-card p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Risk Level Distribution</h2>
          <svg viewBox="0 0 500 220" className="w-full h-[220px]">
            {bars.map((bar, idx) => {
              const barHeight = (bar.value / maxBar) * 140
              const x = 40 + idx * 110
              const y = 180 - barHeight
              return (
                <g key={bar.label}>
                  <rect x={x} y={y} width="60" height={barHeight} fill={bar.color} rx="8" />
                  <text x={x + 30} y={195} textAnchor="middle" fontSize="12" fill="#334155">{bar.label}</text>
                  <text x={x + 30} y={y - 8} textAnchor="middle" fontSize="12" fill="#0F172A">{bar.value}</text>
                </g>
              )
            })}
          </svg>
        </section>

        <section className="app-card p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Patient History</h2>
          {assessments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 mb-4">No assessments yet. Start your first assessment.</p>
              <Link to="/intake" className="inline-block bg-[#C62828] text-white px-4 py-2 rounded-lg">Start your first assessment</Link>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-200">
                    <th className="py-2">Date</th>
                    <th className="py-2">Risk Level</th>
                    <th className="py-2">Vitals Summary</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.slice(0, 12).map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-2">{new Date(item.date).toLocaleString()}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : item.riskLevel === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                        }`}>
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="py-2 text-slate-600">
                        BP {item.vitals?.systolicBP}/{item.vitals?.diastolicBP}, Hb {item.vitals?.hemoglobin}
                      </td>
                      <td className="py-2 text-[#1A237E]">Stored</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}