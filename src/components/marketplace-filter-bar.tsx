'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { 
  Search, 
  X, 
  Sparkles,
  LayoutGrid,
  Video,
  Camera,
  MessageCircle,
  Smartphone,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react'

const PLATFORMS = [
  { name: 'All', icon: LayoutGrid },
  { name: 'YouTube', icon: Video, color: 'text-red-600' },
  { name: 'TikTok', icon: Smartphone, color: 'text-[#010b13]' },
  { name: 'Instagram', icon: Camera, color: 'text-pink-600' },
  { name: 'Twitter / X', label: '𝕏', color: 'text-[#010b13]' },
  { name: 'Facebook', label: 'FB', color: 'text-blue-600' },
  { name: 'Discord', icon: MessageCircle, color: 'text-indigo-600' },
]

const FOLLOWER_TIERS = [
  { label: 'Audience: Any Size', value: '' },
  { label: '1K+ Followers', value: '1000' },
  { label: '10K+ Followers', value: '10000' },
  { label: '50K+ Followers', value: '50000' },
  { label: '100K+ Followers', value: '100000' },
  { label: '500K+ Followers', value: '500000' },
]

interface MarketplaceFilterBarProps {
  basePath?: string
  targetId?: string
}

export function MarketplaceFilterBar({ basePath = '/marketplace', targetId = 'browse' }: MarketplaceFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Current filter states from URL
  const currentQ = searchParams.get('q') || ''
  const currentPlatform = searchParams.get('platform') || 'All'
  const currentMinFollowers = searchParams.get('min_followers') || ''
  const currentMinPrice = searchParams.get('min_price') || ''
  const currentMaxPrice = searchParams.get('max_price') || ''
  const currentMonetized = searchParams.get('monetized') === 'true'
  const currentSort = searchParams.get('sort') || 'newest'

  const [searchTerm, setSearchTerm] = useState(currentQ)
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice)

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

      const targetHash = targetId ? `#${targetId}` : ''
      startTransition(() => {
        router.push(`${basePath}?${params.toString()}${targetHash}`, { scroll: false })
      })
    },
    [router, searchParams, basePath, targetId]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: searchTerm.trim() || null })
  }

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({
      min_price: minPriceInput.trim() || null,
      max_price: maxPriceInput.trim() || null,
    })
  }

  const handleClearAll = () => {
    setSearchTerm('')
    setMinPriceInput('')
    setMaxPriceInput('')
    const targetHash = targetId ? `#${targetId}` : ''
    startTransition(() => {
      router.push(`${basePath}${targetHash}`, { scroll: false })
    })
  }

  const hasActiveFilters = Boolean(
    currentQ ||
      (currentPlatform && currentPlatform !== 'All') ||
      currentMinFollowers ||
      currentMinPrice ||
      currentMaxPrice ||
      currentMonetized ||
      (currentSort && currentSort !== 'newest')
  )

  return (
    <div id={targetId} className="space-y-4 mb-8">
      {/* Search & Main Controls Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#d2dde4] shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#526371]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by asset title, platform, niche, handle (e.g. Forex, Gaming, Tech)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#d2dde4] bg-[#ebf1f5] text-[#010b13] text-sm focus:bg-white focus:border-[#010b13] focus:ring-2 focus:ring-[#010b13]/10 outline-none transition placeholder:text-[#526371]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  updateFilters({ q: null })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#526371] hover:text-[#010b13] p-0.5"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Quick Dropdowns & Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Audience / Follower Tier */}
            <select
              value={currentMinFollowers}
              onChange={(e) => updateFilters({ min_followers: e.target.value || null })}
              aria-label="Filter by follower tier"
              className="text-xs font-semibold rounded-xl border border-[#d2dde4] bg-[#ebf1f5] py-2.5 px-3 text-[#010b13] shadow-xs focus:border-[#010b13] outline-none hover:bg-[#d2dde4]/60 transition cursor-pointer"
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
              className="text-xs font-semibold rounded-xl border border-[#d2dde4] bg-[#ebf1f5] py-2.5 px-3 text-[#010b13] shadow-xs focus:border-[#010b13] outline-none hover:bg-[#d2dde4]/60 transition cursor-pointer"
            >
              <option value="newest">Sort: Newly Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="followers">Most Followers</option>
            </select>

            {/* Monetized Filter Toggle */}
            <button
              type="button"
              onClick={() => updateFilters({ monetized: currentMonetized ? null : 'true' })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs border cursor-pointer ${
                currentMonetized
                  ? 'bg-[#010b13] text-[#ebf1f5] border-[#010b13]'
                  : 'bg-[#ebf1f5] text-[#010b13] border-[#d2dde4] hover:bg-[#d2dde4]/60'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${currentMonetized ? 'text-[#ebf1f5]' : 'text-[#010b13]'}`} />
              <span>Monetized Only</span>
            </button>

            {/* Price Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                showAdvanced || currentMinPrice || currentMaxPrice
                  ? 'bg-[#010b13] text-[#ebf1f5] border-[#010b13]'
                  : 'bg-[#ebf1f5] text-[#526371] border-[#d2dde4] hover:bg-[#d2dde4]/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Price Range</span>
            </button>

            {/* Reset Filters Action */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 px-2.5 py-2 rounded-xl hover:bg-rose-50 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>

        {/* Collapsible Min/Max Price Sub-row */}
        {showAdvanced && (
          <form onSubmit={handlePriceApply} className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#d2dde4]">
            <span className="text-xs font-semibold text-[#526371]">Price Range (USD):</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#526371]">$</span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-24 text-xs py-1.5 px-2.5 rounded-lg border border-[#d2dde4] bg-[#ebf1f5] focus:bg-white focus:border-[#010b13] outline-none text-[#010b13]"
              />
            </div>
            <span className="text-xs text-[#526371]">to</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#526371]">$</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-24 text-xs py-1.5 px-2.5 rounded-lg border border-[#d2dde4] bg-[#ebf1f5] focus:bg-white focus:border-[#010b13] outline-none text-[#010b13]"
              />
            </div>
            <button
              type="submit"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#010b13] text-[#ebf1f5] hover:bg-[#0a1722] transition"
            >
              Apply Price
            </button>
            {(currentMinPrice || currentMaxPrice) && (
              <button
                type="button"
                onClick={() => {
                  setMinPriceInput('')
                  setMaxPriceInput('')
                  updateFilters({ min_price: null, max_price: null })
                }}
                className="text-xs text-[#526371] hover:text-[#010b13] underline ml-1"
              >
                Clear Price
              </button>
            )}
          </form>
        )}

        {/* Platform Selector Chips Row */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#d2dde4] overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-[#526371] uppercase tracking-wider font-mono mr-1 shrink-0">
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
                    ? 'bg-[#010b13] text-[#ebf1f5] shadow-sm'
                    : 'bg-[#ebf1f5] text-[#526371] hover:bg-[#d2dde4] hover:text-[#010b13] border border-[#d2dde4]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {platform.label && <span className="font-bold">{platform.label}</span>}
                <span>{platform.name}</span>
              </button>
            )
          })}
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#d2dde4]">
            <span className="text-[10px] font-mono uppercase text-[#526371] mr-1">Active Filters:</span>
            
            {currentQ && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4] px-2 py-0.5 rounded-md">
                Search: &ldquo;{currentQ}&rdquo;
                <button type="button" onClick={() => { setSearchTerm(''); updateFilters({ q: null }) }}>
                  <X className="w-3 h-3 hover:text-black" />
                </button>
              </span>
            )}

            {currentPlatform && currentPlatform !== 'All' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4] px-2 py-0.5 rounded-md">
                Platform: {currentPlatform}
                <button type="button" onClick={() => updateFilters({ platform: null })}>
                  <X className="w-3 h-3 hover:text-black" />
                </button>
              </span>
            )}

            {currentMinFollowers && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4] px-2 py-0.5 rounded-md">
                Min Followers: {Number(currentMinFollowers).toLocaleString()}+
                <button type="button" onClick={() => updateFilters({ min_followers: null })}>
                  <X className="w-3 h-3 hover:text-black" />
                </button>
              </span>
            )}

            {(currentMinPrice || currentMaxPrice) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#ebf1f5] text-[#010b13] border border-[#d2dde4] px-2 py-0.5 rounded-md">
                Price: ${currentMinPrice || '0'} - ${currentMaxPrice || '∞'}
                <button type="button" onClick={() => { setMinPriceInput(''); setMaxPriceInput(''); updateFilters({ min_price: null, max_price: null }) }}>
                  <X className="w-3 h-3 hover:text-black" />
                </button>
              </span>
            )}

            {currentMonetized && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#010b13] text-[#ebf1f5] px-2 py-0.5 rounded-md">
                Monetized Only
                <button type="button" onClick={() => updateFilters({ monetized: null })}>
                  <X className="w-3 h-3 text-[#ebf1f5] hover:text-white" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-bold text-rose-600 hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
