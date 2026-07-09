import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME && process.env.DB_NAME !== 'your_database_name' ? process.env.DB_NAME : 'roseup_quest'

let client
let dbInstance
let connectPromise

async function getDb() {
  if (dbInstance) return dbInstance
  
  if (!connectPromise) {
    connectPromise = (async () => {
      client = new MongoClient(MONGO_URL, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      })
      await client.connect()
      dbInstance = client.db(DB_NAME)
      await seedIfEmpty(dbInstance)
      return dbInstance
    })()
  }
  
  return await connectPromise
}

const DAILY_CHALLENGE_POOL = [
  { title: 'Walk 3 km today', description: 'Lace up your shoes and log a 3 km walk anywhere.', icon: '🚶', points: 30, category: 'move' },
  { title: 'Take a photo with a rose', description: 'Snap a picture with any rose — real, drawn, or digital.', icon: '🌹', points: 20, category: 'create' },
  { title: 'Read about Cystic Fibrosis', description: 'Learn one new fact about CF and reflect on it.', icon: '📚', points: 15, category: 'learn' },
  { title: 'Share a RoseUp Story', description: 'Post a short story of hope on your social channels.', icon: '✨', points: 25, category: 'share' },
  { title: 'Invite a friend', description: 'Invite one friend to join the RoseUp Quest.', icon: '💜', points: 35, category: 'grow' },
  { title: 'Share an awareness post', description: 'Share the official awareness post with #RoseUp2026.', icon: '📱', points: 20, category: 'share' },
  { title: 'Do 15 minutes of stretching', description: 'Move gently for 15 minutes to honor those who cannot.', icon: '🧘', points: 15, category: 'move' },
  { title: 'Drink 2L of water', description: 'Stay hydrated — hydration matters for CF awareness.', icon: '💧', points: 10, category: 'wellness' },
]

const SEED_PARTICIPANTS = [
  { name: 'Camille Dubois', avatar: '🌷', points: 1240, km: 42.1 },
  { name: 'Marco Rossi', avatar: '🌹', points: 1180, km: 38.5 },
  { name: 'Aisha Patel', avatar: '🌸', points: 980, km: 31.2 },
  { name: 'Sofia Bernard', avatar: '🌺', points: 860, km: 28.7 },
  { name: 'Liam O’Connor', avatar: '🌻', points: 720, km: 24.0 },
  { name: 'Yuki Tanaka', avatar: '🌼', points: 640, km: 21.4 },
  { name: 'Hannah Müller', avatar: '🌽', points: 520, km: 17.9 },
  { name: 'Rafael Silva', avatar: '🌾', points: 410, km: 14.2 },
  { name: 'Emma Larsen', avatar: '🌿', points: 310, km: 10.8 },
  { name: 'Noah Cohen', avatar: '🍀', points: 240, km: 8.1 },
]

async function seedIfEmpty(db) {
  const stats = await db.collection('meta').findOne({ _id: 'seeded' })
  if (stats) return
  const participants = SEED_PARTICIPANTS.map(p => ({
    id: uuidv4(),
    ...p,
    streak: Math.floor(Math.random() * 12) + 1,
    completed: Math.floor(p.points / 25),
    seed: true,
    createdAt: new Date(),
  }))
  if (participants.length) await db.collection('participants').insertMany(participants)
  await db.collection('meta').insertOne({ _id: 'seeded', fundGoal: 250000, at: new Date() })
}

function pickDaily(seed, count = 5) {
  // deterministic per date+userId
  const arr = [...DAILY_CHALLENGE_POOL]
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const out = []
  const used = new Set()
  let attempts = 0
  const maxAttempts = arr.length * 10 // Safety limit
  while (out.length < count && attempts < maxAttempts) {
    h = (h * 1103515245 + 12345) >>> 0
    const idx = h % arr.length
    if (!used.has(idx)) {
      used.add(idx)
      out.push({ ...arr[idx], id: `${seed}-${idx}` })
    }
    attempts++
    // If we've tried all indices, break
    if (used.size >= arr.length) break
  }
  return out
}

