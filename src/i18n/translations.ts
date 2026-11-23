import { SupportedLanguage } from '../types/reelsync';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  rtl?: boolean;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'roman-ur', label: 'Roman Urdu', nativeLabel: 'Roman Urdu' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', rtl: true },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', rtl: true },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
];

export interface TranslationStrings {
  languageLabel: string;
  brightTheme: string;
  darkTheme: string;
  brightShort: string;
  darkShort: string;
  appearance: string;
  signOut: string;

  // Auth Gate
  authHeadline: string;
  authSubheadline: string;
  authEmailButton: string;
  authConnecting: string;
  authStepBadge: string;
  authBenefit1Title: string;
  authBenefit1Desc: string;
  authBenefit2Title: string;
  authBenefit2Desc: string;
  authBenefit3Title: string;
  authBenefit3Desc: string;
  authPrivacyNote: string;
  onboardingTitle: string;
  onboardingSubtitle: string;
  onboardingNameLabel: string;
  onboardingNamePlaceholder: string;
  onboardingEmailLabel: string;
  onboardingLangLabel: string;
  onboardingSubmit: string;
  onboardingSaving: string;
  onboardingSwitchAccount: string;

  // Sidebar & Header
  userWorkspace: string;
  adminOptions: string;
  newReelUpload: string;
  newReelShort: string;
  navDashboard: string;
  navComposer: string;
  navQueue: string;
  navAccountsAdmin: string;
  navAccountsUser: string;
  navAdminChannels: string;
  navAdminRoles: string;
  navAdminSupport: string;
  creatorAccessLabel: string;
  ownerAdminLabel: string;

  // Dashboard
  dashControlCenter: string;
  dashSignedInAs: string;
  dashCreatorWorkspace: string;
  dashTitle: string;
  dashSubtitleAdmin: string;
  dashSubtitleUser: string;
  dashUploadReel: string;
  dashTotalReels: string;
  dashConnectedChannels: string;
  dashScheduledQueued: string;
  dashPublishedDrops: string;
  dashUserOptionsTitle: string;
  dashUserOptionsSub: string;
  dashUploadComposeTitle: string;
  dashUploadComposeSub: string;
  dashQueueStatusTitle: string;
  dashQueueStatusSub: string;
  dashConnectedSocialTitle: string;
  dashConnectedSocialSub: string;
  dashCreatorSupport: string;
  dashChannelsHeading: string;
  dashChannelsHint: string;
  dashRecentReelsHeading: string;
  dashRecentReelsSub: string;
  dashOpenFullQueue: string;
  dashAskBotTitle: string;
  dashAskBotSubtitle: string;
  dashAskBotCta: string;

  // Help Chatbot
  botTitle: string;
  botSubtitle: string;
  botGreeting: string;
  botPlaceholder: string;
  botSend: string;
  botThinking: string;
  botClear: string;
  botOpenAria: string;
  botCloseAria: string;
  botRetry: string;
  botQuickPrompts: string[];
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    languageLabel: 'Language',
    brightTheme: 'Bright Theme',
    darkTheme: 'Dark Theme',
    brightShort: 'Bright',
    darkShort: 'Dark',
    appearance: 'Appearance',
    signOut: 'Sign Out',

    authHeadline: 'Create your creator account to enter ReelSync',
    authSubheadline:
      'Sign up or log in with your email to upload short-form videos, manage captions, and track cross-platform schedules.',
    authEmailButton: 'Continue with your Email (Google)',
    authConnecting: 'Connecting account...',
    authStepBadge: 'Step 1 of 2 · Account & Language',
    authBenefit1Title: 'Multi-Platform Publishing',
    authBenefit1Desc: 'Compose once and distribute across TikTok, Instagram Reels, YouTube Shorts, and Snapchat.',
    authBenefit2Title: 'Multi-Language Studio',
    authBenefit2Desc: 'Choose English, Urdu, Roman Urdu, Arabic, Spanish, or French before entering.',
    authBenefit3Title: 'Built-in AI Help Assistant',
    authBenefit3Desc: 'Get instant troubleshooting answers at the bottom of your workspace anytime.',
    authPrivacyNote: 'Sign in with your own email. Workspace administration remains locked to the verified owner.',
    onboardingTitle: 'Complete your ReelSync account',
    onboardingSubtitle: 'Confirm your display name and preferred language before entering the studio.',
    onboardingNameLabel: 'Creator / Display Name',
    onboardingNamePlaceholder: 'Enter your name',
    onboardingEmailLabel: 'Verified Email',
    onboardingLangLabel: 'Preferred Language',
    onboardingSubmit: 'Create Account & Open Studio',
    onboardingSaving: 'Creating account...',
    onboardingSwitchAccount: 'Use a different email',

