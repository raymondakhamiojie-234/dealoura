'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Check, 
  ArrowUpDown, 
  Sparkles,
  LayoutGrid,
  Video,
  Camera,
  MessageCircle,
  Smartphone
} from 'lucide-react'

const PLATFORMS = [
  { name: 'All', icon: LayoutGrid },
  { name: 'YouTube', icon: Video, color: 'text-red-600', activeBg: 'bg-red-600 text-white' },
  { name: 'TikTok', icon: Smartphone, color: 'text-slate-900', activeBg: 'bg-slate-900 text-white' },
  { name: 'Instagram', icon: Camera, color: 'text-pink-600', activeBg: 'bg-pink-600 text-white' },
  { name: 'Twitter / X', label: '𝕏', color: 'text-slate-900', activeBg: 'bg-slate-900 text-white' },
  { name: 'Facebook', label: 'FB', color: 'text-blue-600', activeBg: 'bg-blue-600 text-white' },
  { name: 'Discord', icon: MessageCircle, color: 'text-indigo-600', activeBg: 'bg-indigo-600 text-white' },
]

const FOLLOWER_TIERS = [
  { label: 'Audience: Any Size', value: '' },
  { label: '1K+ Followers', value: '1000' },
  { label: '10K+ Followers', value: '10000' },
  { label: '50K+ Followers', value: '50000' },
  { label: '100K+ Followers', value: '100000' },
  { label: '500K+ Followers', value: '500000' },
]

export function MarketplaceFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Current filter states from URL
  const currentQ = searchParams.get('q') || ''
  const currentPlatform = searchParams.get('platform') || 'All'
  const currentMinFollowers = searchParams.get('min_followers') || ''
  const currentMonetized = searchParams.get('monetized') === 'true'
  const currentSort = searchParams.get('sort') || 'newest'

  const [searchTerm, setSearchTerm] = useState(currentQ)

  // Helper to push updated search parameters to the URL
  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'All') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      startTransition(() => {
        router.push(`/?${params.toString()}#browse`, { scroll: false })
      })
    },
    [router, searchParams]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: searchTerm.trim() || null })
  }

  const handleClearAll = () => {
    setSearchTerm('')
    startTransition(() => {
      router.push('/#browse', { scroll: false })
    })
  }

  const hasActiveFilters = Boolean(
    currentQ ||
      (currentPlatform && currentPlatform !== 'All') ||
      currentMinFollowers ||
      currentMonetized ||
      (currentSort && currentSort !== 'newest')
  )

  return (
    <div id="browse" className="space-y-4 mb-8">
      {/* Top Search & Controls Container */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by niche, channel name, handle or keyword (e.g. Finance, Tech, Gaming)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  updateFilters({ q: null })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Dropdowns & Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Audience / Follower Tier */}
            <select
              value={currentMinFollowers}
              onChange={(e) => updateFilters({ min_followers: e.target.value || null })}
              aria-label="Filter by follower tier"
              className="text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-700 shadow-xs focus:border-blue-500 outline-none hover:bg-slate-50 transition cursor-pointer"
            >
              {FOLLOWER_TIERS.map((tier) => (
                <option key={tier.label} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>

            {/* Sort By Dropdown */}
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value || null })}
              aria-label="Sort listings"
              className="text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-slate-700 shadow-xs focus:border-blue-500 outline-none hover:bg-slate-50 transition cursor-pointer"
            >
              <option value="newest">Sort: Newly Listed</option>
              <option value="price_asc">Price: Lowest First</option>
              <option value="price_desc">Price: Highest First</option>
              <option value="followers">Most Followers</option>
            </select>

            {/* Monetized Filter Toggle */}
            <button
              type="button"
              onClick={() => updateFilters({ monetized: currentMonetized ? null : 'true' })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs border cursor-pointer ${
                currentMonetized
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${currentMonetized ? 'text-white' : 'text-emerald-500'}`} />
              <span>Monetized Only</span>
            </button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

        </div>

        {/* Platform Chips Row */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono mr-1 shrink-0">
            Platform:
          </span>
          {PLATFORMS.map((platform) => {
            const isSelected = currentPlatform === platform.name
            const Icon = platform.icon

            return (
              <button
                key={platform.name}
                type="button"
                onClick={() => updateFilters({ platform: platform.name === 'All' ? null : platform.name })}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {platform.label && <span className="font-bold">{platform.label}</span>}
                <span>{platform.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
