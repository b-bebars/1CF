'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, Gift } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { api } from './api'
import { WELCOME_POINTS } from '@/lib/constants/links'

export function Onboarding({ open, onClose, onDone, initialMode = 'signin' }) {
  const { t } = useLang()
  const [mode, setMode] = useState(initialMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e) => {
    e?.preventDefault()
    if (!username || !password) { toast.error(t('fill_both')); return }
    setLoading(true)
    const sb = createClient()
    const internalEmail = `${username.trim().toLowerCase()}@roseup.local`

    if (mode === 'signup') {
      const { data, error } = await sb.auth.signUp({ email: internalEmail, password, options: { data: { name: username } } })
      setLoading(false)
      if (error) { toast.error(t('signup_failed', { m: error.message })); return }
      const meData = await api('me')
      const p = meData?.participant || { id: data.user?.id, name: username, points: 0, km: 0, completed: 0, streak: 0 }
      toast.success(t('account_created'))
      if (meData?.welcomeAwarded) setTimeout(() => toast.success(t('welcome_bonus_toast', { n: WELCOME_POINTS })), 400)
      await onDone?.(p)
      onClose?.()
    } else {
      const { error } = await sb.auth.signInWithPassword({ email: internalEmail, password })
      setLoading(false)
      if (error) { toast.error(t('invalid_creds')); return }
      const meData = await api('me')
      const p = meData?.participant || { id: meData?.user?.id, name: username, points: 0, km: 0, completed: 0, streak: 0 }
      toast.success(t('logged_in'))
      if (meData?.welcomeAwarded) setTimeout(() => toast.success(t('welcome_bonus_toast', { n: WELCOME_POINTS })), 400)
      await onDone?.(p)
      onClose?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="sm:max-w-md rounded-3xl" data-testid="auth-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-brand-purple-dark">{mode === 'signup' ? t('create_account') : t('welcome_back_title')}</DialogTitle>
          <DialogDescription>{mode === 'signup' ? t('signup_desc', { n: WELCOME_POINTS }) : t('signin_desc')}</DialogDescription>
        </DialogHeader>
        {mode === 'signup' && (
          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 p-3 flex items-center gap-2 text-sm text-brand-purple-dark">
            <Gift className="h-4 w-4 text-brand-purple"/>+{WELCOME_POINTS} {t('pts')} 🎉
          </div>
        )}
        <form onSubmit={handleAuth} className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-purple">{t('username')}</label>
            <Input type="text" placeholder={t('username')} value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl border-purple-200" data-testid="auth-username" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-purple">{t('password')}</label>
            <Input type="password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border-purple-200" data-testid="auth-password" required />
          </div>
          <Button type="submit" disabled={loading} data-testid="auth-submit" className="w-full brand-gradient text-white rounded-xl py-2 font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signup' ? t('sign_up') : t('sign_in')}
          </Button>
        </form>
        <DialogFooter className="sm:justify-center">
          <div className="text-xs text-center text-muted-foreground">
            {mode === 'signup' ? (
              <>{t('have_account')}{' '}<button type="button" onClick={() => setMode('signin')} className="text-brand-purple font-bold hover:underline">{t('sign_in')}</button></>
            ) : (
              <>{t('no_account')}{' '}<button type="button" onClick={() => setMode('signup')} data-testid="auth-switch-signup" className="text-brand-purple font-bold hover:underline">{t('sign_up')}</button></>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
