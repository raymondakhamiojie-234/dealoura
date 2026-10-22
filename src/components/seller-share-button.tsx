'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export function SellerShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        const url = window.location.href
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      }
    } catch {
      // Fallback
    }
  }

  return (
    <button
      onClick={handleShare}
      type="button"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
      title="Copy profile link"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-gray-500" />
          <span>Share Profile</span>
        </>
      )}
    </button>
  )
}
