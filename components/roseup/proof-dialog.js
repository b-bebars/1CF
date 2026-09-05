'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Upload, X, Loader2, Instagram, ExternalLink } from 'lucide-react'
import { useLang, challengeText } from '@/lib/i18n'
import { api, jsonPost } from './api'
import { INSTAGRAM_URL, INSTAGRAM_HANDLE, IMG_IG_QR } from '@/lib/constants/links'

export function ProofDialog({ open, onClose, challenge, me, onSubmitted }) {
  const { t, lang } = useLang()
  const [note, setNote] = useState('')
  const [instagram, setInstagram] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  const reset = () => { setFile(null); setPreview(null); setNote(''); setInstagram(''); setProgress(0) }

  const pickFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return
    const isVideo = f.type.startsWith('video/')
    const isImage = f.type.startsWith('image/')
    if (!isVideo && !isImage) { toast.error(t('pick_img_video')); return }
    const limit = isVideo ? 30 * 1024 * 1024 : 5 * 1024 * 1024
    if (f.size > limit) { toast.error(t('too_big', { kind: isVideo ? t('video') : t('image'), limit: isVideo ? '30 MB' : '5 MB' })); return }
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(f)
  }

  const submit = async () => {
    if (!file) return toast.error(t('pick_media'))
    if (!me?.id) return toast.error(t('session_missing'))
    setLoading(true); setProgress(5)
    try {
      const sb = createClient()
      const signed = await jsonPost('uploads/signed-url', { challengeId: challenge?.id, fileName: file.name })
      if (!signed?.path || !signed?.token) throw new Error(t('submission_failed'))
      setProgress(20)
      const { error: upErr } = await sb.storage.from('proof-images')
        .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type, upsert: true })
      if (upErr) throw upErr
      setProgress(80)
      const res = await jsonPost('submissions', {
        userName: me.name || 'Anonymous',
        userAvatar: me.avatar || '🌹',
        challengeId: challenge?.id,
        challengeTitle: challenge?.title || 'Challenge',
        challengeType: 'daily',
        points: challenge?.points || 0,
        km: challenge?.km || 0,
        proofPath: signed.path,
        instagram: instagram.trim().replace(/^@/, ''),
        note,
      })
      if (res?.error) {
        if (res.code === 'already_pending') { toast.error(t('already_pending')); onSubmitted?.(); onClose?.(); reset(); return }
        throw new Error(t('submission_failed'))
      }
      setProgress(100)
      toast.success(t('proof_submitted'), { description: t('admin_review_soon') })
      onSubmitted?.()
      onClose?.()
      reset()
    } catch (err) {
      console.error('Upload error:', err)
      toast.error(err?.message || t('submission_failed'))
    } finally {
      setLoading(false)
    }
  }

  if (!challenge) return null
  const txt = challengeText(challenge, lang)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="sm:max-w-lg rounded-3xl max-h-[92vh] overflow-y-auto" data-testid="proof-dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-brand-purple-dark flex items-center gap-2"><Upload className="h-5 w-5"/>{t('proof_title')}</DialogTitle>
          <DialogDescription>{t('proof_sub', { title: txt.title, pts: challenge.points || 0 })}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-amber-50 via-rose-50 to-fuchsia-50 p-4 flex gap-3 items-start">
            <img src={IMG_IG_QR} alt="Instagram QR" className="h-16 w-16 rounded-lg object-cover border border-rose-100 shrink-0 bg-white" />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-rose-700 flex items-center gap-1.5"><Instagram className="h-4 w-4"/>{t('proof_ig_title')}</div>
              <p className="text-xs text-rose-900/80 mt-1">{t('proof_ig_text')}</p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline" dir="ltr">@{INSTAGRAM_HANDLE}<ExternalLink className="h-3 w-3"/></a>
            </div>
          </div>

          <div>
            <div className="font-semibold text-sm text-brand-purple-dark mb-2">{t('proof_upload_title')}</div>
            <input type="file" accept="image/*,video/*" ref={fileRef} onChange={pickFile} className="hidden" data-testid="proof-file-input"/>
            {preview ? (
              <div className="relative rounded-2xl overflow-hidden border border-purple-200">
                {preview.startsWith('data:video')
                  ? <video src={preview} controls className="w-full max-h-64"/>
                  : <img src={preview} alt="proof" className="w-full max-h-64 object-cover"/>}
                <button onClick={() => { setFile(null); setPreview(null) }} className="absolute top-2 end-2 h-8 w-8 bg-black/60 text-white rounded-full flex items-center justify-center"><X className="h-4 w-4"/></button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} data-testid="proof-upload-btn" className="w-full rounded-2xl border-2 border-dashed border-purple-200 py-8 hover:bg-purple-50 flex flex-col items-center gap-2 text-brand-purple">
                <Upload className="h-6 w-6"/><div className="font-semibold">{t('upload_photo')}</div><div className="text-xs text-muted-foreground">{t('upload_limits')}</div>
              </button>
            )}
          </div>

          {loading && progress > 0 && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2"/>
              <div className="text-xs text-muted-foreground text-center">{t('uploading', { p: progress })}</div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-brand-purple mb-1 block">{t('ig_label')}</label>
            <div className="relative" dir="ltr">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder={t('ig_placeholder')} data-testid="proof-instagram-input" className="ps-7 rounded-xl border-purple-200"/>
            </div>
          </div>
          <Textarea placeholder={t('note_placeholder')} value={note} onChange={(e) => setNote(e.target.value)} className="rounded-xl border-purple-200" data-testid="proof-note-input"/>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">{t('cancel')}</Button>
          <Button onClick={submit} disabled={loading} data-testid="proof-submit-btn" className="brand-gradient text-white rounded-xl">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : t('submit_review')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
