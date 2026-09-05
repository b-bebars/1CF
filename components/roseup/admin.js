'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Sparkles, Trophy, Users, Heart, MapPin, Loader2, LayoutDashboard, ListChecks, LogOut, X, CheckCircle2, Plus, Trash2,
  Edit3, Eye, Megaphone, Shield, BarChart3, FileSpreadsheet, Clock, XCircle, Instagram, RefreshCw
} from 'lucide-react'
import { useLang, challengeText } from '@/lib/i18n'
import { api, jsonPost } from './api'
import { Wordmark, LangToggle } from './brand'
import { LeaderboardList } from './leaderboard'

export function AdminDashboard({ onExit }) {
  const { t, lang } = useLang()
  const [tab, setTab] = useState('overview')
  const [analytics, setAnalytics] = useState(null)
  const [participants, setParticipants] = useState([])
  const [challenges, setChallenges] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [config, setConfig] = useState({ totalDonations: 0, fundGoal: 250000, donors: 0 })
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null)
  const [proofView, setProofView] = useState(null)
  const [bonusUser, setBonusUser] = useState(null)

  const load = async () => {
    try {
      const sb = createClient()
      const { data: completionsData } = await sb.from('challenge_completions').select('challenge_id')
      const completionCounts = (completionsData || []).reduce((acc, curr) => { acc[curr.challenge_id] = (acc[curr.challenge_id] || 0) + 1; return acc }, {})

      const [aData, pData, cData, sData, anData, stData] = await Promise.allSettled([
        api('admin/analytics'), api('admin/participants'), api('challenges'), api('submissions'), api('announcements'), api('stats'),
      ])
      if (aData.status === 'fulfilled' && aData.value && !aData.value.error) setAnalytics(aData.value)
      else setAnalytics({ totalParticipants: 0, totalPoints: 0, totalKm: 0, submissions: { pending: 0 }, activity: [] })
      if (pData.status === 'fulfilled' && pData.value?.participants) setParticipants(pData.value.participants)
      if (cData.status === 'fulfilled' && cData.value?.challenges) setChallenges(cData.value.challenges.map(c => ({ ...c, participantsCount: completionCounts[c.id] || 0 })))
      if (sData.status === 'fulfilled' && sData.value?.submissions) setSubmissions(sData.value.submissions)
      if (anData.status === 'fulfilled' && anData.value?.announcements) setAnnouncements(anData.value.announcements)
      if (stData.status === 'fulfilled' && stData.value && !stData.value.error) setConfig({ totalDonations: stData.value.totalDonations || 0, fundGoal: stData.value.fundGoal || 250000, donors: stData.value.donors || 0 })
    } catch (err) { console.error('Admin data load safely handled:', err) }
  }
  useEffect(() => { load() }, [])

  const saveChallenge = async (c) => {
    setBusy(true)
    try {
      const { _new, participantsCount, custom, ...payload } = c
      const r = _new ? await jsonPost('challenges', payload) : await jsonPost(`challenges/${c.id}`, payload, 'PUT')
      if (r?.error) throw new Error('failed')
      toast.success(t('saved')); setEditing(null); load()
    } catch { toast.error(t('failed')) } finally { setBusy(false) }
  }
  const deleteChallenge = async (id) => {
    if (!confirm(t('delete_confirm'))) return
    await api(`challenges/${id}`, { method: 'DELETE' })
    toast.success(t('deleted')); load()
  }
  const approve = async (id) => { await api(`submissions/${id}/approve`, { method: 'POST' }); toast.success(t('approved_toast')); load() }
  const reject = async (id) => {
    const r = prompt(t('reject_reason')) || ''
    await jsonPost(`submissions/${id}/reject`, { reason: r }); toast(t('rejected_toast')); load()
  }
  const awardBonus = async () => {
    if (!bonusUser) return
    await jsonPost('admin/bonus', { userId: bonusUser.id, points: bonusUser.pts, reason: bonusUser.reason })
    toast.success(t('bonus_toast', { p: bonusUser.pts, n: bonusUser.name })); setBonusUser(null); load()
  }
  const removeParticipant = async (id) => {
    if (!confirm(t('remove_participant'))) return
    await api(`participants/${id}`, { method: 'DELETE' }); toast.success(t('removed')); load()
  }
  const addAnnouncement = async (title, body, pinned) => { await jsonPost('announcements', { title, body, pinned }); toast.success(t('announcement_posted')); load() }
  const delAnnouncement = async (id) => { await api(`announcements/${id}`, { method: 'DELETE' }); load() }
  const saveConfig = async () => {
    setBusy(true)
    const r = await jsonPost('admin/config', { totalDonations: Number(config.totalDonations) || 0, fundGoal: Number(config.fundGoal) || 0, donors: Number(config.donors) || 0 })
    setBusy(false)
    if (r?.error) toast.error(t('failed')); else { toast.success(t('donations_saved')); load() }
  }
  const rotateNow = async () => {
    setBusy(true)
    const r = await api('admin/rotate-daily', { method: 'POST' })
    setBusy(false)
    if (r?.error) toast.error(t('failed')); else { toast.success(t('rotated')); load() }
  }

  const items = [
    { id: 'overview', label: t('a_overview'), icon: LayoutDashboard },
    { id: 'participants', label: t('a_participants'), icon: Users },
    { id: 'challenges', label: t('a_challenges'), icon: ListChecks },
    { id: 'submissions', label: t('a_submissions'), icon: Eye },
    { id: 'bonus', label: t('a_bonus'), icon: Sparkles },
    { id: 'leaderboard', label: t('a_leaderboard'), icon: Trophy },
    { id: 'donations', label: t('a_donations'), icon: Heart },
    { id: 'analytics', label: t('a_analytics'), icon: BarChart3 },
    { id: 'announcements', label: t('a_announcements'), icon: Megaphone },
    { id: 'settings', label: t('a_settings'), icon: Shield },
  ]

  const customChallenges = challenges.filter(c => c.custom)
  const poolChallenges = challenges.filter(c => !c.custom)
  const statusLabel = (s) => t(`status_${s}`) || s
  const statusClass = (s) => s === 'approved' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : s === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
  const StatusIcon = ({ s }) => s === 'approved' ? <CheckCircle2 className="h-3 w-3 me-1"/> : s === 'rejected' ? <XCircle className="h-3 w-3 me-1"/> : <Clock className="h-3 w-3 me-1"/>

  const ChallengeCard = ({ c }) => {
    const txt = challengeText(c, lang)
    return (
      <div className={`rounded-2xl border p-4 flex items-start gap-3 bg-white ${c.custom ? 'border-amber-200' : 'border-purple-100'}`} data-testid={`admin-challenge-${c.id}`}>
        <div className="text-2xl h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shrink-0">{c.icon || '⭐'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-brand-purple-dark">{txt.title}</span>
            {c.custom && <Badge className="text-[10px] bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">{t('custom_badge')}</Badge>}
            {!c.custom && (c.active ? <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">{t('today')}</Badge> : <Badge variant="outline" className="text-[10px] bg-gray-50">{t('inactive')}</Badge>)}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">{txt.description}</div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-brand-purple font-semibold">+{c.points || 0} {t('pts')}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground font-medium">👥 {t('n_participants', { n: c.participantsCount || 0 })}</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => setEditing({ ...c })} className="p-1.5 rounded-lg hover:bg-purple-50 text-brand-purple" data-testid={`edit-challenge-${c.id}`}><Edit3 className="h-4 w-4"/></button>
          <button onClick={() => deleteChallenge(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" data-testid={`delete-challenge-${c.id}`}><Trash2 className="h-4 w-4"/></button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50/40 via-white to-blue-50/40" data-testid="admin-dashboard">
      <aside className="hidden lg:flex sticky top-0 h-screen w-72 flex-col bg-gradient-to-b from-brand-purple-dark via-brand-purple to-[#4c1d95] text-white">
        <div className="p-5 flex items-center justify-between"><Wordmark small invert/></div>
        <div className="px-5 pb-2 flex items-center gap-2">
          <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400"><Shield className="h-3 w-3 me-1"/>{t('a_badge')}</Badge>
          <LangToggle invert />
        </div>
        <nav className="px-3 py-2 space-y-1 flex-1 overflow-y-auto">
          {items.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} data-testid={`admin-tab-${id}`}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm ${tab === id ? 'bg-white text-brand-purple-dark font-semibold shadow-lg' : 'text-white/85 hover:bg-white/10'}`}>
              <Icon className="h-4 w-4"/>{label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <button onClick={onExit} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/85 hover:bg-white/10"><X className="h-4 w-4"/>{t('exit_admin')}</button>
          <button onClick={async () => { const sb = createClient(); await sb.auth.signOut(); localStorage.clear(); window.location.replace('/') }} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/85 hover:bg-white/10"><LogOut className="h-4 w-4"/>{t('logout')}</button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-display text-2xl md:text-3xl font-bold text-brand-purple-dark">{t('a_title')}</div>
            <div className="text-sm text-muted-foreground">{t('a_sub')}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="lg:hidden"><LangToggle /></div>
            <div className="lg:hidden">
              <select value={tab} onChange={(e) => setTab(e.target.value)} className="rounded-xl border border-purple-200 px-3 py-2 text-sm h-9">
                {items.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
              </select>
            </div>
            <Button variant="outline" onClick={onExit} className="lg:hidden rounded-xl h-9"><X className="h-4 w-4"/></Button>
          </div>
        </div>

        {tab === 'overview' && analytics && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: t('a_participants'), value: analytics.totalParticipants, icon: <Users className="h-4 w-4"/> },
                { label: t('total_points'), value: analytics.totalPoints?.toLocaleString() || '0', icon: <Sparkles className="h-4 w-4"/> },
                { label: t('a_total_km'), value: `${analytics.totalKm || 0}`, icon: <MapPin className="h-4 w-4"/> },
                { label: t('a_pending'), value: analytics.submissions?.pending || 0, icon: <Clock className="h-4 w-4"/> },
              ].map((s, i) => (
                <Card key={i} className="rounded-2xl border-purple-100 card-elevated"><CardContent className="p-4">
                  <div className="flex items-center gap-2 text-brand-purple text-xs uppercase font-semibold">{s.icon}{s.label}</div>
                  <div className="font-display text-2xl font-bold mt-1 text-brand-purple-dark">{s.value}</div>
                </CardContent></Card>
              ))}
            </div>
            <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
              <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">{t('a_subs_week')}</div>
              <div className="flex items-end gap-2 h-40">
                {(analytics.activity || []).map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full brand-gradient rounded-t-lg" style={{ height: `${Math.max(4, (d.submissions || 0) * 24)}px` }}/>
                    <div className="text-[10px] text-muted-foreground">{d.day}</div>
                    <div className="text-xs font-semibold text-brand-purple">{d.submissions || 0}</div>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </>
        )}

        {tab === 'participants' && (
          <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="font-display text-lg font-bold text-brand-purple-dark">{t('a_participants')} ({participants.length})</div>
              <Button asChild variant="outline" className="rounded-xl border-purple-200"><a href="/api/admin/export.csv"><FileSpreadsheet className="h-4 w-4 me-1"/>{t('export_csv')}</a></Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-start text-muted-foreground border-b"><th className="py-2 text-start">{t('rank')}</th><th className="text-start">{t('name')}</th><th className="text-start">{t('points')}</th><th className="text-start">{t('km')}</th><th className="text-start">{t('streak')}</th><th className="text-start">{t('completed')}</th><th></th></tr></thead>
                <tbody>
                  {participants.map((p, i) => (
                    <tr key={p.id || i} className="border-b hover:bg-purple-50/40">
                      <td className="py-2 font-semibold text-brand-purple">#{i + 1}</td>
                      <td className="py-2"><div className="flex items-center gap-2"><span className="text-lg">{p.avatar || '🌹'}</span><span className="font-semibold text-brand-purple-dark">{p.name || 'User'}</span></div></td>
                      <td>{p.points || 0}</td><td>{Number(p.km || 0).toFixed(1)}</td><td>{p.streak || 0}</td><td>{p.completed || 0}</td>
                      <td className="text-end"><button onClick={() => removeParticipant(p.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-4 w-4"/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        )}

        {tab === 'challenges' && (
          <div className="space-y-4">
            <Card className="rounded-3xl border-amber-200 card-elevated bg-gradient-to-br from-amber-50/60 to-white"><CardContent className="p-6">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <div className="font-display text-lg font-bold text-brand-purple-dark flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500"/>{t('custom_section')} ({customChallenges.length})</div>
                <Button onClick={() => setEditing({ _new: true, type: 'daily', title: '', description: '', icon: '⭐', points: 50, active: true, category: 'custom' })} data-testid="new-challenge-btn" className="brand-gradient text-white rounded-xl">
                  <Plus className="h-4 w-4 me-1"/>{t('new_challenge')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{t('custom_hint')}</p>
              {customChallenges.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center rounded-2xl border border-dashed border-amber-200">{t('no_custom')}</div>}
              <div className="grid md:grid-cols-2 gap-3">{customChallenges.map(c => <ChallengeCard key={c.id} c={c}/>)}</div>
            </CardContent></Card>

            <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
              <div className="font-display text-lg font-bold text-brand-purple-dark mb-1">{t('pool_section')} ({poolChallenges.length})</div>
              <p className="text-xs text-muted-foreground mb-4">{t('pool_hint')}</p>
              <div className="grid md:grid-cols-2 gap-3">{poolChallenges.map(c => <ChallengeCard key={c.id} c={c}/>)}</div>
            </CardContent></Card>
          </div>
        )}

        {tab === 'submissions' && (
          <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
            <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">{t('a_submissions')} ({submissions.length})</div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {submissions.length === 0 && <div className="text-sm text-muted-foreground col-span-full py-4 text-center">{t('no_submissions')}</div>}
              {submissions.map(s => (
                <div key={s.id} className="rounded-2xl border border-purple-100 p-3 bg-white" data-testid={`submission-${s.id}`}>
                  {s.proofDataUrl && (/\.(mp4|mov|webm|quicktime)(\?|$)/i.test(s.proofPath || '') || s.proofDataUrl.startsWith('data:video')
                    ? <video src={s.proofDataUrl} controls className="w-full h-36 object-cover rounded-xl" />
                    : <img src={s.proofDataUrl} alt="proof" className="w-full h-36 object-cover rounded-xl cursor-pointer" onClick={() => setProofView(s)}/>)}
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">{s.userAvatar || '🌹'} {s.userName || 'Anonymous'}</div>
                      <div className="font-semibold text-sm truncate text-brand-purple-dark">{s.challengeTitle}</div>
                      <div className="text-xs text-brand-purple">+{s.points || 0} {t('pts')}</div>
                      {s.instagram && <a href={`https://www.instagram.com/${s.instagram}`} target="_blank" rel="noreferrer" className="text-xs text-rose-600 font-semibold inline-flex items-center gap-1 mt-0.5" dir="ltr"><Instagram className="h-3 w-3"/>@{s.instagram}</a>}
                    </div>
                    <Badge className={statusClass(s.status)}><StatusIcon s={s.status}/>{statusLabel(s.status)}</Badge>
                  </div>
                  {s.note && <div className="text-xs text-muted-foreground italic mt-1">"{s.note}"</div>}
                  {s.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => approve(s.id)} data-testid={`approve-${s.id}`} className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs">{t('approve')}</Button>
                      <Button size="sm" onClick={() => reject(s.id)} variant="outline" className="flex-1 h-8 rounded-lg text-xs border-red-200 text-red-600 hover:bg-red-50">{t('reject')}</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent></Card>
        )}

        {tab === 'bonus' && (
          <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
            <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">{t('award_bonus_title')}</div>
            <div className="grid md:grid-cols-2 gap-2">
              {participants.slice(0, 50).map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-purple-100 p-2 bg-white">
                  <span className="text-lg">{p.avatar || '🌹'}</span>
                  <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate text-brand-purple-dark">{p.name || 'User'}</div><div className="text-xs text-muted-foreground">{p.points || 0} {t('pts')}</div></div>
                  <Button size="sm" onClick={() => setBonusUser({ id: p.id, name: p.name, pts: 25, reason: t('bonus_event') })} className="brand-gradient text-white rounded-lg h-8"><Sparkles className="h-3 w-3 me-1"/>{t('award')}</Button>
                </div>
              ))}
            </div>
          </CardContent></Card>
        )}

        {tab === 'leaderboard' && <LeaderboardList me={null}/>}

        {tab === 'donations' && (
          <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
            <div className="font-display text-lg font-bold text-brand-purple-dark mb-1">{t('donation_stats')}</div>
            <p className="text-xs text-muted-foreground mb-4">{t('donation_hint')}</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 p-5">
                <div className="text-xs uppercase text-brand-purple font-semibold">{t('raised')} (€)</div>
                <Input type="number" min="0" value={config.totalDonations} onChange={(e) => setConfig({ ...config, totalDonations: e.target.value })} data-testid="cfg-donations" className="mt-2 rounded-xl border-purple-200 bg-white font-display text-2xl font-bold h-12"/>
              </div>
              <div className="rounded-2xl bg-blue-50 p-5">
                <div className="text-xs uppercase text-brand-blue font-semibold">{t('donors')}</div>
                <Input type="number" min="0" value={config.donors} onChange={(e) => setConfig({ ...config, donors: e.target.value })} data-testid="cfg-donors" className="mt-2 rounded-xl border-purple-200 bg-white font-display text-2xl font-bold h-12"/>
              </div>
            </div>
            <Button onClick={saveConfig} disabled={busy} data-testid="cfg-save" className="mt-4 brand-gradient text-white rounded-xl">{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : t('update_donations')}</Button>
          </CardContent></Card>
        )}

        {tab === 'analytics' && analytics && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
              <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">{t('subs_breakdown')}</div>
              {['pending', 'approved', 'rejected'].map(k => {
                const totalSubs = analytics.submissions?.total || 1
                const v = analytics.submissions?.[k] || 0
                const pct = Math.round((v / totalSubs) * 100)
                const color = k === 'approved' ? 'bg-emerald-500' : k === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                return (
                  <div key={k} className="mb-3">
                    <div className="flex justify-between text-sm mb-1"><span className="capitalize">{statusLabel(k)}</span><span className="font-semibold">{v} · {pct}%</span></div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${pct}%` }}/></div>
                  </div>
                )
              })}
            </CardContent></Card>
            <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
              <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">{t('campaign_health')}</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>{t('total_challenges_cfg')}</span><b>{analytics.totalChallenges || 0}</b></div>
                <div className="flex justify-between"><span>{t('active_participants')}</span><b>{analytics.totalParticipants || 0}</b></div>
                <div className="flex justify-between"><span>{t('total_km_walked')}</span><b>{analytics.totalKm || 0}</b></div>
                <div className="flex justify-between"><span>{t('points_issued')}</span><b>{(analytics.totalPoints || 0).toLocaleString()}</b></div>
              </div>
            </CardContent></Card>
          </div>
        )}

        {tab === 'announcements' && <AnnouncementsAdmin items={announcements} onAdd={addAnnouncement} onDelete={delAnnouncement}/>}

        {tab === 'settings' && (
          <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
            <div className="font-display text-lg font-bold text-brand-purple-dark mb-2">{t('settings')}</div>
            <p className="text-sm text-muted-foreground">{t('settings_text')}</p>
            <Button onClick={rotateNow} disabled={busy} variant="outline" className="mt-4 rounded-xl border-purple-200"><RefreshCw className={`h-4 w-4 me-1 ${busy ? 'animate-spin' : ''}`}/>{t('rotate_now')}</Button>
          </CardContent></Card>
        )}
      </main>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl" data-testid="challenge-dialog">
          <DialogHeader><DialogTitle className="font-display text-xl">{editing?._new ? t('new_challenge') : t('edit_challenge')}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block">{t('type')}</label>
                  <select value="daily" disabled className="w-full h-10 rounded-xl border border-purple-200 px-3 text-sm bg-gray-50"><option value="daily">{t('daily')}</option></select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">{t('icon')}</label>
                  <Input value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="rounded-xl border-purple-200"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">{t('title')}</label>
                <Input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} data-testid="challenge-title-input" className="rounded-xl border-purple-200"/>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">{t('description')}</label>
                <Textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="rounded-xl border-purple-200"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block">{t('points')}</label>
                  <Input type="number" value={editing.points || 0} onChange={(e) => setEditing({ ...editing, points: Number(e.target.value) })} className="rounded-xl border-purple-200"/>
                </div>
                {!editing.custom && !editing._new && (
                  <div className="flex items-center gap-2 pt-6">
                    <Switch checked={!!editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })}/>
                    <span className="text-sm">{t('active')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditing(null)} className="rounded-xl">{t('cancel')}</Button>
            <Button onClick={() => saveChallenge(editing)} disabled={busy} data-testid="challenge-save-btn" className="brand-gradient text-white rounded-xl">{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!proofView} onOpenChange={(v) => !v && setProofView(null)}>
        <DialogContent className="sm:max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">{proofView?.challengeTitle}</DialogTitle>
            <DialogDescription>{t('submitted_by', { n: proofView?.userName || 'User' })}{proofView?.instagram ? ` · @${proofView.instagram}` : ''}</DialogDescription>
          </DialogHeader>
          {proofView?.proofDataUrl && <img src={proofView.proofDataUrl} alt="Proof full view" className="w-full rounded-2xl max-h-96 object-contain bg-black/5" />}
          {proofView?.note && <div className="text-sm text-muted-foreground italic mt-2">"{proofView.note}"</div>}
        </DialogContent>
      </Dialog>

      <Dialog open={!!bonusUser} onOpenChange={(v) => !v && setBonusUser(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader><DialogTitle className="font-display">{t('award_to', { n: bonusUser?.name || '' })}</DialogTitle></DialogHeader>
          {bonusUser && (
            <div className="space-y-3">
              <div><label className="text-xs font-semibold mb-1 block">{t('points')}</label><Input type="number" value={bonusUser.pts || 0} onChange={(e) => setBonusUser({ ...bonusUser, pts: Number(e.target.value) })} className="rounded-xl border-purple-200"/></div>
              <div><label className="text-xs font-semibold mb-1 block">{t('reason')}</label><Input value={bonusUser.reason || ''} onChange={(e) => setBonusUser({ ...bonusUser, reason: e.target.value })} className="rounded-xl border-purple-200"/></div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBonusUser(null)} className="rounded-xl">{t('cancel')}</Button>
            <Button onClick={awardBonus} className="brand-gradient text-white rounded-xl">{t('award')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AnnouncementsAdmin({ items, onAdd, onDelete }) {
  const { t } = useLang()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
        <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">{t('new_announcement')}</div>
        <div className="space-y-3">
          <Input placeholder={t('title')} value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border-purple-200"/>
          <Textarea placeholder={t('message')} value={body} onChange={(e) => setBody(e.target.value)} className="rounded-xl border-purple-200"/>
          <label className="flex items-center gap-2 text-sm"><Switch checked={pinned} onCheckedChange={setPinned}/>{t('pin_top')}</label>
          <Button onClick={() => { if (title) onAdd(title, body, pinned); setTitle(''); setBody(''); setPinned(false) }} className="brand-gradient text-white rounded-xl"><Megaphone className="h-4 w-4 me-1"/>{t('post')}</Button>
        </div>
      </CardContent></Card>
      <Card className="rounded-3xl border-purple-100 card-elevated"><CardContent className="p-6">
        <div className="font-display text-lg font-bold text-brand-purple-dark mb-3">{t('recent')}</div>
        <div className="space-y-2">
          {(items || []).map(a => (
            <div key={a.id} className="rounded-xl border border-purple-100 p-3 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-brand-purple-dark">{a.title} {a.pinned && <Badge className="ms-1 bg-purple-100 text-brand-purple">{t('pinned')}</Badge>}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.body}</div>
                </div>
                <button onClick={() => onDelete(a.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-4 w-4"/></button>
              </div>
            </div>
          ))}
        </div>
      </CardContent></Card>
    </div>
  )
}
