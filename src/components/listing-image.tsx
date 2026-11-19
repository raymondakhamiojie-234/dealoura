'use client'

import { useState } from 'react'

export function ListingImage({
  src,
  alt,
  platform,
  isSold,
}: {
  src?: string | null
  alt: string
  platform?: string
  isSold?: boolean
}) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4 w-full h-full">
        <span className="text-[#010b13] font-black text-base">{platform || 'Digital Asset'}</span>
        <span className="text-[11px] font-mono text-[#526371] mt-1">Verified Escrow Listing</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`w-full h-full object-cover transition-transform duration-500 ${
        isSold ? 'grayscale-[25%]' : 'group-hover:scale-105'
      }`}
    />
  )
}