    userWorkspace: 'User Workspace',
    adminOptions: 'Admin Options',
    newReelUpload: 'New Reel Upload',
    newReelShort: 'New Reel',
    navDashboard: 'Dashboard',
    navComposer: 'Upload & Studio',
    navQueue: 'Publishing Queue',
    navAccountsAdmin: 'Connected Accounts',
    navAccountsUser: 'Channel Status',
    navAdminChannels: 'Media Channel URLs',
    navAdminRoles: 'User Roles & Team',
    navAdminSupport: 'WhatsApp & Gmail',
    creatorAccessLabel: 'Standard Creator Account',
    ownerAdminLabel: 'Owner Admin',

    dashControlCenter: 'ReelSync Control Center',
    dashSignedInAs: 'Signed in as',
    dashCreatorWorkspace: 'Creator Workspace',
    dashTitle: 'Workspace Dashboard',
    dashSubtitleAdmin: 'Access creator publishing tools and admin channel controls from one clean workspace.',
    dashSubtitleUser: 'Upload short-form videos, customize platform captions, and track your publishing queue.',
    dashUploadReel: 'Upload Reel',
    dashTotalReels: 'Total Reels',
    dashConnectedChannels: 'Connected Channels',
    dashScheduledQueued: 'Scheduled & Queued',
    dashPublishedDrops: 'Published Drops',
    dashUserOptionsTitle: 'User & Creator Options',
    dashUserOptionsSub: 'Day-to-day video uploading, scheduling, and channel status tools.',
    dashUploadComposeTitle: 'Upload & Compose Reel',
    dashUploadComposeSub: 'Local HTML5 preview, cover scrub, hashtags & platform overrides',
    dashQueueStatusTitle: 'Publishing Queue & Status',
    dashQueueStatusSub: 'Filter Scheduled, Published, or Needs Attention · Retry uploads',
    dashConnectedSocialTitle: 'Connected Social Accounts',
    dashConnectedSocialSub: 'View active channels & API delivery readiness',
    dashCreatorSupport: 'Creator Support:',
    dashChannelsHeading: 'Connected Social Channels',
    dashChannelsHint: 'Click any platform card for quick options',
    dashRecentReelsHeading: 'Recent & Scheduled Reels',
    dashRecentReelsSub: 'Click any reel thumbnail to preview or open in Studio.',
    dashOpenFullQueue: 'Open Full Queue',
    dashAskBotTitle: 'Need Help? Ask the ReelSync Assistant',
    dashAskBotSubtitle: 'Facing an upload, schedule, or setup issue? Chat with the AI troubleshooting bot right here.',
    dashAskBotCta: 'Open Help Chatbot',

