import { createClient } from '@/utils/supabase/server'
import { processMockPayment, updateTransactionState } from '@/app/actions/transactions'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  Lock,
  DollarSign,
  FileText,
  UserCheck,
} from 'lucide-react'
import { EvaluationCountdown } from '@/components/evaluation-countdown'
import { EscrowCredentialVault } from '@/components/escrow-credential-vault'
import { EscrowTransferBanner } from '@/components/escrow-transfer-banner'

export default async function TransactionTrackerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch Transaction and its Timeline
  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      *,
      listings (title, platform, price),
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
  const timeline =
    tx.transaction_timeline?.sort(
      (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) || []

  // Check if current user has already left a review
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('reviewer_id', user.id)
    .eq('listing_id', tx.listing_id)
    .maybeSingle()

  const hasReviewed = !!existingReview

  // 5-Phase Escrow Steps
  const PHASES = [
    { key: 'pending_payment', label: 'Deposit' },
    { key: 'payment_confirmed', label: 'Credentials' },
    { key: 'agent_verifying', label: 'Agent Check' },
    { key: 'buyer_7_day_evaluation', label: '7-Day Hold' },
    { key: 'completed', label: 'Payout' },
  ]

  const currentPhaseIndex = tx.status === 'payment_verifying'
    ? 0
    : PHASES.findIndex((p) => p.key === tx.status)

  const escrowFee = tx.escrow_fee || Math.round(tx.agreed_price * 0.05 * 100) / 100
  const sellerPayout = Math.max(0, tx.agreed_price - escrowFee)

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Orders
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-blue-400 border border-slate-800">
          Escrow ID: #{tx.id.slice(0, 8)}
        </span>
      </div>

      {/* 5-Phase Progress Stepper */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between relative">
          {/* Progress bar background line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              width: `${
                currentPhaseIndex >= 0
                  ? (currentPhaseIndex / (PHASES.length - 1)) * 100
                  : 0
              }%`,
            }}
          />

          {PHASES.map((phase, idx) => {
            const isCompleted = currentPhaseIndex > idx || tx.status === 'completed'
            const isCurrent = currentPhaseIndex === idx && tx.status !== 'completed'

            return (
              <div key={phase.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : isCurrent
                      ? 'bg-slate-900 text-white ring-4 ring-blue-100'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold mt-2 whitespace-nowrap ${
                    isCurrent ? 'text-blue-600 font-extrabold' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {phase.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Grid: Left (Action Hub) + Right (Escrow Breakdown & Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Escrow Action Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
            
            {/* Title & Platform Header */}
            <div className="border-b border-gray-100 pb-5">
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {tx.listings?.platform || 'Account'}
                </span>
                <span className="text-xs text-gray-400 font-medium">Middle-Man Escrow Deal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">{tx.listings?.title}</h2>
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                <span>Buyer: <strong className="text-gray-900">@{tx.buyer?.username}</strong></span>
                <span>Seller: <strong className="text-gray-900">@{tx.seller?.username}</strong></span>
              </div>
            </div>

            {/* ACTION STAGE 1: PENDING PAYMENT / PAYMENT VERIFYING */}
            {(tx.status === 'pending_payment' || tx.status === 'payment_verifying') && isBuyer && (
              <EscrowTransferBanner
                transactionId={tx.id}
                agreedPrice={tx.agreed_price}
                escrowFee={escrowFee}
                paymentProofData={tx.payment_proof_data}
                paymentProofUrl={tx.payment_proof_url}
                isBuyer={isBuyer}
              />
            )}

            {(tx.status === 'pending_payment' || tx.status === 'payment_verifying') && !isBuyer && (
              tx.payment_proof_data ? (
                <div className="bg-amber-50/80 border-2 border-amber-200 rounded-3xl p-6 sm:p-8 text-center text-amber-900 space-y-3">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Payment Verification in Progress
                    </span>
                    <h3 className="text-xl font-black text-gray-900 mt-1.5">
                      Buyer Transfer Submitted
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800/90 max-w-md mx-auto leading-relaxed">
                    The buyer has submitted their bank transfer confirmation details. The Dealoura Escrow Desk is reconciling the deposit. You will receive an instant alert and email once the funds are secured in the vault.
                  </p>
                  <p className="text-xs font-bold text-red-600 bg-red-50 py-2 px-4 rounded-xl border border-red-200 inline-block mt-1">
                    ⚠ DO NOT send or hand over any credentials yet!
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-amber-800 space-y-2">
                  <Clock className="w-8 h-8 text-amber-600 mx-auto" />
                  <h3 className="text-base font-bold text-amber-900">Waiting for Buyer Deposit</h3>
                  <p className="text-xs text-amber-700 max-w-md mx-auto">
                    The buyer has not transferred funds into the escrow vault yet. <strong>Do NOT transfer any account credentials</strong> until Dealoura confirms the deposit!
                  </p>
                </div>
              )
            )}

            {/* ACTION STAGE 2: PAYMENT CONFIRMED / SUBMIT CREDENTIALS */}
            {tx.status === 'payment_confirmed' && !isBuyer && (
              <EscrowCredentialVault transactionId={tx.id} />
            )}

            {tx.status === 'payment_confirmed' && isBuyer && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center text-blue-800 space-y-2">
                <ShieldCheck className="w-8 h-8 text-blue-600 mx-auto" />
                <h3 className="text-base font-bold text-blue-900">Payment Secured in Escrow Vault!</h3>
                <p className="text-xs text-blue-700 max-w-md mx-auto">
                  We have secured your ${tx.agreed_price}. The seller has been instructed to hand over credentials to the Dealoura Escrow Agent.
                </p>
              </div>
            )}

            {/* ACTION STAGE 3: AGENT VERIFYING */}
            {tx.status === 'agent_verifying' && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-purple-900">Escrow Agent Verification in Progress</h3>
                <p className="text-xs text-purple-700 max-w-md mx-auto leading-relaxed">
                  Our official Escrow Agent is inspecting the account credentials, checking monetization status, and sending the buyer a Manager access invitation.
                </p>

                {/* Developer / Agent Simulation Action */}
                <div className="pt-4 border-t border-purple-200/80">
                  <p className="text-[11px] text-gray-500 mb-2">DEVELOPER / AGENT ACTION:</p>
                  <form action={updateTransactionState.bind(null, tx.id, 'buyer_7_day_evaluation') as any}>
                    <button
                      type="submit"
                      className="py-2 px-5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      [Agent] Verify & Start Buyer 7-Day Hold
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ACTION STAGE 4: 7-DAY BUYER EVALUATION */}
            {tx.status === 'buyer_7_day_evaluation' && (
              <div className="space-y-4">
                <EvaluationCountdown
                  endsAt={tx.evaluation_ends_at}
                  startedAt={tx.evaluation_started_at}
                />

                {/* Simulation for 7 Days Passing */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-[11px] text-gray-500 mb-2">DEVELOPER TESTING TOOL:</p>
                  <form action={updateTransactionState.bind(null, tx.id, 'completed') as any}>
                    <button
                      type="submit"
                      className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      Simulate 7 Days Concluding (Release Payout)
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ACTION STAGE 5: COMPLETED */}
            {tx.status === 'completed' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                  <h3 className="text-xl font-black text-green-900">Escrow Deal Completed! 🎉</h3>
                  <p className="text-xs text-green-700 max-w-md mx-auto">
                    Primary ownership has been successfully assigned to the buyer and payout of <strong>${sellerPayout}</strong> has been released to the seller.
                  </p>
                </div>

                {/* Review Form */}
                {!hasReviewed ? (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      Leave Feedback for the {isBuyer ? 'Seller' : 'Buyer'}
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">Help build trust in the Dealoura community.</p>

                    <form
                      action={async (formData) => {
                        'use server'
                        const { leaveReview } = await import('@/app/actions/reviews')
                        await leaveReview(formData)
                      }}
                      className="space-y-3"
                    >
                      <input type="hidden" name="transaction_id" value={tx.id} />
                      <input type="hidden" name="listing_id" value={tx.listing_id} />
                      <input type="hidden" name="reviewee_id" value={isBuyer ? tx.seller_id : tx.buyer_id} />

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Rating</label>
                        <select
                          name="rating"
                          required
                          className="w-full text-xs font-bold rounded-lg border border-gray-300 py-2 px-3 bg-white"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5 - Flawless Deal)</option>
                          <option value="4">⭐⭐⭐⭐ (4 - Great)</option>
                          <option value="3">⭐⭐⭐ (3 - Average)</option>
                          <option value="2">⭐⭐ (2 - Below Expectations)</option>
                          <option value="1">⭐ (1 - Terrible)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Review Comments</label>
                        <textarea
                          name="comment"
                          rows={2}
                          required
                          placeholder="How did the account transfer go?"
                          className="w-full text-xs rounded-lg border border-gray-300 p-2.5 outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl text-center text-xs text-gray-500 italic border border-slate-100">
                    Thank you! You have already submitted a review for this transaction.
                  </div>
                )}
              </div>
            )}

            {/* ACTION STAGE: DISPUTED */}
            {tx.status === 'disputed' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-800 space-y-2">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                <h3 className="text-base font-bold text-red-900">Transaction Under Dispute</h3>
                <p className="text-xs text-red-700 max-w-md mx-auto">
                  A dispute ticket is currently open. Dealoura staff are inspecting chat history and evidence. Funds are frozen until resolution.
                </p>
              </div>
            )}

            {/* Open Dispute Form (Available during active transfer) */}
            {tx.status !== 'completed' && tx.status !== 'cancelled' && tx.status !== 'disputed' && (
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Need Assistance?</h4>
                  <span className="text-[11px] text-gray-400">Escrow Protection Guarantee</span>
                </div>
                <form
                  action={async (formData) => {
                    'use server'
                    const { openDispute } = await import('@/app/actions/disputes')
                    await openDispute(formData)
                  }}
                  className="space-y-3"
                >
                  <input type="hidden" name="transaction_id" value={tx.id} />
                  <textarea
                    name="reason"
                    required
                    rows={2}
                    placeholder="Describe any issue (e.g. invalid credentials, unassigned manager access, strikes)..."
                    className="w-full text-xs rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  />
                  <button
                    type="submit"
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                  >
                    Open a Formal Dispute Ticket &rarr;
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Escrow Breakdown & Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Escrow Protection Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wide">Dealoura Escrow Vault</span>
            </div>

            <div className="space-y-2.5 text-xs border-y border-slate-800 py-3.5">
              <div className="flex justify-between text-slate-300">
                <span>Agreed Price</span>
                <span className="font-bold text-white">${tx.agreed_price}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Escrow Protection Fee (5%)</span>
                <span>${escrowFee}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800 font-bold">
                <span>Seller Payout</span>
                <span className="text-green-400">${sellerPayout}</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <p>• Assigned Agent: <strong className="text-slate-200">escrow@dealoura.com</strong></p>
              <p>• Dispute Resolution: Guaranteed</p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/messages/escrow"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
              >
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Contact Escrow Agent
              </Link>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Official Audit Trail</h3>
            
            {timeline.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-6">
                  {timeline.map((event: any, eventIdx: number) => (
                    <li key={eventIdx}>
                      <div className="relative pb-6">
                        {eventIdx !== timeline.length - 1 ? (
                          <span
                            className="absolute top-3 left-3 -ml-px h-full w-0.5 bg-gray-100"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3 items-start">
                          <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {eventIdx + 1}
                          </div>
                          <div className="min-w-0 flex-1 flex justify-between space-x-2">
                            <div>
                              <p className="text-xs font-medium text-gray-800">{event.description}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {new Date(event.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No events logged yet.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
