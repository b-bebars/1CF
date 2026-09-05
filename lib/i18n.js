'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const en = {
  tagline: 'Your Fundraiser, Your Way',
  nav_home: 'Home', nav_leaderboard: 'Leaderboard', nav_donations: 'Donate', nav_how: 'How It Works', nav_noor: 'Meet Noor',
  login: 'Log In', signup: 'Sign Up', signout: 'Sign out', logout: 'Log Out', lang_switch: 'عربي',
  hero_sub: 'Every Step Gives Hope',
  hero_text: 'Complete daily selfie challenges, earn points, climb the leaderboard and help us make a difference together.',
  start_quest: 'Start the Quest', learn_more: 'Learn more',
  total_points: 'Total Points', km_walked: 'Kilometers Walked', participants: 'Participants', total_donations: 'Total Donations',
  all_participants: 'All participants', worldwide: 'Worldwide', total_raised: 'Total raised',
  top10: 'Top 10', see_leaderboard: 'See Leaderboard', top_participants: 'Top participants',
  todays_quest: "Today's Quest", n_daily: '5 new challenges daily',
  quest_text: "Fresh challenges rotate every day at midnight. Log in to see today's set, submit your proof and earn points!",
  resets: 'Resets 00:00 UTC',
  how_title: 'How It Works', how_sub: 'Five simple steps to make a real impact.', step: 'STEP {n}',
  how1: 'Join', how1t: 'Create your account and get {n} welcome points.',
  how2: 'Do Challenges', how2t: 'Fresh daily selfie quests.',
  how3: 'Submit Proof', how3t: 'Upload your photo & tag @breathewithnoor.',
  how4: 'Earn Points', how4t: 'Approved proofs bloom your roses.',
  how5: 'Make Impact', how5t: 'Donate and support the cause.',
  footer: 'Made with 💜 for RoseUp Quest 2026 · Every step gives hope.', admin: 'Admin',
  noor_kicker: 'The heart behind the quest', noor_title: 'Meet Noor',
  noor_text: 'RoseUp Quest is a community fundraiser for Cystic Fibrosis awareness. Follow Noor on Instagram, tag her in your challenge photos and get featured in her stories.',
  follow_ig: 'Follow on Instagram', scan_ig: 'Scan to follow', tag_us: 'Tag @breathewithnoor in your proof to be mentioned in our story',
  donate_here: 'Donate here', donate_kicker: 'Support the cause',
  donate_text: 'Every donation goes directly to the Cystic Fibrosis Foundation fundraiser. Scan the QR code or tap the button.',
  donate_btn: 'Donate Now', campaign_goal: 'Campaign Goal', raised_so_far: 'Raised so far', scan_donate: 'Scan to donate',
  welcome_back: 'Welcome back,', dashboard: 'Dashboard', daily_challenges: 'Daily Challenges', my_submissions: 'My Submissions',
  leaderboard: 'Leaderboard', donations: 'Donate & Follow', certificate: 'Certificate', profile: 'Profile',
  your_rank: 'Your Rank', out_of: 'out of {n}', challenges: 'Challenges', completed: 'Completed', distance: 'Distance', walked: 'Walked',
  streak: 'Streak', current_days: 'Current days', pts: 'pts', points: 'Points',
  your_progress: 'Your Progress', roses_bloomed: '{u}/{r} roses bloomed on your path',
  todays_challenges: "Today's Challenges", bloom_next: 'Complete them to bloom your next rose', n_completed: '{a} / {b} completed',
  proof_required_title: 'Proof is required for every challenge',
  proof_required_text: 'Take your photo or video, post it on Instagram tagging @breathewithnoor, then upload it here. Points are added once an admin approves it.',
  fresh_daily: 'Fresh every day at 00:00 UTC. Submit proof to earn points!', n_left: '{n} left',
  submit_proof: 'Submit Proof', pending_review: 'Pending review', done: 'Done', custom_badge: 'Special',
  track_reviews: 'Track your proof reviews.', no_subs: "No submissions yet. Submit proof from today's challenges.",
  reason: 'Reason', status_pending: 'pending', status_approved: 'approved', status_rejected: 'rejected',
  rank_points: 'Rank #{r} · {p} points', kilometers: 'Kilometers', days: 'days',
  streak_title: 'Your Streak', streak_sub: 'Get at least one challenge approved every day to keep the fire burning.',
  streak_days: '{n} day streak', streak_next: '{n} more day(s) to unlock +{b} bonus points', streak_max: 'Legendary! You unlocked every streak bonus.',
  streak_bonus_toast: '🔥 {n}-day streak! +{b} bonus points', milestone_days: '{n} days', bonus: 'bonus',
  global_n: 'Global · {n} participants', search: 'Search…', loading: 'Loading…', none_found: 'No participants found', you: '(you)',
  cert_title: 'Your Digital Certificate', cert_sub: 'Generated with your latest stats.', download: 'Download',
  proof_title: 'Submit Proof', proof_sub: '{title} · +{pts} pts (pending admin review)',
  proof_ig_title: 'Step 1 · Post on Instagram', proof_ig_text: 'Share your photo/video on Instagram and tag @breathewithnoor so we can mention you in our story 💜',
  proof_upload_title: 'Step 2 · Upload the same proof here', upload_photo: 'Upload photo or video', upload_limits: 'Image up to 5 MB · Video up to 30 MB',
  ig_label: 'Your Instagram username', ig_placeholder: 'yourname — so we can mention you in our story',
  note_placeholder: 'Add a note (optional)…', cancel: 'Cancel', submit_review: 'Submit for Review', uploading: 'Uploading… {p}%',
  pick_media: 'Please pick a photo or video', pick_img_video: 'Please pick an image or video', too_big: '{kind} exceeds {limit} limit', image: 'Image', video: 'Video',
  session_missing: 'User session not found. Please log in again.', proof_submitted: 'Proof submitted!', admin_review_soon: 'An admin will review it soon.',
  submission_failed: 'Submission failed', already_pending: 'You already have a pending submission for this challenge.',
  create_account: 'Create Account', welcome_back_title: 'Welcome Back', signup_desc: 'Enter a username and password to create your account. You get {n} welcome points!',
  signin_desc: 'Enter your credentials to access your account.', username: 'Username', password: 'Password', sign_in: 'Sign In', sign_up: 'Sign Up',
  have_account: 'Already have an account?', no_account: "Don't have an account?", fill_both: 'Please enter both username and password',
  signup_failed: 'Sign up failed: {m}', invalid_creds: 'Invalid username or password', account_created: 'Account created successfully!', logged_in: 'Logged in successfully!',
  welcome_bonus_toast: '🎉 +{n} welcome points added!', signed_out: 'Signed out',
  a_title: 'Admin Dashboard', a_sub: 'Manage RoseUp Quest 2026', a_badge: 'Admin', exit_admin: 'Exit Admin',
  a_overview: 'Overview', a_participants: 'Participants', a_challenges: 'Challenges', a_submissions: 'Review Submissions', a_bonus: 'Award Bonus',
  a_leaderboard: 'Leaderboard', a_donations: 'Donations', a_analytics: 'Analytics', a_announcements: 'Announcements', a_settings: 'Settings',
  a_total_km: 'Total km', a_pending: 'Pending Reviews', a_subs_week: 'Submissions this week',
  export_csv: 'Export CSV', rank: 'Rank', name: 'Name', km: 'km', remove_participant: 'Remove this participant?', removed: 'Removed',
  new_challenge: 'New Challenge', edit_challenge: 'Edit Challenge', custom_section: 'Your custom challenges', custom_hint: 'Created by admin · always visible to everyone until deleted',
  no_custom: 'No custom challenges yet. Click "New Challenge" to add one.', pool_section: 'Daily pool', pool_hint: '5 challenges are picked from this pool every day at 00:00 UTC',
  active: 'Active', inactive: 'inactive', today: 'today', delete_confirm: 'Delete this challenge?', deleted: 'Deleted', saved: 'Saved', failed: 'Failed',
  type: 'Type', daily: 'Daily', icon: 'Icon', title: 'Title', description: 'Description', save: 'Save', n_participants: '{n} participants',
  approve: 'Approve', reject: 'Reject', approved_toast: 'Approved & points awarded', rejected_toast: 'Rejected', reject_reason: 'Reason (optional):',
  no_submissions: 'No submissions yet.', submitted_by: 'Submitted by {n}', instagram: 'Instagram',
  award_bonus_title: 'Award Bonus Points', award: 'Award', award_to: 'Award bonus to {n}', bonus_event: 'Bonus event', bonus_toast: '+{p} pts to {n}',
  donation_stats: 'Donation Statistics', raised: 'Raised', goal: 'Goal', donors: 'Donors', update_donations: 'Save totals', donations_saved: 'Donation totals saved',
  donation_hint: 'Enter the real totals from the CFF fundraiser page. They are shown on the public site — no fake numbers.',
  subs_breakdown: 'Submissions Breakdown', campaign_health: 'Campaign Health', total_challenges_cfg: 'Total challenges configured', active_participants: 'Active participants',
  total_km_walked: 'Total km walked', points_issued: 'Points issued',
  new_announcement: 'New Announcement', post: 'Post', pin_top: 'Pin to top', recent: 'Recent', pinned: 'pinned', message: 'Message…', announcement_posted: 'Announcement posted',
  settings: 'Settings', settings_text: 'Supabase Auth · Storage · Database are connected. Daily rotation runs automatically at 00:00 UTC.',
  rotate_now: "Rotate today's challenges now", rotated: 'Challenges rotated',
  admin_pw_title: 'Admin Password Required', admin_pw_text: 'Please enter the admin password to continue.', enter_password: 'Enter Password', enter_dashboard: 'Enter Dashboard', back_app: 'Back to App', wrong_pw: 'Wrong Password!',
}

