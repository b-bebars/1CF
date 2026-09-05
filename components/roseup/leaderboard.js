'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trophy, Search, Flame } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { api } from './api'

export function LeaderboardList({ me, compact = false }) {
  const { t } = useLang()
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      const d = await api(`leaderboard?q=${encodeURIComponent(q)}`)
      if (!cancelled) { setRows(Array.isArray(d?.leaderboard) ? d.leaderboard : []); setLoading(false) }
    }
    const timer = setTimeout(run, 200)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [q, me?.points])

  const list = compact ? rows.slice(0, 10) : rows

  return (
    <Card className="rounded-3xl border-purple-100 card-elevated bg-white" data-testid="leaderboard">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl brand-gradient flex items-center justify-center text-white"><Trophy className="h-4 w-4"/></div>
            <div><h3 className="font-display text-xl font-bold text-brand-purple-dark">{t('leaderboard')}</h3><div className="text-xs text-muted-foreground">{t('global_n', { n: rows.length })}</div></div>
          </div>
          {!compact && (
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} className="ps-9 rounded-xl border-purple-200"/>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          {loading && <div className="text-center text-sm text-muted-foreground py-8">{t('loading')}</div>}
          {!loading && rows.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">{t('none_found')}</div>}
          <AnimatePresence>
            {list.map((r) => {
              const isMe = me && r.id === me.id
              return (
                <motion.div key={r.id || r.rank} layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${isMe ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200' : 'hover:bg-purple-50/50'}`}>
                  <div className={`w-7 text-center font-display font-bold text-sm ${r.rank <= 3 ? 'text-brand-purple' : 'text-muted-foreground'}`}>{r.rank}</div>
                  <div className="text-xl h-9 w-9 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">{r.avatar || '🌹'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-brand-purple-dark">{r.name}{isMe && <span className="text-xs text-brand-blue ms-1.5 font-normal">{t('you')}</span>}</div>
                    {r.streak > 0 && <div className="text-[10px] text-orange-600 flex items-center gap-0.5"><Flame className="h-3 w-3"/>{r.streak}</div>}
                  </div>
                  <div className="font-display font-bold text-sm text-brand-purple">{r.points || 0} {t('pts')}</div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
