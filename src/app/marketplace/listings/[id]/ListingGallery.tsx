'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ListingGallery({ images }: { images: { id: string; media_url: string }[] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]?.media_url || null)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-slate-100 rounded-xl flex items-center justify-center text-gray-400 font-medium">
        No screenshot proof uploaded
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Large Image */}
      <div className="relative w-full h-[380px] sm:h-[450px] bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Listing proof"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(img.media_url)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                selectedImage === img.media_url
                  ? 'border-blue-600 ring-2 ring-blue-100'
                  : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.media_url}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
