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
  UserCheck,
} from 'lucide-react'
import { EvaluationCountdown } from '@/components/evaluation-countdown'
import { EscrowCredentialVault } from '@/components/escrow-credential-vault'
import { EscrowTransferBanner } from '@/components/escrow-transfer-banner'
import { BuyerEvaluationActions } from '@/components/buyer-evaluation-actions'
import { SellerPayoutCard } from '@/components/seller-payout-card'

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

  const isYouTube = tx.listings?.platform?.toLowerCase().includes('youtube')

  // 5-Phase Escrow Steps (YouTube: 7 Days, Other Platforms: 15 Minutes)
  const PHASES = [
    { key: 'pending_payment', label: '1. Deposit' },
    { key: 'payment_confirmed', label: '2. Credentials' },
    { key: 'agent_verifying', label: '3. Agent Check' },
    { key: 'buyer_7_day_evaluation', label: isYouTube ? '4. 7-Day Hold' : '4. 15-Min Hold' },
    { key: 'completed', label: '5. Payout' },
  ]

  const currentPhaseIndex = tx.status === 'payment_verifying'
    ? 0
    : PHASES.findIndex((p) => p.key === tx.status)

  const escrowFee = tx.escrow_fee || Math.round(tx.agreed_price * 0.05 * 100) / 100
  const sellerPayout = Math.max(0, tx.agreed_price - escrowFee)

  return (
    <div className="min-h-screen bg-[#ebf1f5] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center text-xs sm:text-sm font-bold text-[#526371] hover:text-[#010b13] transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Orders & Sales
          </Link>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#010b13] text-[#ebf1f5]">
            Escrow Deal #{tx.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        {/* 5-Phase Progress Stepper */}
        <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 shadow-xs border border-[#d2dde4]">
          <div className="flex items-center justify-between relative">
            {/* Progress bar background line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-[#d2dde4] -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-[#010b13] -translate-y-1/2 z-0 transition-all duration-500"
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
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-mono font-bold text-xs sm:text-sm transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#010b13] text-[#ebf1f5] shadow-sm'
                        : isCurrent
                        ? 'bg-[#010b13] text-[#ebf1f5] ring-4 ring-[#d2dde4]'
                        : 'bg-[#ffffff] border-2 border-[#d2dde4] text-[#526371]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-[#ebf1f5]" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold mt-2 whitespace-nowrap tracking-tight ${
                      isCurrent ? 'text-[#010b13] font-black' : isCompleted ? 'text-[#010b13]' : 'text-[#526371]'
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
            <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-8 shadow-xs border border-[#d2dde4] space-y-6">
              
              {/* Title & Platform Header */}
              <div className="border-b border-[#d2dde4] pb-5">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
                    {tx.listings?.platform || 'Digital Asset'}
                  </span>
                  <span className="text-xs text-[#526371] font-semibold">Dealoura Escrow Protocol</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#010b13] tracking-tight">{tx.listings?.title}</h2>
                <div className="flex items-center space-x-4 text-xs text-[#526371] mt-2 font-medium">
                  <span>Buyer: <strong className="text-[#010b13]">@{tx.buyer?.username}</strong></span>
                  <span>Seller: <strong className="text-[#010b13]">@{tx.seller?.username}</strong></span>
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
                  <div className="bg-[#ebf1f5] border border-[#d2dde4] rounded-2xl p-6 sm:p-8 text-center text-[#010b13] space-y-3">
                    <div className="w-12 h-12 bg-[#010b13] text-[#ebf1f5] rounded-xl flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#010b13] text-[#ebf1f5]">
                        Deposit Verification in Progress
                      </span>
                      <h3 className="text-xl font-black text-[#010b13] mt-2">
                        Buyer Transfer Submitted
                      </h3>
                    </div>
                    <p className="text-xs text-[#526371] max-w-md mx-auto leading-relaxed">
                      The buyer has submitted their escrow deposit confirmation. The Dealoura Escrow Desk is reconciling the transfer. You will receive an instant notification once funds are confirmed in the vault.
                    </p>
                    <p className="text-xs font-bold text-red-600 bg-red-50 py-2 px-4 rounded-xl border border-red-200 inline-block mt-1">
                      ⚠ DO NOT hand over any credentials until Dealoura verifies the deposit!
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#ebf1f5] border border-[#d2dde4] rounded-2xl p-6 text-center text-[#010b13] space-y-2">
                    <Clock className="w-8 h-8 text-[#526371] mx-auto" />
                    <h3 className="text-base font-black text-[#010b13]">Waiting for Buyer Escrow Deposit</h3>
                    <p className="text-xs text-[#526371] max-w-md mx-auto">
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
                <div className="bg-[#ebf1f5] border border-[#d2dde4] rounded-2xl p-6 text-center text-[#010b13] space-y-2">
                  <ShieldCheck className="w-8 h-8 text-[#010b13] mx-auto" />
                  <h3 className="text-base font-black text-[#010b13]">Payment Secured in Escrow Vault</h3>
                  <p className="text-xs text-[#526371] max-w-md mx-auto">
                    We have secured your ${tx.agreed_price}. The seller has been instructed to hand over credentials to the Dealoura Escrow Officer.
                  </p>
                </div>
              )}

              {/* ACTION STAGE 3: AGENT VERIFYING */}
              {tx.status === 'agent_verifying' && (
                <div className="bg-[#ebf1f5] border border-[#d2dde4] rounded-2xl p-6 sm:p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-[#010b13] text-[#ebf1f5] rounded-xl flex items-center justify-center mx-auto animate-pulse">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#010b13]">Escrow Agent Verification in Progress</h3>
                  <p className="text-xs text-[#526371] max-w-md mx-auto leading-relaxed">
                    Our official Escrow Agent is inspecting the account credentials, checking monetization health, and inviting the buyer as an authorized manager.
                  </p>

                  {/* Developer / Agent Simulation Action */}
                  <div className="pt-4 border-t border-[#d2dde4]">
                    <p className="text-[11px] font-mono text-[#526371] mb-2">DEVELOPER / AGENT ACTION:</p>
                    <form action={updateTransactionState.bind(null, tx.id, 'buyer_7_day_evaluation') as any}>
                      <button
                        type="submit"
                        className="py-2.5 px-5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                      >
                        {isYouTube ? '[Agent] Verify & Start 7-Day YouTube Hold' : '[Agent] Verify & Start 15-Minute Hold'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ACTION STAGE 4: PRODUCTION EVALUATION HOLD (7-Day YouTube vs 15-Min other platforms) */}
              {tx.status === 'buyer_7_day_evaluation' && (
                <BuyerEvaluationActions
                  transactionId={tx.id}
                  isBuyer={isBuyer}
                  agreedPrice={tx.agreed_price}
                  platform={tx.listings?.platform}
                  endsAt={tx.evaluation_ends_at}
                  startedAt={tx.evaluation_started_at}
                  holdDurationMinutes={tx.hold_duration_minutes}
                  sellerPayoutStatus={tx.payout_status}
                />
              )}

              {/* ACTION STAGE: DISPUTED */}
              {tx.status === 'disputed' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-7 text-red-950 space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-red-900">Escrow Deal in Formal Dispute</h4>
                      <p className="text-xs text-red-700">All funds and credentials are frozen pending arbitration</p>
                    </div>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    A dispute ticket has been registered on this transaction. A Dealoura Senior Compliance Officer is reviewing the chat logs, credentials, and submitted evidence. Neither party can release funds or transfer ownership until an arbitration verdict is issued.
                  </p>
                </div>
              )}

              {/* ACTION STAGE 5: COMPLETED */}
              {tx.status === 'completed' && (
                <div className="space-y-6">
                  <div className="bg-[#ffffff] border border-[#d2dde4] rounded-2xl p-6 sm:p-8 text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-[#010b13] mx-auto" />
                    <h3 className="text-xl sm:text-2xl font-black text-[#010b13]">Escrow Deal Completed 🎉</h3>
                    <p className="text-xs text-[#526371] max-w-md mx-auto leading-relaxed">
                      Primary ownership has been successfully assigned to the buyer and payout of <strong>${sellerPayout}</strong> has been released to the seller.
                    </p>
                  </div>

                  {/* Review Form */}
                  {!hasReviewed ? (
                    <div className="bg-[#ebf1f5] p-6 rounded-2xl border border-[#d2dde4]">
                      <h4 className="text-sm font-bold text-[#010b13] mb-1">
                        Leave Feedback for the {isBuyer ? 'Seller' : 'Buyer'}
                      </h4>
                      <p className="text-xs text-[#526371] mb-4">Help maintain honest reputation in the Dealoura marketplace.</p>

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
                          <label className="block text-xs font-bold text-[#010b13] mb-1">Rating</label>
                          <select
                            name="rating"
                            required
                            className="w-full text-xs font-bold rounded-xl border border-[#d2dde4] py-2.5 px-3 bg-[#ffffff] text-[#010b13]"
                          >
                            <option value="5">⭐⭐⭐⭐⭐ (5 - Flawless Deal)</option>
                            <option value="4">⭐⭐⭐⭐ (4 - Great)</option>
                            <option value="3">⭐⭐⭐ (3 - Average)</option>
                            <option value="2">⭐⭐ (2 - Below Expectations)</option>
                            <option value="1">⭐ (1 - Terrible)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#010b13] mb-1">Review Comments</label>
                          <textarea
                            name="comment"
                            rows={2}
                            required
                            placeholder="How did the account transfer go?"
                            className="w-full text-xs rounded-xl border border-[#d2dde4] bg-[#ffffff] text-[#010b13] p-3 outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="py-2.5 px-5 bg-[#010b13] hover:bg-[#18263B] text-[#ebf1f5] font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Submit Feedback
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-[#ebf1f5] p-4 rounded-xl text-center text-xs text-[#526371] italic border border-[#d2dde4]">
                      Thank you! You have already submitted a review for this transaction.
                    </div>
                  )}
                </div>
              )}

              {/* SELLER PAYOUT DESTINATION CARD (Visible to Seller or on Completion) */}
              {(!isBuyer || tx.status === 'completed') && (
                <SellerPayoutCard
                  transactionId={tx.id}
                  agreedPrice={tx.agreed_price}
                  escrowFee={tx.escrow_fee}
                  payoutStatus={tx.payout_status}
                  payoutMethod={tx.seller_payout_method}
                  payoutDetails={tx.seller_payout_details}
                  payoutTxHash={tx.payout_tx_hash}
                  payoutSentAt={tx.payout_sent_at}
                  isDealCompleted={tx.status === 'completed'}
                />
              )}

              {/* ACTION STAGE: DISPUTED */}
              {tx.status === 'disputed' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-900 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                  <h3 className="text-base font-black text-red-950">Transaction Under Formal Dispute</h3>
                  <p className="text-xs text-red-800 max-w-md mx-auto">
                    An arbitration ticket is currently open. Dealoura staff are inspecting chat history and verification evidence. Funds are frozen in escrow until resolution.
                  </p>
                </div>
              )}

              {/* Open Dispute Form (Available during active transfer) */}
              {tx.status !== 'completed' && tx.status !== 'cancelled' && tx.status !== 'disputed' && (
                <div className="pt-6 border-t border-[#d2dde4]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase text-[#526371] tracking-wider">Need Assistance?</h4>
                    <span className="text-[11px] text-[#526371]">Escrow Protection Guarantee</span>
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
                      className="w-full text-xs rounded-xl border border-[#d2dde4] bg-[#ebf1f5]/30 text-[#010b13] p-3 outline-none focus:border-red-500 focus:bg-[#ffffff] transition"
                    />
                    <button
                      type="submit"
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
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
            <div className="bg-[#010b13] text-[#ebf1f5] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 border border-[#18263B]">
              <div className="flex items-center space-x-2 text-[#ebf1f5]">
                <ShieldCheck className="w-5 h-5 text-[#ebf1f5]" />
                <span className="font-extrabold text-sm uppercase tracking-wide">Dealoura Escrow Vault</span>
              </div>

              <div className="space-y-3 text-xs border-y border-[#18263B] py-4">
                <div className="flex justify-between text-[#ebf1f5]/80">
                  <span>Agreed Price</span>
                  <span className="font-mono font-bold text-[#ebf1f5]">${tx.agreed_price}</span>
                </div>
                <div className="flex justify-between text-[#ebf1f5]/80">
                  <span>Escrow Protection Fee (5%)</span>
                  <span className="font-mono">${escrowFee}</span>
                </div>
                <div className="flex justify-between text-[#ebf1f5] pt-2 border-t border-[#18263B] font-bold text-sm">
                  <span>Seller Net Payout</span>
                  <span className="font-mono text-[#ebf1f5]">${sellerPayout}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#ebf1f5]/70">
                <p>• Assigned Escrow Officer: <strong className="text-[#ebf1f5]">escrow@dealoura.com</strong></p>
                <p>• Inspection Status: Segregated Custody</p>
                <p>• Payout Guarantee: Released upon 7-day confirmation</p>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/messages/escrow"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#18263B] hover:bg-[#ebf1f5] hover:text-[#010b13] text-[#ebf1f5] text-xs font-bold rounded-xl transition border border-[#d2dde4]/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact Escrow Agent Desk
                </Link>
              </div>
            </div>

            {/* Audit Trail Timeline */}
            <div className="bg-[#ffffff] rounded-2xl p-6 sm:p-7 shadow-xs border border-[#d2dde4] space-y-4">
              <h3 className="text-sm font-black text-[#010b13]">Official Audit Trail</h3>
              
              {timeline.length > 0 ? (
                <div className="flow-root">
                  <ul className="-mb-6">
                    {timeline.map((event: any, eventIdx: number) => (
                      <li key={eventIdx}>
                        <div className="relative pb-6">
                          {eventIdx !== timeline.length - 1 ? (
                            <span
                              className="absolute top-3 left-3 -ml-px h-full w-0.5 bg-[#d2dde4]"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3 items-start">
                            <div className="h-6 w-6 rounded-full bg-[#010b13] text-[#ebf1f5] flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                              {eventIdx + 1}
                            </div>
                            <div className="min-w-0 flex-1 flex justify-between space-x-2">
                              <div>
                                <p className="text-xs font-medium text-[#010b13] leading-relaxed">{event.description}</p>
                              </div>
                              <span className="text-[10px] font-mono text-[#526371] shrink-0">
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
                <p className="text-xs text-[#526371]">No audit events logged yet.</p>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