const ar = {
  tagline: 'حملتك للتبرع، على طريقتك',
  nav_home: 'الرئيسية', nav_leaderboard: 'لوحة المتصدرين', nav_donations: 'تبرّع', nav_how: 'كيف يعمل', nav_noor: 'تعرّف على نور',
  login: 'تسجيل الدخول', signup: 'إنشاء حساب', signout: 'خروج', logout: 'تسجيل الخروج', lang_switch: 'English',
  hero_sub: 'كل خطوة تمنح الأمل',
  hero_text: 'أنجز تحديات السيلفي اليومية، اجمع النقاط، تصدّر اللوحة وساعدنا في صنع الفرق معاً.',
  start_quest: 'ابدأ التحدي', learn_more: 'اعرف أكثر',
  total_points: 'مجموع النقاط', km_walked: 'الكيلومترات المقطوعة', participants: 'المشاركون', total_donations: 'مجموع التبرعات',
  all_participants: 'كل المشاركين', worldwide: 'حول العالم', total_raised: 'المجموع المُحصَّل',
  top10: 'أفضل 10', see_leaderboard: 'شاهد المتصدرين', top_participants: 'أفضل المشاركين',
  todays_quest: 'تحدي اليوم', n_daily: '5 تحديات جديدة كل يوم',
  quest_text: 'تتجدد التحديات كل يوم عند منتصف الليل. سجّل الدخول لترى تحديات اليوم، أرسل إثباتك واجمع النقاط!',
  resets: 'يتجدد 00:00 UTC',
  how_title: 'كيف يعمل', how_sub: 'خمس خطوات بسيطة لصنع أثر حقيقي.', step: 'الخطوة {n}',
  how1: 'انضم', how1t: 'أنشئ حسابك واحصل على {n} نقاط ترحيبية.',
  how2: 'أنجز التحديات', how2t: 'تحديات سيلفي جديدة كل يوم.',
  how3: 'أرسل الإثبات', how3t: 'ارفع صورتك وأشر إلى @breathewithnoor.',
  how4: 'اجمع النقاط', how4t: 'الإثباتات المعتمدة تُزهر ورودك.',
  how5: 'اصنع الأثر', how5t: 'تبرّع وادعم القضية.',
  footer: 'صُنع بـ 💜 لأجل RoseUp Quest 2026 · كل خطوة تمنح الأمل.', admin: 'الإدارة',
  noor_kicker: 'القلب النابض للتحدي', noor_title: 'تعرّف على نور',
  noor_text: 'RoseUp Quest حملة مجتمعية لجمع التبرعات والتوعية بالتليف الكيسي. تابعي/تابع نور على إنستغرام، أشر إليها في صور تحدياتك لتظهر في قصصها.',
  follow_ig: 'تابع على إنستغرام', scan_ig: 'امسح للمتابعة', tag_us: 'أشر إلى @breathewithnoor في إثباتك لنذكرك في قصتنا',
  donate_here: 'تبرّع هنا', donate_kicker: 'ادعم القضية',
  donate_text: 'كل تبرع يذهب مباشرة إلى حملة مؤسسة التليف الكيسي. امسح رمز QR أو اضغط الزر.',
  donate_btn: 'تبرّع الآن', campaign_goal: 'هدف الحملة', raised_so_far: 'تم جمعه حتى الآن', scan_donate: 'امسح للتبرع',
  welcome_back: 'أهلاً بعودتك،', dashboard: 'لوحة التحكم', daily_challenges: 'التحديات اليومية', my_submissions: 'إثباتاتي',
  leaderboard: 'لوحة المتصدرين', donations: 'تبرّع وتابع', certificate: 'الشهادة', profile: 'الملف الشخصي',
  your_rank: 'ترتيبك', out_of: 'من أصل {n}', challenges: 'التحديات', completed: 'مكتملة', distance: 'المسافة', walked: 'مقطوعة',
  streak: 'السلسلة', current_days: 'أيام متواصلة', pts: 'نقطة', points: 'النقاط',
  your_progress: 'تقدّمك', roses_bloomed: 'أزهرت {u} من {r} ورود على طريقك',
  todays_challenges: 'تحديات اليوم', bloom_next: 'أنجزها لتُزهر وردتك التالية', n_completed: 'أُنجز {a} من {b}',
  proof_required_title: 'الإثبات مطلوب لكل تحدٍ',
  proof_required_text: 'التقط صورتك أو فيديوك، انشره على إنستغرام مع الإشارة إلى @breathewithnoor، ثم ارفعه هنا. تُضاف النقاط بعد اعتماد الإدارة.',
  fresh_daily: 'تتجدد كل يوم عند 00:00 UTC. أرسل الإثبات لتجمع النقاط!', n_left: 'متبقٍ {n}',
  submit_proof: 'أرسل الإثبات', pending_review: 'قيد المراجعة', done: 'تم', custom_badge: 'خاص',
  track_reviews: 'تابع حالة مراجعة إثباتاتك.', no_subs: 'لا إثباتات بعد. أرسل إثباتاً من تحديات اليوم.',
  reason: 'السبب', status_pending: 'قيد المراجعة', status_approved: 'معتمد', status_rejected: 'مرفوض',
  rank_points: 'الترتيب #{r} · {p} نقطة', kilometers: 'كيلومتر', days: 'يوم',
  streak_title: 'سلسلتك اليومية', streak_sub: 'احصل على اعتماد تحدٍ واحد على الأقل كل يوم لتبقي الشعلة مشتعلة.',
  streak_days: 'سلسلة {n} يوم', streak_next: 'بقي {n} يوم لفتح مكافأة +{b} نقطة', streak_max: 'أسطوري! فتحت كل مكافآت السلسلة.',
  streak_bonus_toast: '🔥 سلسلة {n} يوم! +{b} نقطة مكافأة', milestone_days: '{n} أيام', bonus: 'مكافأة',
  global_n: 'عالمي · {n} مشارك', search: 'ابحث…', loading: 'جارٍ التحميل…', none_found: 'لا يوجد مشاركون', you: '(أنت)',
  cert_title: 'شهادتك الرقمية', cert_sub: 'تُولَّد من أحدث إحصائياتك.', download: 'تحميل',
  proof_title: 'إرسال الإثبات', proof_sub: '{title} · +{pts} نقطة (بانتظار مراجعة الإدارة)',
  proof_ig_title: 'الخطوة 1 · انشر على إنستغرام', proof_ig_text: 'شارك صورتك/فيديوك على إنستغرام وأشر إلى @breathewithnoor لنذكرك في قصتنا 💜',
  proof_upload_title: 'الخطوة 2 · ارفع الإثبات نفسه هنا', upload_photo: 'ارفع صورة أو فيديو', upload_limits: 'صورة حتى 5 MB · فيديو حتى 30 MB',
  ig_label: 'اسم حسابك على إنستغرام', ig_placeholder: 'اسم_حسابك — لنذكرك في قصتنا',
  note_placeholder: 'أضف ملاحظة (اختياري)…', cancel: 'إلغاء', submit_review: 'إرسال للمراجعة', uploading: 'جارٍ الرفع… {p}%',
  pick_media: 'اختر صورة أو فيديو أولاً', pick_img_video: 'الرجاء اختيار صورة أو فيديو', too_big: '{kind} يتجاوز الحد {limit}', image: 'الصورة', video: 'الفيديو',
  session_missing: 'لم يتم العثور على الجلسة. الرجاء تسجيل الدخول مجدداً.', proof_submitted: 'تم إرسال الإثبات!', admin_review_soon: 'ستراجعه الإدارة قريباً.',
  submission_failed: 'فشل الإرسال', already_pending: 'لديك إثبات قيد المراجعة لهذا التحدي بالفعل.',
  create_account: 'إنشاء حساب', welcome_back_title: 'أهلاً بعودتك', signup_desc: 'أدخل اسم مستخدم وكلمة مرور لإنشاء حسابك. ستحصل على {n} نقاط ترحيبية!',
  signin_desc: 'أدخل بياناتك للوصول إلى حسابك.', username: 'اسم المستخدم', password: 'كلمة المرور', sign_in: 'دخول', sign_up: 'إنشاء حساب',
  have_account: 'لديك حساب بالفعل؟', no_account: 'ليس لديك حساب؟', fill_both: 'الرجاء إدخال اسم المستخدم وكلمة المرور',
  signup_failed: 'فشل إنشاء الحساب: {m}', invalid_creds: 'اسم المستخدم أو كلمة المرور غير صحيحة', account_created: 'تم إنشاء الحساب بنجاح!', logged_in: 'تم تسجيل الدخول بنجاح!',
  welcome_bonus_toast: '🎉 أُضيفت {n} نقاط ترحيبية!', signed_out: 'تم تسجيل الخروج',
  a_title: 'لوحة الإدارة', a_sub: 'إدارة RoseUp Quest 2026', a_badge: 'مدير', exit_admin: 'الخروج من الإدارة',
  a_overview: 'نظرة عامة', a_participants: 'المشاركون', a_challenges: 'التحديات', a_submissions: 'مراجعة الإثباتات', a_bonus: 'منح مكافأة',
  a_leaderboard: 'لوحة المتصدرين', a_donations: 'التبرعات', a_analytics: 'التحليلات', a_announcements: 'الإعلانات', a_settings: 'الإعدادات',
  a_total_km: 'مجموع كم', a_pending: 'بانتظار المراجعة', a_subs_week: 'الإثباتات هذا الأسبوع',
  export_csv: 'تصدير CSV', rank: 'الترتيب', name: 'الاسم', km: 'كم', remove_participant: 'حذف هذا المشارك؟', removed: 'تم الحذف',
  new_challenge: 'تحدٍ جديد', edit_challenge: 'تعديل التحدي', custom_section: 'تحدياتك الخاصة', custom_hint: 'أنشأتها الإدارة · تظهر للجميع دائماً حتى تُحذف',
  no_custom: 'لا تحديات خاصة بعد. اضغط "تحدٍ جديد" لإضافة واحد.', pool_section: 'مخزون التحديات اليومية', pool_hint: 'يُختار 5 تحديات من هذا المخزون كل يوم عند 00:00 UTC',
  active: 'مفعّل', inactive: 'غير مفعّل', today: 'اليوم', delete_confirm: 'حذف هذا التحدي؟', deleted: 'تم الحذف', saved: 'تم الحفظ', failed: 'فشل',
  type: 'النوع', daily: 'يومي', icon: 'الأيقونة', title: 'العنوان', description: 'الوصف', save: 'حفظ', n_participants: '{n} مشارك',
  approve: 'اعتماد', reject: 'رفض', approved_toast: 'تم الاعتماد ومنح النقاط', rejected_toast: 'تم الرفض', reject_reason: 'السبب (اختياري):',
  no_submissions: 'لا إثباتات بعد.', submitted_by: 'أرسله {n}', instagram: 'إنستغرام',
  award_bonus_title: 'منح نقاط مكافأة', award: 'امنح', award_to: 'منح مكافأة إلى {n}', bonus_event: 'مكافأة خاصة', bonus_toast: '+{p} نقطة إلى {n}',
  donation_stats: 'إحصائيات التبرعات', raised: 'المجموع', goal: 'الهدف', donors: 'المتبرعون', update_donations: 'حفظ الأرقام', donations_saved: 'تم حفظ أرقام التبرعات',
  donation_hint: 'أدخل الأرقام الحقيقية من صفحة حملة CFF. تظهر على الموقع العام — لا أرقام وهمية.',
  subs_breakdown: 'توزيع الإثباتات', campaign_health: 'صحة الحملة', total_challenges_cfg: 'مجموع التحديات المُعدّة', active_participants: 'المشاركون النشطون',
  total_km_walked: 'مجموع الكيلومترات', points_issued: 'النقاط الممنوحة',
  new_announcement: 'إعلان جديد', post: 'نشر', pin_top: 'تثبيت في الأعلى', recent: 'الأخيرة', pinned: 'مثبّت', message: 'الرسالة…', announcement_posted: 'تم نشر الإعلان',
  settings: 'الإعدادات', settings_text: 'Supabase (المصادقة · التخزين · قاعدة البيانات) متصلة. التدوير اليومي يعمل تلقائياً عند 00:00 UTC.',
  rotate_now: 'دوّر تحديات اليوم الآن', rotated: 'تم تدوير التحديات',
  admin_pw_title: 'كلمة مرور الإدارة مطلوبة', admin_pw_text: 'الرجاء إدخال كلمة مرور الإدارة للمتابعة.', enter_password: 'أدخل كلمة المرور', enter_dashboard: 'دخول اللوحة', back_app: 'عودة للتطبيق', wrong_pw: 'كلمة المرور خاطئة!',
}

