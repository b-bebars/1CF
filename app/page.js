'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Sparkles, Trophy, Users, Heart, Search, Flame, Target, ChevronRight, Award, MapPin,
  Loader2, LayoutDashboard, ListChecks, CalendarRange, Star, LogOut, User, Activity,
  BellRing, Mail, Menu, X, ArrowRight, CheckCircle2, Upload, Download, Plus, Trash2,
  Edit3, Eye, Megaphone, Shield, BarChart3, FileSpreadsheet, PartyPopper, Clock, XCircle
} from 'lucide-react'

const AVATARS = ['🌹','🌷','🌸','🌺','🌻','🌼','💜','✨','🌿','🌟']
const api = (p, o) => fetch(`/api/${p}`, o).then(r => r.json())

// ============= BRAND =============
function BrandMark({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <defs>
        <radialGradient id="lgp" cx="50%" cy="50%" r="55%"><stop offset="0%" stopColor="#a78bfa"/><stop offset="60%" stopColor="#6b21a8"/><stop offset="100%" stopColor="#3b0764"/></radialGradient>
        <linearGradient id="lgb" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa"/><stop offset="100%" stopColor="#2563eb"/></linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#lgp)"/>
      <g fill="none" stroke="url(#lgb)" strokeWidth="4" strokeLinecap="round">
        <path d="M32 12 A20 20 0 0 1 52 32"/><path d="M52 32 A20 20 0 0 1 32 52" opacity=".85"/>
        <path d="M32 52 A20 20 0 0 1 12 32" opacity=".7"/><path d="M12 32 A20 20 0 0 1 32 12" opacity=".55"/>
      </g>
      <g fill="none" stroke="#a5b4fc" strokeWidth="2.2" strokeLinecap="round" opacity=".9">
        <path d="M32 20 A12 12 0 0 1 44 32"/><path d="M44 32 A12 12 0 0 1 32 44" opacity=".8"/>
      </g>
      <circle cx="32" cy="32" r="4.5" fill="#fbbf24"/><circle cx="32" cy="32" r="1.7" fill="#7c2d12"/>
    </svg>
  )
}
function Wordmark({ small=false, invert=false }) {
  const t = invert ? 'text-white' : 'text-brand-purple-dark'
  const sub = invert ? 'text-white/60' : 'text-brand-purple/70'
  return (<div className="flex items-center gap-2.5">
    <BrandMark size={small?34:42}/>
    <div className="leading-none">
      <div className={`font-display font-extrabold tracking-tight ${t} ${small?'text-lg':'text-xl'}`}>ROSE UP</div>
      <div className={`text-[9px] uppercase tracking-[0.18em] ${sub} font-semibold mt-0.5`}>Your Fundraiser, Your Way</div>
    </div>
  </div>)
}

// Blue rose SVG (simplified for brevity)
function BlueRose({ className='' }) {
  return (<svg viewBox="0 0 360 360" className={className}>
    <defs>
      <radialGradient id="rblu" cx="45%" cy="40%" r="65%"><stop offset="0%" stopColor="#93c5fd"/><stop offset="60%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#1d4ed8"/></radialGradient>
      <linearGradient id="stm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#4c1d95"/></linearGradient>
    </defs>
    <path d="M180 200 Q182 250 178 320" stroke="url(#stm)" strokeWidth="7" fill="none" strokeLinecap="round"/>
    <path d="M178 240 Q140 235 118 260 Q150 275 178 260 Z" fill="#7c3aed"/>
    <path d="M182 275 Q220 270 240 295 Q210 308 182 292 Z" fill="#6d28d9"/>
    <path d="M180 90 C120 90 80 140 90 190 C100 240 170 245 180 210 C190 245 260 240 270 190 C280 140 240 90 180 90 Z" fill="url(#rblu)"/>
    <path d="M180 115 C140 115 115 150 125 185 C135 220 175 220 180 200 C185 220 225 220 235 185 C245 150 220 115 180 115 Z" fill="#2563eb" opacity=".85"/>
    <path d="M180 140 C155 140 140 165 148 185 C156 205 178 205 180 195 C182 205 204 205 212 185 C220 165 205 140 180 140 Z" fill="#1e40af"/>
    <circle cx="180" cy="176" r="4" fill="#fbbf24"/>
  </svg>)
}

// ============= ROSE PATH =============
function RosePath({ points }) {
  const roses=8, perRose=125, goal=roses*perRose
  const progress=Math.min(points/goal,1), unlocked=Math.floor(points/perRose)
  const w=900,h=220
  const nodes=Array.from({length:roses},(_,i)=>({x:70+(i/(roses-1))*(w-140),y:130+Math.sin((i/(roses-1))*Math.PI*1.4)*-40}))
  let d=`M ${nodes[0].x} ${nodes[0].y}`
  for(let i=1;i<nodes.length;i++){const p=nodes[i-1],c=nodes[i];d+=` Q ${(p.x+c.x)/2} ${p.y}, ${c.x} ${c.y}`}
  const r=progress*(nodes.length-1), si=Math.min(Math.floor(r),nodes.length-2), t=r-si
  const a=nodes[si], b=nodes[si+1]
  const wx=a.x+(b.x-a.x)*t, wy=a.y+(b.y-a.y)*t-22
  return (<div className="rounded-3xl bg-white border border-purple-100 card-elevated p-6">
    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
      <div><h3 className="font-display text-xl md:text-2xl font-bold text-brand-purple-dark">Your Progress</h3>
      <p className="text-sm text-muted-foreground">{unlocked}/{roses} roses bloomed on your path</p></div>
      <Badge className="bg-purple-100 text-brand-purple border-purple-200 hover:bg-purple-100">{points} / {goal} pts</Badge>
    </div>
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs><linearGradient id="rpb" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#c4b5fd"/><stop offset="100%" stopColor="#93c5fd"/></linearGradient>
      <linearGradient id="rpa" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6b21a8"/><stop offset="100%" stopColor="#2563eb"/></linearGradient></defs>
      <path d={d} stroke="url(#rpb)" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 10" opacity=".85"/>
      <motion.path d={d} stroke="url(#rpa)" strokeWidth="5" fill="none" strokeLinecap="round" initial={{pathLength:0}} animate={{pathLength:progress}} transition={{duration:1.4,ease:'easeInOut'}}/>
      {nodes.map((n,i)=>{const u=i<unlocked; return (<g key={i} transform={`translate(${n.x} ${n.y})`}>
        <circle r="14" fill={u?'#fecdd3':'#e9d5ff'} opacity={u?1:.5}/><circle r="9" fill={u?'#f43f5e':'#c084fc'} opacity={u?1:.4}/><circle r="4" fill={u?'#be123c':'#7c3aed'} opacity={u?1:.4}/>
      </g>)})}
      <g transform={`translate(${nodes[nodes.length-1].x+30} ${nodes[nodes.length-1].y-25})`}><line x1="0" y1="0" x2="0" y2="30" stroke="#6b21a8" strokeWidth="2"/><path d="M 0 0 L 18 6 L 0 12 Z" fill="#3b82f6"/></g>
      <motion.g animate={{x:wx,y:wy}} initial={{x:nodes[0].x,y:nodes[0].y-22}} transition={{type:'spring',stiffness:50,damping:14}}>
        <circle cx="0" cy="-6" r="6" fill="#6b21a8"/><rect x="-4" y="-1" width="8" height="12" rx="3" fill="#3b82f6"/>
        <line x1="-2" y1="11" x2="-4" y2="20" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round"/><line x1="2" y1="11" x2="4" y2="20" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round"/>
      </motion.g>
    </svg>
  </div>)
}

