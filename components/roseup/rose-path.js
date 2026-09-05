'use client'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useLang } from '@/lib/i18n'

export function RosePath({ points = 0 }) {
  const { t } = useLang()
  const roses = 8, perRose = 125, goal = roses * perRose
  const safePoints = Number(points) || 0
  const progress = Math.min(safePoints / goal, 1), unlocked = Math.floor(safePoints / perRose)
  const w = 900, h = 220
  const nodes = Array.from({ length: roses }, (_, i) => ({ x: 70 + (i / (roses - 1)) * (w - 140), y: 130 + Math.sin((i / (roses - 1)) * Math.PI * 1.4) * -40 }))
  let d = `M ${nodes[0].x} ${nodes[0].y}`
  for (let i = 1; i < nodes.length; i++) { const p = nodes[i - 1], c = nodes[i]; d += ` Q ${(p.x + c.x) / 2} ${p.y}, ${c.x} ${c.y}` }
  const r = progress * (nodes.length - 1), si = Math.min(Math.floor(r), nodes.length - 2), tt = r - si
  const a = nodes[si], b = nodes[si + 1]
  const wx = a.x + (b.x - a.x) * tt, wy = a.y + (b.y - a.y) * tt - 22

  return (
    <div className="rounded-3xl bg-white border border-purple-100 card-elevated p-6" data-testid="rose-path">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div>
          <h3 className="font-display text-xl md:text-2xl font-bold text-brand-purple-dark">{t('your_progress')}</h3>
          <p className="text-sm text-muted-foreground">{t('roses_bloomed', { u: unlocked, r: roses })}</p>
        </div>
        <Badge className="bg-purple-100 text-brand-purple border-purple-200 hover:bg-purple-100">{safePoints} / {goal} {t('pts')}</Badge>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" dir="ltr">
        <defs>
          <linearGradient id="rpb" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#c4b5fd"/><stop offset="100%" stopColor="#93c5fd"/></linearGradient>
          <linearGradient id="rpa" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6b21a8"/><stop offset="100%" stopColor="#2563eb"/></linearGradient>
        </defs>
        <path d={d} stroke="url(#rpb)" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 10" opacity=".85"/>
        <motion.path d={d} stroke="url(#rpa)" strokeWidth="5" fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: progress }} transition={{ duration: 1.4, ease: 'easeInOut' }}/>
        {nodes.map((n, i) => {
          const u = i < unlocked
          return (
            <g key={i} transform={`translate(${n.x} ${n.y})`}>
              <circle r="14" fill={u ? '#fecdd3' : '#e9d5ff'} opacity={u ? 1 : .5}/>
              <circle r="9" fill={u ? '#f43f5e' : '#c084fc'} opacity={u ? 1 : .4}/>
              <circle r="4" fill={u ? '#be123c' : '#7c3aed'} opacity={u ? 1 : .4}/>
            </g>
          )
        })}
        <g transform={`translate(${nodes[nodes.length - 1].x + 30} ${nodes[nodes.length - 1].y - 25})`}>
          <line x1="0" y1="0" x2="0" y2="30" stroke="#6b21a8" strokeWidth="2"/>
          <path d="M 0 0 L 18 6 L 0 12 Z" fill="#3b82f6"/>
        </g>
        <motion.g animate={{ x: wx, y: wy }} initial={{ x: nodes[0].x, y: nodes[0].y - 22 }} transition={{ type: 'spring', stiffness: 50, damping: 14 }}>
          <circle cx="0" cy="-6" r="6" fill="#6b21a8"/>
          <rect x="-4" y="-1" width="8" height="12" rx="3" fill="#3b82f6"/>
          <line x1="-2" y1="11" x2="-4" y2="20" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round"/>
          <line x1="2" y1="11" x2="4" y2="20" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round"/>
        </motion.g>
      </svg>
    </div>
  )
}