export const CHALLENGE_AR = {
  'd-selfie-purple': ['سيلفي بنفسجي', 'ارتدِ شيئاً بنفسجياً والتقط سيلفي.'],
  'd-selfie-rose': ['سيلفي مع وردة', 'حقيقية أو مرسومة أو حتى إيموجي على ورقة — أرنا وردتك!'],
  'd-selfie-walk': ['سيلفي أثناء المشي', 'التقط سيلفي أثناء مشي 3 كم (لقطة شاشة للخطوات مرحّب بها).'],
  'd-selfie-sunrise': ['سيلفي مع شروق الشمس', 'استيقظ باكراً والتقط سيلفي مع الشروق.'],
  'd-selfie-friend': ['سيلفي مع صديق', 'ادعُ صديقاً للتحدي والتقطا سيلفي معاً.'],
  'd-selfie-pet': ['سيلفي مع حيوان أو نبتة', 'سيلفي مع حيوانك الأليف أو نبتتك المفضلة.'],
  'd-selfie-workout': ['سيلفي بعد التمرين', 'سيلفي أمام المرآة بعد التمرين — العرق يُحتسب!'],
  'd-selfie-water': ['سيلفي الترطيب', 'سيلفي مع زجاجة مائك — حافظ على ترطيبك.'],
  'd-selfie-smile': ['سيلفي أكبر ابتسامة', 'أرنا أكبر ابتسامة لديك اليوم.'],
  'd-selfie-sign': ['سيلفي لافتة الأمل', 'احمل لافتة مكتوب عليها "كل خطوة تمنح الأمل" وابتسم.'],
  'd-selfie-nature': ['سيلفي في الطبيعة', '20 دقيقة في الهواء الطلق — أثبتها بسيلفي في الطبيعة.'],
  'd-selfie-family': ['سيلفي عائلي', 'سيلفي مع عائلتك أو أحبّائك.'],
  'd-selfie-meal': ['سيلفي وجبة صحية', 'صوّر نفسك مع وجبة صحية ملوّنة.'],
  'd-selfie-stairs': ['سيلفي الدرج', 'اصعد الدرج (50 درجة أو أكثر) والتقط سيلفي في الأعلى.'],
  'd-selfie-sky': ['سيلفي مع السماء', 'انظر للأعلى! سيلفي مع سماء اليوم.'],
  'd-selfie-book': ['سيلفي القراءة', 'سيلفي مع الكتاب الذي تقرأه اليوم.'],
  'd-selfie-hat': ['سيلفي القبعة المضحكة', 'كلما كانت القبعة أغرب كان أفضل.'],
  'd-selfie-breathe': ['سيلفي التنفس العميق', 'خذ 10 أنفاس عميقة من أجل التوعية بالتليف الكيسي والتقط سيلفي هادئاً.'],
  'd-selfie-yoga': ['سيلفي وضعية اليوغا', 'اتخذ وضعية يوغا والتقط سيلفي.'],
  'd-selfie-bike': ['سيلفي الدراجة', 'اقطع 5 كم بالدراجة والتقط سيلفي معها.'],
  'd-selfie-run': ['سيلفي الجري', 'اجرِ 1 كم والتقط سيلفي بعد الجهد.'],
  'd-video-dance': ['مقطع رقص 10 ثوانٍ', 'ارقص 10 ثوانٍ على أغنيتك المفضلة.'],
  'd-video-cf-fact': ['مقطع 30 ثانية عن التليف الكيسي', 'شارك حقيقة واحدة عن التليف الكيسي في مقطع 30 ثانية.'],
  'd-video-cheer': ['مقطع تشجيع', 'سجّل مقطع تشجيع لمدة 15 ثانية لفريق RoseUp.'],
  'd-draw-rose': ['ارسم وردة', 'ارسم أو لوّن وردة وشاركها.'],
  'd-post-awareness': ['منشور توعوي', 'انشر عن التليف الكيسي مع #RoseUp2026 وأشر إلى @breathewithnoor.'],
  'd-story-hope': ['قصة أمل', 'شارك قصة أمل قصيرة على إنستغرام وأشر إلينا.'],
  'd-thank-you': ['سيلفي الشكر', 'سيلفي مع شخص شكرته اليوم.'],
  'd-selfie-team': ['سيلفي الفريق', 'سيلفي مع 3 أشخاص أو أكثر يرتدون البنفسجي.'],
  'd-selfie-sunset': ['سيلفي مع غروب الشمس', 'التقط سيلفي مع غروب اليوم.'],
  'd-selfie-coffee': ['سيلفي قهوة الصباح', 'ابدأ يومك: سيلفي مع مشروبك الصباحي.'],
  'd-selfie-kindness': ['سيلفي عمل الخير', 'قم بعمل لطيف والتقط سيلفي بعده.'],
  'd-selfie-outfit': ['إطلالة بنفسجية كاملة', 'ملابس بنفسجية من الرأس إلى القدم!'],
  'd-selfie-steps': ['سيلفي 10 آلاف خطوة', 'حقق 10,000 خطوة وأرنا الدليل.'],
  'd-selfie-mirror-msg': ['رسالة على المرآة', 'اكتب رسالة أمل على مرآتك والتقط سيلفي معها.'],
}