// ============= UPLOAD PROOF DIALOG =============
function ProofDialog({ open, onClose, challenge, me, onSubmitted }) {
  const [note, setNote] = useState('')
  const [dataUrl, setDataUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)
  const pickFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    const isVideo = f.type.startsWith('video/')
    const isImage = f.type.startsWith('image/')
    if (!isVideo && !isImage) { toast.error('Please pick an image or video'); return }
    const limit = isVideo ? 15 * 1024 * 1024 : 3 * 1024 * 1024
    if (f.size > limit) { toast.error(`${isVideo?'Video':'Image'} exceeds ${isVideo?'15 MB':'3 MB'} limit`); return }
    const reader = new FileReader()
    reader.onload = () => setDataUrl(reader.result)
    reader.readAsDataURL(f)
  }
  const submit = async () => {
    if (!dataUrl) return toast.error('Please upload a proof image')
    setLoading(true)
    try {
      await api('submissions', { method: 'POST', body: JSON.stringify({
        userId: me.id, userName: me.name, userAvatar: me.avatar,
        challengeId: challenge.id, challengeTitle: challenge.title, challengeType: challenge.type || 'weekly',
        points: challenge.points, km: challenge.km || 0, proofDataUrl: dataUrl, note,
      })})
      toast.success('Proof submitted!', { description: 'An admin will review it soon.' })
      onSubmitted?.()
      onClose?.()
      setDataUrl(null); setNote('')
    } catch { toast.error('Submission failed') } finally { setLoading(false) }
  }
  if (!challenge) return null
  return (<Dialog open={open} onOpenChange={(v)=>!v&&onClose?.()}>
    <DialogContent className="sm:max-w-lg rounded-3xl">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl text-brand-purple-dark flex items-center gap-2"><Upload className="h-5 w-5"/>Submit Proof</DialogTitle>
        <DialogDescription><b>{challenge.title}</b> · +{challenge.points} pts (pending admin review)</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <input type="file" accept="image/*,video/*" ref={fileRef} onChange={pickFile} className="hidden"/>
          {dataUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-purple-200">
              {dataUrl.startsWith('data:video')
                ? <video src={dataUrl} controls className="w-full max-h-64"/>
                : <img src={dataUrl} alt="proof" className="w-full max-h-64 object-cover"/>}
            <button onClick={()=>setDataUrl(null)} className="absolute top-2 right-2 h-8 w-8 bg-black/60 text-white rounded-full flex items-center justify-center"><X className="h-4 w-4"/></button></div>
          ) : (
            <button onClick={()=>fileRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-purple-200 py-10 hover:bg-purple-50 flex flex-col items-center gap-2 text-brand-purple">
              <Upload className="h-6 w-6"/><div className="font-semibold">Upload photo or video</div><div className="text-xs text-muted-foreground">Image up to 3 MB · Video up to 15 MB</div>
            </button>
          )}
        </div>
        <Textarea placeholder="Add a note (optional)…" value={note} onChange={(e)=>setNote(e.target.value)} className="rounded-xl border-purple-200"/>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
        <Button onClick={submit} disabled={loading} className="brand-gradient text-white rounded-xl">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:'Submit for Review'}</Button>
      </DialogFooter>
    </DialogContent></Dialog>)
}

