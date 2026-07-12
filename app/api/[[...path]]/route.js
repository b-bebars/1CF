import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME && process.env.DB_NAME !== 'your_database_name' ? process.env.DB_NAME : 'roseup_quest'

let client, dbInstance
async function getDb() {
  if (dbInstance) return dbInstance
  client = new MongoClient(MONGO_URL)
  await client.connect()
  dbInstance = client.db(DB_NAME)
  await seedIfEmpty(dbInstance)
  return dbInstance
}

// ---------- Seed data ----------
const DAILY_CHALLENGE_POOL = [
  { title: 'Walk 3 km today', description: 'Lace up your shoes and log a 3 km walk.', icon: '🚶', points: 30, category: 'move' },
  { title: 'Take a photo with a rose', description: 'Snap a picture with any rose — real, drawn, or digital.', icon: '🌹', points: 20, category: 'create' },
  { title: 'Read about Cystic Fibrosis', description: 'Learn one new fact about CF and reflect on it.', icon: '📚', points: 15, category: 'learn' },
  { title: 'Share a RoseUp Story', description: 'Post a short story of hope on your social channels.', icon: '✨', points: 25, category: 'share' },
  { title: 'Invite a friend', description: 'Invite one friend to join the RoseUp Quest.', icon: '💜', points: 35, category: 'grow' },
  { title: 'Share an awareness post', description: 'Share the official awareness post with #RoseUp2026.', icon: '📱', points: 20, category: 'share' },
  { title: '15 min of stretching', description: 'Move gently for 15 minutes.', icon: '🧘', points: 15, category: 'move' },
  { title: 'Drink 2L of water', description: 'Stay hydrated — hydration matters.', icon: '💧', points: 10, category: 'wellness' },
]
const WEEKLY_CHALLENGES = [
  { id: 'w-walk20', type: 'weekly', title: 'Walk 20 km', description: 'Complete 20 kilometers this week.', icon: '👟', points: 150, target: 20, unit: 'km', active: true },
  { id: 'w-video', type: 'weekly', title: 'Create a RoseUp video', description: 'Record a 60-second awareness clip.', icon: '🎬', points: 200, active: true },
  { id: 'w-invite3', type: 'weekly', title: 'Invite 3 friends', description: 'Grow the movement — invite 3 friends this week.', icon: '💜', points: 180, active: true },
  { id: 'w-photo5', type: 'weekly', title: 'Take 5 nature photos', description: 'Capture five beautiful moments outdoors.', icon: '📸', points: 120, active: true },
]
const SPECIAL_CHALLENGES = [
  { id: 's-purpleday', type: 'special', title: 'Purple Day', description: 'Wear purple and share a photo.', icon: '👕', points: 60, active: true, endsAt: null },
  { id: 's-marathon', type: 'special', title: 'RoseUp Weekend Marathon', description: 'Log 42 km across the weekend.', icon: '🏃', points: 300, active: true },
]
const SEED_PARTICIPANTS = [
  { name: 'Noor Alami', avatar: '🌷', points: 5820, km: 42.1 },
  { name: 'Ahmad Farouq', avatar: '🌹', points: 5600, km: 38.5 },
  { name: 'Sarah Nassar', avatar: '🌸', points: 5450, km: 31.2 },
  { name: 'Omar Haddad', avatar: '🌺', points: 4980, km: 28.7 },
  { name: 'Lana Khoury', avatar: '🌻', points: 4760, km: 24.0 },
  { name: 'Kareem Aziz', avatar: '🌼', points: 4520, km: 21.4 },
  { name: 'Maya Salim', avatar: '💜', points: 4210, km: 17.9 },
  { name: 'Yousef Rami', avatar: '🌿', points: 3980, km: 14.2 },
  { name: 'Rania Mounir', avatar: '✨', points: 3750, km: 10.8 },
  { name: 'Hassan Kabir', avatar: '🌹', points: 3410, km: 9.6 },
]
const SEED_ANNOUNCEMENTS = [
  { id: uuidv4(), title: 'Welcome to RoseUp Quest 2026!', body: 'Every step gives hope. Complete daily challenges to bloom your Rose Path.', createdAt: new Date(), pinned: true },
  { id: uuidv4(), title: 'Purple Day is coming', body: 'On Friday, wear purple and share your photo for bonus points.', createdAt: new Date(), pinned: false },
]

