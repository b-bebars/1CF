import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)

    // Auto-promote configured admin email
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
      if (user?.email?.toLowerCase() === adminEmail && (user.app_metadata?.role !== 'admin')) {
        const { createClient } = await import('@supabase/supabase-js')
        const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
        await admin.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, role: 'admin' } })
      }
      // Ensure participant row exists
      if (user) {
        await supabase.from('participants').upsert({
          id: user.id,
          display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Rose',
          avatar: '🌹',
        }, { onConflict: 'id', ignoreDuplicates: true })
      }
    } catch (e) { console.error('post-auth setup error', e) }
  }
  return NextResponse.redirect(new URL(next, request.url))
}
