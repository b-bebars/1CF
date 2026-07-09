'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Sparkles, Trophy, Users, Heart, Search, Flame, Target, ChevronRight, Award, MapPin,
  Loader2, LayoutDashboard, ListChecks, CalendarRange, Star, LogOut, User, Activity,
  BellRing, Mail, Menu, X, ArrowRight, CheckCircle2, PartyPopper
} from 'lucide-react'

const AVATARS = ['🌹','🌷','🌸','🌺','🌻','🌼','🌷','🌿','💜','✨']

// ---------- Brand Logo (my SVG interpretation: concentric swirl + yellow eye) ----------
function BrandMark({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="RoseUp">
      <defs>
        <radialGradient id="lg-rp" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="60%" stopColor="#6b21a8"/>
          <stop offset="100%" stopColor="#3b0764"/>
        </radialGradient>
        <linearGradient id="lg-rb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#2563eb"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#lg-rp)"/>
      {/* swirl petals — arcs */}
      <g fill="none" stroke="url(#lg-rb)" strokeWidth="4" strokeLinecap="round">
        <path d="M32 12 A20 20 0 0 1 52 32" />
        <path d="M52 32 A20 20 0 0 1 32 52" opacity="0.85"/>
        <path d="M32 52 A20 20 0 0 1 12 32" opacity="0.7"/>
        <path d="M12 32 A20 20 0 0 1 32 12" opacity="0.55"/>
      </g>
      <g fill="none" stroke="#a5b4fc" strokeWidth="2.2" strokeLinecap="round" opacity="0.9">
        <path d="M32 20 A12 12 0 0 1 44 32" />
        <path d="M44 32 A12 12 0 0 1 32 44" opacity="0.8"/>
      </g>
      <circle cx="32" cy="32" r="4.5" fill="#fbbf24"/>
      <circle cx="32" cy="32" r="1.7" fill="#7c2d12"/>
    </svg>
  )
}

function Wordmark({ small = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={small ? 34 : 42}/>
      <div className="leading-none">
        <div className={`font-display font-extrabold tracking-tight text-brand-purple-dark ${small ? 'text-lg' : 'text-xl'}`}>ROSE UP</div>
        <div className="text-[9px] uppercase tracking-[0.18em] text-brand-purple/70 font-semibold mt-0.5">Your Fundraiser, Your Way</div>
      </div>
    </div>
  )
}

// ---------- Blue Rose Illustration ----------
function BlueRose({ className = '' }) {
  return (
    <svg viewBox="0 0 360 360" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rose-blue" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#93c5fd"/>
          <stop offset="60%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </radialGradient>
        <linearGradient id="stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#4c1d95"/>
        </linearGradient>
        <radialGradient id="highlight" cx="35%" cy="30%" r="20%">
          <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Stem */}
      <path d="M180 200 Q182 250 178 320" stroke="url(#stem)" strokeWidth="7" fill="none" strokeLinecap="round"/>
      {/* Leaves */}
      <path d="M178 240 Q140 235 118 260 Q150 275 178 260 Z" fill="#7c3aed"/>
      <path d="M182 275 Q220 270 240 295 Q210 308 182 292 Z" fill="#6d28d9"/>
      {/* Outer petals */}
      <path d="M180 90 C120 90 80 140 90 190 C100 240 170 245 180 210 C190 245 260 240 270 190 C280 140 240 90 180 90 Z" fill="url(#rose-blue)"/>
      {/* Middle petals */}
      <path d="M180 115 C140 115 115 150 125 185 C135 220 175 220 180 200 C185 220 225 220 235 185 C245 150 220 115 180 115 Z" fill="#2563eb" opacity="0.85"/>
      {/* Inner bud */}
      <path d="M180 140 C155 140 140 165 148 185 C156 205 178 205 180 195 C182 205 204 205 212 185 C220 165 205 140 180 140 Z" fill="#1e40af"/>
      <path d="M180 160 C168 160 160 172 165 182 C170 192 178 190 180 185 C182 190 190 192 195 182 C200 172 192 160 180 160 Z" fill="#1e3a8a"/>
      <circle cx="180" cy="176" r="4" fill="#fbbf24"/>
      {/* Highlight */}
      <ellipse cx="150" cy="140" rx="35" ry="18" fill="url(#highlight)"/>
    </svg>
  )
}

