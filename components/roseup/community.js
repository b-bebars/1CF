'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Heart, Instagram, Flame, ExternalLink } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { INSTAGRAM_URL, INSTAGRAM_HANDLE, DONATE_URL, IMG_NOOR, IMG_IG_QR, IMG_DONATE_QR, STREAK_MILESTONES } from '@/lib/constants/links'

export function MeetNoor({ id = 'noor' }) {
  const { t } = useLang()
  return (
    <section id={id} className="mt-12" data-testid="meet-noor">
      <Card className="rounded-3xl border-purple-100 card-elevated overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 relative min-h-[320px] md:min-h-full">
              <img src={IMG_NOOR} alt="Noor" className="absolute inset-0 w-full h-full object-cover object-top" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
            </div>
            <div className="md:col-span-3 p-6 md:p-10 flex flex-col justify-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue flex items-center gap-1"><Heart className="h-3.5 w-3.5"/>{t('noor_kicker')}</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-purple-dark mt-2">{t('noor_title')}</h2>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-brand-purple font-semibold hover:underline w-fit" dir="ltr">
                <Instagram className="h-4 w-4"/>@{INSTAGRAM_HANDLE}
              </a>
              <p className="mt-4 text-muted-foreground leading-relaxed max-w-lg">{t('noor_text')}</p>
              <div className="mt-6 flex flex-wrap items-center gap-5">
                <Button asChild size="lg" className="rounded-full h-12 px-6 text-white bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 hover:opacity-90">
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" data-testid="follow-ig-btn"><Instagram className="h-4 w-4 me-2"/>{t('follow_ig')}</a>
                </Button>
                <div className="flex items-center gap-3">
                  <img src={IMG_IG_QR} alt="Instagram QR" className="h-20 w-20 rounded-xl border border-purple-100 object-cover bg-white" />
                  <div className="text-xs text-muted-foreground max-w-[120px]">{t('scan_ig')}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export function DonateCard({ stats, compact = false }) {
  const { t } = useLang()
  const raised = Number(stats?.totalDonations || 0)
  return (
    <Card className="rounded-3xl border-purple-100 card-elevated bg-white overflow-hidden" data-testid="donate-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-brand-purple mb-3"><Heart className="h-4 w-4"/><span className="text-xs font-semibold uppercase tracking-wider">{t('donate_kicker')}</span></div>
        <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h3 className="font-display text-3xl font-bold text-brand-purple-dark">{t('donate_here')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('donate_text')}</p>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">{t('raised_so_far')}</div>
              <div className="font-display text-3xl font-bold text-brand-purple-dark" data-testid="donations-raised">€{raised.toLocaleString()}</div>
            </div>
            <Button asChild size="lg" className="mt-5 brand-gradient text-white rounded-full h-12 px-7 font-semibold shadow-xl shadow-purple-500/25">
              <a href={DONATE_URL} target="_blank" rel="noreferrer" data-testid="donate-btn"><Heart className="h-4 w-4 me-2"/>{t('donate_btn')}<ExternalLink className="h-3.5 w-3.5 ms-2 opacity-80"/></a>
            </Button>
          </div>
          <div className="flex flex-col items-center gap-2 mx-auto">
            <a href={DONATE_URL} target="_blank" rel="noreferrer" className="rounded-2xl border-2 border-purple-100 p-2 bg-white hover:border-purple-300 transition">
              <img src={IMG_DONATE_QR} alt="Donate QR" className="h-40 w-40 object-contain" />
            </a>
            <div className="text-xs text-muted-foreground">{t('scan_donate')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function InstagramCard() {
  const { t } = useLang()
  return (
    <Card className="rounded-3xl border-purple-100 card-elevated overflow-hidden bg-white" data-testid="instagram-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-brand-purple mb-3"><Instagram className="h-4 w-4"/><span className="text-xs font-semibold uppercase tracking-wider">{t('instagram')}</span></div>
        <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-center">
          <img src={IMG_NOOR} alt="Noor" className="h-28 w-28 rounded-2xl object-cover object-top border border-purple-100 mx-auto" />
          <div>
            <h3 className="font-display text-2xl font-bold text-brand-purple-dark">{t('noor_title')}</h3>
            <div className="text-brand-purple font-semibold" dir="ltr">@{INSTAGRAM_HANDLE}</div>
            <p className="mt-2 text-sm text-muted-foreground">{t('tag_us')}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button asChild className="rounded-full text-white bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 hover:opacity-90">
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4 me-2"/>{t('follow_ig')}</a>
              </Button>
              <img src={IMG_IG_QR} alt="Instagram QR" className="h-16 w-16 rounded-xl border border-purple-100 object-cover" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StreakCard({ streak = 0 }) {
  const { t } = useLang()
  const s = Number(streak) || 0
  const next = STREAK_MILESTONES.find(m => m.days > s)
  const prevDays = [...STREAK_MILESTONES].reverse().find(m => m.days <= s)?.days || 0
  const pct = next ? Math.round(((s - prevDays) / (next.days - prevDays)) * 100) : 100
  return (
    <Card className="rounded-3xl border-orange-100 card-elevated bg-gradient-to-br from-orange-50 via-white to-amber-50" data-testid="streak-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display text-xl font-bold text-brand-purple-dark flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500"/>{t('streak_title')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">{t('streak_sub')}</p>
          </div>
          <div className="text-end">
            <div className="font-display text-4xl font-bold text-orange-600 leading-none" data-testid="streak-value">{s}<span className="text-lg">🔥</span></div>
            <div className="text-xs text-muted-foreground">{t('streak_days', { n: s })}</div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={pct} className="h-2.5 bg-orange-100 [&>div]:bg-gradient-to-r [&>div]:from-orange-400 [&>div]:to-rose-500"/>
          <div className="text-xs text-muted-foreground mt-1.5">{next ? t('streak_next', { n: next.days - s, b: next.bonus }) : t('streak_max')}</div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {STREAK_MILESTONES.map(m => {
            const hit = s >= m.days
            return (
              <div key={m.days} className={`rounded-xl border p-2 text-center ${hit ? 'border-orange-300 bg-orange-100/70' : 'border-purple-100 bg-white/70'}`}>
                <div className={`text-sm font-bold ${hit ? 'text-orange-700' : 'text-brand-purple-dark'}`}>{t('milestone_days', { n: m.days })}</div>
                <div className={`text-[11px] ${hit ? 'text-orange-700' : 'text-muted-foreground'}`}>+{m.bonus} {t('bonus')}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
