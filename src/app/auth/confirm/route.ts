import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()

  // Handle PKCE Code exchange (standard for password reset and modern auth)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Handle token_hash verification (email OTPs)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/error?message=Could not verify email', request.url))
}
