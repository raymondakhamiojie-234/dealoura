import { createListing } from '@/app/actions/listings'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UploadCloud, CheckCircle, ArrowLeft } from 'lucide-react'

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-2">List an Account for Sale</h1>
        <p className="text-gray-500 text-sm mt-1">
          Provide accurate statistics and screenshot proof. Deals are completed securely via Dealoura Escrow.
        </p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 sm:p-8">
        <form action={createListing as any} className="space-y-6">
          
          {/* Section 1: Platform & Handle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="platform" className="block text-sm font-semibold text-gray-700">
                Platform <span className="text-red-500">*</span>
              </label>
              <select
                name="platform"
                id="platform"
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border bg-white"
              >
                <option value="YouTube">YouTube Channel</option>
                <option value="TikTok">TikTok Account</option>
                <option value="Instagram">Instagram Page</option>
                <option value="Twitter / X">Twitter / X Account</option>
                <option value="Discord">Discord Server</option>
                <option value="Twitch">Twitch Channel</option>
                <option value="Facebook">Facebook Page</option>
              </select>
            </div>

            <div>
              <label htmlFor="account_handle" className="block text-sm font-semibold text-gray-700">
                Account Handle or URL <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="account_handle"
                id="account_handle"
                placeholder="e.g. @TechReviews or youtube.com/@tech"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border"
              />
            </div>
          </div>

          {/* Section 2: Listing Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
              Listing Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border"
              placeholder="e.g. 150K Monetized Gaming Channel (Active Community & Organic Reach)"
            />
          </div>

          {/* Section 3: Audience & Monetization Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label htmlFor="followers_count" className="block text-sm font-semibold text-gray-700">
                Followers / Subscribers <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="followers_count"
                id="followers_count"
                min="0"
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border"
                placeholder="e.g. 50000"
              />
            </div>

            <div>
              <label htmlFor="niche" className="block text-sm font-semibold text-gray-700">
                Niche / Category <span className="text-red-500">*</span>
              </label>
              <select
                name="niche"
                id="niche"
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border bg-white"
              >
                <option value="Gaming">Gaming</option>
                <option value="Tech & Gadgets">Tech & Gadgets</option>
                <option value="Finance & Crypto">Finance & Crypto</option>
                <option value="Entertainment & Humor">Entertainment & Humor</option>
                <option value="Fitness & Health">Fitness & Health</option>
                <option value="Lifestyle & Vlog">Lifestyle & Vlog</option>
                <option value="Music & Art">Music & Art</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="monetized" className="block text-sm font-semibold text-gray-700">
                Monetization Status <span className="text-red-500">*</span>
              </label>
              <select
                name="monetized"
                id="monetized"
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border bg-white"
              >
                <option value="true">Monetized (Earns Ad Revenue)</option>
                <option value="false">Not Monetized</option>
              </select>
            </div>
          </div>

          {/* Section 4: Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
              Asking Price (USD) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1 rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm font-bold">$</span>
              </div>
              <input
                type="number"
                name="price"
                id="price"
                step="0.01"
                min="1"
                required
                className="block w-full rounded-lg border-gray-300 pl-8 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border"
                placeholder="250.00"
              />
            </div>
          </div>

          {/* Section 5: Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
              Description & Details <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3 border"
              placeholder="Describe account age, audience geography (e.g. 60% US), strike history, and monthly earnings..."
            />
          </div>

          {/* Section 6: Image Uploads for Proof & Screenshots */}
          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Upload Proof Screenshots & Analytics
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Upload up to 5 screenshots proving analytics, subscriber counts, monetization overview, and copyright cleanliness.
            </p>

            <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition rounded-xl p-6 text-center cursor-pointer bg-slate-50 relative">
              <input
                type="file"
                name="images"
                id="images"
                multiple
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center pointer-events-none">
                <UploadCloud className="w-10 h-10 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">
                  Click to select images or drag and drop
                </span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB each</span>
              </div>
            </div>
          </div>

          {/* Section 7: Submission Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              name="action"
              value="draft"
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white py-2.5 px-5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              name="action"
              value="pending"
              className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-6 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              Publish Listing
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
