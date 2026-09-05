import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServer } from '@/lib/supabase/server'

const admin = () => getAdminClient()

const WELCOME_POINTS = 10
const STREAK_MILESTONES = { 3: 15, 7: 50, 14: 100, 30: 250 }
const CHALLENGE_COLUMNS = ['title', 'description', 'icon', 'points', 'category', 'active', 'ends_at', 'requires_submission']
const DEFAULT_GOAL = 250000

// ---------- helpers ----------
function startOfUtcDay(d) { const x = new Date(d); x.setUTCHours(0, 0, 0, 0); return x.getTime() }
function daysBetween(a, b) { return Math.floor((startOfUtcDay(b) - startOfUtcDay(a)) / 86400000) }

// Streak shown to the user: 0 until the first completion, and 0 again if a full day was skipped
function effectiveStreak(p) {
  if (!p || !(p.completed > 0)) return 0
  if (!p.last_active) return p.streak || 0
  return daysBetween(p.last_active, new Date()) > 1 ? 0 : (p.streak || 0)
}
// Streak value after a completion happening right now
function nextStreak(p) {
  if (!(p?.completed > 0) || !p.last_active) return 1
  const d = daysBetween(p.last_active, new Date())
  if (d === 0) return p.streak || 1
  if (d === 1) return (p.streak || 0) + 1
  return 1
}
function isCustom(c) { return c?.category === 'custom' || /^d-\d+$/.test(c?.id || '') }
function parseInstagram(note) { const m = /^@([\w.]+)/.exec(note || ''); return m ? m[1] : null }

function toParticipant(p) {
  if (!p) return null
  return {
    id: p.id, name: p.display_name, avatar: p.avatar, points: p.points || 0, km: Number(p.km) || 0,
    streak: effectiveStreak(p), rawStreak: p.streak || 0, completed: p.completed || 0,
    completedChallengeIds: p.completed_challenge_ids || [], lastActive: p.last_active, createdAt: p.created_at,
  }
}
function toChallenge(c, extra = {}) { return { ...c, custom: isCustom(c), ...extra } }

// Daily rotation done in JS (the SQL RPC is blocked by safe-update when called through the API).
// Deterministic per UTC day: same 5 challenges for everyone until midnight UTC.
async function rotateDaily(sb) {
  const now = new Date()
  const dayOfYear = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86400000)
  const seed = `${now.getUTCFullYear()}${String(dayOfYear).padStart(3, '0')}`
  const { data: pool, error } = await sb.from('challenges').select('id, category').eq('type', 'daily')
  if (error) throw new Error(error.message)
  const customIds = (pool || []).filter(c => isCustom(c)).map(c => c.id)
  const candidates = (pool || []).filter(c => !isCustom(c))
  const h = (s) => createHash('md5').update(s).digest('hex')
  candidates.sort((a, b) => h(a.id + seed).localeCompare(h(b.id + seed)))
  const picks = candidates.slice(0, 5).map(c => c.id)
  await sb.from('challenges').update({ active: false }).eq('type', 'daily')
  if (picks.length) await sb.from('challenges').update({ active: true }).in('id', picks)
  if (customIds.length) await sb.from('challenges').update({ active: true }).in('id', customIds)
  await sb.from('participants').update({ completed_challenge_ids: [] }).not('id', 'is', null)
  try { await sb.from('challenge_completions').delete().lt('completed_at', new Date(Date.now() - 30 * 86400000).toISOString()) } catch {}
  return { picks, customIds, seed }
}

async function getConfig(sb) {
  const { data } = await sb.from('meta').select('value').eq('key', 'config').maybeSingle()
  return { fundGoal: DEFAULT_GOAL, totalDonations: 0, donors: 0, ...(data?.value || {}) }
}

