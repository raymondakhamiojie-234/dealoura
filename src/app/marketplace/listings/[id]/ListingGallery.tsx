'use client'

import { useState } from 'react'
import { ShieldCheck, ImageOff } from 'lucide-react'

interface ListingGalleryProps {
  images: { id: string; media_url: string; display_order?: number }[]
  platform?: string
  title?: string
}

export default function ListingGallery({ images, platform, title }: ListingGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]?.media_url || null)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  const handleImageError = (url: string) => {
    setFailedImages((prev) => ({ ...prev, [url]: true }))
  }

  // If no images were uploaded at all
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 sm:h-96 bg-[#ebf1f5] rounded-2xl border border-[#d2dde4] flex flex-col items-center justify-center p-6 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#010b13] flex items-center justify-center text-[#ebf1f5] mb-4 shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-[#010b13]">Verified Asset Listing</h4>
        <p className="text-xs text-[#526371] max-w-sm mt-1.5 font-mono">
          {platform ? `${platform} asset details verified.` : 'Digital asset verified.'} Handover credentials supervised by Dealoura Escrow.
        </p>
      </div>
    )
  }

  const isCurrentFailed = selectedImage ? failedImages[selectedImage] : false

  return (
    <div className="space-y-4">
      {/* Main Large Image Container */}
      <div className="relative w-full h-[360px] sm:h-[440px] bg-[#010b13] rounded-2xl overflow-hidden border border-[#d2dde4] flex items-center justify-center shadow-inner">
        {selectedImage && !isCurrentFailed ? (
          <img
            src={selectedImage}
            alt={title || 'Listing proof preview'}
            onError={() => handleImageError(selectedImage)}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#ebf1f5]">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3 text-[#ebf1f5]/70">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-bold text-[#ebf1f5]">{platform || 'Digital Asset'} Proof Screenshot</h5>
            <p className="text-[11px] font-mono text-[#ebf1f5]/70 mt-1 max-w-xs">
              Direct account analytics &amp; ownership transfer supervised by Dealoura Escrow.
            </p>
          </div>
        )}

        {/* Platform watermark badge */}
        <div className="absolute bottom-3 right-3 bg-[#010b13]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono text-[#ebf1f5] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Proof</span>
        </div>
      </div>

      {/* Thumbnails Row (if multiple images uploaded) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => {
            const isSelected = selectedImage === img.media_url
            const hasFailed = failedImages[img.media_url]

            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedImage(img.media_url)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition bg-[#ebf1f5] ${
                  isSelected
                    ? 'border-[#010b13] ring-2 ring-[#010b13]/20'
                    : 'border-[#d2dde4] hover:border-[#010b13]/50 opacity-75 hover:opacity-100'
                }`}
              >
                {!hasFailed ? (
                  <img
                    src={img.media_url}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={() => handleImageError(img.media_url)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#526371] text-[10px] font-mono">
                    <ImageOff className="w-4 h-4" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