// ---------- Stat card (landing) ----------
function StatPill({ icon, label, value, sub }) {
  return (
    <Card className="rounded-2xl border-purple-100 card-elevated bg-white">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-brand-purple mb-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">{icon}</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
        <div className="font-display text-2xl font-bold text-brand-purple-dark">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  )
}

// ---------- Rose Path (gentle horizontal curve with walker) ----------
function RosePath({ points }) {
  const roses = 8
  const perRose = 125
  const goal = roses * perRose // 1000
  const progress = Math.min(points / goal, 1)
  const unlocked = Math.floor(points / perRose)
  const width = 900, height = 220

  // Generate 8 evenly spaced points along a sine curve
  const nodes = Array.from({ length: roses }, (_, i) => {
    const x = 70 + (i / (roses - 1)) * (width - 140)
    const y = 130 + Math.sin((i / (roses - 1)) * Math.PI * 1.4) * -40
    return { x, y }
  })

  let d = `M ${nodes[0].x} ${nodes[0].y}`
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1], cur = nodes[i]
    const cx = (prev.x + cur.x) / 2
    d += ` Q ${cx} ${prev.y}, ${cur.x} ${cur.y}`
  }

  const rawPos = progress * (nodes.length - 1)
  const segIdx = Math.min(Math.floor(rawPos), nodes.length - 2)
  const t = rawPos - segIdx
  const a = nodes[segIdx], b = nodes[segIdx + 1]
  const walkerX = a.x + (b.x - a.x) * t
  const walkerY = a.y + (b.y - a.y) * t - 22

  return (
    <div className="relative rounded-3xl bg-white border border-purple-100 card-elevated overflow-hidden">
      <div className="p-6 md:p-7">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div>
            <h3 className="font-display text-xl md:text-2xl font-bold text-brand-purple-dark">Your Progress</h3>
            <p className="text-sm text-muted-foreground">{unlocked}/{roses} roses bloomed on your path</p>
          </div>
          <Badge className="bg-purple-100 text-brand-purple hover:bg-purple-100 border-purple-200">
            {points} / {goal} pts
          </Badge>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="rp-base" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c4b5fd"/>
              <stop offset="100%" stopColor="#93c5fd"/>
            </linearGradient>
            <linearGradient id="rp-active" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6b21a8"/>
              <stop offset="100%" stopColor="#2563eb"/>
            </linearGradient>
          </defs>
          {/* Dashed base */}
          <path d={d} stroke="url(#rp-base)" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 10" opacity="0.85"/>
          {/* Active drawn path */}
          <motion.path
            d={d}
            stroke="url(#rp-active)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />
          {/* Rose nodes */}
          {nodes.map((n, i) => {
            const isUnlocked = i < unlocked
            return (
              <g key={i} transform={`translate(${n.x} ${n.y})`}>
                {/* Rose head */}
                <g>
                  <circle r="14" fill={isUnlocked ? '#fecdd3' : '#e9d5ff'} opacity={isUnlocked ? 1 : 0.5}/>
                  <circle r="9" fill={isUnlocked ? '#f43f5e' : '#c084fc'} opacity={isUnlocked ? 1 : 0.4}/>
                  <circle r="4" fill={isUnlocked ? '#be123c' : '#7c3aed'} opacity={isUnlocked ? 1 : 0.4}/>
                </g>
                {/* Leaf */}
                <path d="M 4 6 Q 14 8 16 16 Q 6 14 4 6 Z" fill={isUnlocked ? '#7c3aed' : '#c4b5fd'} opacity={isUnlocked ? 0.9 : 0.4}/>
              </g>
            )
          })}
          {/* Finish flag */}
          <g transform={`translate(${nodes[nodes.length-1].x + 30} ${nodes[nodes.length-1].y - 25})`}>
            <line x1="0" y1="0" x2="0" y2="30" stroke="#6b21a8" strokeWidth="2"/>
            <path d="M 0 0 L 18 6 L 0 12 Z" fill="#3b82f6"/>
          </g>
          {/* Walker */}
          <motion.g
            animate={{ x: walkerX, y: walkerY }}
            initial={{ x: nodes[0].x, y: nodes[0].y - 22 }}
            transition={{ type: 'spring', stiffness: 50, damping: 14 }}
          >
            {/* Head */}
            <circle cx="0" cy="-6" r="6" fill="#6b21a8"/>
            {/* Body */}
            <rect x="-4" y="-1" width="8" height="12" rx="3" fill="#3b82f6"/>
            {/* Legs */}
            <line x1="-2" y1="11" x2="-4" y2="20" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round"/>
            <line x1="2" y1="11" x2="4" y2="20" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round"/>
            {/* Arm */}
            <line x1="3" y1="3" x2="8" y2="8" stroke="#6b21a8" strokeWidth="2.5" strokeLinecap="round"/>
          </motion.g>
        </svg>
        <div className="mt-1 text-center text-sm">
          <span className="text-brand-purple font-semibold">You're doing great! Keep going!</span>
          <span className="text-muted-foreground"> — reach the next milestone at {(unlocked + 1) * perRose} pts</span>
        </div>
      </div>
    </div>
  )
}

