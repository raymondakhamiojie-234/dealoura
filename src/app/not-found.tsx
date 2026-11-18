import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#ebf1f5] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-[#010b13] text-[#ebf1f5] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4]">
            404 Error
          </span>
          <h1 className="text-2xl font-black text-[#010b13] mt-2">Page Not Found</h1>
          <p className="text-xs text-[#526371] mt-1.5 leading-relaxed">
            The page or digital asset listing you are searching for does not exist or has been removed.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}
