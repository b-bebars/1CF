import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServer } from '@/lib/supabase/server'

const admin = () => getAdminClient()

function daysBetween(a, b) { return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000) }
function calcStreak(p) {
  if (!p?.last_active) return 1
  const d = daysBetween(p.last_active, new Date())
  if (d === 0) return p.streak || 1
  if (d === 1) return (p.streak || 0) + 1
  return 1
}
function toParticipant(p) {
  if (!p) return null
  return {
    id: p.id, name: p.display_name, avatar: p.avatar, points: p.points || 0, km: Number(p.km) || 0,
    streak: p.streak || 1, completed: p.completed || 0, completedChallengeIds: p.completed_challenge_ids || [],
  }
}

async function handler(request, ctx) {
  const method = request.method
  const p = await ctx?.params
  const path = (p?.path || []).join('/')
  const url = new URL(request.url)
  const sb = admin()

  try {
    if (method === 'GET' && !path) return NextResponse.json({ ok: true, service: 'RoseUp Quest 2026 · Supabase' })

    // ---------- Session/me ----------
    if (method === 'GET' && path === 'me') {
      const server = await createSupabaseServer()
      const { data: { user } } = await server.auth.getUser()
      if (!user) return NextResponse.json({ user: null })
      const { data: prof } = await sb.from('participants').select('*').eq('id', user.id).maybeSingle()
      return NextResponse.json({ user: { id: user.id, email: user.email, role: user.app_metadata?.role || 'user' }, participant: toParticipant(prof) })
    }

    // ---------- Participants ----------
    if (method === 'POST' && path === 'participants') {
      const body = await request.json()
      const server = await createSupabaseServer()
      const { data: { user } } = await server.auth.getUser()
      if (!user) return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
      const { data } = await sb.from('participants').upsert({
        id: user.id,
        display_name: body.name || user.email?.split('@')[0] || 'Rose',
        avatar: body.avatar || '🌹',
      }, { onConflict: 'id' }).select().single()
      return NextResponse.json(toParticipant(data))
    }

    if (method === 'GET' && path.startsWith('participants/')) {
      const id = path.split('/')[1]
      const { data } = await sb.from('participants').select('*').eq('id', id).maybeSingle()
      if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
      return NextResponse.json(toParticipant(data))
    }
    if (method === 'DELETE' && path.startsWith('participants/')) {
      const id = path.split('/')[1]
      await sb.from('participants').delete().eq('id', id)
      await sb.auth.admin.deleteUser(id).catch(() => {})
      return NextResponse.json({ ok: true })
    }

    // ---------- Stats ----------
    if (method === 'GET' && path === 'stats') {
      const { data: parts } = await sb.from('participants').select('points, km')
      const { data: top } = await sb.from('participants').select('id, display_name, avatar, points').order('points', { ascending: false }).limit(3)
      const { data: meta } = await sb.from('meta').select('value').eq('key', 'config').maybeSingle()
      const totalPoints = (parts || []).reduce((s, p) => s + (p.points || 0), 0)
      const totalKm = Math.round((parts || []).reduce((s, p) => s + Number(p.km || 0), 0) * 10) / 10
      const fundGoal = meta?.value?.fundGoal || 250000
      return NextResponse.json({
        totalPoints, totalKm, totalParticipants: parts?.length || 0,
        totalDonations: Math.round(totalPoints * 1.25 + 12480), fundGoal,
        topParticipants: (top || []).map(t => ({ id: t.id, name: t.display_name, avatar: t.avatar, points: t.points })),
      })
    }

    // ---------- Leaderboard ----------
    if (method === 'GET' && path === 'leaderboard') {
      const q = url.searchParams.get('q') || ''
      let query = sb.from('participants').select('*').order('points', { ascending: false }).limit(100)
      if (q) query = query.ilike('display_name', `%${q}%`)
      const { data } = await query
      const list = (data || []).map((p, i) => ({ ...toParticipant(p), rank: i + 1 }))
      return NextResponse.json({ leaderboard: list })
    }

    // ---------- Challenges ----------
    if (method === 'GET' && path === 'challenges/daily') {
      const userId = url.searchParams.get('userId')
      const { data } = await sb.from('challenges').select('*').eq('type', 'daily').eq('active', true).order('created_at')
      let done = new Set()
      if (userId) {
        const { data: p } = await sb.from('participants').select('completed_challenge_ids').eq('id', userId).maybeSingle()
        done = new Set(p?.completed_challenge_ids || [])
      }
      return NextResponse.json({ challenges: (data || []).map(c => ({ ...c, completed: done.has(c.id) })) })
    }
    if (method === 'GET' && path === 'challenges') {
      const type = url.searchParams.get('type')
      let q = sb.from('challenges').select('*').order('created_at', { ascending: false })
      if (type) q = q.eq('type', type)
      else q = q.in('type', ['weekly', 'special'])
      const { data } = await q
      return NextResponse.json({ challenges: data || [] })
    }
    if (method === 'POST' && path === 'challenges') {
      const b = await request.json()
      const id = b.id || `${b.type?.[0] || 'x'}-${Date.now()}`
      const { data } = await sb.from('challenges').insert({
        id, type: b.type || 'weekly', title: b.title || 'Untitled', description: b.description || '',
        icon: b.icon || '⭐', points: Number(b.points) || 50, active: b.active !== false, category: b.category || null,
      }).select().single()
      return NextResponse.json(data)
    }
    if (method === 'PUT' && path.startsWith('challenges/')) {
      const id = path.split('/')[1]
      const b = await request.json()
      const { id: _i, _id, createdAt, created_at, ...upd } = b
      const { data } = await sb.from('challenges').update(upd).eq('id', id).select().single()
      return NextResponse.json(data)
    }
    if (method === 'DELETE' && path.startsWith('challenges/')) {
      await sb.from('challenges').delete().eq('id', path.split('/')[1])
      return NextResponse.json({ ok: true })
    }

    // ---------- Complete challenge (daily quick-complete) ----------
    if (method === 'POST' && path === 'challenges/complete') {
      const { userId, challengeId, points = 0, km = 0 } = await request.json()
      if (!userId || !challengeId) return NextResponse.json({ error: 'missing' }, { status: 400 })
      const { data: p } = await sb.from('participants').select('*').eq('id', userId).maybeSingle()
      if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 })
      if ((p.completed_challenge_ids || []).includes(challengeId))
        return NextResponse.json({ ok: true, alreadyCompleted: true, participant: toParticipant(p) })
      const newStreak = calcStreak(p)
      const { data: updated } = await sb.from('participants').update({
        points: (p.points || 0) + Number(points),
        km: Number(p.km || 0) + Number(km),
        completed: (p.completed || 0) + 1,
        completed_challenge_ids: [...(p.completed_challenge_ids || []), challengeId],
        streak: newStreak, last_active: new Date().toISOString(),
      }).eq('id', userId).select().single()
      return NextResponse.json({ ok: true, participant: toParticipant(updated) })
    }

    // ---------- Submissions ----------
    if (method === 'POST' && path === 'submissions') {
      const b = await request.json()
      const server = await createSupabaseServer()
      const { data: { user } } = await server.auth.getUser()
      if (!user) return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
      let proof_path = null
      // If proofDataUrl provided, upload to storage
      if (b.proofDataUrl?.startsWith('data:')) {
        const [meta, b64] = b.proofDataUrl.split(',')
        const ext = /image\/(\w+)/.exec(meta)?.[1] || 'jpg'
        const buf = Buffer.from(b64, 'base64')
        const path = `${user.id}/${b.challengeId}/${Date.now()}.${ext}`
        const { error } = await sb.storage.from('proof-images').upload(path, buf, { contentType: `image/${ext}` })
        if (!error) proof_path = path
      }
      const { data } = await sb.from('submissions').insert({
        user_id: user.id, user_name: b.userName, user_avatar: b.userAvatar,
        challenge_id: b.challengeId, challenge_title: b.challengeTitle, challenge_type: b.challengeType,
        points: Number(b.points) || 0, km: Number(b.km) || 0, proof_path, note: b.note || '',
      }).select().single()
      return NextResponse.json(data)
    }
    if (method === 'GET' && path === 'submissions') {
      const status = url.searchParams.get('status')
      const userId = url.searchParams.get('userId')
      let q = sb.from('submissions').select('*').order('created_at', { ascending: false }).limit(200)
      if (status) q = q.eq('status', status)
      if (userId) q = q.eq('user_id', userId)
      const { data } = await q
      // Generate signed URLs for proofs
      const out = await Promise.all((data || []).map(async s => {
        let proofDataUrl = null
        if (s.proof_path) {
          const { data: signed } = await sb.storage.from('proof-images').createSignedUrl(s.proof_path, 3600)
          proofDataUrl = signed?.signedUrl || null
        }
        return { id: s.id, userId: s.user_id, userName: s.user_name, userAvatar: s.user_avatar,
          challengeId: s.challenge_id, challengeTitle: s.challenge_title, challengeType: s.challenge_type,
          points: s.points, km: s.km, note: s.note, status: s.status, reason: s.reason,
          createdAt: s.created_at, proofDataUrl }
      }))
      return NextResponse.json({ submissions: out })
    }
    if (method === 'POST' && path.startsWith('submissions/') && path.endsWith('/approve')) {
      const id = path.split('/')[1]
      const { data: sub } = await sb.from('submissions').select('*').eq('id', id).maybeSingle()
      if (!sub) return NextResponse.json({ error: 'not found' }, { status: 404 })
      if (sub.status === 'approved') return NextResponse.json({ ok: true, alreadyApproved: true })
      await sb.from('submissions').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', id)
      const { data: p } = await sb.from('participants').select('*').eq('id', sub.user_id).maybeSingle()
      if (p) {
        const newStreak = calcStreak(p)
        await sb.from('participants').update({
          points: (p.points || 0) + (sub.points || 0),
          km: Number(p.km || 0) + Number(sub.km || 0),
          completed: (p.completed || 0) + 1,
          completed_challenge_ids: Array.from(new Set([...(p.completed_challenge_ids || []), sub.challenge_id])),
          streak: newStreak, last_active: new Date().toISOString(),
        }).eq('id', sub.user_id)
      }
      return NextResponse.json({ ok: true })
    }
    if (method === 'POST' && path.startsWith('submissions/') && path.endsWith('/reject')) {
      const id = path.split('/')[1]
      const b = await request.json().catch(() => ({}))
      await sb.from('submissions').update({ status: 'rejected', reason: b?.reason || '', reviewed_at: new Date().toISOString() }).eq('id', id)
      return NextResponse.json({ ok: true })
    }

    // ---------- Bonus ----------
    if (method === 'POST' && path === 'admin/bonus') {
      const { userId, points = 0, reason = 'Bonus' } = await request.json()
      if (!userId) return NextResponse.json({ error: 'missing' }, { status: 400 })
      const { data: p } = await sb.from('participants').select('points').eq('id', userId).maybeSingle()
      await sb.from('participants').update({ points: (p?.points || 0) + Number(points) }).eq('id', userId)
      await sb.from('bonuses').insert({ user_id: userId, points: Number(points), reason })
      return NextResponse.json({ ok: true })
    }

    // ---------- Promote to admin ----------
    if (method === 'POST' && path === 'admin/promote') {
      const { userId } = await request.json()
      const { data: u } = await sb.auth.admin.getUserById(userId)
      const prev = u?.user?.app_metadata || {}
      await sb.auth.admin.updateUserById(userId, { app_metadata: { ...prev, role: 'admin' } })
      return NextResponse.json({ ok: true })
    }

    // ---------- Announcements ----------
    if (method === 'GET' && path === 'announcements') {
      const { data } = await sb.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(20)
      return NextResponse.json({ announcements: (data || []).map(a => ({ ...a, body: a.body })) })
    }
    if (method === 'POST' && path === 'announcements') {
      const b = await request.json()
      const { data } = await sb.from('announcements').insert({ title: b.title, body: b.body, pinned: !!b.pinned }).select().single()
      return NextResponse.json(data)
    }
    if (method === 'DELETE' && path.startsWith('announcements/')) {
      await sb.from('announcements').delete().eq('id', path.split('/')[1])
      return NextResponse.json({ ok: true })
    }

    // ---------- Admin analytics + participants ----------
    if (method === 'GET' && path === 'admin/analytics') {
      const [{ data: participants }, { data: submissions }, { data: challenges }] = await Promise.all([
        sb.from('participants').select('*'),
        sb.from('submissions').select('*'),
        sb.from('challenges').select('*'),
      ])
      const totalPoints = (participants || []).reduce((s, p) => s + (p.points || 0), 0)
      const totalKm = Math.round((participants || []).reduce((s, p) => s + Number(p.km || 0), 0) * 10) / 10
      const pending = (submissions || []).filter(s => s.status === 'pending').length
      const approved = (submissions || []).filter(s => s.status === 'approved').length
      const rejected = (submissions || []).filter(s => s.status === 'rejected').length
      const now = new Date()
      const activity = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now); d.setDate(d.getDate() - (6 - i))
        return { day: `${d.getMonth() + 1}/${d.getDate()}`,
          submissions: (submissions || []).filter(s => new Date(s.created_at).toDateString() === d.toDateString()).length }
      })
      return NextResponse.json({
        totalParticipants: participants?.length || 0, totalPoints, totalKm,
        totalChallenges: challenges?.length || 0,
        submissions: { pending, approved, rejected, total: submissions?.length || 0 }, activity,
      })
    }
    if (method === 'GET' && path === 'admin/participants') {
      const { data } = await sb.from('participants').select('*').order('points', { ascending: false })
      return NextResponse.json({ participants: (data || []).map(toParticipant) })
    }

    // ---------- CSV export ----------
    if (method === 'GET' && path === 'admin/export.csv') {
      const { data } = await sb.from('participants').select('*').order('points', { ascending: false })
      const rows = [['id', 'name', 'avatar', 'points', 'km', 'streak', 'completed', 'created_at']]
      ;(data || []).forEach(p => rows.push([p.id, `"${(p.display_name || '').replace(/"/g, '""')}"`, p.avatar || '',
        p.points || 0, p.km || 0, p.streak || 0, p.completed || 0, p.created_at || '']))
      return new Response(rows.map(r => r.join(',')).join('\n'),
        { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="roseup-participants.csv"' } })
    }

    return NextResponse.json({ error: 'not found', path, method }, { status: 404 })
  } catch (e) {
    console.error('API error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler

// Allow large proof video uploads (~20MB base64 for 15MB video)
export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