// Award a completed challenge: points + km + streak (+ streak milestone bonus)
async function awardCompletion(sb, p, { points = 0, km = 0, challengeId }) {
  const oldStreak = effectiveStreak(p)
  const newStreak = nextStreak(p)
  let streakBonus = 0, milestone = null
  if (newStreak > oldStreak && STREAK_MILESTONES[newStreak]) { streakBonus = STREAK_MILESTONES[newStreak]; milestone = newStreak }
  const { data: updated } = await sb.from('participants').update({
    points: (p.points || 0) + Number(points || 0) + streakBonus,
    km: Number(p.km || 0) + Number(km || 0),
    completed: (p.completed || 0) + 1,
    completed_challenge_ids: Array.from(new Set([...(p.completed_challenge_ids || []), challengeId])),
    streak: newStreak, last_active: new Date().toISOString(),
  }).eq('id', p.id).select().single()
  if (streakBonus) { try { await sb.from('bonuses').insert({ user_id: p.id, points: streakBonus, reason: `streak_${milestone}` }) } catch {} }
  try { await sb.from('challenge_completions').insert({ user_id: p.id, challenge_id: challengeId }) } catch {}
  return { updated, streak: newStreak, streakBonus, milestone }
}

async function handler(request, ctx) {
  const method = request.method
  const prm = await ctx?.params
  const path = (prm?.path || []).join('/')
  const url = new URL(request.url)
  try {
    if (method === 'GET' && !path) return NextResponse.json({ ok: true, service: 'RoseUp Quest 2026 · Supabase' })

    const sb = admin()

    // ---------- Session / me (+ welcome bonus) ----------
    if (method === 'GET' && path === 'me') {
      const server = await createSupabaseServer()
      const { data: { user } } = await server.auth.getUser()
      if (!user) return NextResponse.json({ user: null })
      let role = user.app_metadata?.role || 'user'
      try { const { data: fresh } = await sb.auth.admin.getUserById(user.id); role = fresh?.user?.app_metadata?.role || role } catch {}
      if (role !== 'admin' && process.env.ADMIN_EMAIL && user.email?.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
        try { await sb.auth.admin.updateUserById(user.id, { app_metadata: { ...(user.app_metadata || {}), role: 'admin' } }); role = 'admin' } catch {}
      }
      let { data: prof } = await sb.from('participants').select('*').eq('id', user.id).maybeSingle()
      if (!prof) {
        const { data: created } = await sb.from('participants').upsert({
          id: user.id,
          display_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Rose',
          avatar: user.user_metadata?.avatar || '🌹',
        }, { onConflict: 'id' }).select().single()
        prof = created
      }
      // Welcome bonus: exactly once per user (tracked in `bonuses`)
      let welcomeAwarded = false
      if (prof) {
        const { data: wb } = await sb.from('bonuses').select('id').eq('user_id', user.id).eq('reason', 'welcome').limit(1)
        if (!wb?.length) {
          const { error: bErr } = await sb.from('bonuses').insert({ user_id: user.id, points: WELCOME_POINTS, reason: 'welcome' })
          if (!bErr) {
            const { data: up } = await sb.from('participants').update({ points: (prof.points || 0) + WELCOME_POINTS }).eq('id', user.id).select().single()
            if (up) prof = up
            welcomeAwarded = true
          }
        }
      }
      return NextResponse.json({ user: { id: user.id, email: user.email, role }, participant: toParticipant(prof), welcomeAwarded, welcomePoints: WELCOME_POINTS })
    }

    // ---------- Participants ----------
    if (method === 'POST' && path === 'participants') {
      const body = await request.json()
      const server = await createSupabaseServer()
      const { data: { user } } = await server.auth.getUser()
      if (!user) return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
      const { data } = await sb.from('participants').upsert({
        id: user.id, display_name: body.name || user.email?.split('@')[0] || 'Rose', avatar: body.avatar || '🌹',
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
      try { await sb.auth.admin.deleteUser(id) } catch {}
      return NextResponse.json({ ok: true })
    }

    // ---------- Stats (real numbers only) ----------
    if (method === 'GET' && path === 'stats') {
      const [{ data: parts }, { count: participantsCount }, { data: top }, cfg] = await Promise.all([
        sb.from('participants').select('points, km'),
        sb.from('participants').select('*', { count: 'exact', head: true }),
        sb.from('participants').select('id, display_name, avatar, points').order('points', { ascending: false }).limit(10),
        getConfig(sb),
      ])
      const totalPoints = (parts || []).reduce((s, p) => s + (p.points || 0), 0)
      const totalKm = Math.round((parts || []).reduce((s, p) => s + Number(p.km || 0), 0) * 10) / 10
      return NextResponse.json({
        totalPoints, totalKm,
        totalParticipants: participantsCount ?? (parts?.length || 0),
        totalDonations: Number(cfg.totalDonations) || 0,
        donors: Number(cfg.donors) || 0,
        fundGoal: Number(cfg.fundGoal) || DEFAULT_GOAL,
        topParticipants: (top || []).map(t => ({ id: t.id, name: t.display_name, avatar: t.avatar, points: t.points })),
      })
    }

    // ---------- Leaderboard ----------
    if (method === 'GET' && path === 'leaderboard') {
      const q = url.searchParams.get('q') || ''
      let query = sb.from('participants').select('*').order('points', { ascending: false }).limit(100)
      if (q) query = query.ilike('display_name', `%${q}%`)
      const { data } = await query
      return NextResponse.json({ leaderboard: (data || []).map((p, i) => ({ ...toParticipant(p), rank: i + 1 })) })
    }

    // ---------- Challenges (daily pool + admin custom) ----------
    if (method === 'GET' && path === 'challenges/daily') {
      const userId = url.searchParams.get('userId')
      const { data } = await sb.from('challenges').select('*').eq('type', 'daily').or('active.eq.true,category.eq.custom')
      let done = new Set(), pending = new Set()
      if (userId && userId !== 'guest') {
        const [{ data: p }, { data: subs }] = await Promise.all([
          sb.from('participants').select('completed_challenge_ids').eq('id', userId).maybeSingle(),
          sb.from('submissions').select('challenge_id').eq('user_id', userId).eq('status', 'pending'),
        ])
        done = new Set(p?.completed_challenge_ids || [])
        pending = new Set((subs || []).map(s => s.challenge_id))
      }
      const list = (data || [])
        .map(c => toChallenge(c, { completed: done.has(c.id), pending: pending.has(c.id) }))
        .sort((a, b) => (Number(b.custom) - Number(a.custom)) || ((b.points || 0) - (a.points || 0)))
      return NextResponse.json({ challenges: list })
    }
    if (method === 'GET' && path === 'challenges') {
      // Admin: whole pool + custom (NOTE: table has no created_at column)
      const { data, error } = await sb.from('challenges').select('*').eq('type', 'daily').order('points', { ascending: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const list = (data || []).map(c => toChallenge(c)).sort((a, b) => (Number(b.custom) - Number(a.custom)) || (Number(b.active) - Number(a.active)))
      return NextResponse.json({ challenges: list })
    }
    if (method === 'POST' && path === 'challenges') {
      const b = await request.json()
      const id = b.id || `d-${Date.now()}`
      const { data, error } = await sb.from('challenges').insert({
        id, type: 'daily', title: b.title || 'Untitled', description: b.description || '', icon: b.icon || '⭐',
        points: Number(b.points) || 20, active: true, category: 'custom', requires_submission: true,
      }).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(toChallenge(data))
    }
    if (method === 'PUT' && path.startsWith('challenges/')) {
      const id = path.split('/')[1]
      const b = await request.json()
      const upd = {}
      for (const k of CHALLENGE_COLUMNS) if (b[k] !== undefined) upd[k] = b[k]
      if (upd.points !== undefined) upd.points = Number(upd.points) || 0
      const { data, error } = await sb.from('challenges').update({ ...upd, type: 'daily' }).eq('id', id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(toChallenge(data))
    }
    if (method === 'DELETE' && path.startsWith('challenges/')) {
      const { error } = await sb.from('challenges').delete().eq('id', path.split('/')[1])
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    // ---------- Quick complete (legacy, kept for compatibility) ----------
    if (method === 'POST' && path === 'challenges/complete') {
      const { userId, challengeId, points = 0, km = 0 } = await request.json()
      if (!userId || !challengeId) return NextResponse.json({ error: 'missing' }, { status: 400 })
      const { data: p } = await sb.from('participants').select('*').eq('id', userId).maybeSingle()
      if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 })
      if ((p.completed_challenge_ids || []).includes(challengeId)) return NextResponse.json({ ok: true, alreadyCompleted: true, participant: toParticipant(p) })
      const r = await awardCompletion(sb, p, { points, km, challengeId })
      return NextResponse.json({ ok: true, participant: toParticipant(r.updated), streak: r.streak, streakBonus: r.streakBonus })
    }

    // ---------- Signed upload URL (direct client upload to Storage) ----------
    if (method === 'POST' && path === 'uploads/signed-url') {
      const server = await createSupabaseServer()
      const { data: { user } } = await server.auth.getUser()
      if (!user) return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
      const { challengeId, fileName } = await request.json()
      const safeName = String(fileName || 'proof').replace(/[^\w.\-]/g, '_')
      const objectPath = `${user.id}/${challengeId || 'proof'}/${Date.now()}-${safeName}`
      const { data, error } = await sb.storage.from('proof-images').createSignedUploadUrl(objectPath)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ path: objectPath, token: data.token, signedUrl: data.signedUrl })
    }

    // ---------- Submissions ----------
    if (method === 'POST' && path === 'submissions') {
      const b = await request.json()
      const server = await createSupabaseServer()
      const { data: { user } } = await server.auth.getUser()
      if (!user) return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
      if (!b.challengeId) return NextResponse.json({ error: 'missing challengeId' }, { status: 400 })

      const { data: existing } = await sb.from('submissions').select('id').eq('user_id', user.id).eq('challenge_id', b.challengeId).eq('status', 'pending').limit(1)
      if (existing?.length) return NextResponse.json({ error: 'already_pending', id: existing[0].id }, { status: 409 })

      let proof_path = b.proofPath || null
      if (!proof_path && b.proofDataUrl?.startsWith('data:')) {
        const [meta, b64] = b.proofDataUrl.split(',')
        const ext = /image\/(\w+)/.exec(meta)?.[1] || 'jpg'
        const buf = Buffer.from(b64, 'base64')
        const oPath = `${user.id}/${b.challengeId}/${Date.now()}.${ext}`
        const { error } = await sb.storage.from('proof-images').upload(oPath, buf, { contentType: `image/${ext}` })
        if (!error) proof_path = oPath
      }
      const handle = String(b.instagram || '').trim().replace(/^@/, '').replace(/[^\w.]/g, '')
      const note = [handle ? `@${handle}` : '', String(b.note || '').trim()].filter(Boolean).join(' · ')
      const { data, error } = await sb.from('submissions').insert({
        user_id: user.id, user_name: b.userName, user_avatar: b.userAvatar,
        challenge_id: b.challengeId, challenge_title: b.challengeTitle, challenge_type: 'daily',
        points: Number(b.points) || 0, km: Number(b.km) || 0, proof_path, note,
      }).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ...data, instagram: handle || null })
    }
    if (method === 'GET' && path === 'submissions') {
      const status = url.searchParams.get('status')
      const userId = url.searchParams.get('userId')
      let q = sb.from('submissions').select('*').order('created_at', { ascending: false }).limit(200)
      if (status) q = q.eq('status', status)
      if (userId) q = q.eq('user_id', userId)
      const { data } = await q
      const out = await Promise.all((data || []).map(async s => {
        let proofDataUrl = null
        if (s.proof_path) {
          const { data: signed } = await sb.storage.from('proof-images').createSignedUrl(s.proof_path, 3600)
          proofDataUrl = signed?.signedUrl || null
        }
        return { id: s.id, userId: s.user_id, userName: s.user_name, userAvatar: s.user_avatar,
          challengeId: s.challenge_id, challengeTitle: s.challenge_title, challengeType: s.challenge_type,
          points: s.points, km: s.km, note: s.note, instagram: parseInstagram(s.note), status: s.status, reason: s.reason,
          createdAt: s.created_at, proofDataUrl, proofPath: s.proof_path }
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
      let result = null
      if (p) result = await awardCompletion(sb, p, { points: sub.points || 0, km: sub.km || 0, challengeId: sub.challenge_id })
      return NextResponse.json({ ok: true, participant: toParticipant(result?.updated), streak: result?.streak, streakBonus: result?.streakBonus || 0 })
    }
    if (method === 'POST' && path.startsWith('submissions/') && path.endsWith('/reject')) {
      const id = path.split('/')[1]
      const b = await request.json().catch(() => ({}))
      await sb.from('submissions').update({ status: 'rejected', reason: b?.reason || '', reviewed_at: new Date().toISOString() }).eq('id', id)
      return NextResponse.json({ ok: true })
    }

    // ---------- Admin: bonus / promote / rotate / config ----------
    if (method === 'POST' && path === 'admin/bonus') {
      const { userId, points = 0, reason = 'Bonus' } = await request.json()
      if (!userId) return NextResponse.json({ error: 'missing' }, { status: 400 })
      const { data: p } = await sb.from('participants').select('points').eq('id', userId).maybeSingle()
      await sb.from('participants').update({ points: (p?.points || 0) + Number(points) }).eq('id', userId)
      await sb.from('bonuses').insert({ user_id: userId, points: Number(points), reason })
      return NextResponse.json({ ok: true })
    }
    if (method === 'POST' && path === 'admin/promote') {
      const { userId } = await request.json()
      const { data: u } = await sb.auth.admin.getUserById(userId)
      await sb.auth.admin.updateUserById(userId, { app_metadata: { ...(u?.user?.app_metadata || {}), role: 'admin' } })
      return NextResponse.json({ ok: true })
    }
    if (method === 'POST' && path === 'admin/rotate-daily') {
      const r = await rotateDaily(sb)
      return NextResponse.json({ ok: true, ...r })
    }
    if (method === 'GET' && path === 'admin/config') {
      return NextResponse.json(await getConfig(sb))
    }
    if (method === 'POST' && path === 'admin/config') {
      const b = await request.json()
      const cur = await getConfig(sb)
      const next = { ...cur }
      if (b.fundGoal !== undefined) next.fundGoal = Math.max(0, Number(b.fundGoal) || 0)
      if (b.totalDonations !== undefined) next.totalDonations = Math.max(0, Number(b.totalDonations) || 0)
      if (b.donors !== undefined) next.donors = Math.max(0, Number(b.donors) || 0)
      const { error } = await sb.from('meta').upsert({ key: 'config', value: next }, { onConflict: 'key' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, config: next })
    }

    // ---------- Announcements ----------
    if (method === 'GET' && path === 'announcements') {
      const { data } = await sb.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(20)
      return NextResponse.json({ announcements: data || [] })
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
        sb.from('participants').select('*'), sb.from('submissions').select('*'), sb.from('challenges').select('*').eq('type', 'daily'),
      ])
      const totalPoints = (participants || []).reduce((s, p) => s + (p.points || 0), 0)
      const totalKm = Math.round((participants || []).reduce((s, p) => s + Number(p.km || 0), 0) * 10) / 10
      const count = (st) => (submissions || []).filter(s => s.status === st).length
      const now = new Date()
      const activity = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now); d.setDate(d.getDate() - (6 - i))
        return { day: `${d.getMonth() + 1}/${d.getDate()}`, submissions: (submissions || []).filter(s => new Date(s.created_at).toDateString() === d.toDateString()).length }
      })
      return NextResponse.json({
        totalParticipants: participants?.length || 0, totalPoints, totalKm, totalChallenges: challenges?.length || 0,
        submissions: { pending: count('pending'), approved: count('approved'), rejected: count('rejected'), total: submissions?.length || 0 }, activity,
      })
    }
    if (method === 'GET' && path === 'admin/participants') {
      const { data } = await sb.from('participants').select('*').order('points', { ascending: false })
      return NextResponse.json({ participants: (data || []).map(toParticipant) })
    }
    if (method === 'GET' && path === 'admin/export.csv') {
      const { data } = await sb.from('participants').select('*').order('points', { ascending: false })
      const rows = [['id', 'name', 'avatar', 'points', 'km', 'streak', 'completed', 'created_at']]
      ;(data || []).forEach(p => rows.push([p.id, `"${(p.display_name || '').replace(/"/g, '""')}"`, p.avatar || '', p.points || 0, p.km || 0, p.streak || 0, p.completed || 0, p.created_at || '']))
      return new Response(rows.map(r => r.join(',')).join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="roseup-participants.csv"' } })
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

export const maxDuration = 30
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
