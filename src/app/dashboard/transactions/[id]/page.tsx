import { createClient } from '@/utils/supabase/server'
import { processMockPayment, updateTransactionState } from '@/app/actions/transactions'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function TransactionTrackerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch Transaction and its Timeline
  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      *,
      listings (title),
      buyer:buyer_id (username),
      seller:seller_id (username),
      transaction_timeline (status, description, created_at)
    `)
    .eq('id', params.id)
    .single()

  if (!tx) notFound()

  // Make sure user is involved
  if (tx.buyer_id !== user.id && tx.seller_id !== user.id) {
    notFound()
  }

  const isBuyer = tx.buyer_id === user.id

  // Sort timeline chronologically
  const timeline = tx.transaction_timeline?.sort((a: any, b: any) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) || []

  // Check if current user has already left a review
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('reviewer_id', user.id)
    .eq('listing_id', tx.listing_id)
    .maybeSingle()

  const hasReviewed = !!existingReview

  // Define steps for the UI
  const steps = [
    'pending_payment', 
    'payment_confirmed', 
    'transfer_started', 
    'buyer_reviewing', 
    'completed'
  ]
  const currentStepIndex = steps.indexOf(tx.status)

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Transaction Tracker</h1>

      {/* Status Progress Bar */}
      <div className="mb-8">
        <div className="overflow-hidden rounded-full bg-gray-200">
          <div 
            className="h-2 rounded-full bg-indigo-600" 
            style={{ width: `${Math.max(5, (currentStepIndex / (steps.length - 1)) * 100)}%` }} 
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
          <span>Payment</span>
          <span>Transfer</span>
          <span>Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Actions Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{tx.listings?.title}</h2>
            <p className="text-sm text-gray-500 mb-6">
              Amount: <span className="font-bold text-indigo-600">${tx.agreed_price}</span>
            </p>

            {/* ACTION BUTTONS BASED ON STATE */}
            
            {tx.status === 'pending_payment' && isBuyer && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-md p-6 text-center">
                <p className="text-indigo-800 font-medium mb-4">You have accepted the offer! Please complete your payment. Funds will be held securely in escrow.</p>
                <form action={async () => {
                  'use server'
                  await processMockPayment(tx.id)
                }}>
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium shadow-sm">
                    Pay ${tx.agreed_price} (Mock)
                  </button>
                </form>
              </div>
            )}
            
            {tx.status === 'pending_payment' && !isBuyer && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-md p-6 text-center text-yellow-800">
                Waiting for the buyer to complete payment to the Dealoura Escrow vault. Do not transfer the account yet!
              </div>
            )}

            {tx.status === 'payment_confirmed' && !isBuyer && (
              <div className="bg-blue-50 border border-blue-100 rounded-md p-6 text-center">
                <p className="text-blue-800 font-medium mb-4">Payment secured in Escrow! Please transfer ownership to our secure agent at <strong className="text-black">escrow@dealoura.com</strong>.</p>
                <form action={async () => {
                  'use server'
                  await updateTransactionState(tx.id, 'agent_verifying')
                }}>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium shadow-sm">
                    I have transferred to Escrow Agent
                  </button>
                </form>
              </div>
            )}

            {tx.status === 'payment_confirmed' && isBuyer && (
              <div className="bg-blue-50 border border-blue-100 rounded-md p-6 text-center text-blue-800">
                Your payment is secure. We are currently waiting for the seller to transfer the account to our Escrow Agent.
              </div>
            )}

            {tx.status === 'agent_verifying' && (
              <div className="bg-purple-50 border border-purple-100 rounded-md p-6 text-center">
                <p className="text-purple-800 font-medium mb-2">Dealoura Agent is Verifying</p>
                <p className="text-sm text-purple-600 mb-4">Our agents are currently verifying the account credentials and assigning Manager access to the buyer.</p>
                
                {/* Admin simulation button */}
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-xs text-gray-500 mb-2">DEVELOPER TOOL (Simulate Agent Action):</p>
                  <form action={async () => {
                    'use server'
                    await updateTransactionState(tx.id, 'buyer_7_day_evaluation')
                  }}>
                    <button type="submit" className="bg-purple-600 text-white px-4 py-1 text-sm rounded hover:bg-purple-700 font-medium shadow-sm">
                      [Admin] Verify & Grant Manager Access
                    </button>
                  </form>
                </div>
              </div>
            )}

            {tx.status === 'buyer_7_day_evaluation' && isBuyer && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-md p-6 text-center">
                <p className="text-indigo-800 font-medium mb-2">7-Day Manager Evaluation</p>
                <p className="text-sm text-indigo-700 mb-4">You have been granted Manager access! Please evaluate the account. After 7 days, the Escrow Agent will transfer Primary Ownership to you.</p>
                <form action={async () => {
                  'use server'
                  await updateTransactionState(tx.id, 'completed')
                }}>
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium shadow-sm">
                    Simulate 7 Days Passing (Complete Transfer)
                  </button>
                </form>
              </div>
            )}

            {tx.status === 'buyer_7_day_evaluation' && !isBuyer && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-md p-6 text-center text-indigo-800">
                <p className="font-medium">The Buyer is currently in their 7-day evaluation period.</p>
                <p className="text-sm mt-1">Once completed, primary ownership will be transferred to them and your funds will be released.</p>
              </div>
            )}

            {tx.status === 'completed' && (
              <div className="bg-green-100 border border-green-200 rounded-md p-6 text-center text-green-800">
                <p className="font-bold text-lg mb-2">Transaction Completed! 🎉</p>
                <p className="text-sm mb-6">The payment has been released to the seller.</p>
                
                {!hasReviewed ? (
                  <div className="bg-white p-4 rounded-md text-left shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-2">Leave a Review for the {isBuyer ? 'Seller' : 'Buyer'}</h4>
                    <form action={async (formData) => {
                      'use server'
                      const { leaveReview } = await import('@/app/actions/reviews')
                      await leaveReview(formData)
                    }}>
                      <input type="hidden" name="transaction_id" value={tx.id} />
                      <input type="hidden" name="listing_id" value={tx.listing_id} />
                      <input type="hidden" name="reviewee_id" value={isBuyer ? tx.seller_id : tx.buyer_id} />
                      
                      <div className="flex flex-col space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Rating (1-5)</label>
                          <select name="rating" required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Terrible</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Comment</label>
                          <textarea name="comment" required rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700">
                          Submit Review
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-md text-left shadow-sm text-center text-gray-500 italic">
                    You have already left a review for this transaction. Thank you!
                  </div>
                )}
              </div>
            )}

            {tx.status === 'disputed' && (
              <div className="bg-red-50 border border-red-100 rounded-md p-6 text-center text-red-800">
                <p className="font-bold text-lg mb-2">Transaction Disputed 🚨</p>
                <p className="text-sm">An admin is currently reviewing this transaction.</p>
              </div>
            )}

            {tx.status !== 'completed' && tx.status !== 'cancelled' && tx.status !== 'disputed' && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Having an issue?</h3>
                <form action={async (formData) => {
                  'use server'
                  const { openDispute } = await import('@/app/actions/disputes')
                  await openDispute(formData)
                }}>
                  <input type="hidden" name="transaction_id" value={tx.id} />
                  <div className="flex flex-col space-y-4">
                    <textarea 
                      name="reason" 
                      required 
                      rows={2} 
                      placeholder="Describe the issue you are having..."
                      className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2 px-3 border"
                    />
                    <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-500 self-start">
                      Open a Dispute
                    </button>
                  </div>
                </form>
              </div>
            )}
            
          </div>
        </div>

        {/* Timeline Sidebar */}
        <div className="bg-white shadow rounded-lg p-6 h-fit">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {timeline.map((event: any, eventIdx: number) => (
                <li key={eventIdx}>
                  <div className="relative pb-8">
                    {eventIdx !== timeline.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                          <span className="text-white text-xs font-bold">{eventIdx + 1}</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">{event.description}</p>
                        </div>
                        <div className="text-right text-xs whitespace-nowrap text-gray-500">
                          {new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