async function seedIfEmpty(db) {
  const seeded = await db.collection('meta').findOne({ _id: 'seeded' })
  if (seeded) return
  const participants = SEED_PARTICIPANTS.map(p => ({
    id: uuidv4(), ...p,
    streak: Math.floor(Math.random() * 12) + 1,
    completed: Math.floor(p.points / 30),
    completedChallengeIds: [],
    createdAt: new Date(),
  }))
  if (participants.length) await db.collection('participants').insertMany(participants)
  const wc = WEEKLY_CHALLENGES.map(c => ({ ...c, createdAt: new Date() }))
  const sc = SPECIAL_CHALLENGES.map(c => ({ ...c, createdAt: new Date() }))
  await db.collection('challenges').insertMany([...wc, ...sc])
  await db.collection('announcements').insertMany(SEED_ANNOUNCEMENTS)
  await db.collection('meta').insertOne({ _id: 'seeded', fundGoal: 250000, campaignEndsAt: new Date(Date.now() + 30*24*3600*1000), at: new Date() })
}

// ---------- Helpers ----------
function pickDaily(seed, count = 5) {
  const arr = [...DAILY_CHALLENGE_POOL]
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const out = [], used = new Set()
  let attempts = 0
  while (out.length < count && attempts < arr.length * 10) {
    h = (h * 1103515245 + 12345) >>> 0
    const idx = h % arr.length
    if (!used.has(idx)) { used.add(idx); out.push({ ...arr[idx], id: `${seed}-${idx}` }) }
    attempts++
    if (used.size >= arr.length) break
  }
  return out
}
function todayKey() {
  const d = new Date()
  return `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`
}
function daysBetween(a, b) {
  const ms = 24*3600*1000
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / ms)
}
function calcStreak(participant) {
  if (!participant?.lastActive) return 1
  const diff = daysBetween(participant.lastActive, new Date())
  if (diff === 0) return participant.streak || 1
  if (diff === 1) return (participant.streak || 0) + 1
  return 1
}

