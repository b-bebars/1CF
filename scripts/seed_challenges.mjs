// One-off: refresh the daily challenge pool with fun selfie challenges.
// Usage: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed_challenges.mjs
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const POOL = [
  ['d-selfie-purple', '💜', 'Purple selfie', 'Wear something purple and snap a selfie.', 20, 'share'],
  ['d-selfie-rose', '🌹', 'Selfie with a rose', 'Real, drawn, or even an emoji on paper — show us your rose!', 20, 'create'],
  ['d-selfie-walk', '🚶', 'Walking selfie', 'Take a selfie during a 3 km walk (screenshot of steps welcome).', 30, 'move'],
  ['d-selfie-sunrise', '🌅', 'Sunrise selfie', 'Catch the sunrise and take a selfie with it.', 25, 'create'],
  ['d-selfie-friend', '👯', 'Selfie with a friend', 'Invite a friend to the Quest and snap a selfie together.', 35, 'grow'],
  ['d-selfie-pet', '🐾', 'Pet or plant selfie', 'A selfie with your pet or favourite plant.', 15, 'wellness'],
  ['d-selfie-workout', '🏋️', 'Workout selfie', 'Post-workout mirror selfie — sweat counts!', 25, 'move'],
  ['d-selfie-water', '💧', 'Hydration selfie', 'Selfie with your water bottle — stay hydrated.', 10, 'wellness'],
  ['d-selfie-smile', '😁', 'Biggest smile selfie', 'Show us your biggest smile today.', 15, 'share'],
  ['d-selfie-sign', '✍️', 'Hope sign selfie', "Hold a sign saying 'Every Step Gives Hope' and smile.", 30, 'share'],
  ['d-selfie-nature', '🌿', 'Nature selfie', '20 minutes outdoors — prove it with a selfie in nature.', 20, 'wellness'],
  ['d-selfie-family', '👨‍👩‍👧', 'Family selfie', 'A selfie with your family or loved ones.', 25, 'share'],
  ['d-selfie-meal', '🥗', 'Healthy meal selfie', 'Snap yourself with a colourful healthy meal.', 15, 'wellness'],
  ['d-selfie-stairs', '🪩', 'Stairs selfie', 'Take the stairs (50+ steps) and snap a selfie at the top.', 15, 'move'],
  ['d-selfie-sky', '🌤️', 'Sky selfie', "Look up! A selfie with today's sky.", 10, 'create'],
  ['d-selfie-book', '📚', 'Reading selfie', "Selfie with the book you're reading today.", 15, 'learn'],
  ['d-selfie-hat', '🎩', 'Silly hat selfie', 'The sillier the hat, the better.', 15, 'share'],
  ['d-selfie-breathe', '🫁', 'Deep breath selfie', 'Take 10 deep breaths for CF awareness and snap a calm selfie.', 20, 'wellness'],
  ['d-selfie-yoga', '🧘', 'Yoga pose selfie', 'Strike a yoga pose and take a selfie.', 25, 'wellness'],
  ['d-selfie-bike', '🚴', 'Cycling selfie', 'Ride 5 km and snap a selfie with your bike.', 40, 'move'],
  ['d-selfie-run', '🏃', 'Running selfie', 'Run 1 km and take a sweaty selfie.', 40, 'move'],
  ['d-video-dance', '💃', '10-sec dance clip', 'Dance for 10 seconds to your favourite song.', 30, 'create'],
  ['d-video-cf-fact', '🎥', '30-sec CF fact clip', 'Share one Cystic Fibrosis fact in a 30-second clip.', 45, 'learn'],
  ['d-video-cheer', '📣', 'Cheer clip', 'Record a 15-second cheer for the RoseUp team.', 25, 'share'],
  ['d-draw-rose', '🎨', 'Draw a rose', 'Doodle or paint a rose and show it off.', 25, 'create'],
  ['d-post-awareness', '📱', 'Awareness post', 'Post about CF with #RoseUp2026 and tag @breathewithnoor.', 20, 'share'],
  ['d-story-hope', '✨', 'Story of hope', 'Share a short story of hope on Instagram and tag us.', 25, 'share'],
  ['d-thank-you', '💌', 'Thank-you selfie', 'Selfie with someone you thanked today.', 15, 'share'],
  ['d-selfie-team', '🤝', 'Team selfie', 'Selfie with 3+ people wearing purple.', 40, 'grow'],
  ['d-selfie-sunset', '🌇', 'Sunset selfie', "Take a selfie with today's sunset.", 20, 'create'],
  ['d-selfie-coffee', '☕', 'Morning coffee selfie', 'Start the day: selfie with your morning drink.', 10, 'wellness'],
  ['d-selfie-kindness', '🤗', 'Act of kindness selfie', 'Do something kind and snap a selfie afterwards.', 25, 'share'],
  ['d-selfie-outfit', '👕', 'Purple outfit of the day', 'Full purple outfit — head to toe!', 30, 'share'],
  ['d-selfie-steps', '👟', '10k steps selfie', 'Hit 10,000 steps and show the proof.', 40, 'move'],
  ['d-selfie-mirror-msg', '🪩', 'Mirror message', 'Write a message of hope on your mirror and take a selfie with it.', 20, 'create'],
]

