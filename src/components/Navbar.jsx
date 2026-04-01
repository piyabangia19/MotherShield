import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex justify-between items-center">
      <Link to="/" className="flex flex-col leading-tight">
        <span className="text-[20px] font-bold text-[#1A237E]">
          <span className="text-[#C62828] mr-1">♥</span>MotherShield
        </span>
        <span className="text-[11px] text-slate-500">Saving mothers, one scan at a time</span>
      </Link>
      <div className="flex gap-3 items-center">
        <Link to="/dashboard" className="text-slate-600 text-sm hover:text-slate-900">Dashboard</Link>
        <Link to="/intake" className="bg-[#C62828] text-white px-4 py-2 rounded-full text-sm font-semibold">
          New Assessment
        </Link>
      </div>
    </nav>
  )
}