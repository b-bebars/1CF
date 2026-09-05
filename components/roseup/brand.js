'use client'
import { Languages } from 'lucide-react'
import { useLang } from '@/lib/i18n'

export function BrandMark({ size = 44 }) {
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

export function Wordmark({ small = false, invert = false }) {
  const { t } = useLang()
  const c = invert ? 'text-white' : 'text-brand-purple-dark'
  const sub = invert ? 'text-white/60' : 'text-brand-purple/70'
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={small ? 34 : 42} />
      <div className="leading-none">
        <div className={`font-display font-extrabold tracking-tight ${c} ${small ? 'text-lg' : 'text-xl'}`}>ROSE UP</div>
        <div className={`text-[9px] uppercase tracking-[0.12em] ${sub} font-semibold mt-0.5 hidden sm:block`}>{t('tagline')}</div>
      </div>
    </div>
  )
}

export function LangToggle({ invert = false, compact = false, className = '' }) {
  const { t, toggle, lang } = useLang()
  return (
    <button
      type="button"
      onClick={toggle}
      data-testid="lang-toggle"
      aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 h-9 text-xs font-semibold transition shrink-0 ${invert ? 'border-white/30 text-white hover:bg-white/10' : 'border-purple-200 text-brand-purple-dark hover:bg-purple-50'} ${className}`}
    >
      <Languages className="h-3.5 w-3.5" /><span className={compact ? 'hidden sm:inline' : ''}>{t('lang_switch')}</span>
    </button>
  )
}

export function BlueRose({ className = '' }) {
  return (
    <svg viewBox="0 0 360 360" className={className}>
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
    </svg>
  )
}
