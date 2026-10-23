'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { Search, X, SlidersHorizontal, Check, ArrowUpDown } from 'lucide-react'

const PLATFORMS = [
  'All',
  'Facebook',
  'YouTube',
  'TikTok',
  'Instagram',
  'Twitter / X',
  'Discord',
  'Twitch',
]

const FOLLOWER_TIERS = [
  { label: 'Any Audience', value: '' },
  { label: '1K+ Followers', value: '1000' },
  { label: '10K+ Followers', value: '10000' },
  { label: '50K+ Followers', value: '50000' },
  { label: '100K+ Followers', value: '100000' },
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
      {/* Top Search & Controls Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search channels, niches, handles (e.g. Gaming, Tech)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                updateFilters({ q: null })
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Dropdowns & Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Audience / Follower Tier */}
          <select
            value={currentMinFollowers}
            onChange={(e) => updateFilters({ min_followers: e.target.value || null })}
            className="text-xs font-semibold rounded-lg border border-gray-200 bg-white py-2 px-3 text-gray-700 shadow-sm focus:border-blue-500 outline-none"
          >
            {FOLLOWER_TIERS.map((tier) => (
              <option key={tier.label} value={tier.value}>
                {tier.label}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value || null })}
              className="text-xs font-semibold rounded-lg border border-gray-200 bg-white py-2 px-3 text-gray-700 shadow-sm focus:border-blue-500 outline-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="followers">Most Followers</option>
            </select>
          </div>

          {/* Monetized Filter Toggle */}
          <button
            type="button"
            onClick={() => updateFilters({ monetized: currentMonetized ? null : 'true' })}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition shadow-sm border ${
              currentMonetized
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${currentMonetized ? 'opacity-100' : 'opacity-0'}`} />
            Monetized Only
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline px-2 py-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Platform Chips Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PLATFORMS.map((platform) => {
          const isSelected = currentPlatform === platform
          return (
            <button
              key={platform}
              type="button"
              onClick={() => updateFilters({ platform: platform === 'All' ? null : platform })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-xs ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {platform}
            </button>
          )
        })}
      </div>
    </div>
  )
}
