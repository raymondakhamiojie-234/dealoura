import Link from 'next/link'
import { ShieldCheck, Mail, ArrowRight, Clock, CheckCircle } from 'lucide-react'

export default function EscrowAgentPage() {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900">Dealoura Escrow Agent Support</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <p className="text-sm text-gray-500">Official Middle-Man Transaction Service</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
          <h3 className="font-semibold text-blue-900 mb-2">How Escrow Protection Works</h3>
          <ul className="space-y-3 text-sm text-blue-800">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <span><strong>Buyer deposits funds:</strong> Money is held securely in the Dealoura escrow vault.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <span><strong>Seller transfers to Escrow Agent:</strong> The seller grants ownership to our escrow address (<code className="bg-blue-100 px-1 rounded">escrow@dealoura.com</code>).</span>
            </li>
            <li className="flex items-start">
              <Clock className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <span><strong>7-day evaluation period:</strong> The buyer is assigned manager access to inspect and verify the account thoroughly.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <span><strong>Primary ownership & payout:</strong> Once verified, ownership is finalized to the buyer and payout is released to the seller.</span>
            </li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Need direct assistance with an active deal?</h3>
          <p className="text-sm text-gray-600">
            For urgent escrow inquiries or ownership verification questions, you can contact our dedicated escrow team:
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Direct Email:</span>
            <a href="mailto:escrow@dealoura.com" className="text-blue-600 hover:underline">
              escrow@dealoura.com
            </a>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View your active escrow transactions <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