const DICT = { en, ar }

export function challengeText(c, lang) {
  if (lang === 'ar' && c?.id && CHALLENGE_AR[c.id]) return { title: CHALLENGE_AR[c.id][0], description: CHALLENGE_AR[c.id][1] }
  return { title: c?.title || '', description: c?.description || '' }
}

function interpolate(str, vars) {
  if (!vars) return str
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`))
}

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k, dir: 'ltr', isAr: false })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let initial = 'en'
    try {
      const saved = localStorage.getItem('roseup_lang')
      if (saved === 'ar' || saved === 'en') initial = saved
      else if ((navigator.language || '').toLowerCase().startsWith('ar')) initial = 'ar'
    } catch {}
    setLangState(initial)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const value = useMemo(() => ({
    lang,
    isAr: lang === 'ar',
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    setLang: (l) => { setLangState(l); try { localStorage.setItem('roseup_lang', l) } catch {} },
    toggle: () => { const l = lang === 'ar' ? 'en' : 'ar'; setLangState(l); try { localStorage.setItem('roseup_lang', l) } catch {} },
    t: (key, vars) => interpolate(DICT[lang]?.[key] ?? DICT.en[key] ?? key, vars),
  }), [lang])

  if (!mounted) return null
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() { return useContext(LangContext) }
