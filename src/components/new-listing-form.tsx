'use client'

import { useState } from 'react'
import { 
  UploadCloud, 
  X, 
  ShieldCheck, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Video,
  Camera,
  MessageCircle,
  Smartphone
} from 'lucide-react'
import { createListing } from '@/app/actions/listings'

const PLATFORMS = [
  { value: 'YouTube', label: 'YouTube Channel', icon: Video },
  { value: 'TikTok', label: 'TikTok Account', icon: Smartphone },
  { value: 'Instagram', label: 'Instagram Page', icon: Camera },
  { value: 'Facebook', label: 'Facebook Page / Group', labelShort: 'FB' },
  { value: 'Twitter / X', label: 'Twitter / X Account', labelShort: '𝕏' },
  { value: 'Discord', label: 'Discord Server', icon: MessageCircle },
  { value: 'Twitch', label: 'Twitch Channel' },
]

const NICHES = [
  'Gaming',
  'Tech & Gadgets',
  'Finance & Crypto',
  'Entertainment & Humor',
  'Fitness & Health',
  'Lifestyle & Vlog',
  'Music & Art',
  'Education',
  'Business & E-commerce',
  'Sports & Outdoors',
  'Travel & Food',
  'Other'
]

export function NewListingForm() {
  const [askingPrice, setAskingPrice] = useState<number | ''>(500)
  const [selectedPlatform, setSelectedPlatform] = useState('YouTube')
  const [isMonetized, setIsMonetized] = useState('false')
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const numPrice = typeof askingPrice === 'number' ? askingPrice : 0
  const escrowFee = Math.round(numPrice * 0.05 * 100) / 100
  const netPayout = Math.max(0, numPrice - escrowFee)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setFormError(null)
    const fileList = Array.from(files)

    // Check individual file sizes (limit to 4.5MB to ensure safe transmission)
    for (const file of fileList) {
      if (file.size > 4.5 * 1024 * 1024) {
        setFormError(`Image "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Please select images under 4.5MB for fast upload.`)
        e.target.value = ''
        setPreviews([])
        return
      }
    }

    const newPreviews: { name: string; url: string }[] = []
    const selected = fileList.slice(0, 5)

    selected.forEach((file) => {
      newPreviews.push({
        name: file.name,
        url: URL.createObjectURL(file)
      })
    })

    setPreviews(newPreviews)
  }

  return (
    <form 
      action={async (formData: FormData) => {
        setIsSubmitting(true)
        setFormError(null)
        try {
          const res = await createListing(formData)
          if (res?.error) {
            setIsSubmitting(false)
            setFormError(res.error)
          } else if (res?.listingId) {
            window.location.href = `/marketplace/listings/${res.listingId}`
          }
        } catch (err: any) {
          setIsSubmitting(false)
          setFormError(err.message || 'Server error uploading listing. Please try smaller images or check your connection.')
        }
      }}
      className="space-y-8"
    >
      {formError && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-xs text-red-800 font-medium flex items-center justify-between gap-3">
          <span>{formError}</span>
          <button
            type="button"
            onClick={() => setFormError(null)}
            className="text-red-500 hover:text-red-700 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* 1. Platform & Handle Selection */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d2dde4] shadow-xs space-y-6">
        <div className="border-b border-[#d2dde4] pb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#010b13] bg-[#ebf1f5] px-2.5 py-0.5 rounded-full border border-[#d2dde4]">
            Step 1 of 4
          </span>
          <h2 className="text-lg font-bold text-[#010b13] mt-2">
            Select Platform &amp; Account Identity
          </h2>
          <p className="text-xs text-[#526371] mt-0.5">
            Identify the digital property you want to list for escrow sale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="platform" className="block text-xs font-bold text-[#010b13]">
              Platform <span className="text-rose-500">*</span>
            </label>
            <select
              name="platform"
              id="platform"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              required
              className="w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm py-2.5 px-3 focus:bg-white focus:border-[#010b13] outline-none transition"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="account_handle" className="block text-xs font-bold text-[#010b13]">
              Account Handle or Public URL <span className="text-[#526371] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="account_handle"
              id="account_handle"
              placeholder="e.g. @TechReviews or youtube.com/@tech"
              className="w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm py-2.5 px-3 focus:bg-white focus:border-[#010b13] outline-none transition placeholder:text-[#526371]"
            />
          </div>
        </div>
      </div>

      {/* 2. Listing Title & Category */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d2dde4] shadow-xs space-y-6">
        <div className="border-b border-[#d2dde4] pb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#010b13] bg-[#ebf1f5] px-2.5 py-0.5 rounded-full border border-[#d2dde4]">
            Step 2 of 4
          </span>
          <h2 className="text-lg font-bold text-[#010b13] mt-2">
            Listing Title &amp; Audience Demographics
          </h2>
          <p className="text-xs text-[#526371] mt-0.5">
            Accurate metrics attract serious buyers and accelerate escrow approval.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-xs font-bold text-[#010b13]">
            Listing Headline / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            placeholder="e.g. 150K Monetized Gaming Channel (US Audience, Strike-Free)"
            className="w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm py-2.5 px-3 focus:bg-white focus:border-[#010b13] outline-none transition placeholder:text-[#526371]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="followers_count" className="block text-xs font-bold text-[#010b13]">
              Followers / Subscribers <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="followers_count"
              id="followers_count"
              min="0"
              required
              placeholder="e.g. 50000"
              className="w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm py-2.5 px-3 focus:bg-white focus:border-[#010b13] outline-none transition placeholder:text-[#526371]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="niche" className="block text-xs font-bold text-[#010b13]">
              Primary Niche <span className="text-rose-500">*</span>
            </label>
            <select
              name="niche"
              id="niche"
              required
              className="w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm py-2.5 px-3 focus:bg-white focus:border-[#010b13] outline-none transition"
            >
              {NICHES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="monetized" className="block text-xs font-bold text-[#010b13]">
              Monetization Status <span className="text-rose-500">*</span>
            </label>
            <select
              name="monetized"
              id="monetized"
              value={isMonetized}
              onChange={(e) => setIsMonetized(e.target.value)}
              required
              className="w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm py-2.5 px-3 focus:bg-white focus:border-[#010b13] outline-none transition"
            >
              <option value="true">Monetized (Active Revenue)</option>
              <option value="false">Not Monetized</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-xs font-bold text-[#010b13]">
            Account Description &amp; Verification Details <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            required
            placeholder="Describe the channel history, top viewer countries (e.g. 60% US / 20% UK), copyright cleanliness, monthly revenue, and reason for selling..."
            className="w-full rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm py-2.5 px-3 focus:bg-white focus:border-[#010b13] outline-none transition placeholder:text-[#526371] leading-relaxed"
          />
        </div>
      </div>

      {/* 3. Asking Price with Live Escrow Calculation */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d2dde4] shadow-xs space-y-6">
        <div className="border-b border-[#d2dde4] pb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#010b13] bg-[#ebf1f5] px-2.5 py-0.5 rounded-full border border-[#d2dde4]">
            Step 3 of 4
          </span>
          <h2 className="text-lg font-bold text-[#010b13] mt-2">
            Asking Price &amp; Seller Payout Calculation
          </h2>
          <p className="text-xs text-[#526371] mt-0.5">
            Transparent 5% escrow fee. No upfront fees to list.
          </p>
        </div>

        <div className="max-w-xs space-y-1.5">
          <label htmlFor="price" className="block text-xs font-bold text-[#010b13]">
            Asking Price (USD) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#526371] text-sm">
              $
            </span>
            <input
              type="number"
              name="price"
              id="price"
              step="1"
              min="10"
              required
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="500"
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-base font-bold focus:bg-white focus:border-[#010b13] outline-none transition"
            />
          </div>
        </div>

        {/* Dynamic Payout Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#ebf1f5] p-4 rounded-2xl border border-[#d2dde4]">
            <span className="text-[11px] font-medium text-[#526371] block">Buyer Deposit</span>
            <span className="text-lg font-black text-[#010b13] font-mono mt-1 block">
              ${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[#526371]">Gross purchase price</span>
          </div>

          <div className="bg-[#ebf1f5] p-4 rounded-2xl border border-[#d2dde4]">
            <span className="text-[11px] font-medium text-[#526371] block">Dealoura Escrow Fee (5%)</span>
            <span className="text-lg font-black text-rose-600 font-mono mt-1 block">
              -${escrowFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[#526371]">Covers 2FA audit &amp; wire</span>
          </div>

          <div className="bg-[#010b13] text-[#ebf1f5] p-4 rounded-2xl border border-[#010b13]">
            <span className="text-[11px] font-bold text-[#ebf1f5]/80 block">Your Net Payout</span>
            <span className="text-xl font-black text-white font-mono mt-1 block">
              ${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[#ebf1f5]/70">0% chargeback risk</span>
          </div>
        </div>
      </div>

      {/* 4. Proof Screenshots Upload */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d2dde4] shadow-xs space-y-6">
        <div className="border-b border-[#d2dde4] pb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#010b13] bg-[#ebf1f5] px-2.5 py-0.5 rounded-full border border-[#d2dde4]">
            Step 4 of 4
          </span>
          <h2 className="text-lg font-bold text-[#010b13] mt-2">
            Upload Analytics Proof Screenshots
          </h2>
          <p className="text-xs text-[#526371] mt-0.5">
            Upload up to 5 screenshots proving ownership, subscriber counts, analytics, and monetization standing.
          </p>
        </div>

        <div className="border-2 border-dashed border-[#d2dde4] hover:border-[#010b13] transition rounded-2xl p-8 text-center cursor-pointer bg-[#ebf1f5] relative">
          <input
            type="file"
            name="images"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center pointer-events-none">
            <UploadCloud className="w-12 h-12 text-[#010b13] mb-2" />
            <span className="text-sm font-bold text-[#010b13]">
              Click to select images or drag and drop
            </span>
            <span className="text-xs text-[#526371] mt-1">PNG, JPG, WEBP up to 10MB each (max 5)</span>
          </div>
        </div>

        {/* Live Upload Previews */}
        {previews.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#010b13]">Selected Files ({previews.length}):</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {previews.map((prev, index) => (
                <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#d2dde4] bg-white">
                  <img src={prev.url} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-[#010b13]/80 text-[#ebf1f5] text-[9px] font-mono px-1.5 py-0.5 rounded">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submission Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-[#526371]">
          <ShieldCheck className="w-4 h-4 text-[#010b13]" />
          <span>Every listing is verified by a Dealoura Escrow Agent before going live.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="submit"
            name="action"
            value="draft"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#d2dde4] bg-white hover:bg-[#d2dde4] text-[#010b13] font-bold text-xs transition cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            name="action"
            value="pending"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#010b13] hover:bg-[#0a1722] text-[#ebf1f5] font-black text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Publishing Listing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#ebf1f5]" />
                <span>Publish for Escrow Review</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
