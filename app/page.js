'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Sparkles, Trophy, Users, Heart, Search, Flame, Target, ChevronRight, Award, MapPin, Loader2 } from 'lucide-react'

const AVATARS = ['🌹','🌷','🌸','🌺','🌻','🌼','🌽','🌾','🌿','🍀','💜','✨']

// ---------- Rose Path (the signature visual) ----------
function RosePath({ points }) {
  // Serpentine path across 10 rose milestones. Each rose = 100 points, max 1000+.
  const roses = 10
  const perRose = 100
  const progress = Math.min(points / (roses * perRose), 1)
  const unlocked = Math.floor(points / perRose)
  const width = 720, height = 520
  // Generate serpentine points
  const nodes = []
  for (let i = 0; i < roses; i++) {
    const row = Math.floor(i / 5)
    const col = row % 2 === 0 ? (i % 5) : (4 - (i % 5))
    const x = 80 + col * 140
    const y = 90 + row * 200
    nodes.push({ x, y })
  }
  // build svg path
  let d = ''
  nodes.forEach((n, i) => {
    if (i === 0) d += `M ${n.x} ${n.y}`
    else {
      const prev = nodes[i - 1]
      const midY = (prev.y + n.y) / 2
      d += ` C ${prev.x} ${midY}, ${n.x} ${midY}, ${n.x} ${n.y}`
    }
  })

  // Position current avatar between nodes based on progress
  const totalSegs = nodes.length - 1
  const rawPos = progress * totalSegs
  const segIdx = Math.min(Math.floor(rawPos), totalSegs - 1)
  const t = rawPos - segIdx
  const a = nodes[segIdx]
  const b = nodes[Math.min(segIdx + 1, nodes.length - 1)]
  const avatarX = a.x + (b.x - a.x) * t
  const avatarY = a.y + (b.y - a.y) * t

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-white via-pink-50/50 to-purple-50 border border-pink-100 card-glow">
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, #fbcfe8 0, transparent 40%), radial-gradient(circle at 80% 80%, #e9d5ff 0, transparent 40%)'
      }}/>
      <div className="relative p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold">Your Rose Path</h3>
            <p className="text-sm text-muted-foreground">{unlocked}/{roses} roses bloomed — {points} points</p>
          </div>
          <Badge className="bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-100">{Math.round(progress*100)}% to finish</Badge>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f9a8d4" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>
            <linearGradient id="pathGradActive" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Base dashed path */}
          <path d={d} stroke="url(#pathGrad)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="2 14" opacity="0.7"/>
          {/* Active progress path (drawn) */}
          <motion.path
            d={d}
            stroke="url(#pathGradActive)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />
          {/* Rose nodes */}
          {nodes.map((n, i) => {
            const isUnlocked = i < unlocked
            const isCurrent = i === unlocked
            return (
              <g key={i} transform={`translate(${n.x} ${n.y})`}>
                <circle r="26" fill={isUnlocked ? '#fce7f3' : '#f5f3ff'} stroke={isUnlocked ? '#db2777' : '#ddd6fe'} strokeWidth="3" />
                <text x="0" y="8" textAnchor="middle" fontSize={isUnlocked ? 30 : 22} opacity={isUnlocked ? 1 : 0.35}>🌹</text>
                <text x="0" y="50" textAnchor="middle" fontSize="12" fill="#6b21a8" fontWeight="600">{(i+1)*perRose}</text>
                {isCurrent && (
                  <circle r="32" fill="none" stroke="#db2777" strokeWidth="2" opacity="0.5">
                    <animate attributeName="r" from="28" to="38" dur="1.6s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite"/>
                  </circle>
                )}
              </g>
            )
          })}
          {/* Avatar marker */}
          <motion.g
            animate={{ x: avatarX, y: avatarY }}
            initial={{ x: nodes[0].x, y: nodes[0].y }}
            transition={{ type: 'spring', stiffness: 40, damping: 12 }}
          >
            <circle r="18" fill="#fff" stroke="#db2777" strokeWidth="3" filter="url(#softGlow)"/>
            <text x="0" y="6" textAnchor="middle" fontSize="22">💜</text>
          </motion.g>
          {/* Finish line */}
          <g transform={`translate(${nodes[nodes.length-1].x + 60} ${nodes[nodes.length-1].y})`}>
            <text fontSize="32">🏁</text>
          </g>
        </svg>
      </div>
    </div>
  )
}

