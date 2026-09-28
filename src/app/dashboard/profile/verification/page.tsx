import { createClient } from '@/utils/supabase/server'
import { submitVerification } from '@/app/actions/verification'
import { redirect } from 'next/navigation'

export default async function VerificationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if they already have a verification request
  const { data: existing } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Verification</h1>

      {existing && (
        <div className="mb-8 bg-white shadow rounded-lg p-6 border-l-4 border-indigo-500">
          <h2 className="text-lg font-medium text-gray-900">Current Status: <span className="uppercase text-indigo-600 font-bold">{existing.status}</span></h2>
          <p className="mt-2 text-sm text-gray-500">Submitted on {new Date(existing.created_at).toLocaleDateString()}</p>
          {existing.admin_notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-semibold text-gray-700">Admin Notes:</p>
              <p className="text-sm text-gray-600">{existing.admin_notes}</p>
            </div>
          )}
        </div>
      )}

      {(!existing || existing.status === 'rejected') && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Submit Verification Request</h2>
          <p className="text-sm text-gray-500 mb-6">
            Upload a private document (e.g., ID or proof of ownership) to verify your account. This file will be kept strictly private and only viewable by administrators.
          </p>

          <form action={submitVerification} className="space-y-6">
            <div>
              <label htmlFor="evidence" className="block text-sm font-medium text-gray-700">Evidence File (Image or PDF)</label>
              <input
                type="file"
                name="evidence"
                id="evidence"
                required
                accept="image/*,.pdf"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Submit for Review
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
