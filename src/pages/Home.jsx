import { Link } from 'react-router-dom'

const stats = [
  '295,000 deaths prevented globally',
  '1M ASHA workers supported',
  '37% fewer complications'
]

const features = [
  {
    title: 'Risk Assessment',
    text: 'AI evaluates maternal vitals instantly and classifies risk level for fast triage.'
  },
  {
    title: 'Instant Referral',
    text: 'Auto-generated referral letters and nearest hospital discovery reduce treatment delay.'
  },
  {
    title: 'Family Alerts',
    text: 'Critical cases can trigger emergency family notifications with next-step guidance.'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A237E] to-[#0D47A1] text-white px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Every mother deserves to come home</h1>
          <p className="text-slate-200 text-lg md:text-xl mb-8">
            AI-powered maternal risk assessment for frontline health workers
          </p>
          <Link
            to="/intake"
            className="inline-block bg-[#C62828] hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl text-lg"
          >
            Start New Assessment
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-red-700/20 [clip-path:polygon(0_35%,15%_55%,30%_35%,45%_55%,60%_35%,75%_55%,90%_35%,100%_55%,100%_100%,0_100%)]" />
      </section>

      <section className="max-w-6xl mx-auto px-6 -mt-10 md:-mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat} className="app-card p-5 text-center font-semibold text-[#1A237E]">
              {stat}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
          {features.map((feature) => (
            <div key={feature.title} className="app-card p-6">
              <h3 className="text-lg font-bold text-[#1A237E] mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}