// ============= LEADERBOARD =============
function LeaderboardList({ me, compact=false }) {
  const [rows, setRows] = useState([]); const [q, setQ] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(()=>{let c=false;const f=async()=>{setLoading(true);const d=await api(`leaderboard?q=${encodeURIComponent(q)}`);if(!c){setRows(d.leaderboard||[]);setLoading(false)}}
  const t=setTimeout(f,200); return ()=>{c=true;clearTimeout(t)}},[q, me?.points])
  const list = compact ? rows.slice(0,10) : rows
  return (<Card className="rounded-3xl border-purple-100 card-elevated bg-white"><CardContent className="p-6">
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl brand-gradient flex items-center justify-center text-white"><Trophy className="h-4 w-4"/></div>
        <div><h3 className="font-display text-xl font-bold text-brand-purple-dark">Leaderboard</h3><div className="text-xs text-muted-foreground">Global · {rows.length} participants</div></div>
      </div>
      {!compact && <div className="relative w-full sm:w-72"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
      <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search…" className="pl-9 rounded-xl border-purple-200"/></div>}
    </div>
    <div className="space-y-1.5">
      {loading && <div className="text-center text-sm text-muted-foreground py-8">Loading…</div>}
      <AnimatePresence>{list.map((r)=>{const isMe=me&&r.id===me.id;return(<motion.div key={r.id} layout initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}}
        className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isMe?'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200':'hover:bg-purple-50/50'}`}>
        <div className={`w-7 text-center font-display font-bold text-sm ${r.rank<=3?'text-brand-purple':'text-muted-foreground'}`}>{r.rank}</div>
        <div className="text-xl h-9 w-9 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">{r.avatar||'🌹'}</div>
        <div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate text-brand-purple-dark">{r.name}{isMe && <span className="text-xs text-brand-blue ml-1.5 font-normal">(you)</span>}</div></div>
        <div className="text-sm font-bold text-brand-purple">{(r.points||0).toLocaleString()} pts</div>
      </motion.div>)})}</AnimatePresence>
    </div>
  </CardContent></Card>)
}

// ============= CERTIFICATE =============
function Certificate({ me }) {
  const download = () => {
    const svg = document.getElementById('cert-svg')
    if (!svg) return
    const s = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([s], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `roseup-certificate-${me?.name?.replace(/\s+/g,'-')||'me'}.svg`; a.click()
    URL.revokeObjectURL(url)
  }
  const km = (me?.km || 0).toFixed(1)
  return (<Card className="rounded-3xl border-purple-100 card-elevated overflow-hidden bg-white">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-display text-xl font-bold text-brand-purple-dark">Your Digital Certificate</h3><p className="text-xs text-muted-foreground">Generated with your latest stats.</p></div>
        <Button onClick={download} className="brand-gradient text-white rounded-xl"><Download className="h-4 w-4 mr-1"/>Download</Button>
      </div>
      <div className="rounded-2xl overflow-hidden border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <svg id="cert-svg" viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <defs>
            <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#f5f3ff"/></linearGradient>
            <linearGradient id="cbrand" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6b21a8"/><stop offset="100%" stopColor="#2563eb"/></linearGradient>
          </defs>
          <rect x="0" y="0" width="900" height="560" fill="url(#cbg)"/>
          <rect x="20" y="20" width="860" height="520" rx="24" fill="none" stroke="url(#cbrand)" strokeWidth="3" strokeDasharray="6 8"/>
          <g transform="translate(430 90)"><circle r="30" fill="#6b21a8"/><circle r="10" fill="#fbbf24"/></g>
          <text x="450" y="180" textAnchor="middle" fontFamily="Georgia,serif" fontSize="34" fontWeight="700" fill="#4c1d95">RoseUp Quest 2026</text>
          <text x="450" y="210" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#7c3aed" letterSpacing="4">CERTIFICATE OF PARTICIPATION</text>
          <text x="450" y="260" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fill="#6b7280">This certifies that</text>
          <text x="450" y="308" textAnchor="middle" fontFamily="Georgia,serif" fontSize="40" fontWeight="700" fill="#3b82f6">{me?.name || 'Your Name'}</text>
          <text x="450" y="342" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fill="#6b7280">has actively participated in the RoseUp Quest 2026 campaign.</text>
          <g transform="translate(160 400)"><text fontFamily="Georgia,serif" fontSize="26" fontWeight="700" fill="#4c1d95">{me?.points || 0}</text><text y="22" fontSize="11" fill="#6b7280">Total Points</text></g>
          <g transform="translate(360 400)"><text fontFamily="Georgia,serif" fontSize="26" fontWeight="700" fill="#4c1d95">{me?.completed || 0}</text><text y="22" fontSize="11" fill="#6b7280">Challenges Completed</text></g>
          <g transform="translate(580 400)"><text fontFamily="Georgia,serif" fontSize="26" fontWeight="700" fill="#4c1d95">{km} km</text><text y="22" fontSize="11" fill="#6b7280">Distance Walked</text></g>
          <text x="450" y="500" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="#7c3aed" fontStyle="italic">Every step gives hope.</text>
        </svg>
      </div>
    </CardContent></Card>)
}

// ============= ADMIN =============
function AdminDashboard({ onExit, currentUser }) {
  const [tab, setTab] = useState('overview')
  const [analytics, setAnalytics] = useState(null)
  const [participants, setParticipants] = useState([])
  const [challenges, setChallenges] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null) // challenge being edited
  const [proofView, setProofView] = useState(null)
  const [bonusUser, setBonusUser] = useState(null)

  const load = async () => {
    try {
      const [aData, pData, cData, sData, anData] = await Promise.allSettled([
        api('admin/analytics'),
        api('admin/participants'),
        api('challenges'),
        api('submissions'),
        api('announcements')
      ])

      if (aData.status === 'fulfilled' && aData.value && !aData.value.error) {
        setAnalytics(aData.value)
      } else {
        setAnalytics({
          totalParticipants: 0,
          totalPoints: 0,
          totalKm: 0,
          submissions: { pending: 0 },
          activity: []
        })
      }

      if (pData.status === 'fulfilled' && pData.value?.participants) setParticipants(pData.value.participants)
      if (cData.status === 'fulfilled' && cData.value?.challenges) setChallenges(cData.value.challenges)
      if (sData.status === 'fulfilled' && sData.value?.submissions) setSubmissions(sData.value.submissions)
      if (anData.status === 'fulfilled' && anData.value?.announcements) setAnnouncements(anData.value.announcements)
    } catch (err) {
      console.error("Admin data load safely handled:", err)
    }
  }
  useEffect(() => { load() }, [])

  const saveChallenge = async (c) => {
    setBusy(true)
    try {
      if (c._new) { delete c._new; await api('challenges', { method:'POST', body: JSON.stringify(c) }) }
      else await api(`challenges/${c.id}`, { method: 'PUT', body: JSON.stringify(c) })
      toast.success('Saved'); setEditing(null); load()
    } catch { toast.error('Failed') } finally { setBusy(false) }
  }
  const deleteChallenge = async (id) => { if (!confirm('Delete?')) return; await api(`challenges/${id}`, { method: 'DELETE' }); toast.success('Deleted'); load() }
  const approve = async (id) => { await api(`submissions/${id}/approve`, { method: 'POST' }); toast.success('Approved & points awarded'); load() }
  const reject = async (id) => { const r = prompt('Reason (optional):') || ''; await api(`submissions/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason: r }) }); toast('Rejected'); load() }
  const awardBonus = async () => {
    if (!bonusUser) return
    await api('admin/bonus', { method: 'POST', body: JSON.stringify({ userId: bonusUser.id, points: bonusUser.pts, reason: bonusUser.reason }) })
    toast.success(`+${bonusUser.pts} pts to ${bonusUser.name}`); setBonusUser(null); load()
  }
  const removeParticipant = async (id) => { if (!confirm('Remove this participant?')) return; await api(`participants/${id}`, { method: 'DELETE' }); toast.success('Removed'); load() }
  const addAnnouncement = async (title, body, pinned) => {
    await api('announcements', { method: 'POST', body: JSON.stringify({ title, body, pinned }) })
    toast.success('Announcement posted'); load()
  }
  const delAnnouncement = async (id) => { await api(`announcements/${id}`, { method: 'DELETE' }); load() }

  const items = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'challenges', label: 'Challenges', icon: ListChecks },
    { id: 'submissions', label: 'Review Submissions', icon: Eye },
    { id: 'bonus', label: 'Award Bonus', icon: Sparkles },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Shield },
  ]

  return (<div className="min-h-screen flex bg-gradient-to-br from-purple-50/40 via-white to-blue-50/40">
    <aside className="hidden lg:flex sticky top-0 h-screen w-72 flex-col bg-gradient-to-b from-brand-purple-dark via-brand-purple to-[#4c1d95] text-white">
      <div className="p-5 flex items-center justify-between">
        <Wordmark small invert/>
      </div>
      <div className="px-5 pb-2"><Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400"><Shield className="h-3 w-3 mr-1"/>Admin</Badge></div>
      <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
        {items.map(({id,label,icon:Icon})=>{const a=tab===id;return(<button key={id} onClick={()=>setTab(id)}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm ${a?'bg-white text-brand-purple-dark font-semibold shadow-lg':'text-white/85 hover:bg-white/10'}`}>
          <Icon className="h-4 w-4"/>{label}
        </button>)})}
      </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <button onClick={onExit} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/85 hover:bg-white/10"><X className="h-4 w-4"/>Exit Admin</button>
          <button onClick={async()=>{const sb=createClient();await sb.auth.signOut();localStorage.clear();window.location.replace('/')}} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/85 hover:bg-white/10"><LogOut className="h-4 w-4"/>Log Out</button>
        </div>
    </aside>
    <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-display text-2xl md:text-3xl font-bold text-brand-purple-dark">Admin Dashboard</div>
          <div className="text-sm text-muted-foreground">Manage RoseUp Quest 2026</div>
        </div>
        <div className="lg:hidden">
          <select value={tab} onChange={(e)=>setTab(e.target.value)} className="rounded-xl border border-purple-200 px-3 py-2 text-sm">
            {items.map(i=><option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        </div>
      </div>

      {tab === 'overview' && analytics && (<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:'Participants',value:analytics.totalParticipants,icon:<Users className="h-4 w-4"/>},
            {label:'Total Points',value:analytics.totalPoints?.toLocaleString(),icon:<Sparkles className="h-4 w-4"/>},
            {label:'Total km',value:`${analytics.totalKm}`,icon:<MapPin className="h-4 w-4"/>},
            {label:'Pending Reviews',value:analytics.submissions.pending,icon:<Clock className="h-4 w-4"/>},
          ].map((s,i)=>(<Card key={i} className="rounded-2xl border-purple-100 card-elevated"><CardContent className="p-4">
            <div className="flex items-center gap-2 text-brand-purple text-xs uppercase font-semibold">{s.icon}{s.label}</div>
            <div className="font-display text-2xl font-bold mt-1 text-brand-purple-dark">{s.value}</div>
          </CardContent></Card>))}
        </div>
        <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
          <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">Submissions this week</div>
          <div className="flex items-end gap-2 h-40">
            {analytics.activity.map((d,i)=>(<div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full brand-gradient rounded-t-lg" style={{height:`${Math.max(4,d.submissions*24)}px`}}/>
              <div className="text-[10px] text-muted-foreground">{d.day}</div><div className="text-xs font-semibold text-brand-purple">{d.submissions}</div>
            </div>))}
          </div>
        </CardContent></Card>
      </>)}

      {tab === 'participants' && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
        <div className="flex items-center justify-between mb-4"><div className="font-display text-lg font-bold text-brand-purple-dark">Participants ({participants.length})</div>
          <Button asChild variant="outline" className="rounded-xl border-purple-200"><a href="/api/admin/export.csv"><FileSpreadsheet className="h-4 w-4 mr-1"/>Export CSV</a></Button>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground border-b"><th className="py-2">Rank</th><th>Name</th><th>Points</th><th>km</th><th>Streak</th><th>Done</th><th></th></tr></thead>
          <tbody>{participants.map((p,i)=>(<tr key={p.id} className="border-b hover:bg-purple-50/40">
            <td className="py-2 font-semibold text-brand-purple">#{i+1}</td>
            <td className="py-2"><div className="flex items-center gap-2"><span className="text-lg">{p.avatar}</span><span className="font-semibold text-brand-purple-dark">{p.name}</span></div></td>
            <td>{p.points||0}</td><td>{(p.km||0).toFixed?.(1)}</td><td>{p.streak||0}</td><td>{p.completed||0}</td>
            <td className="text-right"><button onClick={()=>removeParticipant(p.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4"/></button></td>
          </tr>))}</tbody></table></div>
      </CardContent></Card>)}

      {tab === 'challenges' && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-display text-lg font-bold text-brand-purple-dark">Challenges ({challenges.length})</div>
          <Button onClick={()=>setEditing({_new:true,type:'weekly',title:'',description:'',icon:'⭐',points:100,active:true})} className="brand-gradient text-white rounded-xl"><Plus className="h-4 w-4 mr-1"/>New Challenge</Button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">{challenges.map(c=>(<div key={c.id} className="rounded-2xl border border-purple-100 p-4 flex items-start gap-3">
          <div className="text-2xl h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">{c.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2"><span className="font-semibold text-brand-purple-dark">{c.title}</span>
              <Badge variant="outline" className="text-xs capitalize border-purple-200">{c.type}</Badge>
              {!c.active && <Badge variant="outline" className="text-xs">inactive</Badge>}
            </div>
            <div className="text-xs text-muted-foreground truncate">{c.description}</div>
            <div className="text-xs mt-1 text-brand-purple font-semibold">+{c.points} pts</div>
          </div>
          <div className="flex gap-1"><button onClick={()=>setEditing({...c})} className="p-1.5 rounded-lg hover:bg-purple-50 text-brand-purple"><Edit3 className="h-4 w-4"/></button>
          <button onClick={()=>deleteChallenge(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4"/></button></div>
        </div>))}</div>
      </CardContent></Card>)}

      {tab === 'submissions' && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
        <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">Review Submissions ({submissions.length})</div>
        <div className="grid md:grid-cols-2 gap-3">{submissions.length === 0 && <div className="text-sm text-muted-foreground">No submissions yet.</div>}
        {submissions.map(s=>(<div key={s.id} className="rounded-2xl border border-purple-100 p-3">
          {s.proofDataUrl && <img src={s.proofDataUrl} alt="proof" className="w-full h-32 object-cover rounded-xl cursor-pointer" onClick={()=>setProofView(s)}/>}
          <div className="mt-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{s.userAvatar} {s.userName}</div>
              <div className="font-semibold text-sm truncate text-brand-purple-dark">{s.challengeTitle}</div>
              <div className="text-xs text-brand-purple">+{s.points} pts</div>
            </div>
            <Badge className={s.status==='approved'?'bg-emerald-100 text-emerald-700':s.status==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}>
              {s.status==='approved'?<CheckCircle2 className="h-3 w-3 mr-1"/>:s.status==='rejected'?<XCircle className="h-3 w-3 mr-1"/>:<Clock className="h-3 w-3 mr-1"/>}{s.status}
            </Badge>
          </div>
          {s.note && <div className="text-xs text-muted-foreground italic mt-1">"{s.note}"</div>}
          {s.status==='pending' && (<div className="mt-2 flex gap-2">
            <Button size="sm" onClick={()=>approve(s.id)} className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs">Approve</Button>
            <Button size="sm" onClick={()=>reject(s.id)} variant="outline" className="flex-1 h-8 rounded-lg text-xs border-red-200 text-red-600 hover:bg-red-50">Reject</Button>
          </div>)}
        </div>))}</div>
      </CardContent></Card>)}

      {tab === 'bonus' && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
        <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">Award Bonus Points</div>
        <div className="grid md:grid-cols-2 gap-2">{participants.slice(0,20).map(p=>(<div key={p.id} className="flex items-center gap-3 rounded-xl border border-purple-100 p-2">
          <span className="text-lg">{p.avatar}</span><div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate text-brand-purple-dark">{p.name}</div><div className="text-xs text-muted-foreground">{p.points} pts</div></div>
          <Button size="sm" onClick={()=>setBonusUser({id:p.id,name:p.name,pts:25,reason:'Bonus event'})} className="brand-gradient text-white rounded-lg h-8"><Sparkles className="h-3 w-3 mr-1"/>Award</Button>
        </div>))}</div>
      </CardContent></Card>)}

      {tab === 'leaderboard' && <LeaderboardList me={null}/>}

      {tab === 'donations' && analytics && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
        <div className="font-display text-lg font-bold text-brand-purple-dark mb-4">Donation Statistics</div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 p-5"><div className="text-xs uppercase text-brand-purple font-semibold">Raised</div><div className="font-display text-3xl font-bold text-brand-purple-dark mt-1">€{Math.round(analytics.totalPoints*1.25+12480).toLocaleString()}</div></div>
          <div className="rounded-2xl bg-purple-50 p-5"><div className="text-xs uppercase text-brand-purple font-semibold">Donors</div><div className="font-display text-3xl font-bold text-brand-purple-dark mt-1">1,245</div></div>
          <div className="rounded-2xl bg-blue-50 p-5"><div className="text-xs uppercase text-brand-blue font-semibold">Avg. Donation</div><div className="font-display text-3xl font-bold text-brand-purple-dark mt-1">€42</div></div>
        </div>
      </CardContent></Card>)}

      {tab === 'analytics' && analytics && (<div className="grid md:grid-cols-2 gap-4">
        <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
          <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">Submissions Breakdown</div>
          {['pending','approved','rejected'].map(k=>{const v=analytics.submissions[k],pct=Math.round((v/(analytics.submissions.total||1))*100);
            const color=k==='approved'?'bg-emerald-500':k==='rejected'?'bg-red-500':'bg-amber-500'
            return(<div key={k} className="mb-3"><div className="flex justify-between text-sm mb-1"><span className="capitalize">{k}</span><span className="font-semibold">{v} · {pct}%</span></div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className={`h-full ${color}`} style={{width:`${pct}%`}}/></div></div>)})}
        </CardContent></Card>
        <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
          <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">Campaign Health</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Total challenges configured</span><b>{analytics.totalChallenges}</b></div>
            <div className="flex justify-between"><span>Active participants</span><b>{analytics.totalParticipants}</b></div>
            <div className="flex justify-between"><span>Total km walked</span><b>{analytics.totalKm}</b></div>
            <div className="flex justify-between"><span>Points issued</span><b>{analytics.totalPoints?.toLocaleString()}</b></div>
          </div>
        </CardContent></Card>
      </div>)}

      {tab === 'announcements' && (<AnnouncementsAdmin items={announcements} onAdd={addAnnouncement} onDelete={delAnnouncement}/>)}

      {tab === 'settings' && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
        <div className="font-display text-lg font-bold text-brand-purple-dark mb-2">Settings</div>
        <p className="text-sm text-muted-foreground">Third-party integrations (Supabase Auth/Storage/Database, Stripe donations, email notifications) will be configured here in the final phase.</p>
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-dashed border-purple-200 p-4"><div className="font-semibold text-brand-purple-dark">Supabase</div><div className="text-xs text-muted-foreground mt-1">Auth · Storage · DB — pending</div></div>
          <div className="rounded-2xl border border-dashed border-purple-200 p-4"><div className="font-semibold text-brand-purple-dark">Stripe</div><div className="text-xs text-muted-foreground mt-1">Donation checkout — pending</div></div>
        </div>
      </CardContent></Card>)}
    </main>

    {/* Challenge edit dialog */}
    <Dialog open={!!editing} onOpenChange={(v)=>!v&&setEditing(null)}>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader><DialogTitle className="font-display text-xl">{editing?._new?'New Challenge':'Edit Challenge'}</DialogTitle></DialogHeader>
        {editing && (<div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold mb-1 block">Type</label>
              <select value={editing.type} onChange={(e)=>setEditing({...editing,type:e.target.value})} className="w-full h-10 rounded-xl border border-purple-200 px-3 text-sm">
                <option value="weekly">Weekly</option><option value="special">Special</option>
              </select></div>
            <div><label className="text-xs font-semibold mb-1 block">Icon</label><Input value={editing.icon||''} onChange={(e)=>setEditing({...editing,icon:e.target.value})} className="rounded-xl border-purple-200"/></div>
          </div>
          <div><label className="text-xs font-semibold mb-1 block">Title</label><Input value={editing.title||''} onChange={(e)=>setEditing({...editing,title:e.target.value})} className="rounded-xl border-purple-200"/></div>
          <div><label className="text-xs font-semibold mb-1 block">Description</label><Textarea value={editing.description||''} onChange={(e)=>setEditing({...editing,description:e.target.value})} className="rounded-xl border-purple-200"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold mb-1 block">Points</label><Input type="number" value={editing.points||0} onChange={(e)=>setEditing({...editing,points:Number(e.target.value)})} className="rounded-xl border-purple-200"/></div>
            <div className="flex items-center gap-2 pt-6"><Switch checked={!!editing.active} onCheckedChange={(v)=>setEditing({...editing,active:v})}/><span className="text-sm">Active</span></div>
          </div>
        </div>)}
        <DialogFooter>
          <Button variant="outline" onClick={()=>setEditing(null)} className="rounded-xl">Cancel</Button>
          <Button onClick={()=>saveChallenge(editing)} disabled={busy} className="brand-gradient text-white rounded-xl">{busy?<Loader2 className="h-4 w-4 animate-spin"/>:'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Proof view */}
    <Dialog open={!!proofView} onOpenChange={(v)=>!v&&setProofView(null)}>
      <DialogContent className="sm:max-w-xl rounded-3xl">
        <DialogHeader><DialogTitle className="font-display">{proofView?.challengeTitle}</DialogTitle>
        <DialogDescription>Submitted by {proofView?.userName}</DialogDescription></DialogHeader>
        {proofView?.proofDataUrl && <img src={proofView.proofDataUrl} className="w-full rounded-2xl"/>}
        {proofView?.note && <div className="text-sm text-muted-foreground italic">"{proofView.note}"</div>}
      </DialogContent>
    </Dialog>

    {/* Bonus dialog */}
    <Dialog open={!!bonusUser} onOpenChange={(v)=>!v&&setBonusUser(null)}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader><DialogTitle className="font-display">Award bonus to {bonusUser?.name}</DialogTitle></DialogHeader>
        {bonusUser && <div className="space-y-3">
          <div><label className="text-xs font-semibold mb-1 block">Points</label><Input type="number" value={bonusUser.pts} onChange={(e)=>setBonusUser({...bonusUser,pts:Number(e.target.value)})} className="rounded-xl border-purple-200"/></div>
          <div><label className="text-xs font-semibold mb-1 block">Reason</label><Input value={bonusUser.reason} onChange={(e)=>setBonusUser({...bonusUser,reason:e.target.value})} className="rounded-xl border-purple-200"/></div>
        </div>}
        <DialogFooter><Button variant="outline" onClick={()=>setBonusUser(null)} className="rounded-xl">Cancel</Button>
        <Button onClick={awardBonus} className="brand-gradient text-white rounded-xl">Award</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>)
}

function AnnouncementsAdmin({ items, onAdd, onDelete }) {
  const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [pinned, setPinned] = useState(false)
  return (<div className="grid md:grid-cols-2 gap-4">
    <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
      <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">New Announcement</div>
      <div className="space-y-3">
        <Input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} className="rounded-xl border-purple-200"/>
        <Textarea placeholder="Message…" value={body} onChange={(e)=>setBody(e.target.value)} className="rounded-xl border-purple-200"/>
        <label className="flex items-center gap-2 text-sm"><Switch checked={pinned} onCheckedChange={setPinned}/>Pin to top</label>
        <Button onClick={()=>{if(title)onAdd(title,body,pinned);setTitle('');setBody('');setPinned(false)}} className="brand-gradient text-white rounded-xl"><Megaphone className="h-4 w-4 mr-1"/>Post</Button>
      </div>
    </CardContent></Card>
    <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
      <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">Recent</div>
      <div className="space-y-2">{items.map(a=>(<div key={a.id} className="rounded-xl border border-purple-100 p-3">
        <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="font-semibold text-sm text-brand-purple-dark">{a.title} {a.pinned && <Badge className="ml-1 bg-purple-100 text-brand-purple">pinned</Badge>}</div>
        <div className="text-xs text-muted-foreground">{a.body}</div></div>
        <button onClick={()=>onDelete(a.id)} className="text-red-500"><Trash2 className="h-4 w-4"/></button></div>
      </div>))}</div>
    </CardContent></Card>
  </div>)
}

// ============= ONBOARDING / AUTH =============
function Onboarding({ open, onClose, onDone }) {
  const [mode, setMode] = useState('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const sb = createClient()

const handleAuth = async (e) => {
    e?.preventDefault()
    if (!username || !password) {
      toast.error('Please enter both username and password')
      return
    }
    setLoading(true)

    const internalEmail = `${username.trim().toLowerCase()}@roseup.local`

    if (mode === 'signup') {
      const { data, error } = await sb.auth.signUp({
        email: internalEmail,
        password: password,
        options: { data: { name: username } }
      })
      setLoading(false)
      if (error) {
        toast.error('Sign up failed: ' + error.message)
        return
      }
      
      const newUser = {
        id: data.user?.id || Date.now().toString(),
        name: username,
        email: internalEmail,
        points: 0,
        km: 0,
        completed: 0,
        streak: 1
      }
      
      toast.success('Account created successfully!')
      await onDone?.(newUser)
      onClose?.()
    } else {
      const { data, error } = await sb.auth.signInWithPassword({
        email: internalEmail,
        password: password,
      })
      setLoading(false)
      if (error) {
        toast.error('Invalid username or password')
        return
      }

      // استخراج البيانات وتنسيق كائن المستخدم بالشكل الصحيح
      const loggedInUser = {
        id: data.user?.id,
        name: data.user?.user_metadata?.name || username,
        email: data.user?.email,
        points: data.user?.user_metadata?.points || 0,
        km: data.user?.user_metadata?.km || 0,
        completed: data.user?.user_metadata?.completed || 0,
        streak: data.user?.user_metadata?.streak || 1
      }

      toast.success('Logged in successfully!')
      await onDone?.(loggedInUser)
      onClose?.()
    }
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-brand-purple-dark">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signup'
              ? 'Enter a username and password to create your account.'
              : 'Enter your credentials to access your account.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAuth} className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-purple">Username</label>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border-purple-200"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-purple">Password</label>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-purple-200"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full brand-gradient text-white rounded-xl py-2 font-semibold"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'signup' ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <DialogFooter className="sm:justify-center">
          <div className="text-xs text-center text-muted-foreground">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-brand-purple font-bold hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-brand-purple font-bold hover:underline"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============= CHALLENGE CARDS =============
function ChallengeRow({ c, onComplete, onUpload, busy }) {
  return (<motion.div layout initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
    className={`flex items-center gap-4 rounded-2xl border p-4 ${c.completed?'border-emerald-200 bg-emerald-50/40':'border-purple-100 bg-white hover:border-purple-200'}`}>
    <div className="text-2xl h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shrink-0">{c.icon}</div>
    <div className="flex-1 min-w-0"><div className="font-semibold text-brand-purple-dark truncate">{c.title}</div>
    <div className="text-xs text-muted-foreground truncate">{c.description}</div></div>
    <div className="text-right shrink-0"><div className="text-sm font-bold text-brand-purple">+{c.points} pts</div>
      {c.completed?<div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold"><CheckCircle2 className="h-4 w-4"/>Done</div>
      :c.type==='daily'?<Button size="sm" disabled={busy} onClick={()=>onComplete(c)} className="mt-1 h-7 brand-gradient text-white rounded-lg px-3">Complete</Button>
      :<Button size="sm" disabled={busy} onClick={()=>onUpload(c)} className="mt-1 h-7 brand-gradient text-white rounded-lg px-3"><Upload className="h-3 w-3 mr-1"/>Submit Proof</Button>}
    </div>
  </motion.div>)
}

// ============= APP =============
function App() {
  const [me, setMe] = useState(null)
  const [onboard, setOnboard] = useState(false)
  const [stats, setStats] = useState({totalPoints:0,totalKm:0,totalParticipants:0,totalDonations:0,fundGoal:250000,topParticipants:[]})
  const [daily, setDaily] = useState([])
  const [weekly, setWeekly] = useState([])
  const [special, setSpecial] = useState([])
  const [mySubs, setMySubs] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [tab, setTab] = useState('dashboard')
  const [busy, setBusy] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [proofChallenge, setProofChallenge] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRequested, setAdminRequested] = useState(false)
  const [role, setRole] = useState('user')

  // 1. معالجة معلمات الرابط (URL Parameters)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1') setAdminRequested(true);
      if (params.get('signout') === '1') {
        const sb = createClient();
        sb.auth.signOut().finally(() => {
          localStorage.clear();
          window.location.replace('/');
        });
        return;
      }
    }
  }, []);

  // 2. التحقق من المستخدم ومنح صلاحية الأدمن
  useEffect(() => {
    const hydrate = async () => {
      try {
        const d = await api('me');
        if (d?.user || d?.participant) {
          if (d.participant) setMe(d.participant);

          // فحص شامل لجميع صيغ البريد والاسم
          const email = (d?.user?.email || d?.participant?.email || d?.email || '').toLowerCase();
          const name = (d?.user?.user_metadata?.name || d?.participant?.name || d?.name || '').toLowerCase();

          const isAdmin = 
            email.includes('bebars') || email.includes('nelshaar') ||
            name.includes('bebars')  || name.includes('nelshaar');

          if (isAdmin) {
            setRole('admin');
            setAdminRequested(true);
          }
        }
      } catch (err) {
        console.error("Hydrate error:", err);
      }
    };

    hydrate();
  }, []);

  // 3. جلب الإعلانات
  useEffect(() => {
    api('announcements').then((d) => setAnnouncements(d?.announcements || []));
  }, []);

  useEffect(() => {
    if (me?.id) {
      api(`challenges/daily?userId=${me.id}`).then(d=>setDaily(d.challenges||[]))
      api(`participants/${me.id}`).then(d=>{if(d?.id){setMe(d);localStorage.setItem('roseup_user',JSON.stringify(d))}})
      api(`submissions?userId=${me.id}`).then(d=>setMySubs(d.submissions||[]))
    } else {
      api('challenges/daily?userId=guest').then(d=>setDaily(d.challenges||[]))
    }
    api('challenges?type=weekly').then(d=>setWeekly(d.challenges||[]))
    api('challenges?type=special').then(d=>setSpecial(d.challenges||[]))
  }, [me?.id])

  const refetchMe = async () => { if(me?.id){const d=await api(`participants/${me.id}`); if(d?.id){setMe(d);localStorage.setItem('roseup_user',JSON.stringify(d))}} api('stats').then(setStats) }

  const signOut = async () => { const sb = createClient(); await sb.auth.signOut(); localStorage.removeItem('roseup_user'); setMe(null); setTab('dashboard'); toast('Signed out') }
  const completeDaily = async (c) => {
    if (!me?.id) { setOnboard(true); return }
    setBusy(true)
    try {
      const km = c.category==='move' && /walk/i.test(c.title) ? 3 : (c.category==='move' ? 0.5 : 0)
      const data = await api('challenges/complete', { method: 'POST', body: JSON.stringify({ userId: me.id, challengeId: c.id, points: c.points, km }) })
      if (data.participant) { setMe(data.participant); localStorage.setItem('roseup_user', JSON.stringify(data.participant)) }
      setDaily(prev => prev.map(x => x.id === c.id ? { ...x, completed: true } : x))
      toast.success(`+${c.points} points! 🌹`, { description: c.title }); api('stats').then(setStats)
    } catch { toast.error('Failed') } finally { setBusy(false) }
  }
  const startProof = (c) => { if (!me?.id) { setOnboard(true); return } setProofChallenge(c) }
  const myRank = useMemo(()=>{if(!me)return null;const idx=(stats.topParticipants||[]).findIndex(p=>p.id===me.id);return idx>=0?idx+1:null},[stats,me])

  // ADMIN VIEW — دخول ثابت ووصول دائم لـ bebars و nelshaar و admin
  const userEmail = (me?.email || me?.user?.email || '').toLowerCase();
  const userName = (me?.name || me?.participant?.name || me?.display_name || '').toLowerCase();

  const isUserAdmin = 
    role === 'admin' || 
    userEmail.includes('bebars') || userEmail.includes('nelshaar') || 
    userName.includes('bebars')  || userName.includes('nelshaar');

  if (adminRequested || tab === 'admin') {
    const safeAdminUser = me ? { ...me, role: 'admin' } : { name: 'Admin', role: 'admin' };

    if (isUserAdmin) {
      return (
        <AdminDashboard 
          onExit={() => { 
            if (typeof setAdminRequested === 'function') setAdminRequested(false);
            setTab('challenges'); 
          }} 
          currentUser={safeAdminUser}
        />
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full rounded-3xl card-elevated border-purple-100">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-3"><BrandMark size={56}/></div>
            <h2 className="font-display text-2xl font-bold text-brand-purple-dark">Admin access required</h2>
            <p className="text-sm text-muted-foreground mt-2">Only users with the admin role can view this page. Sign in with an admin account to continue.</p>
            <div className="mt-5 flex flex-col gap-2">
              {!me ? (
                <Button onClick={() => setOnboard(true)} className="brand-gradient text-white rounded-xl h-11">Sign in</Button>
              ) : (
                <Button onClick={async () => { const sb = createClient(); await sb.auth.signOut(); localStorage.clear(); window.location.replace('/?admin=1') }} variant="outline" className="rounded-xl h-11 border-purple-200">Switch account</Button>
              )}
              <Button variant="ghost" onClick={() => { if (typeof setAdminRequested === 'function') setAdminRequested(false); setTab('challenges'); }} className="rounded-xl h-11">Back to app</Button>
            </div>
            {me && !isUserAdmin && (
              <div className="mt-4 text-xs text-muted-foreground">
                Signed in as <b>{me.name}</b> but not an admin.
              </div>
            )}
          </CardContent>
        </Card>
        <Onboarding open={onboard} onClose={() => setOnboard(false)} onDone={(u) => { setMe(u); setOnboard(false); setTimeout(() => window.location.reload(), 300) }} />
      </div>
    );
  }
  // LANDING
  if (!me) {
    return (<div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/75 border-b border-purple-100">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Wordmark small/>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-brand-purple-dark">
            <a className="text-brand-purple font-semibold underline underline-offset-4 decoration-brand-blue">Home</a>
            <a href="#leaderboard" className="hover:text-brand-purple">Leaderboard</a>
            <a href="#donations" className="hover:text-brand-purple">Donations</a>
            <a href="#how" className="hover:text-brand-purple">How It Works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={()=>setOnboard(true)} className="rounded-full border-purple-200 text-brand-purple-dark hover:bg-purple-50">Log In</Button>
            <Button onClick={()=>setOnboard(true)} className="rounded-full brand-gradient text-white">Sign Up</Button>
            <Button variant="ghost" onClick={signOut} title="Sign out of any existing session" className="rounded-full text-xs text-muted-foreground hover:text-brand-purple"><LogOut className="h-3.5 w-3.5 mr-1"/>Sign out</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 md:py-14">
        {announcements.filter(a=>a.pinned).slice(0,1).map(a=>(<div key={a.id} className="mb-6 rounded-2xl brand-gradient text-white p-4 flex items-start gap-3">
          <Megaphone className="h-5 w-5 mt-0.5"/><div><div className="font-semibold">{a.title}</div><div className="text-sm text-white/90">{a.body}</div></div></div>))}
        <section className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="font-display font-bold leading-[0.98] text-5xl md:text-7xl text-brand-purple-dark">RoseUp<br/>Quest <span className="brand-gradient-text">2026</span></h1>
            <div className="mt-4 text-2xl md:text-3xl font-semibold text-brand-blue">Every Step Gives Hope</div>
            <p className="mt-4 text-muted-foreground max-w-md">Complete challenges, earn points, climb the leaderboard and help us make a difference together.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={()=>setOnboard(true)} className="brand-gradient text-white rounded-full h-12 px-7 font-semibold shadow-xl shadow-purple-500/25">Start the Quest <ArrowRight className="ml-1.5 h-5 w-5"/></Button>
              <Button size="lg" variant="outline" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})} className="rounded-full h-12 px-6 border-purple-200">Learn more</Button>
            </div>
          </div>
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 flex items-center justify-center"><div className="h-72 w-72 rounded-full bg-gradient-to-br from-purple-200/40 to-blue-200/40 blur-2xl"/></div>
            <div className="relative animate-float"><BlueRose className="w-80 md:w-[420px] h-auto drop-shadow-2xl"/></div>
          </div>
        </section>
        <section className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            {icon:<Sparkles className="h-4 w-4"/>,label:'Total Points',value:stats.totalPoints?.toLocaleString(),sub:'All participants'},
            {icon:<MapPin className="h-4 w-4"/>,label:'Kilometers Walked',value:`${stats.totalKm||0} km`,sub:'All participants'},
            {icon:<Users className="h-4 w-4"/>,label:'Participants',value:stats.totalParticipants?.toLocaleString(),sub:'Worldwide'},
            {icon:<Heart className="h-4 w-4"/>,label:'Total Donations',value:`€${stats.totalDonations?.toLocaleString()}`,sub:'Total raised'},
          ].map((s,i)=>(<Card key={i} className="rounded-2xl border-purple-100 card-elevated bg-white"><CardContent className="p-5">
            <div className="flex items-center gap-2 text-brand-purple mb-2"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">{s.icon}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div></div>
            <div className="font-display text-2xl font-bold text-brand-purple-dark">{s.value}</div><div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
          </CardContent></Card>))}
          <button onClick={()=>document.getElementById('leaderboard')?.scrollIntoView({behavior:'smooth'})} className="text-left rounded-2xl brand-gradient text-white p-5">
            <div className="flex items-center gap-2 mb-2 text-white/90"><Trophy className="h-4 w-4"/><span className="text-xs font-semibold uppercase tracking-wider">Top 10</span></div>
            <div className="font-display text-lg font-bold">See Leaderboard</div><div className="text-xs text-white/80 mt-0.5">Top participants</div>
          </button>
        </section>
        <section id="leaderboard" className="mt-10 grid lg:grid-cols-2 gap-5"><LeaderboardList me={me} compact/>
          <Card className="rounded-3xl brand-gradient text-white"><CardContent className="p-6 relative">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1"><Trophy className="h-4 w-4"/>Weekly Challenge</div>
            <h3 className="font-display text-3xl font-bold mt-3">Walk 20 km</h3><p className="text-sm text-white/85 mt-1">Complete 20 kilometers this week.</p>
            <div className="mt-6 h-2 rounded-full bg-white/25 overflow-hidden"><div className="h-full bg-white" style={{width:'62%'}}/></div>
            <div className="mt-3 text-xs text-white/80">+150 pts · Ends in 4d 12h</div>
          </CardContent></Card>
        </section>
        <section id="how" className="mt-12"><div className="text-center mb-6"><h2 className="font-display text-3xl md:text-4xl font-bold text-brand-purple-dark">How It Works</h2><p className="text-muted-foreground">Five simple steps to make a real impact.</p></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{[
            {n:1,icon:<User className="h-5 w-5"/>,title:'Join',text:'Create your account.'},
            {n:2,icon:<ListChecks className="h-5 w-5"/>,title:'Do Challenges',text:'Daily and weekly quests.'},
            {n:3,icon:<Star className="h-5 w-5"/>,title:'Earn Points',text:'Watch your progress grow.'},
            {n:4,icon:<Trophy className="h-5 w-5"/>,title:'Climb Higher',text:'Rise on the leaderboard.'},
            {n:5,icon:<Heart className="h-5 w-5"/>,title:'Make Impact',text:'Support the cause.'},
          ].map(s=>(<Card key={s.n} className="rounded-2xl border-purple-100 card-elevated bg-white"><CardContent className="p-5">
            <div className="h-11 w-11 rounded-2xl brand-gradient text-white flex items-center justify-center">{s.icon}</div>
            <div className="mt-3 text-xs font-semibold text-brand-blue">STEP {s.n}</div>
            <div className="font-display text-lg font-bold text-brand-purple-dark mt-0.5">{s.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.text}</div>
          </CardContent></Card>))}</div>
        </section>
        <footer className="mt-16 py-8 text-center text-sm text-muted-foreground">Made with 💜 for RoseUp Quest 2026 · Every step gives hope. · <a href="?admin=1" className="underline hover:text-brand-purple">Admin</a></footer>
      </main>
      <Onboarding open={onboard} onClose={()=>setOnboard(false)} onDone={(u)=>{setMe(u);setOnboard(false);setTab('dashboard')}}/>
    </div>)
  }

  // DASHBOARD
  const rank = myRank || '—'
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Daily Challenges', icon: ListChecks },
    { id: 'weekly', label: 'Weekly Challenges', icon: CalendarRange },
    { id: 'special', label: 'Special Challenges', icon: Star },
    { id: 'submissions', label: 'My Submissions', icon: Upload },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'certificate', label: 'Certificate', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (<div className="min-h-screen flex bg-gradient-to-br from-purple-50/40 via-white to-blue-50/40">
    {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
    <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-gradient-to-b from-brand-purple-dark via-brand-purple to-[#4c1d95] text-white flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
      <div className="p-5 flex items-center justify-between"><Wordmark small invert/><button className="lg:hidden text-white/80" onClick={()=>setSidebarOpen(false)}><X className="h-5 w-5"/></button></div>
      <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">{items.map(({id,label,icon:Icon})=>{const a=tab===id;return(<button key={id} onClick={()=>{setTab(id);setSidebarOpen(false)}}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm ${a?'bg-white text-brand-purple-dark font-semibold shadow-lg':'text-white/85 hover:bg-white/10'}`}>
        <Icon className="h-4 w-4"/>{label}</button>)})}</nav>
      <div className="p-3 border-t border-white/10"><button onClick={signOut} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/85 hover:bg-white/10"><LogOut className="h-4 w-4"/>Log Out</button></div>
    </aside>
    <main className="flex-1 min-w-0">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-purple-100">
        <div className="flex items-center justify-between px-4 md:px-8 h-16">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebarOpen(true)} className="lg:hidden text-brand-purple-dark"><Menu className="h-5 w-5"/></button>
            <div><div className="font-display text-lg font-bold text-brand-purple-dark">Welcome back,</div><div className="text-sm text-muted-foreground -mt-0.5">{me.name} 👋</div></div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white border border-purple-100 pl-1 pr-3 py-1 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-lg">{me.avatar}</div>
            <div className="leading-tight"><div className="text-sm font-semibold text-brand-purple-dark">{me.name.split(' ')[0]}</div><div className="text-[10px] text-muted-foreground">{me.points||0} pts</div></div>
          </div>
          <Button onClick={signOut} variant="outline" size="sm" className="rounded-full border-purple-200 h-9 gap-1.5"><LogOut className="h-3.5 w-3.5"/><span className="hidden sm:inline">Log Out</span></Button>
        </div>
      </header>
      <div className="p-4 md:p-8 space-y-6">
        {announcements.filter(a=>a.pinned).slice(0,1).map(a=>(<div key={a.id} className="rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 p-4 flex items-start gap-3">
          <Megaphone className="h-5 w-5 mt-0.5 text-brand-purple"/><div><div className="font-semibold text-brand-purple-dark">{a.title}</div><div className="text-sm text-brand-purple-dark/80">{a.body}</div></div></div>))}

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="rounded-2xl border-purple-100 card-elevated bg-gradient-to-br from-purple-600 to-blue-500 text-white"><CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-white/80 font-semibold">Total Points</div><div className="font-display text-3xl font-bold mt-1">{me.points||0}</div></CardContent></Card>
          <Card className="rounded-2xl border-purple-100 card-elevated bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Rank</div>
            <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark">#{rank}</div><div className="text-[10px] text-muted-foreground">out of {stats.totalParticipants}</div></CardContent></Card>
          <Card className="rounded-2xl border-purple-100 card-elevated bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Challenges</div>
            <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark">{me.completed||0}<span className="text-lg text-muted-foreground"> / 35</span></div><div className="text-[10px] text-muted-foreground">Completed</div></CardContent></Card>
          <Card className="rounded-2xl border-purple-100 card-elevated bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Distance</div>
            <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark">{(me.km||0).toFixed?.(1)??me.km}<span className="text-lg text-muted-foreground"> km</span></div><div className="text-[10px] text-muted-foreground">Walked</div></CardContent></Card>
          <Card className="rounded-2xl border-purple-100 card-elevated bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Streak</div>
            <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark flex items-center gap-1">{me.streak||1}<Flame className="h-5 w-5 text-orange-500"/></div><div className="text-[10px] text-muted-foreground">Current days</div></CardContent></Card>
        </section>

        {tab==='dashboard' && (<><RosePath points={me.points||0}/>
          <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
            <div className="flex items-center justify-between mb-4"><div><h3 className="font-display text-xl font-bold text-brand-purple-dark">Today's Challenges</h3><p className="text-xs text-muted-foreground">Complete them to bloom your next rose</p></div>
              <Badge className="bg-purple-100 text-brand-purple border-purple-200 hover:bg-purple-100">{daily.filter(c=>c.completed).length} / {daily.length} completed</Badge></div>
            <div className="space-y-2.5">{daily.map(c=><ChallengeRow key={c.id} c={{...c,type:'daily'}} onComplete={completeDaily} onUpload={startProof} busy={busy}/>)}</div>
          </CardContent></Card></>)}

        {tab==='daily' && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
          <h3 className="font-display text-2xl font-bold text-brand-purple-dark mb-1">Daily Challenges</h3><p className="text-sm text-muted-foreground mb-5">Fresh every day.</p>
          <div className="space-y-2.5">{daily.map(c=><ChallengeRow key={c.id} c={{...c,type:'daily'}} onComplete={completeDaily} onUpload={startProof} busy={busy}/>)}</div></CardContent></Card>)}

        {tab==='weekly' && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
          <h3 className="font-display text-2xl font-bold text-brand-purple-dark mb-1">Weekly Challenges</h3><p className="text-sm text-muted-foreground mb-5">Bigger goals, bigger rewards. Submit proof to earn points.</p>
          <div className="space-y-2.5">{weekly.filter(c=>c.active).map(c=><ChallengeRow key={c.id} c={{...c,completed:(me.completedChallengeIds||[]).includes(c.id)}} onUpload={startProof} onComplete={completeDaily} busy={busy}/>)}</div></CardContent></Card>)}

        {tab==='special' && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
          <h3 className="font-display text-2xl font-bold text-brand-purple-dark mb-1">Special Challenges</h3><p className="text-sm text-muted-foreground mb-5">Limited-time events. Grab the bonus points!</p>
          <div className="space-y-2.5">{special.filter(c=>c.active).map(c=><ChallengeRow key={c.id} c={{...c,completed:(me.completedChallengeIds||[]).includes(c.id)}} onUpload={startProof} onComplete={completeDaily} busy={busy}/>)}</div></CardContent></Card>)}

        {tab==='submissions' && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
          <h3 className="font-display text-2xl font-bold text-brand-purple-dark mb-1">My Submissions</h3><p className="text-sm text-muted-foreground mb-5">Track your proof reviews.</p>
          {mySubs.length===0 && <div className="text-center text-sm text-muted-foreground py-8">No submissions yet. Upload proof from Weekly or Special challenges.</div>}
          <div className="grid md:grid-cols-3 gap-3">{mySubs.map(s=>(<div key={s.id} className="rounded-2xl border border-purple-100 p-3">
            {s.proofDataUrl && <img src={s.proofDataUrl} className="w-full h-28 object-cover rounded-xl"/>}
            <div className="mt-2 flex items-start justify-between gap-2">
              <div className="min-w-0"><div className="font-semibold text-sm truncate text-brand-purple-dark">{s.challengeTitle}</div><div className="text-xs text-brand-purple">+{s.points} pts</div></div>
              <Badge className={s.status==='approved'?'bg-emerald-100 text-emerald-700':s.status==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}>
                {s.status==='approved'?<CheckCircle2 className="h-3 w-3 mr-1"/>:s.status==='rejected'?<XCircle className="h-3 w-3 mr-1"/>:<Clock className="h-3 w-3 mr-1"/>}{s.status}
              </Badge>
            </div>
            {s.reason && <div className="text-xs text-red-600 mt-1">Reason: {s.reason}</div>}
          </div>))}</div>
        </CardContent></Card>)}

        {tab==='leaderboard' && <LeaderboardList me={me}/>}

        {tab==='donations' && (<Card className="rounded-3xl border-purple-100 card-elevated bg-white"><CardContent className="p-6">
          <div className="flex items-center gap-2 text-brand-purple mb-3"><Heart className="h-4 w-4"/><span className="text-xs font-semibold uppercase tracking-wider">Donations</span></div>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="text-sm text-muted-foreground">Campaign Goal</div><div className="font-display text-2xl font-bold text-brand-purple-dark">€{stats.fundGoal?.toLocaleString()}</div>
              <div className="font-display text-4xl font-bold mt-3 text-brand-purple-dark">€{stats.totalDonations?.toLocaleString()}</div><div className="text-xs text-muted-foreground">Raised so far</div>
              <div className="mt-4"><Progress value={((stats.totalDonations||0)/(stats.fundGoal||1))*100} className="h-3"/></div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-purple-50 p-3"><div className="text-xs text-brand-purple font-semibold uppercase">Donors</div><div className="font-display text-xl font-bold text-brand-purple-dark">1,245</div></div>
                <div className="rounded-2xl bg-blue-50 p-3"><div className="text-xs text-brand-blue font-semibold uppercase">Days Left</div><div className="font-display text-xl font-bold text-brand-purple-dark">23</div></div>
              </div>
              <Button className="w-full mt-5 brand-gradient text-white rounded-2xl h-12"><Heart className="h-4 w-4 mr-2"/>Donate Now (coming soon)</Button>
            </div>
            <div className="relative h-64 w-64 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#ede9fe" strokeWidth="10"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#dg)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={2*Math.PI*42} strokeDashoffset={2*Math.PI*42*(1-Math.min((stats.totalDonations||0)/(stats.fundGoal||250000),1))}/>
                <defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6b21a8"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold text-brand-purple-dark">{Math.round(((stats.totalDonations||0)/(stats.fundGoal||250000))*100)}%</div>
            </div>
          </div>
        </CardContent></Card>)}

        {tab==='certificate' && <Certificate me={me}/>}

        {tab==='profile' && (<Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-3xl">{me.avatar}</div>
            <div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.name}</div><div className="text-sm text-muted-foreground">Rank #{rank} · {me.points} points</div></div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-purple-50 p-4"><div className="text-xs text-brand-purple font-semibold uppercase">Points</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.points||0}</div></div>
            <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs text-brand-blue font-semibold uppercase">Kilometers</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{(me.km||0).toFixed?.(1)} km</div></div>
            <div className="rounded-2xl bg-purple-50 p-4"><div className="text-xs text-brand-purple font-semibold uppercase">Streak</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.streak||1} days</div></div>
            <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs text-brand-blue font-semibold uppercase">Completed</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.completed||0}</div></div>
          </div>
        </CardContent></Card>)}
      </div>
    </main>

    <Onboarding 
        open={onboard} 
        onClose={() => setOnboard(false)} 
        onDone={(user) => {
          if (user) setMe(user);
          setOnboard(false);
          setTab('challenges');
        }}
      />
    </div>
  );
}

export default App;
