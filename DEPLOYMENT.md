# 🌹 RoseUp Quest 2026 — Deployment Guide

## 📋 خطوات النشر (بالترتيب)

### 1️⃣ Supabase — تشغيل الـ SQL Fixes
افتح Supabase Dashboard → SQL Editor → **New Query** والصق كل محتوى ملف [`fixes.sql`](./fixes.sql) → **Run**.

هالسكريبت رح يعمل:
- ✅ Trigger `handle_new_user` — كل مستخدم جديد بينضاف تلقائياً لجدول `participants` → **يصلح عدّاد المستخدمين وعدّاد النقاط**
- ✅ Backfill للمستخدمين القدماء (اللي ما إلهم participants)
- ✅ إنشاء جدول `challenge_completions` (كان مفقود ومسبب crash بالكود)
- ✅ RPC آمن `increment_points(user_id, amount, km)`
- ✅ **حذف** كل التحديات الأسبوعية والسبيشال من الـ DB
- ✅ Storage bucket `proof-images`:
  - رفع الحد لـ 50MB
  - قبول صور + فيديو (`mp4`, `webm`, `mov`, `jpeg`, `png`, `webp`, `gif`)
  - Policies: كل مستخدم يرفع في مجلده الخاص
- ✅ إضافة **25 تحدي يومي** جديد (بنك التحديات)
- ✅ Function `rotate_daily_challenges()` — يفعّل 5 تحديات عشوائية كل يوم ويصفّر الإنجازات
- ✅ **pg_cron job** يشتغل كل يوم الساعة **00:00 UTC** أوتوماتيك

### 2️⃣ التحقق (اختياري لكن مهم)
بعد ما تشغّل السكريبت، شغّل هالـ query للتأكد:
```sql
select 
  (select count(*) from public.participants) as participants,
  (select count(*) from public.challenges where type='daily' and active=true) as active_daily,
  (select count(*) from cron.job where jobname='roseup_daily_rotation') as cron_active;
```
المفروض ترجع:
- `participants` = عدد المستخدمين الحاليين (لو صفر يعني ما عندك حسابات بعد، رح يزيد أول ما يسجل حد)
- `active_daily` = **5**
- `cron_active` = **1**

### 3️⃣ Deploy على Vercel
```bash
cd path/to/1CF
git add .
git commit -m "fix: user/points counters, daily challenges rotation, direct upload"
git push
```
Vercel رح ينشر لحاله. راقب الـ build logs.

### 4️⃣ اختبار على Preview URL
1. **User counter**: سجّل حساب جديد من `/` (اضغط Sign Up) → افتح الصفحة الرئيسية بدون تسجيل → لازم يبان **Participants +1**
2. **Points counter**: خش على الحساب → اضغط "Complete" على تحدي → لازم النقاط تزيد فوراً + لو رجعت للـ home stats كمان زادت
3. **Upload**: خش على تحدي → لو بتظهر "Submit Proof" اختر فيديو حتى 30MB → لازم progress bar يشتغل ويرفع
4. **Daily rotation**: بعد منتصف الليل UTC، لازم التحديات تتغير + `completed_challenge_ids` تتصفر

---

## 🚨 نقاط مهمة

### أ. `pg_cron` مفعّل بـ Supabase؟
لو ظهر خطأ عند تشغيل `create extension pg_cron`، لازم تفعّله من:
**Supabase Dashboard → Database → Extensions → ابحث عن `pg_cron` → Enable**

### ب. Auth مسموح `@roseup.local`؟
الكود بيستخدم emails على شكل `username@roseup.local`. لو Supabase رفض الـ signup:
**Dashboard → Authentication → Providers → Email → أطفئ "Confirm email"** (لأنه ما فيش domain حقيقي يستقبل ايميل تأكيد)

### ج. Env vars على Vercel
تأكد إنه هالثلاثة موجودين بـ Vercel Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### د. تشغيل rotation يدوياً
لو بدك تشوف تحديات اليوم تتغيّر بدون ما تنتظر منتصف الليل:
```sql
select public.rotate_daily_challenges();
```
أو من الـ API (admin only): `POST /api/admin/rotate-daily`

---

## 📝 ملخص التعديلات على الكود

| ملف | التغيير |
|-----|---------|
| `fixes.sql` | جديد — كل الـ DB fixes |
| `app/page.js` | حذف Weekly/Special tabs، direct upload لـ Storage، إصلاح refetch للـ counters، رفع limits لـ 5MB/30MB |
| `app/api/[[...path]]/route.js` | حذف weekly/special endpoints، endpoint جديد `/uploads/signed-url` للـ direct upload، إصلاح `/stats` بـ count exact، auto-create participant في `/me` (fallback) |

## 🎯 الأحداث اللي بتزيد النقاط (حالياً)
- ✅ **Complete Daily Challenge** → نقاط التحدي (10-45 نقطة)
- ✅ **Submission Approved by Admin** → نقاط التحدي المرفوع
- ✅ **Admin Bonus** → أي مبلغ يحدده الأدمن

> بدك نضيف نقاط لـ signup أو upload تلقائي بدون approval؟ قلّي بلاش.