// ---------- Handler ----------
async function handler(request, ctx) {
  const method = request.method
  const p = await ctx?.params
  const path = (p?.path || []).join('/')
  const url = new URL(request.url)
  try {
    const db = await getDb()

    if (method === 'GET' && !path) return NextResponse.json({ ok: true, service: 'RoseUp Quest 2026' })

    // ---------- Participants ----------
    if (method === 'POST' && path === 'participants') {
      const body = await request.json()
      const doc = {
        id: uuidv4(),
        name: body.name?.trim() || 'Anonymous Rose',
        avatar: body.avatar || '🌹',
        email: body.email || null,
        role: 'user',
        points: 0, km: 0, streak: 1, completed: 0,
        completedChallengeIds: [], createdAt: new Date(), lastActive: new Date(),
      }
      await db.collection('participants').insertOne(doc)
      return NextResponse.json(doc)
    }
    if (method === 'GET' && path.startsWith('participants/')) {
      const id = path.split('/')[1]
      const p = await db.collection('participants').findOne({ id })
      if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 })
      delete p._id
      return NextResponse.json(p)
    }
    if (method === 'DELETE' && path.startsWith('participants/')) {
      const id = path.split('/')[1]
      await db.collection('participants').deleteOne({ id })
      await db.collection('submissions').deleteMany({ userId: id })
      return NextResponse.json({ ok: true })
    }

    // ---------- Stats ----------
    if (method === 'GET' && path === 'stats') {
      const agg = await db.collection('participants').aggregate([
        { $group: { _id: null, points: { $sum: '$points' }, km: { $sum: '$km' }, count: { $sum: 1 } } }
      ]).toArray()
      const top = await db.collection('participants').find({}).sort({ points: -1 }).limit(3).project({ _id: 0, id: 1, name: 1, avatar: 1, points: 1 }).toArray()
      const meta = await db.collection('meta').findOne({ _id: 'seeded' })
      const raised = Math.round(((agg[0]?.points || 0) * 1.25) + 12480)
      return NextResponse.json({
        totalPoints: agg[0]?.points || 0,
        totalKm: Math.round((agg[0]?.km || 0) * 10) / 10,
        totalParticipants: agg[0]?.count || 0,
        totalDonations: raised,
        fundGoal: meta?.fundGoal || 250000,
        campaignEndsAt: meta?.campaignEndsAt || null,
        topParticipants: top,
      })
    }

    // ---------- Leaderboard ----------
    if (method === 'GET' && path === 'leaderboard') {
      const q = url.searchParams.get('q') || ''
      const filter = q ? { name: { $regex: q, $options: 'i' } } : {}
      const list = await db.collection('participants').find(filter).sort({ points: -1 }).limit(100).project({ _id: 0 }).toArray()
      return NextResponse.json({ leaderboard: list.map((p, i) => ({ ...p, rank: i + 1 })) })
    }

    // ---------- Daily challenges (dynamic per user+date) ----------
    if (method === 'GET' && path === 'challenges/daily') {
      const userId = url.searchParams.get('userId') || 'guest'
      const key = `${todayKey()}-${userId}`
      const list = pickDaily(key, 5)
      const p = await db.collection('participants').findOne({ id: userId })
      const done = new Set(p?.completedChallengeIds || [])
      return NextResponse.json({ challenges: list.map(c => ({ ...c, type: 'daily', completed: done.has(c.id) })) })
    }

    // ---------- Weekly & Special (stored in DB, admin-editable) ----------
    if (method === 'GET' && path === 'challenges') {
      const type = url.searchParams.get('type') // weekly / special / undefined=all
      const filter = type ? { type } : { type: { $in: ['weekly', 'special'] } }
      const list = await db.collection('challenges').find(filter).sort({ createdAt: -1 }).project({ _id: 0 }).toArray()
      return NextResponse.json({ challenges: list })
    }
    if (method === 'POST' && path === 'challenges') {
      const body = await request.json()
      const doc = {
        id: body.id || uuidv4(),
        type: body.type || 'weekly',
        title: body.title || 'Untitled',
        description: body.description || '',
        icon: body.icon || '⭐',
        points: Number(body.points) || 50,
        active: body.active !== false,
        target: body.target || null,
        unit: body.unit || null,
        endsAt: body.endsAt || null,
        createdAt: new Date(),
      }
      await db.collection('challenges').insertOne(doc)
      return NextResponse.json(doc)
    }
    if (method === 'PUT' && path.startsWith('challenges/')) {
      const id = path.split('/')[1]
      const body = await request.json()
      const { _id, id: _ignore, ...update } = body
      await db.collection('challenges').updateOne({ id }, { $set: update })
      const c = await db.collection('challenges').findOne({ id }, { projection: { _id: 0 } })
      return NextResponse.json(c)
    }
    if (method === 'DELETE' && path.startsWith('challenges/')) {
      const id = path.split('/')[1]
      await db.collection('challenges').deleteOne({ id })
      return NextResponse.json({ ok: true })
    }

    // ---------- Complete daily challenge (no proof) ----------
    if (method === 'POST' && path === 'challenges/complete') {
      const body = await request.json()
      const { userId, challengeId, points = 0, km = 0 } = body
      if (!userId || !challengeId) return NextResponse.json({ error: 'missing fields' }, { status: 400 })
      const participant = await db.collection('participants').findOne({ id: userId })
      if (!participant) return NextResponse.json({ error: 'not found' }, { status: 404 })
      if ((participant.completedChallengeIds || []).includes(challengeId)) {
        return NextResponse.json({ ok: true, alreadyCompleted: true, participant: { ...participant, _id: undefined } })
      }
      const newStreak = calcStreak(participant)
      await db.collection('participants').updateOne({ id: userId }, {
        $inc: { points: Number(points) || 0, km: Number(km) || 0, completed: 1 },
        $addToSet: { completedChallengeIds: challengeId },
        $set: { lastActive: new Date(), streak: newStreak },
      })
      const updated = await db.collection('participants').findOne({ id: userId }, { projection: { _id: 0 } })
      return NextResponse.json({ ok: true, participant: updated })
    }

    // ---------- Submissions (proof upload with pending/approved/rejected) ----------
    if (method === 'POST' && path === 'submissions') {
      const body = await request.json()
      const doc = {
        id: uuidv4(),
        userId: body.userId,
        userName: body.userName || 'Anonymous',
        userAvatar: body.userAvatar || '🌹',
        challengeId: body.challengeId,
        challengeTitle: body.challengeTitle || 'Challenge',
        challengeType: body.challengeType || 'weekly',
        points: Number(body.points) || 0,
        km: Number(body.km) || 0,
        proofDataUrl: body.proofDataUrl || null, // base64 data URL
        proofType: body.proofType || 'image',
        note: body.note || '',
        status: 'pending',
        createdAt: new Date(),
      }
      await db.collection('submissions').insertOne(doc)
      const { _id, ...safe } = doc
      return NextResponse.json(safe)
    }
    if (method === 'GET' && path === 'submissions') {
      const status = url.searchParams.get('status')
      const userId = url.searchParams.get('userId')
      const filter = {}
      if (status) filter.status = status
      if (userId) filter.userId = userId
      const list = await db.collection('submissions').find(filter).sort({ createdAt: -1 }).limit(200).project({ _id: 0 }).toArray()
      return NextResponse.json({ submissions: list })
    }
    if (method === 'POST' && path.startsWith('submissions/') && path.endsWith('/approve')) {
      const id = path.split('/')[1]
      const sub = await db.collection('submissions').findOne({ id })
      if (!sub) return NextResponse.json({ error: 'not found' }, { status: 404 })
      if (sub.status === 'approved') return NextResponse.json({ ok: true, alreadyApproved: true })
      await db.collection('submissions').updateOne({ id }, { $set: { status: 'approved', reviewedAt: new Date() } })
      const participant = await db.collection('participants').findOne({ id: sub.userId })
      if (participant) {
        const newStreak = calcStreak(participant)
        await db.collection('participants').updateOne({ id: sub.userId }, {
          $inc: { points: sub.points || 0, km: sub.km || 0, completed: 1 },
          $addToSet: { completedChallengeIds: sub.challengeId },
          $set: { lastActive: new Date(), streak: newStreak },
        })
      }
      return NextResponse.json({ ok: true })
    }
    if (method === 'POST' && path.startsWith('submissions/') && path.endsWith('/reject')) {
      const id = path.split('/')[1]
      const body = await request.json().catch(() => ({}))
      await db.collection('submissions').updateOne({ id }, { $set: { status: 'rejected', reason: body?.reason || '', reviewedAt: new Date() } })
      return NextResponse.json({ ok: true })
    }

    // ---------- Bonus points ----------
    if (method === 'POST' && path === 'admin/bonus') {
      const body = await request.json()
      const { userId, points = 0, reason = 'Bonus' } = body
      if (!userId) return NextResponse.json({ error: 'missing userId' }, { status: 400 })
      await db.collection('participants').updateOne({ id: userId }, { $inc: { points: Number(points) } })
      await db.collection('bonuses').insertOne({ id: uuidv4(), userId, points, reason, createdAt: new Date() })
      return NextResponse.json({ ok: true })
    }

    // ---------- Announcements ----------
    if (method === 'GET' && path === 'announcements') {
      const list = await db.collection('announcements').find({}).sort({ pinned: -1, createdAt: -1 }).limit(20).project({ _id: 0 }).toArray()
      return NextResponse.json({ announcements: list })
    }
    if (method === 'POST' && path === 'announcements') {
      const body = await request.json()
      const doc = { id: uuidv4(), title: body.title || '', body: body.body || '', pinned: !!body.pinned, createdAt: new Date() }
      await db.collection('announcements').insertOne(doc)
      return NextResponse.json(doc)
    }
    if (method === 'DELETE' && path.startsWith('announcements/')) {
      const id = path.split('/')[1]
      await db.collection('announcements').deleteOne({ id })
      return NextResponse.json({ ok: true })
    }

    // ---------- Admin analytics ----------
    if (method === 'GET' && path === 'admin/analytics') {
      const [participants, submissions, challenges] = await Promise.all([
        db.collection('participants').find({}).project({ _id: 0 }).toArray(),
        db.collection('submissions').find({}).project({ _id: 0 }).toArray(),
        db.collection('challenges').find({}).project({ _id: 0 }).toArray(),
      ])
      const totalPoints = participants.reduce((s, p) => s + (p.points || 0), 0)
      const totalKm = Math.round(participants.reduce((s, p) => s + (p.km || 0), 0) * 10) / 10
      const pending = submissions.filter(s => s.status === 'pending').length
      const approved = submissions.filter(s => s.status === 'approved').length
      const rejected = submissions.filter(s => s.status === 'rejected').length
      // simple 7-day activity
      const now = new Date()
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now); d.setDate(d.getDate() - (6 - i))
        const key = `${d.getMonth()+1}/${d.getDate()}`
        const count = submissions.filter(s => {
          const sd = new Date(s.createdAt); return sd.toDateString() === d.toDateString()
        }).length
        return { day: key, submissions: count }
      })
      return NextResponse.json({
        totalParticipants: participants.length,
        totalPoints, totalKm,
        totalChallenges: challenges.length,
        submissions: { pending, approved, rejected, total: submissions.length },
        activity: days,
      })
    }

    // ---------- Admin: list all participants ----------
    if (method === 'GET' && path === 'admin/participants') {
      const list = await db.collection('participants').find({}).sort({ points: -1 }).project({ _id: 0 }).toArray()
      return NextResponse.json({ participants: list })
    }

    // ---------- CSV Export ----------
    if (method === 'GET' && path === 'admin/export.csv') {
      const list = await db.collection('participants').find({}).sort({ points: -1 }).project({ _id: 0 }).toArray()
      const rows = [['id','name','avatar','email','points','km','streak','completed','createdAt']]
      list.forEach(p => rows.push([
        p.id, `"${(p.name||'').replace(/"/g,'""')}"`, p.avatar || '', p.email || '',
        p.points || 0, p.km || 0, p.streak || 0, p.completed || 0, p.createdAt || ''
      ]))
      const csv = rows.map(r => r.join(',')).join('\n')
      return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="roseup-participants.csv"' } })
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