function todayKey() {
  const d = new Date()
  return `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`
}

async function handler(request, ctx) {
  const method = request.method
  const p = await ctx?.params
  const path = (p?.path || []).join('/')
  console.log(`[API] ${method} /api/${path}`)
  try {
    const db = await getDb()
    console.log(`[API] DB connected for ${path}`)

    // GET /api/  — healthcheck
    if (method === 'GET' && (!path || path === '')) {
      return NextResponse.json({ ok: true, service: 'RoseUp Quest 2026' })
    }

    // POST /api/participants  { name, avatar }
    if (method === 'POST' && path === 'participants') {
      const body = await request.json()
      const doc = {
        id: uuidv4(),
        name: body.name?.trim() || 'Anonymous Rose',
        avatar: body.avatar || '🌹',
        points: 0,
        km: 0,
        streak: 1,
        completed: 0,
        completedChallengeIds: [],
        createdAt: new Date(),
      }
      await db.collection('participants').insertOne(doc)
      delete doc._id
      return NextResponse.json(doc)
    }

    // GET /api/participants/:id
    if (method === 'GET' && path.startsWith('participants/')) {
      const id = path.split('/')[1]
      const p = await db.collection('participants').findOne({ id })
      if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 })
      delete p._id
      return NextResponse.json(p)
    }

    // GET /api/stats
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
        topParticipants: top,
      })
    }

    // GET /api/leaderboard?q=...
    if (method === 'GET' && path === 'leaderboard') {
      const url = new URL(request.url)
      const q = url.searchParams.get('q') || ''
      const filter = q ? { name: { $regex: q, $options: 'i' } } : {}
      const list = await db.collection('participants').find(filter).sort({ points: -1 }).limit(100).project({ _id: 0 }).toArray()
      return NextResponse.json({ leaderboard: list.map((p, i) => ({ ...p, rank: i + 1 })) })
    }

    // GET /api/challenges/daily?userId=xxx
    if (method === 'GET' && path === 'challenges/daily') {
      console.log('[API] Parsing URL for challenges/daily')
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId') || 'guest'
      console.log(`[API] userId=${userId}`)
      const key = `${todayKey()}-${userId}`
      console.log(`[API] Picking daily challenges with key=${key}`)
      const list = pickDaily(key, 5)
      console.log(`[API] Picked ${list.length} challenges`)
      console.log(`[API] Finding participant with id=${userId}`)
      const p = await db.collection('participants').findOne({ id: userId })
      console.log(`[API] Found participant:`, p ? 'yes' : 'no')
      const done = new Set(p?.completedChallengeIds || [])
      console.log(`[API] Returning challenges`)
      return NextResponse.json({ challenges: list.map(c => ({ ...c, completed: done.has(c.id) })) })
    }

    // POST /api/challenges/complete  { userId, challengeId, points, km? }
    if (method === 'POST' && path === 'challenges/complete') {
      const body = await request.json()
      const { userId, challengeId, points = 0, km = 0 } = body
      if (!userId || !challengeId) return NextResponse.json({ error: 'missing fields' }, { status: 400 })
      const p = await db.collection('participants').findOne({ id: userId })
      if (!p) return NextResponse.json({ error: 'participant not found' }, { status: 404 })
      if ((p.completedChallengeIds || []).includes(challengeId)) {
        return NextResponse.json({ ok: true, alreadyCompleted: true, participant: { ...p, _id: undefined } })
      }
      const update = {
        $inc: { points: Number(points) || 0, km: Number(km) || 0, completed: 1 },
        $addToSet: { completedChallengeIds: challengeId },
        $set: { lastActive: new Date() },
      }
      await db.collection('participants').updateOne({ id: userId }, update)
      const updated = await db.collection('participants').findOne({ id: userId })
      delete updated._id
      return NextResponse.json({ ok: true, participant: updated })
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
