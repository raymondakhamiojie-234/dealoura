import { createClient } from '@/utils/supabase/server'
import { updateVerificationStatus } from '@/app/actions/verification'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminVerificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch pending verifications
  const { data: verifications } = await supabase
    .from('verifications')
    .select(`
      *,
      user_profiles:user_id (username, full_name)
    `)
    .eq('status', 'submitted')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex space-x-4 mb-8">
        <Link href="/admin/listings" className="text-gray-500 hover:text-indigo-600 font-medium">Pending Listings</Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/verifications" className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1">Verifications</Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/disputes" className="text-gray-500 hover:text-indigo-600 font-medium">Disputes</Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Verifications</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {verifications && verifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {verifications.map((v) => (
              <li key={v.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">User: {v.user_profiles?.username}</h3>
                    <p className="mt-1 text-sm text-gray-500">Name: {v.user_profiles?.full_name || 'N/A'}</p>
                    <p className="mt-2 text-sm">
                      <a 
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/verifications/${v.evidence_url}`}
                        target="_blank"
                        rel="noreferrer" 
                        className="text-indigo-600 hover:underline"
                      >
                        View Evidence Document
                      </a>
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <form action={async () => {
                      'use server'
                      await updateVerificationStatus(v.id, 'verified', 'Approved by admin.')
                    }}>
                      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Approve
                      </button>
                    </form>
                    <form action={async () => {
                      'use server'
                      await updateVerificationStatus(v.id, 'rejected', 'Evidence insufficient.')
                    }}>
                      <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No pending verifications at this time.
          </div>
        )}
      </div>
    </div>
  )
}