// ---------- Sign-up card (landing) ----------
function SignUpCard({ onStart }) {
  return (
    <Card className="rounded-3xl border-purple-100 card-elevated overflow-hidden bg-white">
      <CardContent className="p-7 relative">
        <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
          <BrandMark size={120}/>
        </div>
        <Wordmark small/>
        <h3 className="font-display text-2xl font-bold text-brand-purple-dark mt-5">Join the Quest!</h3>
        <p className="text-sm text-muted-foreground mt-1">Create your account and start making an impact today.</p>
        <div className="mt-5 space-y-2.5">
          <Button onClick={() => onStart('google')} variant="outline" className="w-full h-11 rounded-xl border-purple-200 justify-start gap-3 hover:bg-purple-50">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.4 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.3-5.2l-6.1-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.1 5.2C40.7 35.6 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
            Continue with Google
          </Button>
          <Button onClick={() => onStart('apple')} variant="outline" className="w-full h-11 rounded-xl border-purple-200 justify-start gap-3 hover:bg-purple-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Continue with Apple
          </Button>
          <Button onClick={() => onStart('email')} variant="outline" className="w-full h-11 rounded-xl border-purple-200 justify-start gap-3 hover:bg-purple-50">
            <Mail className="h-4 w-4"/>
            Continue with Email
          </Button>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Already have an account? <button onClick={() => onStart('email')} className="text-brand-purple font-semibold hover:underline">Log in</button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------- Onboarding dialog ----------
function Onboarding({ open, onClose, onDone, method }) {
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
      toast.success(`Welcome, ${doc.name}!`, { description: 'Your Rose Path awaits 🌹' })
      onDone(doc)
    } catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }
  const methodLabel = method === 'google' ? 'Google' : method === 'apple' ? 'Apple' : 'Email'
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="mx-auto mb-1"><BrandMark size={56}/></div>
          <DialogTitle className="text-center font-display text-2xl text-brand-purple-dark">Join RoseUp Quest 2026</DialogTitle>
          <DialogDescription className="text-center">
            {method ? <span>Signing up with <b>{methodLabel}</b> — tell us your display name.</span> : 'Every step gives hope. Let\'s start your journey.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-semibold mb-2 block">Your name</label>
            <Input placeholder="e.g. Bebars Albasaleh" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border-purple-200 focus-visible:ring-brand-purple" />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Pick your avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a, i) => (
                <button key={i} type="button" onClick={() => setAvatar(a)}
                  className={`text-2xl h-11 rounded-xl border-2 transition ${avatar===a ? 'border-brand-purple bg-purple-50 scale-105' : 'border-transparent bg-muted hover:bg-purple-50'}`}>{a}</button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={loading} className="w-full brand-gradient hover:opacity-95 text-white rounded-xl h-11 font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <>Start the Quest <ChevronRight className="ml-1 h-4 w-4"/></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Challenge row (dashboard) ----------
function ChallengeRow({ c, onComplete, busy }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 rounded-2xl border p-4 ${c.completed ? 'border-emerald-200 bg-emerald-50/40' : 'border-purple-100 bg-white hover:border-purple-200'}`}>
      <div className="text-2xl h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shrink-0">{c.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-brand-purple-dark truncate">{c.title}</div>
        <div className="text-xs text-muted-foreground truncate">{c.description}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold text-brand-purple">+{c.points} pts</div>
        {c.completed ? (
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold"><CheckCircle2 className="h-4 w-4"/>Done</div>
        ) : (
          <Button size="sm" disabled={busy} onClick={() => onComplete(c)} className="mt-1 h-7 brand-gradient text-white rounded-lg px-3">
            Complete
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ---------- Sidebar nav (dashboard) ----------
function Sidebar({ tab, setTab, me, onSignOut, open, setOpen }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Daily Challenges', icon: ListChecks },
    { id: 'weekly', label: 'Weekly Challenges', icon: CalendarRange },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'activity', label: 'My Activity', icon: Activity },
    { id: 'profile', label: 'Profile', icon: User },
  ]
  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)}/>}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-gradient-to-b from-brand-purple-dark via-brand-purple to-[#4c1d95] text-white flex flex-col transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark size={40}/>
            <div className="leading-none">
              <div className="font-display font-extrabold text-lg">ROSE UP</div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-white/60 mt-0.5">Your Fundraiser</div>
            </div>
          </div>
          <button className="lg:hidden text-white/80" onClick={() => setOpen(false)}><X className="h-5 w-5"/></button>
        </div>
        <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
          {items.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => { setTab(id); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition ${active ? 'bg-white text-brand-purple-dark font-semibold shadow-lg shadow-purple-900/30' : 'text-white/85 hover:bg-white/10'}`}>
                <Icon className="h-4 w-4"/>{label}
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={onSignOut} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/85 hover:bg-white/10">
            <LogOut className="h-4 w-4"/>Log Out
          </button>
        </div>
      </aside>
    </>
  )
}

