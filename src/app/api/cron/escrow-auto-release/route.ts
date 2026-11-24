import { NextRequest, NextResponse } from 'next/server'
import { autoReleaseAllExpiredTransactions } from '@/app/actions/transactions'

/**
 * Escrow Auto-Release Cron Worker Endpoint
 * Triggered periodically (e.g. every minute or every 5 minutes by Vercel Cron, Supabase pg_cron, or an external pinger).
 * Also accessible via POST.
 */
export async function GET(request: NextRequest) {
  return handleAutoRelease(request)
}

export async function POST(request: NextRequest) {
  return handleAutoRelease(request)
}

async function handleAutoRelease(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('authorization')
      const url = new URL(request.url)
      const querySecret = url.searchParams.get('secret')

      const isAuthorized =
        authHeader === `Bearer ${cronSecret}` ||
        querySecret === cronSecret

      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid CRON_SECRET' },
          { status: 401 }
        )
      }
    }

    const result = await autoReleaseAllExpiredTransactions()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    })
  } catch (error: any) {
    console.error('Cron Escrow Auto-Release Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
