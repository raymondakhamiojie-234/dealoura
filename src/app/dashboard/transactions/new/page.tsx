import { createClient } from '@/utils/supabase/server'
import { createTransactionFromOffer } from '@/app/actions/transactions'
import { redirect, notFound } from 'next/navigation'

export default async function NewTransactionPage(props: { searchParams: Promise<{ offer_id: string }> }) {
  const searchParams = await props.searchParams;
  const offerId = searchParams.offer_id
  if (!offerId) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch offer to confirm it's accepted and belongs to this user
  const { data: offer, error: fetchError } = await supabase
    .from('offers')
    .select('*, listings(title, price)')
    .eq('id', offerId)
    .single()

  if (fetchError || !offer || offer.status !== 'accepted') {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          Invalid or unaccepted offer. Or the Phase 3 database tables don't exist yet!
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Confirm Purchase</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">You are about to purchase:</h2>
        
        <div className="bg-gray-50 p-4 rounded-md border mb-6">
          <p className="font-semibold text-gray-900">{offer.listings?.title}</p>
          <p className="text-sm text-gray-500 mt-1">Agreed Price: <span className="font-bold text-indigo-600">${offer.amount}</span></p>
        </div>

        <form action={async () => {
          'use server'
          const res = await createTransactionFromOffer(offerId)
          if (res?.error) {
             // In a real app we'd use useActionState for error rendering, 
             // but since we redirect on success, throwing the error lets the Next.js Error Boundary catch it
             throw new Error(res.error)
          }
        }}>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Transaction & Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  )
}
