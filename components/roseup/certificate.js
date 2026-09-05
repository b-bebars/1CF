'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useLang } from '@/lib/i18n'

export function Certificate({ me }) {
  const { t } = useLang()
  const download = () => {
    const svg = document.getElementById('cert-svg')
    if (!svg) return
    const s = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([s], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `roseup-certificate-${me?.name?.replace(/\s+/g, '-') || 'me'}.svg`; a.click()
    URL.revokeObjectURL(url)
  }
  const km = Number(me?.km || 0).toFixed(1)
  return (
    <Card className="rounded-3xl border-purple-100 card-elevated overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div><h3 className="font-display text-xl font-bold text-brand-purple-dark">{t('cert_title')}</h3><p className="text-xs text-muted-foreground">{t('cert_sub')}</p></div>
          <Button onClick={download} className="brand-gradient text-white rounded-xl"><Download className="h-4 w-4 me-1"/>{t('download')}</Button>
        </div>
        <div className="rounded-2xl overflow-hidden border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50" dir="ltr">
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
      </CardContent>
    </Card>
  )
}