// ---------- Stat Card ----------
function StatCard({ icon, label, value, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="card-glow border-pink-100/60 rounded-2xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl ${accent}`}>{icon}</div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
              <div className="text-2xl font-display font-bold">{value}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------- Onboarding ----------
function Onboarding({ open, onDone }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🌹')
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    if (!name.trim()) return toast.error('Please enter your name')
    setLoading(true)
    try {
      const res = await fetch('/api/participants', { method: 'POST', body: JSON.stringify({ name: name.trim(), avatar }) })
      const doc = await res.json()
      localStorage.setItem('roseup_user', JSON.stringify(doc))
      toast.success(`Welcome, ${doc.name}! Your Rose Path awaits 🌹`)
      onDone(doc)
    } catch (e) { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="mx-auto text-5xl mb-2">🌹</div>
          <DialogTitle className="text-center font-display text-2xl">Join RoseUp Quest 2026</DialogTitle>
          <DialogDescription className="text-center">Every step gives hope. Let’s start your journey.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-semibold mb-2 block">Your name</label>
            <Input placeholder="e.g. Camille Dubois" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Pick your rose avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map(a => (
                <button key={a} type="button" onClick={() => setAvatar(a)}
                  className={`text-2xl h-11 rounded-xl border-2 transition ${avatar===a ? 'border-pink-500 bg-pink-50 scale-105' : 'border-transparent bg-muted hover:bg-pink-50'}`}>{a}</button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white rounded-xl h-11 font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <>Start the Quest <ChevronRight className="ml-1 h-4 w-4"/></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Challenge Card ----------
function ChallengeCard({ c, onComplete, disabled }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`rounded-2xl border-pink-100/60 overflow-hidden ${c.completed ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'card-glow'}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="text-3xl h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">{c.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-base">{c.title}</h4>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">+{c.points} pts</Badge>
                {c.category && <Badge variant="outline" className="text-xs capitalize">{c.category}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
              <div className="mt-3">
                {c.completed ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">✓ Completed today</Badge>
                ) : (
                  <Button onClick={() => onComplete(c)} disabled={disabled}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white rounded-xl h-9">
                    Complete <ChevronRight className="ml-1 h-4 w-4"/>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------- Leaderboard ----------
function Leaderboard({ me }) {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    const fetchIt = async () => {
      setLoading(true)
      const res = await fetch(`/api/leaderboard?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!cancelled) { setRows(data.leaderboard || []); setLoading(false) }
    }
    const t = setTimeout(fetchIt, 200)
    return () => { cancelled = true; clearTimeout(t) }
  }, [q, me?.points])

  return (
    <Card className="rounded-3xl border-pink-100/60 card-glow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-pink-600"/>
            <h3 className="font-display text-xl font-bold">Global Leaderboard</h3>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search participants…" className="pl-9 rounded-xl"/>
          </div>
        </div>
        <div className="space-y-2">
          {loading && <div className="text-center text-sm text-muted-foreground py-8">Loading…</div>}
          {!loading && rows.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No one found</div>}
          <AnimatePresence>
            {rows.map((r) => {
              const isMe = me && r.id === me.id
              const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : null
              return (
                <motion.div key={r.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${isMe ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300' : 'border-transparent hover:bg-pink-50/40'}`}>
                  <div className="w-10 text-center font-display font-bold text-lg">
                    {medal || <span className="text-muted-foreground">#{r.rank}</span>}
                  </div>
                  <div className="text-2xl h-10 w-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">{r.avatar || '🌹'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{r.name} {isMe && <span className="text-xs text-pink-600 ml-1">(you)</span>}</div>
                    <div className="text-xs text-muted-foreground">{r.km?.toFixed?.(1) ?? r.km} km · {r.completed || 0} challenges</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-lg">{r.points}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------- Main App ----------
function App() {
  const [me, setMe] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [stats, setStats] = useState({ totalPoints: 0, totalKm: 0, totalParticipants: 0, totalDonations: 0, topParticipants: [] })
  const [challenges, setChallenges] = useState([])
  const [tab, setTab] = useState('home')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('roseup_user')
    if (raw) {
      try { setMe(JSON.parse(raw)) } catch {}
    }
    fetchStats()
  }, [])

  useEffect(() => {
    if (me?.id) {
      fetchChallenges(me.id)
      // refresh me from server
      fetch(`/api/participants/${me.id}`).then(r => r.json()).then(d => { if (d?.id) { setMe(d); localStorage.setItem('roseup_user', JSON.stringify(d)) }})
    } else {
      fetchChallenges('guest')
    }
  }, [me?.id])

  const fetchStats = async () => {
    const r = await fetch('/api/stats'); const d = await r.json(); setStats(d)
  }
  const fetchChallenges = async (uid) => {
    const r = await fetch(`/api/challenges/daily?userId=${uid}`); const d = await r.json(); setChallenges(d.challenges || [])
  }

  const startQuest = () => {
    if (me?.id) { setTab('quest'); return }
    setShowOnboarding(true)
  }

  const completeChallenge = async (c) => {
    if (!me?.id) { setShowOnboarding(true); return }
    setBusy(true)
    try {
      const kmGain = c.category === 'move' && c.title.toLowerCase().includes('walk') ? 3 : (c.category === 'move' ? 0.5 : 0)
      const res = await fetch('/api/challenges/complete', {
        method: 'POST',
        body: JSON.stringify({ userId: me.id, challengeId: c.id, points: c.points, km: kmGain })
      })
      const data = await res.json()
      if (data.participant) { setMe(data.participant); localStorage.setItem('roseup_user', JSON.stringify(data.participant)) }
      setChallenges(prev => prev.map(x => x.id === c.id ? { ...x, completed: true } : x))
      toast.success(`+${c.points} points! 🌹`, { description: c.title })
      fetchStats()
    } catch (e) { toast.error('Failed to complete') }
    finally { setBusy(false) }
  }

  const myRankLabel = useMemo(() => {
    const rank = stats.topParticipants?.findIndex(p => p.id === me?.id)
    if (!me) return '—'
    return rank !== undefined && rank >= 0 ? `#${rank + 1}` : 'Climbing'
  }, [stats, me])

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-pink-100">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl animate-float">🌹</div>
            <div className="font-display text-xl font-bold rose-gradient-text">RoseUp Quest 2026</div>
          </div>
          <div className="flex items-center gap-3">
            {me ? (
              <div className="flex items-center gap-2 rounded-full bg-white border border-pink-100 pl-2 pr-3 py-1 shadow-sm">
                <span className="text-xl">{me.avatar}</span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">{me.name}</div>
                  <div className="text-[10px] text-muted-foreground">{me.points} pts · {me.completed || 0} done</div>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowOnboarding(true)} variant="outline" className="rounded-full border-pink-200 hover:bg-pink-50">Sign in</Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/60 backdrop-blur border border-pink-100 rounded-2xl p-1 mb-6">
            <TabsTrigger value="home" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">Home</TabsTrigger>
            <TabsTrigger value="quest" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">My Quest</TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">Leaderboard</TabsTrigger>
          </TabsList>

          {/* HOME */}
          <TabsContent value="home" className="space-y-8">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-pink-50 to-purple-100 border border-pink-100 card-glow">
              <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-pink-200/60 blur-3xl"/>
              <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-purple-200/60 blur-3xl"/>
              <div className="relative grid md:grid-cols-2 gap-6 items-center p-8 md:p-14">
                <div>
                  <Badge className="bg-white text-pink-700 border border-pink-200 mb-4"><Sparkles className="h-3 w-3 mr-1"/>Global Awareness Campaign 2026</Badge>
                  <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
                    <span className="rose-gradient-text">RoseUp Quest</span><br/> 2026
                  </h1>
                  <p className="font-display text-2xl md:text-3xl mt-3 text-purple-900/80 italic">Every step gives hope.</p>
                  <p className="mt-4 text-muted-foreground max-w-lg">Walk, share, and inspire. Complete daily challenges to bloom roses along your path and support Cystic Fibrosis awareness across the world.</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button size="lg" onClick={startQuest} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white rounded-full h-12 px-7 font-semibold shadow-lg shadow-pink-500/30">
                      {me ? 'Continue the Quest' : 'Start the Quest'} <ChevronRight className="ml-1 h-5 w-5"/>
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setTab('leaderboard')} className="rounded-full h-12 px-6 border-pink-200">
                      <Trophy className="h-4 w-4 mr-2"/> See leaderboard
                    </Button>
                  </div>
                </div>
                <div className="relative hidden md:block">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[220px] animate-float rose-shadow">🌹</div>
                  </div>
                  <div className="absolute top-4 right-10 text-6xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
                  <div className="absolute bottom-8 left-6 text-5xl animate-float" style={{ animationDelay: '2s' }}>💜</div>
                  <div className="h-[380px]"/>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="🌹" label="Total Points" value={stats.totalPoints?.toLocaleString?.() || 0} accent="bg-pink-100"/>
              <StatCard icon="🚶" label="Kilometers Walked" value={`${stats.totalKm || 0} km`} accent="bg-purple-100"/>
              <StatCard icon="👥" label="Participants" value={stats.totalParticipants?.toLocaleString?.() || 0} accent="bg-rose-100"/>
              <StatCard icon="💜" label="Donations Raised" value={`€${stats.totalDonations?.toLocaleString?.() || 0}`} accent="bg-fuchsia-100"/>
            </section>

            {/* How it works */}
            <section className="grid md:grid-cols-3 gap-4">
              {[
                { icon: <Target className="h-5 w-5"/>, title: '1. Take on challenges', text: 'Get fresh daily quests — walk, share, learn, and connect.' },
                { icon: <Award className="h-5 w-5"/>, title: '2. Bloom roses', text: 'Every completed challenge unlocks roses along your path.' },
                { icon: <Heart className="h-5 w-5"/>, title: '3. Give hope', text: 'Points turn into awareness — climb the leaderboard and inspire.' },
              ].map((s, i) => (
                <Card key={i} className="rounded-2xl border-pink-100/60">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-700 mb-3">{s.icon}</div>
                    <div className="font-display font-bold text-lg">{s.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{s.text}</p>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Top 3 */}
            {stats.topParticipants?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-xl font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-pink-600"/> Top participants</h3>
                  <Button variant="ghost" onClick={() => setTab('leaderboard')} className="text-pink-700">See all <ChevronRight className="h-4 w-4"/></Button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {stats.topParticipants.map((p, i) => (
                    <Card key={p.id} className="rounded-2xl border-pink-100/60 card-glow">
                      <CardContent className="p-5 flex items-center gap-3">
                        <div className="text-3xl">{['🥇','🥈','🥉'][i]}</div>
                        <div className="text-2xl h-11 w-11 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">{p.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.points} points</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          {/* QUEST */}
          <TabsContent value="quest" className="space-y-8">
            {!me ? (
              <Card className="rounded-3xl card-glow"><CardContent className="p-10 text-center">
                <div className="text-5xl mb-3">🌹</div>
                <h2 className="font-display text-2xl font-bold mb-2">Start your Rose Path</h2>
                <p className="text-muted-foreground mb-5">Sign up in 5 seconds to see your quest and progress.</p>
                <Button onClick={() => setShowOnboarding(true)} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full h-11 px-6">Start the Quest</Button>
              </CardContent></Card>
            ) : (
              <>
                {/* Profile Row */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl card-glow md:col-span-1">
                    <CardContent className="p-5 text-center">
                      <div className="text-5xl mb-2">{me.avatar}</div>
                      <div className="font-display font-bold text-lg">{me.name}</div>
                      <div className="text-xs text-muted-foreground">Rank {myRankLabel}</div>
                    </CardContent>
                  </Card>
                  <StatCard icon={<Sparkles className="h-5 w-5 text-pink-600"/>} label="Points" value={me.points || 0} accent="bg-pink-100"/>
                  <StatCard icon={<MapPin className="h-5 w-5 text-purple-600"/>} label="Kilometers" value={`${(me.km || 0).toFixed?.(1) ?? me.km} km`} accent="bg-purple-100"/>
                  <StatCard icon={<Flame className="h-5 w-5 text-rose-600"/>} label="Streak" value={`${me.streak || 1} days`} accent="bg-rose-100"/>
                </div>

                {/* Rose Path */}
                <RosePath points={me.points || 0}/>

                {/* Progress bar */}
                <Card className="rounded-2xl card-glow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">Journey progress</div>
                      <div className="text-sm text-muted-foreground">{Math.min(me.points || 0, 1000)}/1000 pts</div>
                    </div>
                    <Progress value={Math.min(((me.points || 0) / 1000) * 100, 100)} className="h-3 bg-pink-100"/>
                    <div className="mt-2 text-xs text-muted-foreground">Reach 1000 points to complete the quest and earn your digital certificate.</div>
                  </CardContent>
                </Card>

                {/* Daily Challenges */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-2xl font-bold flex items-center gap-2"><Target className="h-5 w-5 text-pink-600"/> Today’s Challenges</h3>
                    <Badge variant="outline" className="border-pink-200">{challenges.filter(c=>c.completed).length}/{challenges.length} done</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {challenges.map(c => (
                      <ChallengeCard key={c.id} c={c} onComplete={completeChallenge} disabled={busy}/>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* LEADERBOARD */}
          <TabsContent value="leaderboard">
            <Leaderboard me={me}/>
          </TabsContent>
        </Tabs>

        <footer className="mt-16 py-8 text-center text-sm text-muted-foreground">
          Made with 💜 for the RoseUp Quest 2026 · Every step gives hope.
        </footer>
      </main>

      <Onboarding open={showOnboarding && !me} onDone={(u) => { setMe(u); setShowOnboarding(false); setTab('quest') }}/>
    </div>
  )
}

export default App
