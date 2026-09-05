'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Sparkles, Trophy, Users, Heart, Flame, Award, MapPin, LayoutDashboard, ListChecks, Star, LogOut, User,
  Menu, X, ArrowRight, CheckCircle2, Upload, Megaphone, Clock, XCircle, Instagram, Camera
} from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { WELCOME_POINTS } from '@/lib/constants/links'
import { api } from '@/components/roseup/api'
import { BrandMark, Wordmark, BlueRose, LangToggle } from '@/components/roseup/brand'
import { RosePath } from '@/components/roseup/rose-path'
import { ProofDialog } from '@/components/roseup/proof-dialog'
import { LeaderboardList } from '@/components/roseup/leaderboard'
import { Certificate } from '@/components/roseup/certificate'
import { AdminDashboard } from '@/components/roseup/admin'
import { Onboarding } from '@/components/roseup/onboarding'
import { ChallengeRow } from '@/components/roseup/challenge-row'
import { MeetNoor, DonateCard, InstagramCard, StreakCard } from '@/components/roseup/community'

const ADMIN_PASSWORD = '12121234'

function App() {
  const { t, lang } = useLang()
  const [me, setMe] = useState(null)
  const [onboard, setOnboard] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [stats, setStats] = useState({ totalPoints: 0, totalKm: 0, totalParticipants: 0, totalDonations: 0, fundGoal: 250000, topParticipants: [] })
  const [daily, setDaily] = useState([])
  const [mySubs, setMySubs] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [tab, setTab] = useState('dashboard')
  const [busy, setBusy] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [proofChallenge, setProofChallenge] = useState(null)
  const [adminRequested, setAdminRequested] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const openAuth = (mode) => { setAuthMode(mode); setOnboard(true) }
  const loadStats = () => api('stats').then(d => { if (d && !d.error) setStats(d) })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === '1') setAdminRequested(true)
    if (params.get('signout') === '1') {
      const sb = createClient()
      sb.auth.signOut().finally(() => { localStorage.clear(); window.location.replace('/') })
    }
  }, [])

  useEffect(() => { loadStats() }, [])
  useEffect(() => { api('announcements').then((d) => setAnnouncements(d?.announcements || [])) }, [])

  useEffect(() => {
    const hydrate = async () => {
      try {
        const d = await api('me')
        if (d?.participant) {
          setMe(d.participant)
          if (d.welcomeAwarded) setTimeout(() => toast.success(t('welcome_bonus_toast', { n: d.welcomePoints || WELCOME_POINTS })), 600)
          const email = (d?.user?.email || '').toLowerCase()
          const name = (d?.participant?.name || '').toLowerCase()
          if (d?.user?.role === 'admin' || email.includes('bebars') || email.includes('nelshaar') || name.includes('bebars') || name.includes('nelshaar')) setAdminRequested(true)
        }
      } catch (err) { console.error('Hydrate error:', err) } finally { setHydrated(true) }
    }
    hydrate()
  }, [])

  const loadUserData = (id) => {
    api(`challenges/daily?userId=${id}`).then(d => setDaily(d.challenges || []))
    api(`participants/${id}`).then(d => { if (d?.id) { setMe(d); localStorage.setItem('roseup_user', JSON.stringify(d)) } })
    api(`submissions?userId=${id}`).then(d => setMySubs(d.submissions || []))
  }
  useEffect(() => {
    if (me?.id) loadUserData(me.id)
    else api('challenges/daily?userId=guest').then(d => setDaily(d.challenges || []))
  }, [me?.id])

  const refetchMe = async () => { if (me?.id) loadUserData(me.id); loadStats() }

  const startProof = (c) => { if (!me?.id) { openAuth('signin'); return } setProofChallenge(c) }

  const myRank = useMemo(() => {
    if (!me) return null
    const idx = (stats.topParticipants || []).findIndex(p => p.id === me.id)
    return idx >= 0 ? idx + 1 : null
  }, [stats, me])

  const isPassUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('admin_unlocked') === 'true'

  // ================= ADMIN =================
  if (adminRequested || tab === 'admin') {
    if (!isPassUnlocked) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md w-full rounded-3xl card-elevated border-purple-100">
            <CardContent className="p-8 text-center">
              <div className="flex justify-end"><LangToggle /></div>
              <div className="mx-auto mb-3"><BrandMark size={56}/></div>
              <h2 className="font-display text-2xl font-bold text-brand-purple-dark">{t('admin_pw_title')}</h2>
              <p className="text-sm text-muted-foreground mt-2">{t('admin_pw_text')}</p>
              <form onSubmit={(e) => {
                e.preventDefault()
                if (e.target.password.value === ADMIN_PASSWORD) { sessionStorage.setItem('admin_unlocked', 'true'); window.location.reload() }
                else toast.error(t('wrong_pw'))
              }} className="mt-5 space-y-3">
                <input name="password" type="password" placeholder={t('enter_password')} required data-testid="admin-password" className="w-full h-11 px-4 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-purple text-center"/>
                <Button type="submit" data-testid="admin-enter" className="w-full brand-gradient text-white rounded-xl h-11">{t('enter_dashboard')}</Button>
              </form>
              <Button variant="ghost" onClick={() => { setAdminRequested(false); setTab('dashboard') }} className="mt-3 rounded-xl h-11 w-full">{t('back_app')}</Button>
            </CardContent>
          </Card>
        </div>
      )
    }
    return <AdminDashboard onExit={() => { sessionStorage.removeItem('admin_unlocked'); setAdminRequested(false); setTab('dashboard') }} />
  }

  // ================= LANDING (guest) =================
  if (!me) {
    const donationsValue = `€${Number(stats.totalDonations || 0).toLocaleString()}`
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/75 border-b border-purple-100">
          <div className="container mx-auto flex items-center justify-between h-16 px-4 gap-2">
            <Wordmark small/>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-purple-dark">
              <a href="#top" className="text-brand-purple font-semibold underline underline-offset-4 decoration-brand-blue">{t('nav_home')}</a>
              <a href="#leaderboard" className="hover:text-brand-purple">{t('nav_leaderboard')}</a>
              <a href="#noor" className="hover:text-brand-purple">{t('nav_noor')}</a>
              <a href="#donate" className="hover:text-brand-purple">{t('nav_donations')}</a>
              <a href="#how" className="hover:text-brand-purple">{t('nav_how')}</a>
            </nav>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <LangToggle compact />
              <Button variant="outline" onClick={() => openAuth('signin')} data-testid="login-btn" className="rounded-full border-purple-200 text-brand-purple-dark hover:bg-purple-50 h-9 px-3 text-xs sm:text-sm sm:px-4">{t('login')}</Button>
              <Button onClick={() => openAuth('signup')} data-testid="signup-btn" className="rounded-full brand-gradient text-white h-9 px-3 text-xs sm:text-sm sm:px-4">{t('signup')}</Button>
            </div>
          </div>
        </header>
        <main id="top" className="container mx-auto px-4 py-8 md:py-14">
          {announcements.filter(a => a.pinned).slice(0, 1).map(a => (
            <div key={a.id} className="mb-6 rounded-2xl brand-gradient text-white p-4 flex items-start gap-3">
              <Megaphone className="h-5 w-5 mt-0.5"/><div><div className="font-semibold">{a.title}</div><div className="text-sm text-white/90">{a.body}</div></div>
            </div>
          ))}
          <section className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h1 className="font-display font-bold leading-[0.98] text-5xl md:text-7xl text-brand-purple-dark">RoseUp<br/>Quest <span className="brand-gradient-text">2026</span></h1>
              <div className="mt-4 text-2xl md:text-3xl font-semibold text-brand-blue">{t('hero_sub')}</div>
              <p className="mt-4 text-muted-foreground max-w-md">{t('hero_text')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => openAuth('signup')} data-testid="hero-start" className="brand-gradient text-white rounded-full h-12 px-7 font-semibold shadow-xl shadow-purple-500/25">{t('start_quest')} <ArrowRight className="ms-1.5 h-5 w-5 rtl:rotate-180"/></Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full h-12 px-6 border-purple-200">{t('learn_more')}</Button>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-brand-purple bg-purple-50 border border-purple-100 rounded-full px-3 py-1.5"><Sparkles className="h-3.5 w-3.5"/>+{WELCOME_POINTS} {t('pts')} · {t('how1t', { n: WELCOME_POINTS })}</div>
            </div>
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 flex items-center justify-center"><div className="h-72 w-72 rounded-full bg-gradient-to-br from-purple-200/40 to-blue-200/40 blur-2xl"/></div>
              <div className="relative animate-float"><BlueRose className="w-80 md:w-[420px] h-auto drop-shadow-2xl"/></div>
            </div>
          </section>

          <section className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { icon: <Sparkles className="h-4 w-4"/>, label: t('total_points'), value: (stats.totalPoints || 0).toLocaleString(), sub: t('all_participants'), id: 'stat-points' },
              { icon: <MapPin className="h-4 w-4"/>, label: t('km_walked'), value: `${stats.totalKm || 0} km`, sub: t('all_participants'), id: 'stat-km' },
              { icon: <Users className="h-4 w-4"/>, label: t('participants'), value: (stats.totalParticipants || 0).toLocaleString(), sub: t('worldwide'), id: 'stat-participants' },
              { icon: <Heart className="h-4 w-4"/>, label: t('total_donations'), value: donationsValue, sub: t('total_raised'), id: 'stat-donations' },
            ].map((s) => (
              <Card key={s.id} className="rounded-2xl border-purple-100 card-elevated bg-white" data-testid={s.id}><CardContent className="p-5">
                <div className="flex items-center gap-2 text-brand-purple mb-2"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shrink-0">{s.icon}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div></div>
                <div className="font-display text-2xl font-bold text-brand-purple-dark">{s.value}</div><div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
              </CardContent></Card>
            ))}
            <button onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })} className="text-start rounded-2xl brand-gradient text-white p-5">
              <div className="flex items-center gap-2 mb-2 text-white/90"><Trophy className="h-4 w-4"/><span className="text-xs font-semibold uppercase tracking-wider">{t('top10')}</span></div>
              <div className="font-display text-lg font-bold">{t('see_leaderboard')}</div><div className="text-xs text-white/80 mt-0.5">{t('top_participants')}</div>
            </button>
          </section>

          <section id="leaderboard" className="mt-10 grid lg:grid-cols-2 gap-5">
            <LeaderboardList me={me} compact/>
            <Card className="rounded-3xl brand-gradient text-white"><CardContent className="p-6 relative h-full flex flex-col">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/90 flex items-center gap-1"><Sparkles className="h-4 w-4"/>{t('todays_quest')}</div>
              <h3 className="font-display text-3xl font-bold mt-3">{t('n_daily')}</h3>
              <p className="text-sm text-white/85 mt-1">{t('quest_text')}</p>
              <div className="mt-4 rounded-2xl bg-white/10 border border-white/20 p-3 flex items-start gap-2 text-sm">
                <Camera className="h-4 w-4 mt-0.5 shrink-0"/><div><div className="font-semibold">{t('proof_required_title')}</div><div className="text-xs text-white/80 mt-0.5">{t('proof_required_text')}</div></div>
              </div>
              <div className="mt-auto pt-5 flex items-center gap-2 text-xs text-white/85"><Clock className="h-3.5 w-3.5"/>{t('resets')}</div>
            </CardContent></Card>
          </section>

          <MeetNoor id="noor" />

          <section id="donate" className="mt-10"><DonateCard stats={stats} /></section>

          <section id="how" className="mt-12">
            <div className="text-center mb-6"><h2 className="font-display text-3xl md:text-4xl font-bold text-brand-purple-dark">{t('how_title')}</h2><p className="text-muted-foreground">{t('how_sub')}</p></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{[
              { n: 1, icon: <User className="h-5 w-5"/>, title: t('how1'), text: t('how1t', { n: WELCOME_POINTS }) },
              { n: 2, icon: <ListChecks className="h-5 w-5"/>, title: t('how2'), text: t('how2t') },
              { n: 3, icon: <Instagram className="h-5 w-5"/>, title: t('how3'), text: t('how3t') },
              { n: 4, icon: <Star className="h-5 w-5"/>, title: t('how4'), text: t('how4t') },
              { n: 5, icon: <Heart className="h-5 w-5"/>, title: t('how5'), text: t('how5t') },
            ].map(s => (
              <Card key={s.n} className="rounded-2xl border-purple-100 card-elevated bg-white"><CardContent className="p-5">
                <div className="h-11 w-11 rounded-2xl brand-gradient text-white flex items-center justify-center">{s.icon}</div>
                <div className="mt-3 text-xs font-semibold text-brand-blue">{t('step', { n: s.n })}</div>
                <div className="font-display text-lg font-bold text-brand-purple-dark mt-0.5">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.text}</div>
              </CardContent></Card>
            ))}</div>
          </section>
          <footer className="mt-16 py-8 text-center text-sm text-muted-foreground">{t('footer')} · <a href="?admin=1" className="underline hover:text-brand-purple">{t('admin')}</a></footer>
        </main>
        <Onboarding key={authMode} initialMode={authMode} open={onboard} onClose={() => setOnboard(false)} onDone={(u) => { setMe(u); setOnboard(false); setTab('dashboard'); loadStats() }}/>
      </div>
    )
  }

  // ================= USER DASHBOARD =================
  const rank = myRank || '—'
  const items = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'daily', label: t('daily_challenges'), icon: ListChecks },
    { id: 'submissions', label: t('my_submissions'), icon: Upload },
    { id: 'leaderboard', label: t('leaderboard'), icon: Trophy },
    { id: 'donations', label: t('donations'), icon: Heart },
    { id: 'certificate', label: t('certificate'), icon: Award },
    { id: 'profile', label: t('profile'), icon: User },
  ]
  const filteredDaily = (daily || []).filter(c => c.active !== false || c.custom)
  const doneCount = filteredDaily.filter(c => c.completed).length
  const dateLabel = new Date().toLocaleDateString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  const statusClass = (s) => s === 'approved' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : s === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
  const logout = async () => { const sb = createClient(); await sb.auth.signOut(); localStorage.clear(); window.location.replace('/') }

  const ChallengesBlock = ({ title, sub, badge }) => (
    <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div><h3 className="font-display text-xl md:text-2xl font-bold text-brand-purple-dark">{title}</h3><p className="text-xs text-muted-foreground">{sub}</p></div>
        <Badge className="bg-purple-100 text-brand-purple border-purple-200 hover:bg-purple-100">{badge}</Badge>
      </div>
      <div className="mb-4 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-fuchsia-50 p-3 flex items-start gap-2" data-testid="proof-required-banner">
        <Instagram className="h-4 w-4 mt-0.5 text-rose-600 shrink-0"/>
        <div><div className="text-sm font-semibold text-rose-800">{t('proof_required_title')}</div><div className="text-xs text-rose-900/75 mt-0.5">{t('proof_required_text')}</div></div>
      </div>
      <div className="space-y-2.5" data-testid="daily-list">{filteredDaily.map(c => <ChallengeRow key={c.id} c={c} onUpload={startProof} busy={busy}/>)}</div>
    </CardContent></Card>
  )

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50/40 via-white to-blue-50/40">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}/>}
      <aside className={`fixed lg:sticky top-0 start-0 z-50 h-screen w-72 flex-col bg-gradient-to-b from-brand-purple-dark via-brand-purple to-[#4c1d95] text-white ${sidebarOpen ? 'flex' : 'hidden lg:flex'}`}>
        <div className="p-5 flex items-center justify-between">
          <Wordmark small invert/>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/80 hover:text-white"><X className="h-5 w-5"/></button>
        </div>
        <div className="px-5 pb-2"><LangToggle invert /></div>
        <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
          {items.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); setSidebarOpen(false) }} data-testid={`tab-${id}`}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm ${tab === id ? 'bg-white text-brand-purple-dark font-semibold shadow-lg' : 'text-white/85 hover:bg-white/10'}`}>
              <Icon className="h-4 w-4"/>{label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/85 hover:bg-white/10"><LogOut className="h-4 w-4"/>{t('logout')}</button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-purple-100/60 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl border border-purple-100"><Menu className="h-5 w-5 text-brand-purple-dark"/></button>
            <div><div className="font-display text-lg font-bold text-brand-purple-dark">{t('welcome_back')}</div><div className="text-xs text-muted-foreground flex items-center gap-1">{me.name} <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500"/></div></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-xs" data-testid="header-points">
              <div className="h-6 w-6 rounded-full brand-gradient flex items-center justify-center text-white text-[10px] font-bold">{me.avatar || '🌸'}</div>
              <div><div className="font-semibold text-brand-purple-dark">{me.name}</div><div className="text-[10px] text-muted-foreground">{me.points || 0} {t('pts')}</div></div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl text-muted-foreground hover:text-brand-purple-dark text-xs hidden sm:inline-flex"><LogOut className="h-4 w-4 me-1"/>{t('logout')}</Button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6">
          {announcements.filter(a => a.pinned).slice(0, 1).map(a => (
            <div key={a.id} className="rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 p-4 flex items-start gap-3">
              <Megaphone className="h-5 w-5 mt-0.5 text-brand-purple"/><div><div className="font-semibold text-brand-purple-dark">{a.title}</div><div className="text-sm text-brand-purple-dark/80">{a.body}</div></div>
            </div>
          ))}

          <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="rounded-2xl border-purple-100 card-elevated bg-gradient-to-br from-purple-600 to-blue-500 text-white" data-testid="me-points"><CardContent className="p-4">
              <div className="text-xs uppercase tracking-wider text-white/80 font-semibold">{t('total_points')}</div><div className="font-display text-3xl font-bold mt-1">{me.points || 0}</div></CardContent></Card>
            <Card className="rounded-2xl border-purple-100 card-elevated bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t('your_rank')}</div>
              <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark">#{rank}</div><div className="text-[10px] text-muted-foreground">{t('out_of', { n: stats.totalParticipants })}</div></CardContent></Card>
            <Card className="rounded-2xl border-purple-100 card-elevated bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t('challenges')}</div>
              <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark">{me.completed || 0}</div><div className="text-[10px] text-muted-foreground">{t('completed')}</div></CardContent></Card>
            <Card className="rounded-2xl border-purple-100 card-elevated bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t('distance')}</div>
              <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark">{Number(me.km || 0).toFixed(1)}<span className="text-lg text-muted-foreground"> km</span></div><div className="text-[10px] text-muted-foreground">{t('walked')}</div></CardContent></Card>
            <Card className="rounded-2xl border-orange-100 card-elevated bg-white" data-testid="me-streak"><CardContent className="p-4"><div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t('streak')}</div>
              <div className="font-display text-3xl font-bold mt-1 text-brand-purple-dark flex items-center gap-1">{me.streak || 0}<Flame className="h-5 w-5 text-orange-500"/></div><div className="text-[10px] text-muted-foreground">{t('current_days')}</div></CardContent></Card>
          </section>

          {tab === 'dashboard' && (<>
            <div className="grid lg:grid-cols-[1fr_360px] gap-6">
              <RosePath points={me.points || 0}/>
              <StreakCard streak={me.streak || 0}/>
            </div>
            <ChallengesBlock title={t('todays_challenges')} sub={t('bloom_next')} badge={t('n_completed', { a: doneCount, b: filteredDaily.length })}/>
          </>)}

          {tab === 'daily' && <ChallengesBlock title={t('daily_challenges')} sub={t('fresh_daily')} badge={`${dateLabel} · ${t('n_left', { n: filteredDaily.filter(c => !c.completed).length })}`}/>}

          {tab === 'submissions' && (
            <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
              <h3 className="font-display text-2xl font-bold text-brand-purple-dark mb-1">{t('my_submissions')}</h3><p className="text-sm text-muted-foreground mb-5">{t('track_reviews')}</p>
              {mySubs.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">{t('no_subs')}</div>}
              <div className="grid md:grid-cols-3 gap-3">{mySubs.map(s => (
                <div key={s.id} className="rounded-2xl border border-purple-100 p-3" data-testid={`my-sub-${s.id}`}>
                  {s.proofDataUrl && (/\.(mp4|mov|webm)(\?|$)/i.test(s.proofPath || '') ? <video src={s.proofDataUrl} controls className="w-full h-28 object-cover rounded-xl"/> : <img src={s.proofDataUrl} alt="" className="w-full h-28 object-cover rounded-xl"/>)}
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div className="min-w-0"><div className="font-semibold text-sm truncate text-brand-purple-dark">{s.challengeTitle}</div><div className="text-xs text-brand-purple">+{s.points} {t('pts')}</div>{s.instagram && <div className="text-xs text-rose-600" dir="ltr">@{s.instagram}</div>}</div>
                    <Badge className={statusClass(s.status)}>
                      {s.status === 'approved' ? <CheckCircle2 className="h-3 w-3 me-1"/> : s.status === 'rejected' ? <XCircle className="h-3 w-3 me-1"/> : <Clock className="h-3 w-3 me-1"/>}{t(`status_${s.status}`)}
                    </Badge>
                  </div>
                  {s.reason && <div className="text-xs text-red-600 mt-1">{t('reason')}: {s.reason}</div>}
                </div>
              ))}</div>
            </CardContent></Card>
          )}

          {tab === 'leaderboard' && <LeaderboardList me={me}/>}

          {tab === 'donations' && (
            <div className="grid lg:grid-cols-2 gap-5">
              <DonateCard stats={stats}/>
              <InstagramCard/>
            </div>
          )}

          {tab === 'certificate' && <Certificate me={me}/>}

          {tab === 'profile' && (
            <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-3xl">{me.avatar}</div>
                <div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.name}</div><div className="text-sm text-muted-foreground">{t('rank_points', { r: rank, p: me.points || 0 })}</div></div>
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-purple-50 p-4"><div className="text-xs text-brand-purple font-semibold uppercase">{t('points')}</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.points || 0}</div></div>
                <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs text-brand-blue font-semibold uppercase">{t('kilometers')}</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{Number(me.km || 0).toFixed(1)} km</div></div>
                <div className="rounded-2xl bg-orange-50 p-4"><div className="text-xs text-orange-600 font-semibold uppercase">{t('streak')}</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.streak || 0} {t('days')} 🔥</div></div>
                <div className="rounded-2xl bg-blue-50 p-4"><div className="text-xs text-brand-blue font-semibold uppercase">{t('completed')}</div><div className="font-display text-2xl font-bold text-brand-purple-dark">{me.completed || 0}</div></div>
              </div>
              <div className="mt-6"><StreakCard streak={me.streak || 0}/></div>
            </CardContent></Card>
          )}
        </div>
      </main>

      <Onboarding key={authMode} initialMode={authMode} open={onboard} onClose={() => setOnboard(false)} onDone={(user) => { if (user) setMe(user); setOnboard(false); setTab('dashboard') }}/>
      <ProofDialog open={!!proofChallenge} onClose={() => setProofChallenge(null)} challenge={proofChallenge} me={me} onSubmitted={() => { setProofChallenge(null); refetchMe() }}/>
    </div>
  )
}

export default App