    botTitle: 'ReelSync Help Bot',
    botSubtitle: 'Ask any question to solve issues',
    botGreeting:
      'Hi! I am the ReelSync Help Bot. Tell me what issue you are facing (uploading reels, scheduling, channel setup, or account settings) and I will help you fix it step by step.',
    botPlaceholder: 'Describe your problem...',
    botSend: 'Send',
    botThinking: 'Thinking...',
    botClear: 'New Chat',
    botOpenAria: 'Open Help Chatbot',
    botCloseAria: 'Close Help Chatbot',
    botRetry: 'Retry',
    botQuickPrompts: [
      'Why does a channel say Setup Needed?',
      'How do I upload and schedule a Reel?',
      'How do I change language or theme?',
      'How do platform caption overrides work?',
    ],
  },

  'roman-ur': {
    languageLabel: 'Zaban',
    brightTheme: 'Roshan Theme',
    darkTheme: 'Dark Theme',
    brightShort: 'Bright',
    darkShort: 'Dark',
    appearance: 'Look & Theme',
    signOut: 'Sign Out',

    authHeadline: 'Istamal se pehle apna ReelSync account banayein',
    authSubheadline:
      'Apni email se account banayein ya login karein, apni pasandida zaban chunein aur reels upload ya schedule karein.',
    authEmailButton: 'Apni Email (Google) se Account Banayein',
    authConnecting: 'Account jor rahe hain...',
    authStepBadge: 'Step 1 of 2 · Account aur Zaban',
    authBenefit1Title: 'Multi-Platform Video Publishing',
    authBenefit1Desc: 'Ek dafa video upload karein aur TikTok, Instagram Reels, YouTube Shorts par share karein.',
    authBenefit2Title: 'Apni Zaban Chunein',
    authBenefit2Desc: 'Website kholte hi English, Urdu, Roman Urdu, Arabic ya aur zabanein select karein.',
    authBenefit3Title: 'AI Madadgar Chatbot',
    authBenefit3Desc: 'Agar koi masla aye to end par maujood chatbot se pooch kar foran hal karein.',
    authPrivacyNote: 'Apni mail se login karein. Admin control sirf workspace ke owner ke paas mehfooz hai.',
    onboardingTitle: 'Apna ReelSync account mukammal karein',
    onboardingSubtitle: 'Workspace mein dakhil hone se pehle apna naam aur zaban confirm karein.',
    onboardingNameLabel: 'Aapka Naam',
    onboardingNamePlaceholder: 'Apna naam likhein',
    onboardingEmailLabel: 'Aapki Verified Email',
    onboardingLangLabel: 'Pasandida Zaban',
    onboardingSubmit: 'Account Banayein aur Shuru Karein',
    onboardingSaving: 'Account ban raha hai...',
    onboardingSwitchAccount: 'Doosri email istamal karein',

    userWorkspace: 'User Workspace',
    adminOptions: 'Admin Controls',
    newReelUpload: 'Naya Reel Upload Karein',
    newReelShort: 'Naya Reel',
    navDashboard: 'Dashboard',
    navComposer: 'Upload & Studio',
    navQueue: 'Publishing Queue',
    navAccountsAdmin: 'Connected Accounts',
    navAccountsUser: 'Channel Status',
    navAdminChannels: 'Media Channel URLs',
    navAdminRoles: 'User Roles & Team',
    navAdminSupport: 'WhatsApp & Gmail',
    creatorAccessLabel: 'Standard User Account',
    ownerAdminLabel: 'Owner Admin',

    dashControlCenter: 'ReelSync Control Center',
    dashSignedInAs: 'Login naam:',
    dashCreatorWorkspace: 'User Workspace',
    dashTitle: 'Workspace Dashboard',
    dashSubtitleAdmin: 'Creator tools aur admin channel controls ek hi jagah se manage karein.',
    dashSubtitleUser: 'Short videos upload karein, captions likhein aur apni publishing queue dekhein.',
    dashUploadReel: 'Reel Upload Karein',
    dashTotalReels: 'Kul Reels',
    dashConnectedChannels: 'Jure Hue Channels',
    dashScheduledQueued: 'Scheduled aur Queued',
    dashPublishedDrops: 'Published Reels',
    dashUserOptionsTitle: 'User aur Creator Options',
    dashUserOptionsSub: 'Rozana video upload, schedule aur channel status check karne ke tools.',
    dashUploadComposeTitle: 'Reel Upload aur Compose Karein',
    dashUploadComposeSub: 'Local video preview, cover frame, hashtags aur alag captions',
    dashQueueStatusTitle: 'Publishing Queue aur Status',
    dashQueueStatusSub: 'Scheduled ya Published dekhein · Failed uploads dubara try karein',
    dashConnectedSocialTitle: 'Connected Social Channels',
    dashConnectedSocialSub: 'Active channels aur API status dekhein',
    dashCreatorSupport: 'Creator Support:',
    dashChannelsHeading: 'Connected Social Channels',
    dashChannelsHint: 'Quick options dekhne ke liye kisi card par click karein',
    dashRecentReelsHeading: 'Haalia aur Scheduled Reels',
    dashRecentReelsSub: 'Preview ya edit karne ke liye reel par click karein.',
    dashOpenFullQueue: 'Poori Queue Kholein',
    dashAskBotTitle: 'Koi Masla Hai? ReelSync Help Bot se Poochein',
    dashAskBotSubtitle: 'Agar upload, schedule ya account mein koi problem aye to chatbot se pooch kar hal karein.',
    dashAskBotCta: 'Help Chatbot Kholein',

    botTitle: 'ReelSync Madad Bot',
    botSubtitle: 'Koi bhi masla pooch kar hal karein',
    botGreeting:
      'Salam! Main ReelSync Help Bot hoon. Agar aapko video upload, schedule, channel setup ya account mein koi masla aa raha hai to poochein — main step-by-step hal bataunga.',
    botPlaceholder: 'Apna sawal ya masla likhein...',
    botSend: 'Bhejein',
    botThinking: 'Jawab tayar ho raha hai...',
    botClear: 'Nayi Chat',
    botOpenAria: 'Help Chatbot kholein',
    botCloseAria: 'Help Chatbot band karein',
    botRetry: 'Dubara Koshish Karein',
    botQuickPrompts: [
      'Channel par Setup Needed kyun aa raha hai?',
      'Video upload aur schedule kaise karein?',
      'Zaban ya Blue Theme kaise badlein?',
      'Har platform ka alag caption kaise likhein?',
    ],
  },

  ur: {
    languageLabel: 'زبان',
    brightTheme: 'روشن تھیم',
    darkTheme: 'ڈارک تھیم',
    brightShort: 'روشن',
    darkShort: 'ڈارک',
    appearance: 'ظاہری شکل',
    signOut: 'سائن آؤٹ',

    authHeadline: 'استعمال کرنے سے پہلے اپنا ریل سنک اکاؤنٹ بنائیں',
    authSubheadline:
      'اپنی ای میل سے اکاؤنٹ بنائیں یا لاگ ان کریں، اپنی زبان منتخب کریں اور شارٹ ویڈیوز اپ لوڈ اور شیڈول کریں۔',
    authEmailButton: 'اپنی ای میل (Google) کے ساتھ جاری رکھیں',
    authConnecting: 'اکاؤنٹ منسلک ہو رہا ہے...',
    authStepBadge: 'مرحلہ 1 از 2 · اکاؤنٹ اور زبان',
    authBenefit1Title: 'ملٹی پلیٹ فارم پبلشنگ',
    authBenefit1Desc: 'ایک بار اپ لوڈ کریں اور ٹک ٹاک، انسٹاگرام ریلز اور یوٹیوب شارٹس پر شیئر کریں۔',
    authBenefit2Title: 'زبان کا انتخاب',
    authBenefit2Desc: 'انگریزی، اردو، رومن اردو، عربی، ہسپانوی یا فرانسیسی میں سے انتخاب کریں۔',
    authBenefit3Title: 'مددگار اے آئی چیٹ بوٹ',
    authBenefit3Desc: 'کسی بھی مسئلے کی صورت میں صفحے کے آخر میں موجود بوٹ سے فوری مدد حاصل کریں۔',
    authPrivacyNote: 'اپنی ای میل سے لاگ ان کریں۔ ایڈمن کنٹرول صرف ویب سائٹ کے مالک کے پاس محفوظ ہے۔',
    onboardingTitle: 'اپنا ریل سنک اکاؤنٹ مکمل کریں',
    onboardingSubtitle: 'اسٹوڈیو میں داخل ہونے سے پہلے اپنا نام اور پسندیدہ زبان کی تصدیق کریں۔',
    onboardingNameLabel: 'آپ کا نام',
    onboardingNamePlaceholder: 'اپنا نام درج کریں',
    onboardingEmailLabel: 'تصدیق شدہ ای میل',
    onboardingLangLabel: 'پسندیدہ زبان',
    onboardingSubmit: 'اکاؤنٹ بنائیں اور شروع کریں',
    onboardingSaving: 'اکاؤنٹ بن رہا ہے...',
    onboardingSwitchAccount: 'دوسری ای میل استعمال کریں',

    userWorkspace: 'یوزر ورک اسپیس',
    adminOptions: 'ایڈمن اختیارات',
    newReelUpload: 'نئی ریل اپ لوڈ کریں',
    newReelShort: 'نئی ریل',
    navDashboard: 'ڈیش بورڈ',
    navComposer: 'اپ لوڈ اور اسٹوڈیو',
    navQueue: 'پبلشنگ قطار',
    navAccountsAdmin: 'منسلک اکاؤنٹس',
    navAccountsUser: 'چینل اسٹیٹس',
    navAdminChannels: 'چینل یو آر ایل',
    navAdminRoles: 'یوزر رولز اور ٹیم',
    navAdminSupport: 'واٹس ایپ اور جی میل',
    creatorAccessLabel: 'یوزر اکاؤنٹ',
    ownerAdminLabel: 'اونر ایڈمن',

    dashControlCenter: 'ریل سنک کنٹرول سینٹر',
    dashSignedInAs: 'لاگ ان صارف:',
    dashCreatorWorkspace: 'کریئیٹر ورک اسپیس',
    dashTitle: 'ورک اسپیس ڈیش بورڈ',
    dashSubtitleAdmin: 'ایک ہی جگہ سے کریئیٹر ٹولز اور ایڈمن چینل کنٹرولز استعمال کریں۔',
    dashSubtitleUser: 'مختصر ویڈیوز اپ لوڈ کریں، کیپشن لکھیں اور پبلشنگ قطار دیکھیں۔',
    dashUploadReel: 'ریل اپ لوڈ کریں',
    dashTotalReels: 'کل ریلز',
    dashConnectedChannels: 'منسلک چینلز',
    dashScheduledQueued: 'شیڈول شدہ اور قطار میں',
    dashPublishedDrops: 'شائع شدہ ریلز',
    dashUserOptionsTitle: 'صارف اور کریئیٹر کے اختیارات',
    dashUserOptionsSub: 'روزمرہ ویڈیو اپ لوڈنگ، شیڈولنگ اور چینل اسٹیٹس کے ٹولز۔',
    dashUploadComposeTitle: 'ریل اپ لوڈ اور کمپوز کریں',
    dashUploadComposeSub: 'ویڈیو پیش نظارہ، کور فریم، ہیش ٹیگز اور پلیٹ فارم کیپشنز',
    dashQueueStatusTitle: 'پبلشنگ قطار اور اسٹیٹس',
    dashQueueStatusSub: 'شیڈول یا شائع شدہ ویڈیوز دیکھیں اور دوبارہ کوشش کریں',
    dashConnectedSocialTitle: 'منسلک سوشل اکاؤنٹس',
    dashConnectedSocialSub: 'فعال چینلز اور اے پی آئی کی صورتحال دیکھیں',
    dashCreatorSupport: 'سپورٹ رابطہ:',
    dashChannelsHeading: 'منسلک سوشل چینلز',
    dashChannelsHint: 'مزید اختیارات کے لیے کسی بھی کارڈ پر کلک کریں',
    dashRecentReelsHeading: 'حالیہ اور شیڈول ریلز',
    dashRecentReelsSub: 'پیش نظارہ یا ترمیم کے لیے کسی بھی ریل پر کلک کریں۔',
    dashOpenFullQueue: 'مکمل قطار کھولیں',
    dashAskBotTitle: 'کوئی مسئلہ ہے؟ ریل سنک ہیلپ بوٹ سے پوچھیں',
    dashAskBotSubtitle: 'ویڈیو اپ لوڈ، شیڈول یا سیٹ اپ میں مشکل آئے تو اے آئی بوٹ سے فوری حل پائیں۔',
    dashAskBotCta: 'ہیلپ چیٹ بوٹ کھولیں',

    botTitle: 'ریل سنک مددگار بوٹ',
    botSubtitle: 'اپنا مسئلہ پوچھ کر حل کریں',
    botGreeting:
      'السلام علیکم! میں ریل سنک مددگار بوٹ ہوں۔ اگر آپ کو ریل اپ لوڈ کرنے، شیڈول کرنے یا کسی سیٹنگ میں مسئلہ پیش آ رہا ہے تو مجھ سے پوچھیں۔',
    botPlaceholder: 'اپنا سوال یا مسئلہ لکھیں...',
    botSend: 'بھیجیں',
    botThinking: 'جواب تیار ہو رہا ہے...',
    botClear: 'نئی چیٹ',
    botOpenAria: 'مددگار چیٹ بوٹ کھولیں',
    botCloseAria: 'مددگار چیٹ بوٹ بند کریں',
    botRetry: 'دوبارہ کوشش کریں',
    botQuickPrompts: [
      'چینل پر سیٹ اپ ضروری کیوں آ رہا ہے؟',
      'ریل کیسے اپ لوڈ اور شیڈول کریں؟',
      'زبان یا تھیم کیسے تبدیل کریں؟',
      'ہر پلیٹ فارم کا الگ کیپشن کیسے لکھیں؟',
    ],
  },

  ar: {
    languageLabel: 'اللغة',
    brightTheme: 'مظهر مشرق',
    darkTheme: 'مظهر داكن',
    brightShort: 'مشرق',
    darkShort: 'داكن',
    appearance: 'المظهر',
    signOut: 'تسجيل الخروج',

    authHeadline: 'أنشئ حسابك للدخول إلى ReelSync',
    authSubheadline: 'سجّل الدخول ببريدك الإلكتروني، اختر لغتك، وابدأ برفع وجدولة مقاطع الفيديو القصيرة.',
    authEmailButton: 'المتابعة عبر البريد (Google)',
    authConnecting: 'جاري الاتصال بالحساب...',
    authStepBadge: 'الخطوة 1 من 2 · الحساب واللغة',
    authBenefit1Title: 'نشر متعدد المنصات',
    authBenefit1Desc: 'ارفع الفيديو مرة واحدة وانشره على TikTok وInstagram Reels وYouTube Shorts.',
    authBenefit2Title: 'اختر لغتك المفضلة',
    authBenefit2Desc: 'بدّل بسهولة بين الإنجليزية والأردية والعربية والإسبانية والفرنسية.',
    authBenefit3Title: 'مساعد ذكي لحل المشكلات',
    authBenefit3Desc: 'اسأل روبوت المساعدة في أي وقت لحل مشاكل الرفع أو الجدولة فوراً.',
    authPrivacyNote: 'سجّل الدخول ببريدك الخاص. صلاحيات الإدارة محصورة بمالك المساحة فقط.',
    onboardingTitle: 'أكمل إعداد حسابك',
    onboardingSubtitle: 'أكد اسم العرض واللغة المفضلة قبل دخول الاستوديو.',
    onboardingNameLabel: 'اسم العرض',
    onboardingNamePlaceholder: 'أدخل اسمك',
    onboardingEmailLabel: 'البريد الموثق',
    onboardingLangLabel: 'اللغة المفضلة',
    onboardingSubmit: 'إنشاء الحساب والدخول',
    onboardingSaving: 'جاري إنشاء الحساب...',
    onboardingSwitchAccount: 'استخدام بريد آخر',

    userWorkspace: 'مساحة المستخدم',
    adminOptions: 'خيارات المشرف',
    newReelUpload: 'رفع فيديو جديد',
    newReelShort: 'فيديو جديد',
    navDashboard: 'لوحة التحكم',
    navComposer: 'الرفع والاستوديو',
    navQueue: 'قائمة النشر',
    navAccountsAdmin: 'الحسابات المتصلة',
    navAccountsUser: 'حالة القنوات',
    navAdminChannels: 'روابط القنوات',
    navAdminRoles: 'الأدوار والفريق',
    navAdminSupport: 'واتساب وجيميل',
    creatorAccessLabel: 'حساب مستخدم',
    ownerAdminLabel: 'مشرف المالك',

    dashControlCenter: 'مركز تحكم ReelSync',
    dashSignedInAs: 'مسجل باسم',
    dashCreatorWorkspace: 'مساحة المنشئ',
    dashTitle: 'لوحة العمل',
    dashSubtitleAdmin: 'أدوات النشر وإعدادات القنوات من مكان واحد.',
    dashSubtitleUser: 'ارفع المقاطع القصيرة وعدّل النصوص وتابع حالة النشر.',
    dashUploadReel: 'رفع فيديو',
    dashTotalReels: 'إجمالي المقاطع',
    dashConnectedChannels: 'القنوات المتصلة',
    dashScheduledQueued: 'مجدول وقيد الانتظار',
    dashPublishedDrops: 'تم نشره',
    dashUserOptionsTitle: 'خيارات المستخدم والمنشئ',
    dashUserOptionsSub: 'أدوات الرفع اليومي والجدولة وحالة القنوات.',
    dashUploadComposeTitle: 'رفع وتجهيز مقطع',
    dashUploadComposeSub: 'معاينة الفيديو وتحديد الغلاف والوسوم',
    dashQueueStatusTitle: 'قائمة وحالة النشر',
    dashQueueStatusSub: 'متابعة المجدول والمنشور وإعادة المحاولة',
    dashConnectedSocialTitle: 'الحسابات الاجتماعية المتصلة',
    dashConnectedSocialSub: 'عرض حالة القنوات والجاهزية',
    dashCreatorSupport: 'الدعم:',
    dashChannelsHeading: 'القنوات المتصلة',
    dashChannelsHint: 'انقر على أي بطاقة لخيارات سريعة',
    dashRecentReelsHeading: 'أحدث المقاطع والمجدولة',
    dashRecentReelsSub: 'انقر للمعاينة أو التعديل.',
    dashOpenFullQueue: 'فتح القائمة الكاملة',
    dashAskBotTitle: 'هل تواجه مشكلة؟ اسأل مساعد ReelSync',
    dashAskBotSubtitle: 'تحدث مع روبوت المساعدة للحصول على حلول فورية خطوة بخطوة.',
    dashAskBotCta: 'فتح روبوت المساعدة',

    botTitle: 'مساعد ReelSync',
    botSubtitle: 'اسأل لحل أي مشكلة',
    botGreeting: 'مرحباً! أنا مساعد ReelSync الذكي. اكتب المشكلة التي تواجهها وسأساعدك في حلها خطوة بخطوة.',
    botPlaceholder: 'اكتب سؤالك أو مشكلتك...',
    botSend: 'إرسال',
    botThinking: 'جاري التفكير...',
    botClear: 'محادثة جديدة',
    botOpenAria: 'فتح روبوت المساعدة',
    botCloseAria: 'إغلاق روبوت المساعدة',
    botRetry: 'إعادة المحاولة',
    botQuickPrompts: [
      'لماذا تظهر عبارة بحاجة لإعداد؟',
      'كيف أرفع وأجدول فيديو؟',
      'كيف أغير اللغة أو المظهر؟',
      'كيف أخصص النص لكل منصة؟',
    ],
  },

  es: {
    languageLabel: 'Idioma',
    brightTheme: 'Tema Claro',
    darkTheme: 'Tema Oscuro',
    brightShort: 'Claro',
    darkShort: 'Oscuro',
    appearance: 'Apariencia',
    signOut: 'Cerrar sesión',

    authHeadline: 'Crea tu cuenta para usar ReelSync',
    authSubheadline:
      'Regístrate o inicia sesión con tu correo, elige tu idioma y comienza a subir y programar reels.',
    authEmailButton: 'Continuar con tu correo (Google)',
    authConnecting: 'Conectando cuenta...',
    authStepBadge: 'Paso 1 de 2 · Cuenta e Idioma',
    authBenefit1Title: 'Publicación Multiplataforma',
    authBenefit1Desc: 'Sube una vez y distribuye en TikTok, Instagram Reels, YouTube Shorts y Snapchat.',
    authBenefit2Title: 'Estudio Multilingüe',
    authBenefit2Desc: 'Elige Español, Inglés, Urdu, Roman Urdu, Árabe o Francés.',
    authBenefit3Title: 'Chatbot de Ayuda IA',
    authBenefit3Desc: 'Resuelve dudas de subida, programación o canales al instante.',
    authPrivacyNote: 'Inicia sesión con tu propio correo. El panel de administración es exclusivo del propietario.',
    onboardingTitle: 'Completa tu cuenta ReelSync',
    onboardingSubtitle: 'Confirma tu nombre y tu idioma preferido antes de entrar.',
    onboardingNameLabel: 'Nombre para mostrar',
    onboardingNamePlaceholder: 'Tu nombre',
    onboardingEmailLabel: 'Correo verificado',
    onboardingLangLabel: 'Idioma preferido',
    onboardingSubmit: 'Crear cuenta y entrar',
    onboardingSaving: 'Creando cuenta...',
    onboardingSwitchAccount: 'Usar otro correo',

    userWorkspace: 'Espacio de Usuario',
    adminOptions: 'Opciones de Admin',
    newReelUpload: 'Subir Nuevo Reel',
    newReelShort: 'Nuevo Reel',
    navDashboard: 'Panel',
    navComposer: 'Subir y Estudio',
    navQueue: 'Cola de Publicación',
    navAccountsAdmin: 'Cuentas Conectadas',
    navAccountsUser: 'Estado de Canales',
    navAdminChannels: 'URLs de Canales',
    navAdminRoles: 'Roles y Equipo',
    navAdminSupport: 'WhatsApp y Gmail',
    creatorAccessLabel: 'Cuenta de Usuario',
    ownerAdminLabel: 'Admin Propietario',

    dashControlCenter: 'Centro de Control ReelSync',
    dashSignedInAs: 'Conectado como',
    dashCreatorWorkspace: 'Espacio de Creador',
    dashTitle: 'Panel Principal',
    dashSubtitleAdmin: 'Gestiona tus herramientas de creador y controles de administrador.',
    dashSubtitleUser: 'Sube videos cortos, personaliza textos y sigue tu cola de publicación.',
    dashUploadReel: 'Subir Reel',
    dashTotalReels: 'Total de Reels',
    dashConnectedChannels: 'Canales Activos',
    dashScheduledQueued: 'Programados y en Cola',
    dashPublishedDrops: 'Publicados',
    dashUserOptionsTitle: 'Opciones de Usuario y Creador',
    dashUserOptionsSub: 'Herramientas diarias para subir, programar y revisar canales.',
    dashUploadComposeTitle: 'Subir y Editar Reel',
    dashUploadComposeSub: 'Vista previa local, portada, hashtags y textos por plataforma',
    dashQueueStatusTitle: 'Cola y Estado de Publicación',
    dashQueueStatusSub: 'Filtra programados o publicados y reintenta subidas',
    dashConnectedSocialTitle: 'Cuentas Sociales Conectadas',
    dashConnectedSocialSub: 'Consulta canales activos y disponibilidad',
    dashCreatorSupport: 'Soporte:',
    dashChannelsHeading: 'Canales Sociales Conectados',
    dashChannelsHint: 'Haz clic en cualquier tarjeta para opciones rápidas',
    dashRecentReelsHeading: 'Reels Recientes y Programados',
    dashRecentReelsSub: 'Haz clic para previsualizar o editar.',
    dashOpenFullQueue: 'Abrir Cola Completa',
    dashAskBotTitle: '¿Necesitas ayuda? Pregunta al Asistente ReelSync',
    dashAskBotSubtitle: '¿Tienes un problema al subir o programar? Consulta al chatbot de ayuda aquí.',
    dashAskBotCta: 'Abrir Chatbot de Ayuda',

    botTitle: 'Bot de Ayuda ReelSync',
    botSubtitle: 'Pregunta para resolver problemas',
    botGreeting:
      '¡Hola! Soy el Bot de Ayuda de ReelSync. Cuéntame qué problema tienes y te guiaré paso a paso.',
    botPlaceholder: 'Describe tu problema...',
    botSend: 'Enviar',
    botThinking: 'Pensando...',
    botClear: 'Nuevo Chat',
    botOpenAria: 'Abrir Chatbot de Ayuda',
    botCloseAria: 'Cerrar Chatbot de Ayuda',
    botRetry: 'Reintentar',
    botQuickPrompts: [
      '¿Por qué dice Configuración Necesaria?',
      '¿Cómo subo y programo un Reel?',
      '¿Cómo cambio el idioma o el tema?',
      '¿Cómo personalizo los textos por red?',
    ],
  },

  fr: {
    languageLabel: 'Langue',
    brightTheme: 'Thème Clair',
    darkTheme: 'Thème Sombre',
    brightShort: 'Clair',
    darkShort: 'Sombre',
    appearance: 'Apparence',
    signOut: 'Déconnexion',

    authHeadline: 'Créez votre compte pour accéder à ReelSync',
    authSubheadline:
      'Connectez-vous avec votre e-mail, choisissez votre langue et publiez vos vidéos courtes.',
    authEmailButton: 'Continuer avec votre e-mail (Google)',
    authConnecting: 'Connexion en cours...',
    authStepBadge: 'Étape 1 sur 2 · Compte & Langue',
    authBenefit1Title: 'Publication Multi-Plateforme',
    authBenefit1Desc: 'Publiez sur TikTok, Instagram Reels, YouTube Shorts et Snapchat.',
    authBenefit2Title: 'Interface Multilingue',
    authBenefit2Desc: 'Choisissez Français, Anglais, Ourdou, Roman Urdu, Arabe ou Espagnol.',
    authBenefit3Title: 'Chatbot d’Aide IA',
    authBenefit3Desc: 'Posez vos questions en bas de page pour résoudre tout problème rapidement.',
    authPrivacyNote: 'Connectez-vous avec votre e-mail. Les contrôles admin sont réservés au propriétaire.',
    onboardingTitle: 'Finalisez votre compte ReelSync',
    onboardingSubtitle: 'Confirmez votre nom et votre langue avant d’ouvrir le studio.',
    onboardingNameLabel: 'Nom affiché',
    onboardingNamePlaceholder: 'Votre nom',
    onboardingEmailLabel: 'E-mail vérifié',
    onboardingLangLabel: 'Langue préférée',
    onboardingSubmit: 'Créer le compte et entrer',
    onboardingSaving: 'Création du compte...',
    onboardingSwitchAccount: 'Utiliser un autre e-mail',

    userWorkspace: 'Espace Utilisateur',
    adminOptions: 'Options Admin',
    newReelUpload: 'Nouveau Reel',
    newReelShort: 'Nouveau',
    navDashboard: 'Tableau de bord',
    navComposer: 'Import & Studio',
    navQueue: 'File de publication',
    navAccountsAdmin: 'Comptes connectés',
    navAccountsUser: 'État des chaînes',
    navAdminChannels: 'URLs des chaînes',
    navAdminRoles: 'Rôles & Équipe',
    navAdminSupport: 'WhatsApp & Gmail',
    creatorAccessLabel: 'Compte Utilisateur',
    ownerAdminLabel: 'Admin Propriétaire',

    dashControlCenter: 'Centre de Contrôle ReelSync',
    dashSignedInAs: 'Connecté en tant que',
    dashCreatorWorkspace: 'Espace Créateur',
    dashTitle: 'Tableau de bord',
    dashSubtitleAdmin: 'Outils de création et contrôles administrateur réunis.',
    dashSubtitleUser: 'Importez vos vidéos courtes, adaptez vos légendes et suivez la file.',
    dashUploadReel: 'Importer un Reel',
    dashTotalReels: 'Total Reels',
    dashConnectedChannels: 'Chaînes Connectées',
    dashScheduledQueued: 'Planifiés & en file',
    dashPublishedDrops: 'Publiés',
    dashUserOptionsTitle: 'Options Utilisateur & Créateur',
    dashUserOptionsSub: 'Importation, planification et suivi de vos vidéos.',
    dashUploadComposeTitle: 'Importer & Composer un Reel',
    dashUploadComposeSub: 'Aperçu local, miniature, hashtags et légendes personnalisées',
    dashQueueStatusTitle: 'File & Statut de Publication',
    dashQueueStatusSub: 'Filtrer planifiés ou publiés et relancer les envois',
    dashConnectedSocialTitle: 'Comptes Sociaux Connectés',
    dashConnectedSocialSub: 'Voir les chaînes actives et l’état API',
    dashCreatorSupport: 'Support :',
    dashChannelsHeading: 'Chaînes Sociales Connectées',
    dashChannelsHint: 'Cliquez sur une carte pour les options rapides',
    dashRecentReelsHeading: 'Reels Récents & Planifiés',
    dashRecentReelsSub: 'Cliquez pour prévisualiser ou modifier.',
    dashOpenFullQueue: 'Ouvrir toute la file',
    dashAskBotTitle: 'Un problème ? Demandez à l’Assistant ReelSync',
    dashAskBotSubtitle: 'Discutez avec notre chatbot IA pour résoudre vos problèmes étape par étape.',
    dashAskBotCta: 'Ouvrir le Chatbot',

    botTitle: 'Assistant ReelSync',
    botSubtitle: 'Posez une question pour résoudre un problème',
    botGreeting:
      'Bonjour ! Je suis l’assistant ReelSync. Expliquez-moi votre problème et je vous aiderai étape par étape.',
    botPlaceholder: 'Décrivez votre problème...',
    botSend: 'Envoyer',
    botThinking: 'Réflexion...',
    botClear: 'Nouveau Chat',
    botOpenAria: 'Ouvrir le Chatbot',
    botCloseAria: 'Fermer le Chatbot',
    botRetry: 'Réessayer',
    botQuickPrompts: [
      'Pourquoi une chaîne indique Configuration requise ?',
      'Comment importer et planifier un Reel ?',
      'Comment changer la langue ou le thème ?',
      'Comment personnaliser les légendes ?',
    ],
  },
};
