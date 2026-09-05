'use client'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Upload, Sparkles } from 'lucide-react'
import { useLang, challengeText } from '@/lib/i18n'

export function ChallengeRow({ c, onUpload, busy }) {
  const { t, lang } = useLang()
  const txt = challengeText(c, lang)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid={`challenge-${c.id}`}
      className={`flex items-center gap-4 rounded-2xl border p-4 ${
        c.completed ? 'border-emerald-200 bg-emerald-50/40' : c.pending ? 'border-amber-200 bg-amber-50/40' : 'border-purple-100 bg-white hover:border-purple-200'
      }`}
    >
      <div className="text-2xl h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shrink-0">
        {c.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="font-semibold text-brand-purple-dark truncate">{txt.title}</div>
          {c.custom && <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 text-[10px] px-1.5 py-0 shrink-0"><Sparkles className="h-3 w-3 me-0.5"/>{t('custom_badge')}</Badge>}
        </div>
        <div className="text-xs text-muted-foreground truncate">{txt.description}</div>
      </div>
      <div className="text-end shrink-0">
        <div className="text-sm font-bold text-brand-purple">+{c.points} {t('pts')}</div>
        {c.completed ? (
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="h-4 w-4" />{t('done')}
          </div>
        ) : c.pending ? (
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700 font-semibold">
            <Clock className="h-4 w-4" />{t('pending_review')}
          </div>
        ) : (
          <Button size="sm" disabled={busy} onClick={() => onUpload(c)} data-testid={`submit-proof-${c.id}`} className="mt-1 h-7 brand-gradient text-white rounded-lg px-3">
            <Upload className="h-3 w-3 me-1" />{t('submit_proof')}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