const OLD_SEED_IDS = ['d-walk3','d-photo','d-read','d-story','d-invite','d-post','d-stretch','d-water','d-run1','d-stairs','d-nature','d-meditate','d-sunrise','d-thanks','d-fruit','d-book','d-music','d-draw','d-video','d-declutter','d-cf-fact','d-donate','d-yoga','d-cycle','d-selfie']

const run = async () => {
  const { data: all } = await sb.from('challenges').select('id,category')
  // Mark admin-created challenges (id = d-<timestamp>) as custom so they are always visible
  const customIds = (all || []).filter(c => /^d-\d+$/.test(c.id) && c.category !== 'custom').map(c => c.id)
  if (customIds.length) { const { error } = await sb.from('challenges').update({ category: 'custom' }).in('id', customIds); console.log('custom marked:', customIds, error?.message || 'ok') }

  // Remove the old seed pool (not admin-created ones)
  const { error: delErr } = await sb.from('challenges').delete().in('id', OLD_SEED_IDS)
  console.log('old seed removed:', delErr?.message || 'ok')

  const rows = POOL.map(([id, icon, title, description, points, category]) => ({ id, type: 'daily', icon, title, description, points, category, active: false, requires_submission: true }))
  const { error: upErr } = await sb.from('challenges').upsert(rows, { onConflict: 'id' })
  console.log('pool upserted:', rows.length, upErr?.message || 'ok')

  // Rotate in JS (same algorithm as /api/admin/rotate-daily) - the SQL RPC is blocked by safe-update via the API
  const now = new Date()
  const dayOfYear = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86400000)
  const seed = `${now.getUTCFullYear()}${String(dayOfYear).padStart(3, '0')}`
  const h = (s) => createHash('md5').update(s).digest('hex')
  const picks = POOL.map(r => r[0]).sort((a, b) => h(a + seed).localeCompare(h(b + seed))).slice(0, 5)
  await sb.from('challenges').update({ active: false }).eq('type', 'daily')
  await sb.from('challenges').update({ active: true }).in('id', picks)
  const { data: customs } = await sb.from('challenges').select('id').eq('category', 'custom')
  if (customs?.length) await sb.from('challenges').update({ active: true }).in('id', customs.map(c => c.id))
  await sb.from('participants').update({ completed_challenge_ids: [] }).not('id', 'is', null)
  console.log('rotated, picks:', picks)

  const { data: active } = await sb.from('challenges').select('id,title,active,category').or('active.eq.true,category.eq.custom')
  console.log('visible today:', active)
}
run()