// ---------- Leaderboard component ----------
function LeaderboardList({ me, compact = false }) {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    const fetchIt = async () => {
      setLoading(true)
      const r = await fetch(`/api/leaderboard?q=${encodeURIComponent(q)}`)
      const d = await r.json()
      if (!cancelled) { setRows(d.leaderboard || []); setLoading(false) }
    }
    const t = setTimeout(fetchIt, 200)
    return () => { cancelled = true; clearTimeout(t) }
  }, [q, me?.points])
  const list = compact ? rows.slice(0, 10) : rows
  return (
    <Card className="rounded-3xl border-purple-100 card-elevated bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl brand-gradient flex items-center justify-center text-white"><Trophy className="h-4 w-4"/></div>
            <div>
              <h3 className="font-display text-xl font-bold text-brand-purple-dark">Leaderboard</h3>
              <div className="text-xs text-muted-foreground">Global · {rows.length} participants</div>
            </div>
          </div>
          {!compact && (
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search participants…" className="pl-9 rounded-xl border-purple-200"/>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          {loading && <div className="text-center text-sm text-muted-foreground py-8">Loading…</div>}
          {!loading && list.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No participants found</div>}
          <AnimatePresence>
            {list.map((r) => {
              const isMe = me && r.id === me.id
              return (
                <motion.div key={r.id} layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isMe ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200' : 'hover:bg-purple-50/50'}`}>
                  <div className={`w-7 text-center font-display font-bold text-sm ${r.rank<=3 ? 'text-brand-purple' : 'text-muted-foreground'}`}>{r.rank}</div>
                  <div className="text-xl h-9 w-9 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">{r.avatar || '🌹'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-brand-purple-dark">
                      {r.name}
                      {isMe && <span className="text-xs text-brand-blue ml-1.5 font-normal">(you)</span>}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-brand-purple">{r.points?.toLocaleString?.() || r.points} pts</div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------- MAIN APP ----------
function App() {
  const [me, setMe] = useState(null)
  const [onboard, setOnboard] = useState({ open: false, method: null })
  const [stats, setStats] = useState({ totalPoints: 0, totalKm: 0, totalParticipants: 0, totalDonations: 0, fundGoal: 250000, topParticipants: [] })
  const [challenges, setChallenges] = useState([])
  const [tab, setTab] = useState('dashboard')
  const [busy, setBusy] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('roseup_user')
    if (raw) { try { setMe(JSON.parse(raw)) } catch {} }
    fetchStats()
  }, [])

  useEffect(() => {
    if (me?.id) {
      fetchChallenges(me.id)
      fetch(`/api/participants/${me.id}`).then(r => r.json()).then(d => {
        if (d?.id) { setMe(d); localStorage.setItem('roseup_user', JSON.stringify(d)) }
      })
    } else {
      fetchChallenges('guest')
    }
  }, [me?.id])

  const fetchStats = async () => { const r = await fetch('/api/stats'); setStats(await r.json()) }
  const fetchChallenges = async (uid) => { const r = await fetch(`/api/challenges/daily?userId=${uid}`); const d = await r.json(); setChallenges(d.challenges || []) }

  const startAuth = (method) => setOnboard({ open: true, method })
  const startQuest = () => me ? setTab('dashboard') : setOnboard({ open: true, method: null })

  const signOut = () => { localStorage.removeItem('roseup_user'); setMe(null); setTab('dashboard'); toast('Signed out') }

  const completeChallenge = async (c) => {
    if (!me?.id) { setOnboard({ open: true, method: null }); return }
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
    } catch { toast.error('Failed to complete') }
    finally { setBusy(false) }
  }

  const myRank = useMemo(() => {
    if (!me) return null
    const idx = (stats.topParticipants || []).findIndex(p => p.id === me.id)
    return idx >= 0 ? idx + 1 : null
  }, [stats, me])

  // ============================== LANDING ==============================
  if (!me) {
    return (
      <div className="min-h-screen">
        {/* Nav */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/75 border-b border-purple-100">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <Wordmark small/>
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-brand-purple-dark">
              <a className="text-brand-purple font-semibold underline underline-offset-4 decoration-brand-blue">Home</a>
              <a href="#challenges" className="hover:text-brand-purple">Challenges</a>
              <a href="#leaderboard" className="hover:text-brand-purple">Leaderboard</a>
              <a href="#donations" className="hover:text-brand-purple">Donations</a>
              <a href="#how" className="hover:text-brand-purple">How It Works</a>
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => startAuth('email')} className="rounded-full border-purple-200 text-brand-purple-dark hover:bg-purple-50">Log In</Button>
              <Button onClick={() => startAuth(null)} className="rounded-full brand-gradient text-white hover:opacity-95">Sign Up</Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-14">
          {/* HERO */}
          <section className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h1 className="font-display font-bold leading-[0.98] text-5xl md:text-7xl text-brand-purple-dark">
                RoseUp<br/>Quest <span className="brand-gradient-text">2026</span>
              </h1>
              <div className="mt-4 text-2xl md:text-3xl font-semibold text-brand-blue">Every Step Gives Hope</div>
              <p className="mt-4 text-muted-foreground max-w-md">
                Complete challenges, earn points, climb the leaderboard and help us make a difference together.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" onClick={startQuest} className="brand-gradient text-white rounded-full h-12 px-7 font-semibold shadow-xl shadow-purple-500/25 hover:opacity-95">
                  Start the Quest <ArrowRight className="ml-1.5 h-5 w-5"/>
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full h-12 px-6 border-purple-200">
                  Learn more
                </Button>
              </div>
            </div>
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-72 w-72 rounded-full bg-gradient-to-br from-purple-200/40 to-blue-200/40 blur-2xl"/>
              </div>
              <div className="relative animate-float">
                <BlueRose className="w-80 md:w-[420px] h-auto drop-shadow-2xl"/>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatPill icon={<Sparkles className="h-4 w-4"/>} label="Total Points" value={stats.totalPoints?.toLocaleString?.() || 0} sub="All participants"/>
            <StatPill icon={<MapPin className="h-4 w-4"/>} label="Kilometers Walked" value={`${stats.totalKm?.toLocaleString?.() || 0} km`} sub="All participants"/>
            <StatPill icon={<Users className="h-4 w-4"/>} label="Participants" value={stats.totalParticipants?.toLocaleString?.() || 0} sub="Worldwide"/>
            <StatPill icon={<Heart className="h-4 w-4"/>} label="Total Donations" value={`€${stats.totalDonations?.toLocaleString?.() || 0}`} sub="Total raised"/>
            <button onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })} className="text-left rounded-2xl brand-gradient text-white p-5 hover:opacity-95 transition">
              <div className="flex items-center gap-2 mb-2 text-white/90"><Trophy className="h-4 w-4"/><span className="text-xs font-semibold uppercase tracking-wider">Top 10</span></div>
              <div className="font-display text-lg font-bold">See Leaderboard</div>
              <div className="text-xs text-white/80 mt-0.5">Top participants</div>
            </button>
          </section>

          {/* MIDDLE ROW: Signup + Leaderboard + Weekly */}
          <section id="leaderboard" className="mt-10 grid lg:grid-cols-3 gap-5">
            <SignUpCard onStart={startAuth}/>
            <LeaderboardList me={me} compact/>
            <Card className="rounded-3xl border-purple-100 card-elevated overflow-hidden brand-gradient text-white relative">
              <CardContent className="p-6 relative">
                <div className="absolute -right-10 -bottom-10 opacity-10 text-[200px]">👟</div>
                <div className="flex items-center gap-2 text-white/90">
                  <Trophy className="h-4 w-4"/> <span className="text-xs font-semibold uppercase tracking-wider">Weekly Challenge</span>
                </div>
                <h3 className="font-display text-3xl font-bold mt-3">Walk 20 km</h3>
                <p className="text-sm text-white/85 mt-1">Complete 20 kilometers this week.</p>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="text-sm text-white/80">Progress</div>
                    <div className="font-display text-2xl font-bold">12.4 / 20 km</div>
                  </div>
                  <Badge className="bg-white text-brand-purple hover:bg-white">+150 pts</Badge>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/25 overflow-hidden">
                  <div className="h-full bg-white" style={{ width: '62%' }}/>
                </div>
                <div className="mt-3 text-xs text-white/80">Ends in: 4d 12h 30m</div>
              </CardContent>
            </Card>
          </section>

          {/* DONATIONS + CERTIFICATE */}
          <section id="donations" className="mt-6 grid lg:grid-cols-2 gap-5">
            <Card className="rounded-3xl border-purple-100 card-elevated bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-brand-purple mb-3">
                  <Heart className="h-4 w-4"/><span className="text-xs font-semibold uppercase tracking-wider">Donations</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Campaign Goal</div>
                    <div className="font-display text-2xl font-bold text-brand-purple-dark">€{stats.fundGoal?.toLocaleString?.() || 250000}</div>
                    <div className="font-display text-4xl font-bold mt-3 text-brand-purple-dark">€{stats.totalDonations?.toLocaleString?.() || 0}</div>
                    <div className="text-xs text-muted-foreground">Raised so far</div>
                  </div>
                  <div className="relative h-32 w-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#ede9fe" strokeWidth="10"/>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#donutGrad)" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min((stats.totalDonations || 0) / (stats.fundGoal || 250000), 1))}/>
                      <defs>
                        <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#6b21a8"/><stop offset="100%" stopColor="#3b82f6"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-brand-purple-dark">
                      {Math.round(((stats.totalDonations || 0) / (stats.fundGoal || 250000)) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-purple-50 p-3">
                    <div className="text-xs text-brand-purple font-semibold uppercase tracking-wider">Donors</div>
                    <div className="font-display text-xl font-bold text-brand-purple-dark">1,245</div>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <div className="text-xs text-brand-blue font-semibold uppercase tracking-wider">Days Left</div>
                    <div className="font-display text-xl font-bold text-brand-purple-dark">23</div>
                  </div>
                </div>
                <Button className="w-full mt-5 brand-gradient text-white rounded-2xl h-12 font-semibold">
                  <Heart className="h-4 w-4 mr-2"/> Donate Now
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-purple-100 card-elevated bg-gradient-to-br from-purple-50 via-white to-blue-50">
              <CardContent className="p-6 text-center">
                <div className="mx-auto"><BrandMark size={48}/></div>
                <h3 className="font-display text-2xl font-bold mt-2 text-brand-purple-dark">Digital Certificate</h3>
                <p className="text-xs text-muted-foreground mt-1">Earn your official RoseUp certificate at the end of the campaign.</p>
                <div className="mt-4 rounded-2xl border border-purple-200 border-dashed p-5 bg-white/60">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">This certifies that</div>
                  <div className="font-display text-xl font-bold text-brand-purple-dark mt-1">Your Name Here</div>
                  <div className="mt-3 text-xs text-muted-foreground">has successfully completed</div>
                  <div className="text-sm font-semibold text-brand-purple">RoseUp Quest 2026</div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div><div className="font-display font-bold text-brand-purple-dark">1,000</div><div className="text-[10px] text-muted-foreground">Points</div></div>
                    <div><div className="font-display font-bold text-brand-purple-dark">35/35</div><div className="text-[10px] text-muted-foreground">Challenges</div></div>
                    <div><div className="font-display font-bold text-brand-purple-dark">50 km</div><div className="text-[10px] text-muted-foreground">Walked</div></div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground italic">Thank you for being part of this beautiful journey.</div>
              </CardContent>
            </Card>
          </section>

          {/* HOW IT WORKS */}
          <section id="how" className="mt-12">
            <div className="text-center mb-6">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-purple-dark">How It Works</h2>
              <p className="text-muted-foreground mt-1">Five simple steps to make a real impact.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { n: 1, icon: <User className="h-5 w-5"/>, title: 'Join', text: 'Create your account and join the quest.' },
                { n: 2, icon: <ListChecks className="h-5 w-5"/>, title: 'Do Challenges', text: 'Complete daily and weekly challenges.' },
                { n: 3, icon: <Star className="h-5 w-5"/>, title: 'Earn Points', text: 'Watch your progress grow with every step.' },
                { n: 4, icon: <Trophy className="h-5 w-5"/>, title: 'Climb Higher', text: 'Move up the leaderboard and challenge others.' },
                { n: 5, icon: <Heart className="h-5 w-5"/>, title: 'Make Impact', text: 'Support the cause and make a real difference.' },
              ].map((s) => (
                <Card key={s.n} className="rounded-2xl border-purple-100 card-elevated bg-white">
                  <CardContent className="p-5">
                    <div className="h-11 w-11 rounded-2xl brand-gradient text-white flex items-center justify-center">{s.icon}</div>
                    <div className="mt-3 text-xs font-semibold text-brand-blue">STEP {s.n}</div>
                    <div className="font-display text-lg font-bold text-brand-purple-dark mt-0.5">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.text}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <footer className="mt-16 py-8 text-center text-sm text-muted-foreground">
            Made with 💜 for the RoseUp Quest 2026 · Every step gives hope.
          </footer>
        </main>

        <Onboarding open={onboard.open} method={onboard.method} onClose={() => setOnboard({ open: false, method: null })} onDone={(u) => { setMe(u); setOnboard({ open: false, method: null }); setTab('dashboard') }}/>
      </div>
    )
  }

  // ============================== SIGNED-IN DASHBOARD ==============================
  const goalPoints = 1000
  const rank = myRank || '—'
  const displayChallenges = tab === 'daily' ? challenges : challenges.slice(0, 5)

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50/40 via-white to-blue-50/40">
      <Sidebar tab={tab} setTab={setTab} me={me} onSignOut={signOut} open={sidebarOpen} setOpen={setSidebarOpen}/>

      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-purple-100">
          <div className="flex items-center justify-between px-4 md:px-8 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-brand-purple-dark"><Menu className="h-5 w-5"/></button>
              <div>
                <div className="font-display text-lg font-bold text-brand-purple-dark">Welcome back,</div>
                <div className="text-sm text-muted-foreground -mt-0.5">{me.name} 👋</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center text-brand-purple hover:bg-purple-100 relative">
                <BellRing className="h-4 w-4"/>
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-blue"/>
              </button>
              <div className="flex items-center gap-2 rounded-full bg-white border border-purple-100 pl-1 pr-3 py-1 shadow-sm">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-lg">{me.avatar}</div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-brand-purple-dark">{me.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-muted-foreground">{me.points || 0} pts</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6">
          {/* Stat pills row (matches mockup) */}
          <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="rounded-2xl border-purple-100 card-elevated bg-gradient-to-br from-purple-600 to-blue-500 text-white">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wider text-white/80 font-semibold">Total Points</div>
                <div className="font-display text-3xl font-bold mt-1">{me.points || 0}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-purple-100 card-elevated bg-white">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Rank</div>
                <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark">#{rank}</div>
                <div className="text-[10px] text-muted-foreground">out of {stats.totalParticipants}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-purple-100 card-elevated bg-white">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Challenges</div>
                <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark">{me.completed || 0}<span className="text-lg text-muted-foreground"> / 35</span></div>
                <div className="text-[10px] text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-purple-100 card-elevated bg-white">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Distance</div>
                <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark">{(me.km || 0).toFixed?.(1) ?? me.km}<span className="text-lg text-muted-foreground"> km</span></div>
                <div className="text-[10px] text-muted-foreground">Walked</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-purple-100 card-elevated bg-white">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Streak</div>
                <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark flex items-center gap-1">{me.streak || 1}<Flame className="h-5 w-5 text-orange-500"/></div>
                <div className="text-[10px] text-muted-foreground">Current days</div>
              </CardContent>
            </Card>
          </section>

          {/* Different content per tab */}
          {tab === 'dashboard' && (
            <>
              <RosePath points={me.points || 0}/>

              <Card className="rounded-3xl border-purple-100 card-elevated bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display text-xl font-bold text-brand-purple-dark">Today's Challenges</h3>
                      <p className="text-xs text-muted-foreground">Complete them to bloom your next rose</p>
                    </div>
                    <Badge className="bg-purple-100 text-brand-purple hover:bg-purple-100 border-purple-200">
                      {challenges.filter(c=>c.completed).length} / {challenges.length} completed
                    </Badge>
                  </div>
                  <div className="space-y-2.5">
                    {challenges.map(c => <ChallengeRow key={c.id} c={c} onComplete={completeChallenge} busy={busy}/>)}
                  </div>
                  <button onClick={() => setTab('daily')} className="mt-4 w-full text-center text-sm font-semibold text-brand-purple hover:text-brand-purple-dark">View all challenges →</button>
                </CardContent>
              </Card>
            </>
          )}

          {tab === 'daily' && (
            <Card className="rounded-3xl border-purple-100 card-elevated bg-white">
              <CardContent className="p-6">
                <h3 className="font-display text-2xl font-bold text-brand-purple-dark mb-1">Daily Challenges</h3>
                <p className="text-sm text-muted-foreground mb-5">Fresh every day. Complete them all for a streak bonus.</p>
                <div className="space-y-2.5">
                  {challenges.map(c => <ChallengeRow key={c.id} c={c} onComplete={completeChallenge} busy={busy}/>)}
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'weekly' && (
            <Card className="rounded-3xl border-purple-100 card-elevated bg-white">
              <CardContent className="p-8 text-center">
                <div className="text-5xl mb-3">📆</div>
                <h3 className="font-display text-2xl font-bold text-brand-purple-dark">Weekly Challenges</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">Bigger goals, bigger rewards. Weekly challenges unlock as you complete daily quests. Coming very soon!</p>
              </CardContent>
            </Card>
          )}

          {tab === 'leaderboard' && <LeaderboardList me={me}/>}

          {tab === 'donations' && (
            <Card className="rounded-3xl border-purple-100 card-elevated bg-white">
              <CardContent className="p-8 text-center">
                <Heart className="h-10 w-10 text-brand-purple mx-auto mb-3"/>
                <h3 className="font-display text-2xl font-bold text-brand-purple-dark">Donations</h3>
                <p className="text-sm text-muted-foreground mt-1">Every point contributes to the campaign goal.</p>
                <div className="mt-6 max-w-md mx-auto">
                  <div className="flex justify-between text-sm mb-1"><span>Raised</span><span className="font-semibold">€{stats.totalDonations?.toLocaleString?.() || 0}</span></div>
                  <Progress value={((stats.totalDonations || 0) / (stats.fundGoal || 1)) * 100} className="h-3"/>
                  <div className="text-xs text-muted-foreground mt-1">Goal: €{stats.fundGoal?.toLocaleString?.() || 0}</div>
                </div>
                <Button className="mt-6 brand-gradient text-white rounded-2xl h-11 px-6">Donate Now</Button>
              </CardContent>
            </Card>
          )}

          {(tab === 'activity' || tab === 'profile') && (
            <Card className="rounded-3xl border-purple-100 card-elevated bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-3xl">{me.avatar}</div>
                  <div>
                    <div className="font-display text-2xl font-bold text-brand-purple-dark">{me.name}</div>
                    <div className="text-sm text-muted-foreground">Rank #{rank} · {me.points} points · {me.completed || 0} challenges completed</div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-purple-50 p-4"><div className="text-xs text-brand-purple font-semibold uppercase">Points</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.points || 0}</div></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs text-brand-blue font-semibold uppercase">Kilometers</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{(me.km || 0).toFixed?.(1)} km</div></div>
                  <div className="rounded-2xl bg-purple-50 p-4"><div className="text-xs text-brand-purple font-semibold uppercase">Streak</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.streak || 1} days</div></div>
                  <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs text-brand-blue font-semibold uppercase">Completed</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.completed || 0}</div></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Onboarding open={onboard.open} method={onboard.method} onClose={() => setOnboard({ open: false, method: null })} onDone={(u) => { setMe(u); setOnboard({ open: false, method: null }); setTab('dashboard') }}/>
    </div>
  )
}

export default App
