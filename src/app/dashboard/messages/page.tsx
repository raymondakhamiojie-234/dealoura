import { MessageSquare, ShieldCheck } from 'lucide-react'

export default function InboxEmptyState() {
  return (
    <div className="flex-1 bg-[#ffffff] rounded-2xl shadow-xs border border-[#d2dde4] flex flex-col items-center justify-center p-8 text-center h-full">
      <div className="w-14 h-14 bg-[#010b13] text-[#ebf1f5] rounded-2xl flex items-center justify-center mb-4 shadow-xs">
        <MessageSquare className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-black text-[#010b13] mb-1">Select a Conversation</h3>
      <p className="text-xs text-[#526371] max-w-sm leading-relaxed">
        Choose a negotiation thread from the left sidebar to coordinate asset inspection, escrow verification, or pricing details.
      </p>
      <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ebf1f5] border border-[#d2dde4] text-[11px] font-mono font-bold text-[#010b13]">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>End-to-End Dealoura Escrow Monitored</span>
      </div>
    </div>
  )
}
