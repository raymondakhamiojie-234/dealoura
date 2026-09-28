import { MessageSquare } from 'lucide-react'

export default function InboxEmptyState() {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center p-8 text-center h-full">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Your Messages</h3>
      <p className="text-gray-500 max-w-sm">
        Select a conversation from the sidebar to view your messages and continue negotiating.
      </p>
    </div>
  )
}
