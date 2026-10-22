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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Review KYC Verifications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Inspect submitted government identity and ownership evidence documents before granting the Verified badge.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
