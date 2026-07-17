// CivicAI — UI Translation Dictionary
// Supported languages: English, Hindi, Punjabi, Bengali, Tamil, Telugu, Marathi

export type SupportedLanguage = 'English' | 'Hindi' | 'Punjabi' | 'Bengali' | 'Tamil' | 'Telugu' | 'Marathi';

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  English: {
    // Nav
    'nav.home': 'Home',
    'nav.exams': 'Exams',
    'nav.schemes': 'Schemes',
    'nav.scholarships': 'Scholarships',
    'nav.education': 'Higher Ed',
    'nav.resources': 'Resources',
    'nav.settings': 'Settings',
    'nav.dashboard': 'Dashboard',
    'nav.ask_ai': 'Ask AI',
    'nav.notifications': 'Notifications',

    // Common
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.view_all': 'View All',
    'common.apply_now': 'Apply Now',
    'common.learn_more': 'Learn More',
    'common.back': 'Back',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.success': 'Settings updated successfully!',
    'common.error': 'Something went wrong. Please try again.',

    // Settings
    'settings.title': 'Citizen Settings Desk',
    'settings.subtitle': 'Configure profile criteria matching filters and authentication parameters.',
    'settings.profile': 'Profile Details',
    'settings.password': 'Password & Security',
    'settings.language': 'Language Options',
    'settings.notifications': 'Alert Settings',
    'settings.theme': 'Theme Mode',
    'settings.privacy': 'Privacy Controls',
    'settings.account': 'Account Settings',
    'settings.back_to_dashboard': 'Back to Dashboard',
    'settings.language_title': 'Preferred Portal Language',
    'settings.language_subtitle': 'Configure the portal display text matching regional translations.',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.subtitle': 'Your personalized civic opportunity dashboard',
    'dashboard.saved': 'Saved Items',
    'dashboard.recommended': 'Recommended for You',
    'dashboard.deadlines': 'Upcoming Deadlines',
    'dashboard.profile_strength': 'Profile Strength',
    'dashboard.quick_actions': 'Quick Actions',

    // Pages
    'page.exams.title': 'Government Exams',
    'page.exams.subtitle': 'Explore upcoming government recruitment & competitive examinations',
    'page.schemes.title': 'Government Schemes',
    'page.schemes.subtitle': 'Discover welfare schemes and programs for citizens',
    'page.scholarships.title': 'Scholarships',
    'page.scholarships.subtitle': 'Find scholarships for students across all categories',
    'page.education.title': 'Higher Education',
    'page.education.subtitle': 'Explore colleges, universities, and higher education opportunities',
    'page.resources.title': 'Preparation Resources',
    'page.resources.subtitle': 'Study materials, books, and guides for competitive exams',

    // Home page
    'home.hero.title': "India's AI-Powered Civic Assistant",
    'home.hero.subtitle': 'Discover government exams, schemes, scholarships, and opportunities — all in one place, powered by AI.',
    'home.hero.cta_primary': 'Explore Opportunities',
    'home.hero.cta_secondary': 'Ask AI Assistant',
    'home.featured.title': 'Featured Opportunities',
    'home.featured.subtitle': 'Curated opportunities matching your profile',

    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.name': 'Full Name',

    // Footer
    'footer.tagline': 'AI-powered Government Exam & Student Opportunity Platform.',
    'footer.description': 'Helping students discover government exams, scholarships, welfare schemes, and higher education opportunities through AI.',
    'footer.quick_links': 'Quick Links',
    'footer.resources': 'Resources & Legal',
    'footer.contact': 'Contact & Platform',
    'footer.official_site': 'Official Website',
    'footer.preparation': 'Preparation Resources',
    'footer.rights': 'All rights reserved.',
  },

  Hindi: {
    // Nav
    'nav.home': 'होम',
    'nav.exams': 'परीक्षाएं',
    'nav.schemes': 'योजनाएं',
    'nav.scholarships': 'छात्रवृत्ति',
    'nav.education': 'उच्च शिक्षा',
    'nav.resources': 'संसाधन',
    'nav.settings': 'सेटिंग',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.ask_ai': 'AI से पूछें',
    'nav.notifications': 'सूचनाएं',

    // Common
    'common.save': 'बदलाव सहेजें',
    'common.cancel': 'रद्द करें',
    'common.loading': 'लोड हो रहा है...',
    'common.search': 'खोजें',
    'common.view_all': 'सभी देखें',
    'common.apply_now': 'अभी आवेदन करें',
    'common.learn_more': 'अधिक जानें',
    'common.back': 'वापस',
    'common.close': 'बंद करें',
    'common.submit': 'जमा करें',
    'common.success': 'सेटिंग सफलतापूर्वक अपडेट की गई!',
    'common.error': 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',

    // Settings
    'settings.title': 'नागरिक सेटिंग डेस्क',
    'settings.subtitle': 'प्रोफ़ाइल मानदंड मिलान फ़िल्टर और प्रमाणीकरण पैरामीटर कॉन्फ़िगर करें।',
    'settings.profile': 'प्रोफ़ाइल विवरण',
    'settings.password': 'पासवर्ड और सुरक्षा',
    'settings.language': 'भाषा विकल्प',
    'settings.notifications': 'अलर्ट सेटिंग',
    'settings.theme': 'थीम मोड',
    'settings.privacy': 'गोपनीयता नियंत्रण',
    'settings.account': 'खाता सेटिंग',
    'settings.back_to_dashboard': 'डैशबोर्ड पर वापस जाएं',
    'settings.language_title': 'पसंदीदा पोर्टल भाषा',
    'settings.language_subtitle': 'क्षेत्रीय अनुवादों से मेल खाने वाले पोर्टल प्रदर्शन पाठ को कॉन्फ़िगर करें।',

    // Dashboard
    'dashboard.welcome': 'वापस आपका स्वागत है',
    'dashboard.subtitle': 'आपका व्यक्तिगत नागरिक अवसर डैशबोर्ड',
    'dashboard.saved': 'सहेजे गए आइटम',
    'dashboard.recommended': 'आपके लिए अनुशंसित',
    'dashboard.deadlines': 'आगामी समय-सीमाएं',
    'dashboard.profile_strength': 'प्रोफ़ाइल मज़बूती',
    'dashboard.quick_actions': 'त्वरित कार्य',

    // Pages
    'page.exams.title': 'सरकारी परीक्षाएं',
    'page.exams.subtitle': 'आगामी सरकारी भर्ती और प्रतियोगी परीक्षाएं देखें',
    'page.schemes.title': 'सरकारी योजनाएं',
    'page.schemes.subtitle': 'नागरिकों के लिए कल्याण योजनाएं और कार्यक्रम खोजें',
    'page.scholarships.title': 'छात्रवृत्ति',
    'page.scholarships.subtitle': 'सभी वर्गों के छात्रों के लिए छात्रवृत्ति खोजें',
    'page.education.title': 'उच्च शिक्षा',
    'page.education.subtitle': 'कॉलेज, विश्वविद्यालय और उच्च शिक्षा के अवसर देखें',
    'page.resources.title': 'तैयारी संसाधन',
    'page.resources.subtitle': 'प्रतियोगी परीक्षाओं के लिए अध्ययन सामग्री और मार्गदर्शिकाएं',

    // Home page
    'home.hero.title': 'भारत का AI-संचालित नागरिक सहायक',
    'home.hero.subtitle': 'सरकारी परीक्षाएं, योजनाएं, छात्रवृत्ति और अवसर — सब एक जगह, AI द्वारा संचालित।',
    'home.hero.cta_primary': 'अवसर देखें',
    'home.hero.cta_secondary': 'AI से पूछें',
    'home.featured.title': 'विशेष अवसर',
    'home.featured.subtitle': 'आपकी प्रोफ़ाइल से मेल खाते क्यूरेटेड अवसर',

    // Auth
    'auth.login': 'लॉगिन',
    'auth.signup': 'साइन अप',
    'auth.logout': 'लॉगआउट',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.name': 'पूरा नाम',

    // Footer
    'footer.tagline': 'AI-संचालित सरकारी परीक्षा और छात्र अवसर प्लेटफ़ॉर्म।',
    'footer.description': 'AI के माध्यम से छात्रों को सरकारी परीक्षाएं, छात्रवृत्ति, कल्याण योजनाएं और उच्च शिक्षा अवसर खोजने में मदद करना।',
    'footer.quick_links': 'त्वरित लिंक',
    'footer.resources': 'संसाधन और कानूनी',
    'footer.contact': 'संपर्क और प्लेटफ़ॉर्म',
    'footer.official_site': 'आधिकारिक वेबसाइट',
    'footer.preparation': 'तैयारी संसाधन',
    'footer.rights': 'सर्वाधिकार सुरक्षित।',
  },

  Punjabi: {
    // Nav
    'nav.home': 'ਮੁੱਖ ਪੰਨਾ',
    'nav.exams': 'ਪ੍ਰੀਖਿਆਵਾਂ',
    'nav.schemes': 'ਯੋਜਨਾਵਾਂ',
    'nav.scholarships': 'ਵਜ਼ੀਫੇ',
    'nav.education': 'ਉੱਚ ਸਿੱਖਿਆ',
    'nav.resources': 'ਸਰੋਤ',
    'nav.settings': 'ਸੈਟਿੰਗਾਂ',
    'nav.dashboard': 'ਡੈਸ਼ਬੋਰਡ',
    'nav.ask_ai': 'AI ਤੋਂ ਪੁੱਛੋ',
    'nav.notifications': 'ਸੂਚਨਾਵਾਂ',

    // Common
    'common.save': 'ਬਦਲਾਅ ਸੁਰੱਖਿਅਤ ਕਰੋ',
    'common.cancel': 'ਰੱਦ ਕਰੋ',
    'common.loading': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    'common.search': 'ਖੋਜੋ',
    'common.view_all': 'ਸਭ ਦੇਖੋ',
    'common.apply_now': 'ਹੁਣ ਅਪਲਾਈ ਕਰੋ',
    'common.learn_more': 'ਹੋਰ ਜਾਣੋ',
    'common.back': 'ਵਾਪਸ',
    'common.close': 'ਬੰਦ ਕਰੋ',
    'common.submit': 'ਜਮ੍ਹਾਂ ਕਰੋ',
    'common.success': 'ਸੈਟਿੰਗਾਂ ਸਫਲਤਾਪੂਰਵਕ ਅਪਡੇਟ ਹੋਈਆਂ!',
    'common.error': 'ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',

    // Settings
    'settings.title': 'ਨਾਗਰਿਕ ਸੈਟਿੰਗ ਡੈਸਕ',
    'settings.subtitle': 'ਪ੍ਰੋਫਾਈਲ ਮਾਪਦੰਡ ਮਿਲਾਨ ਫਿਲਟਰ ਅਤੇ ਪ੍ਰਮਾਣੀਕਰਨ ਪੈਰਾਮੀਟਰ ਕਨਫਿਗਰ ਕਰੋ।',
    'settings.profile': 'ਪ੍ਰੋਫਾਈਲ ਵੇਰਵੇ',
    'settings.password': 'ਪਾਸਵਰਡ ਅਤੇ ਸੁਰੱਖਿਆ',
    'settings.language': 'ਭਾਸ਼ਾ ਵਿਕਲਪ',
    'settings.notifications': 'ਅਲਰਟ ਸੈਟਿੰਗਾਂ',
    'settings.theme': 'ਥੀਮ ਮੋਡ',
    'settings.privacy': 'ਗੋਪਨੀਯਤਾ ਨਿਯੰਤਰਣ',
    'settings.account': 'ਖਾਤਾ ਸੈਟਿੰਗਾਂ',
    'settings.back_to_dashboard': 'ਡੈਸ਼ਬੋਰਡ ਤੇ ਵਾਪਸ ਜਾਓ',
    'settings.language_title': 'ਪਸੰਦੀਦਾ ਪੋਰਟਲ ਭਾਸ਼ਾ',
    'settings.language_subtitle': 'ਖੇਤਰੀ ਅਨੁਵਾਦਾਂ ਨਾਲ ਮੇਲ ਖਾਂਦੇ ਪੋਰਟਲ ਡਿਸਪਲੇ ਟੈਕਸਟ ਨੂੰ ਕਨਫਿਗਰ ਕਰੋ।',

    // Dashboard
    'dashboard.welcome': 'ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ',
    'dashboard.subtitle': 'ਤੁਹਾਡਾ ਨਿੱਜੀ ਨਾਗਰਿਕ ਮੌਕਾ ਡੈਸ਼ਬੋਰਡ',
    'dashboard.saved': 'ਸੁਰੱਖਿਅਤ ਆਈਟਮਾਂ',
    'dashboard.recommended': 'ਤੁਹਾਡੇ ਲਈ ਸਿਫਾਰਿਸ਼',
    'dashboard.deadlines': 'ਆਉਣ ਵਾਲੀਆਂ ਅੰਤਿਮ ਤਾਰੀਖਾਂ',
    'dashboard.profile_strength': 'ਪ੍ਰੋਫਾਈਲ ਮਜ਼ਬੂਤੀ',
    'dashboard.quick_actions': 'ਤੇਜ਼ ਕਾਰਵਾਈਆਂ',

    // Pages
    'page.exams.title': 'ਸਰਕਾਰੀ ਪ੍ਰੀਖਿਆਵਾਂ',
    'page.exams.subtitle': 'ਆਉਣ ਵਾਲੀਆਂ ਸਰਕਾਰੀ ਭਰਤੀ ਅਤੇ ਪ੍ਰਤੀਯੋਗੀ ਪ੍ਰੀਖਿਆਵਾਂ ਦੇਖੋ',
    'page.schemes.title': 'ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ',
    'page.schemes.subtitle': 'ਨਾਗਰਿਕਾਂ ਲਈ ਭਲਾਈ ਯੋਜਨਾਵਾਂ ਅਤੇ ਪ੍ਰੋਗਰਾਮ ਲੱਭੋ',
    'page.scholarships.title': 'ਵਜ਼ੀਫੇ',
    'page.scholarships.subtitle': 'ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ ਦੇ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਵਜ਼ੀਫੇ ਲੱਭੋ',
    'page.education.title': 'ਉੱਚ ਸਿੱਖਿਆ',
    'page.education.subtitle': 'ਕਾਲਜ, ਯੂਨੀਵਰਸਿਟੀਆਂ ਅਤੇ ਉੱਚ ਸਿੱਖਿਆ ਦੇ ਮੌਕੇ ਦੇਖੋ',
    'page.resources.title': 'ਤਿਆਰੀ ਸਰੋਤ',
    'page.resources.subtitle': 'ਪ੍ਰਤੀਯੋਗੀ ਪ੍ਰੀਖਿਆਵਾਂ ਲਈ ਅਧਿਐਨ ਸਮੱਗਰੀ ਅਤੇ ਗਾਈਡਾਂ',

    // Home
    'home.hero.title': 'ਭਾਰਤ ਦਾ AI-ਸੰਚਾਲਿਤ ਨਾਗਰਿਕ ਸਹਾਇਕ',
    'home.hero.subtitle': 'ਸਰਕਾਰੀ ਪ੍ਰੀਖਿਆਵਾਂ, ਯੋਜਨਾਵਾਂ, ਵਜ਼ੀਫੇ ਅਤੇ ਮੌਕੇ — ਸਭ ਇੱਕ ਥਾਂ, AI ਦੁਆਰਾ ਸੰਚਾਲਿਤ।',
    'home.hero.cta_primary': 'ਮੌਕੇ ਦੇਖੋ',
    'home.hero.cta_secondary': 'AI ਤੋਂ ਪੁੱਛੋ',
    'home.featured.title': 'ਵਿਸ਼ੇਸ਼ ਮੌਕੇ',
    'home.featured.subtitle': 'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਨਾਲ ਮੇਲ ਖਾਂਦੇ ਕਿਉਰੇਟਿਡ ਮੌਕੇ',

    // Auth
    'auth.login': 'ਲੌਗਿਨ',
    'auth.signup': 'ਸਾਈਨ ਅੱਪ',
    'auth.logout': 'ਲੌਗਆਉਟ',
    'auth.email': 'ਈਮੇਲ ਪਤਾ',
    'auth.password': 'ਪਾਸਵਰਡ',
    'auth.name': 'ਪੂਰਾ ਨਾਮ',

    // Footer
    'footer.tagline': 'AI-ਸੰਚਾਲਿਤ ਸਰਕਾਰੀ ਪ੍ਰੀਖਿਆ ਅਤੇ ਵਿਦਿਆਰਥੀ ਮੌਕਾ ਪਲੇਟਫਾਰਮ।',
    'footer.description': 'AI ਰਾਹੀਂ ਵਿਦਿਆਰਥੀਆਂ ਨੂੰ ਸਰਕਾਰੀ ਪ੍ਰੀਖਿਆਵਾਂ, ਵਜ਼ੀਫੇ, ਭਲਾਈ ਯੋਜਨਾਵਾਂ ਅਤੇ ਉੱਚ ਸਿੱਖਿਆ ਦੇ ਮੌਕੇ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰਨਾ।',
    'footer.quick_links': 'ਤੇਜ਼ ਲਿੰਕ',
    'footer.resources': 'ਸਰੋਤ ਅਤੇ ਕਾਨੂੰਨੀ',
    'footer.contact': 'ਸੰਪਰਕ ਅਤੇ ਪਲੇਟਫਾਰਮ',
    'footer.official_site': 'ਅਧਿਕਾਰਤ ਵੈੱਬਸਾਈਟ',
    'footer.preparation': 'ਤਿਆਰੀ ਸਰੋਤ',
    'footer.rights': 'ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।',
  },

  Bengali: {
    // Nav
    'nav.home': 'হোম',
    'nav.exams': 'পরীক্ষা',
    'nav.schemes': 'প্রকল্প',
    'nav.scholarships': 'বৃত্তি',
    'nav.education': 'উচ্চ শিক্ষা',
    'nav.resources': 'সম্পদ',
    'nav.settings': 'সেটিংস',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.ask_ai': 'AI কে জিজ্ঞেস করুন',
    'nav.notifications': 'বিজ্ঞপ্তি',

    // Common
    'common.save': 'পরিবর্তন সংরক্ষণ করুন',
    'common.cancel': 'বাতিল করুন',
    'common.loading': 'লোড হচ্ছে...',
    'common.search': 'অনুসন্ধান করুন',
    'common.view_all': 'সব দেখুন',
    'common.apply_now': 'এখনই আবেদন করুন',
    'common.learn_more': 'আরও জানুন',
    'common.back': 'ফিরে যান',
    'common.close': 'বন্ধ করুন',
    'common.submit': 'জমা দিন',
    'common.success': 'সেটিংস সফলভাবে আপডেট হয়েছে!',
    'common.error': 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।',

    // Settings
    'settings.title': 'নাগরিক সেটিংস ডেস্ক',
    'settings.subtitle': 'প্রোফাইল মানদণ্ড ম্যাচিং ফিল্টার এবং প্রমাণীকরণ প্যারামিটার কনফিগার করুন।',
    'settings.profile': 'প্রোফাইল বিবরণ',
    'settings.password': 'পাসওয়ার্ড ও নিরাপত্তা',
    'settings.language': 'ভাষা বিকল্প',
    'settings.notifications': 'সতর্কতা সেটিংস',
    'settings.theme': 'থিম মোড',
    'settings.privacy': 'গোপনীয়তা নিয়ন্ত্রণ',
    'settings.account': 'অ্যাকাউন্ট সেটিংস',
    'settings.back_to_dashboard': 'ড্যাশবোর্ডে ফিরে যান',
    'settings.language_title': 'পছন্দের পোর্টাল ভাষা',
    'settings.language_subtitle': 'আঞ্চলিক অনুবাদের সাথে মেলে পোর্টাল ডিসপ্লে টেক্সট কনফিগার করুন।',

    // Dashboard
    'dashboard.welcome': 'আবার স্বাগতম',
    'dashboard.subtitle': 'আপনার ব্যক্তিগতকৃত নাগরিক সুযোগ ড্যাশবোর্ড',
    'dashboard.saved': 'সংরক্ষিত আইটেম',
    'dashboard.recommended': 'আপনার জন্য সুপারিশ',
    'dashboard.deadlines': 'আসন্ন সময়সীমা',
    'dashboard.profile_strength': 'প্রোফাইল শক্তি',
    'dashboard.quick_actions': 'দ্রুত কার্যক্রম',

    // Pages
    'page.exams.title': 'সরকারি পরীক্ষা',
    'page.exams.subtitle': 'আসন্ন সরকারি নিয়োগ ও প্রতিযোগিতামূলক পরীক্ষা দেখুন',
    'page.schemes.title': 'সরকারি প্রকল্প',
    'page.schemes.subtitle': 'নাগরিকদের জন্য কল্যাণ প্রকল্প এবং কার্যক্রম আবিষ্কার করুন',
    'page.scholarships.title': 'বৃত্তি',
    'page.scholarships.subtitle': 'সকল বিভাগের শিক্ষার্থীদের জন্য বৃত্তি খুঁজুন',
    'page.education.title': 'উচ্চ শিক্ষা',
    'page.education.subtitle': 'কলেজ, বিশ্ববিদ্যালয় এবং উচ্চশিক্ষার সুযোগ অন্বেষণ করুন',
    'page.resources.title': 'প্রস্তুতি সম্পদ',
    'page.resources.subtitle': 'প্রতিযোগিতামূলক পরীক্ষার জন্য অধ্যয়ন সামগ্রী এবং নির্দেশিকা',

    // Home
    'home.hero.title': 'ভারতের AI-চালিত নাগরিক সহকারী',
    'home.hero.subtitle': 'সরকারি পরীক্ষা, প্রকল্প, বৃত্তি এবং সুযোগ — সব একজায়গায়, AI দ্বারা চালিত।',
    'home.hero.cta_primary': 'সুযোগ দেখুন',
    'home.hero.cta_secondary': 'AI কে জিজ্ঞেস করুন',
    'home.featured.title': 'বিশেষ সুযোগ',
    'home.featured.subtitle': 'আপনার প্রোফাইলের সাথে মেলে কিউরেটেড সুযোগ',

    // Auth
    'auth.login': 'লগইন',
    'auth.signup': 'সাইন আপ',
    'auth.logout': 'লগআউট',
    'auth.email': 'ইমেইল ঠিকানা',
    'auth.password': 'পাসওয়ার্ড',
    'auth.name': 'পূর্ণ নাম',

    // Footer
    'footer.tagline': 'AI-চালিত সরকারি পরীক্ষা ও ছাত্র সুযোগ প্ল্যাটফর্ম।',
    'footer.description': 'AI এর মাধ্যমে শিক্ষার্থীদের সরকারি পরীক্ষা, বৃত্তি, কল্যাণ প্রকল্প এবং উচ্চশিক্ষার সুযোগ খুঁজে পেতে সাহায্য করা।',
    'footer.quick_links': 'দ্রুত লিঙ্ক',
    'footer.resources': 'সম্পদ ও আইনি',
    'footer.contact': 'যোগাযোগ ও প্ল্যাটফর্ম',
    'footer.official_site': 'অফিসিয়াল ওয়েবসাইট',
    'footer.preparation': 'প্রস্তুতি সম্পদ',
    'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।',
  },

  Tamil: {
    // Nav
    'nav.home': 'முகப்பு',
    'nav.exams': 'தேர்வுகள்',
    'nav.schemes': 'திட்டங்கள்',
    'nav.scholarships': 'உதவித்தொகை',
    'nav.education': 'உயர் கல்வி',
    'nav.resources': 'வளங்கள்',
    'nav.settings': 'அமைப்புகள்',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.ask_ai': 'AI கேளுங்கள்',
    'nav.notifications': 'அறிவிப்புகள்',

    // Common
    'common.save': 'மாற்றங்களை சேமி',
    'common.cancel': 'ரத்து செய்',
    'common.loading': 'ஏற்றுகிறது...',
    'common.search': 'தேடு',
    'common.view_all': 'அனைத்தும் பார்',
    'common.apply_now': 'இப்போது விண்ணப்பி',
    'common.learn_more': 'மேலும் அறி',
    'common.back': 'திரும்பு',
    'common.close': 'மூடு',
    'common.submit': 'சமர்ப்பி',
    'common.success': 'அமைப்புகள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!',
    'common.error': 'ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.',

    // Settings
    'settings.title': 'குடிமக்கள் அமைப்புகள் மேசை',
    'settings.subtitle': 'சுயவிவர அளவுகோல் பொருத்தும் வடிப்பான்கள் மற்றும் அங்கீகார அளவுருக்களை உள்ளமை.',
    'settings.profile': 'சுயவிவர விவரங்கள்',
    'settings.password': 'கடவுச்சொல் மற்றும் பாதுகாப்பு',
    'settings.language': 'மொழி விருப்பங்கள்',
    'settings.notifications': 'எச்சரிக்கை அமைப்புகள்',
    'settings.theme': 'தீம் முறை',
    'settings.privacy': 'தனியுரிமை கட்டுப்பாடுகள்',
    'settings.account': 'கணக்கு அமைப்புகள்',
    'settings.back_to_dashboard': 'டாஷ்போர்டுக்கு திரும்பு',
    'settings.language_title': 'விருப்பமான போர்டல் மொழி',
    'settings.language_subtitle': 'பிராந்திய மொழிபெயர்ப்புகளுக்கு ஏற்ப போர்டல் காட்சி உரையை உள்ளமை.',

    // Dashboard
    'dashboard.welcome': 'மீண்டும் வரவேற்கிறோம்',
    'dashboard.subtitle': 'உங்கள் தனிப்பயனாக்கப்பட்ட குடிமக்கள் வாய்ப்பு டாஷ்போர்டு',
    'dashboard.saved': 'சேமித்த உருப்படிகள்',
    'dashboard.recommended': 'உங்களுக்கு பரிந்துரைக்கப்பட்டது',
    'dashboard.deadlines': 'வரவிருக்கும் காலக்கெடுக்கள்',
    'dashboard.profile_strength': 'சுயவிவர வலிமை',
    'dashboard.quick_actions': 'விரைவு செயல்கள்',

    // Pages
    'page.exams.title': 'அரசு தேர்வுகள்',
    'page.exams.subtitle': 'வரவிருக்கும் அரசு ஆட்சேர்ப்பு மற்றும் போட்டி தேர்வுகளை ஆராயுங்கள்',
    'page.schemes.title': 'அரசு திட்டங்கள்',
    'page.schemes.subtitle': 'குடிமக்களுக்கான நல திட்டங்கள் மற்றும் நிகழ்ச்சிகளை கண்டறியுங்கள்',
    'page.scholarships.title': 'உதவித்தொகை',
    'page.scholarships.subtitle': 'அனைத்து வகையான மாணவர்களுக்கும் உதவித்தொகை கண்டறியுங்கள்',
    'page.education.title': 'உயர் கல்வி',
    'page.education.subtitle': 'கல்லூரிகள், பல்கலைக்கழகங்கள் மற்றும் உயர் கல்வி வாய்ப்புகளை ஆராயுங்கள்',
    'page.resources.title': 'தயாரிப்பு வளங்கள்',
    'page.resources.subtitle': 'போட்டி தேர்வுகளுக்கான படிப்பு பொருட்கள் மற்றும் வழிகாட்டிகள்',

    // Home
    'home.hero.title': 'இந்தியாவின் AI-இயங்கும் குடிமக்கள் உதவியாளர்',
    'home.hero.subtitle': 'அரசு தேர்வுகள், திட்டங்கள், உதவித்தொகை மற்றும் வாய்ப்புகள் — எல்லாம் ஒரே இடத்தில், AI இயங்கும்.',
    'home.hero.cta_primary': 'வாய்ப்புகளை ஆராயுங்கள்',
    'home.hero.cta_secondary': 'AI உதவியாளரை கேளுங்கள்',
    'home.featured.title': 'சிறப்பு வாய்ப்புகள்',
    'home.featured.subtitle': 'உங்கள் சுயவிவரத்துடன் பொருந்தும் தொகுக்கப்பட்ட வாய்ப்புகள்',

    // Auth
    'auth.login': 'உள்நுழை',
    'auth.signup': 'பதிவு செய்',
    'auth.logout': 'வெளியேறு',
    'auth.email': 'மின்னஞ்சல் முகவரி',
    'auth.password': 'கடவுச்சொல்',
    'auth.name': 'முழு பெயர்',

    // Footer
    'footer.tagline': 'AI-இயங்கும் அரசு தேர்வு மற்றும் மாணவர் வாய்ப்பு தளம்.',
    'footer.description': 'AI மூலம் மாணவர்களுக்கு அரசு தேர்வுகள், உதவித்தொகை, நல திட்டங்கள் மற்றும் உயர் கல்வி வாய்ப்புகளை கண்டறிய உதவுதல்.',
    'footer.quick_links': 'விரைவு இணைப்புகள்',
    'footer.resources': 'வளங்கள் மற்றும் சட்டம்',
    'footer.contact': 'தொடர்பு மற்றும் தளம்',
    'footer.official_site': 'அதிகாரப்பூர்வ வலைத்தளம்',
    'footer.preparation': 'தயாரிப்பு வளங்கள்',
    'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  },

  Telugu: {
    // Nav
    'nav.home': 'హోమ్',
    'nav.exams': 'పరీక్షలు',
    'nav.schemes': 'పథకాలు',
    'nav.scholarships': 'స్కాలర్‌షిప్‌లు',
    'nav.education': 'ఉన్నత విద్య',
    'nav.resources': 'వనరులు',
    'nav.settings': 'సెట్టింగులు',
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.ask_ai': 'AI ని అడగండి',
    'nav.notifications': 'నోటిఫికేషన్లు',

    // Common
    'common.save': 'మార్పులు సేవ్ చేయండి',
    'common.cancel': 'రద్దు చేయండి',
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.search': 'శోధించండి',
    'common.view_all': 'అన్నీ చూడండి',
    'common.apply_now': 'ఇప్పుడు దరఖాస్తు చేయండి',
    'common.learn_more': 'మరింత తెలుసుకోండి',
    'common.back': 'వెనుకకు',
    'common.close': 'మూసివేయండి',
    'common.submit': 'సమర్పించండి',
    'common.success': 'సెట్టింగులు విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి!',
    'common.error': 'ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',

    // Settings
    'settings.title': 'పౌర సెట్టింగులు డెస్క్',
    'settings.subtitle': 'ప్రొఫైల్ ప్రమాణాల సరిపోలిక ఫిల్టర్లు మరియు ప్రమాణీకరణ పారామీటర్లను కాన్ఫిగర్ చేయండి.',
    'settings.profile': 'ప్రొఫైల్ వివరాలు',
    'settings.password': 'పాస్‌వర్డ్ మరియు భద్రత',
    'settings.language': 'భాషా ఎంపికలు',
    'settings.notifications': 'హెచ్చరిక సెట్టింగులు',
    'settings.theme': 'థీమ్ మోడ్',
    'settings.privacy': 'గోప్యతా నియంత్రణలు',
    'settings.account': 'ఖాతా సెట్టింగులు',
    'settings.back_to_dashboard': 'డాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి',
    'settings.language_title': 'ఇష్టమైన పోర్టల్ భాష',
    'settings.language_subtitle': 'ప్రాంతీయ అనువాదాలతో సరిపోయే పోర్టల్ ప్రదర్శన టెక్స్ట్‌ను కాన్ఫిగర్ చేయండి.',

    // Dashboard
    'dashboard.welcome': 'తిరిగి స్వాగతం',
    'dashboard.subtitle': 'మీ వ్యక్తిగతీకరించిన పౌర అవకాశ డాష్‌బోర్డ్',
    'dashboard.saved': 'సేవ్ చేసిన అంశాలు',
    'dashboard.recommended': 'మీకు సిఫారసు చేయబడింది',
    'dashboard.deadlines': 'రాబోయే గడువు తేదీలు',
    'dashboard.profile_strength': 'ప్రొఫైల్ బలం',
    'dashboard.quick_actions': 'త్వరిత చర్యలు',

    // Pages
    'page.exams.title': 'ప్రభుత్వ పరీక్షలు',
    'page.exams.subtitle': 'రాబోయే ప్రభుత్వ నియామకం మరియు పోటీ పరీక్షలను అన్వేషించండి',
    'page.schemes.title': 'ప్రభుత్వ పథకాలు',
    'page.schemes.subtitle': 'పౌరులకు సంక్షేమ పథకాలు మరియు కార్యక్రమాలు కనుగొనండి',
    'page.scholarships.title': 'స్కాలర్‌షిప్‌లు',
    'page.scholarships.subtitle': 'అన్ని వర్గాల విద్యార్థులకు స్కాలర్‌షిప్‌లు కనుగొనండి',
    'page.education.title': 'ఉన్నత విద్య',
    'page.education.subtitle': 'కళాశాలలు, విశ్వవిద్యాలయాలు మరియు ఉన్నత విద్యా అవకాశాలను అన్వేషించండి',
    'page.resources.title': 'తయారీ వనరులు',
    'page.resources.subtitle': 'పోటీ పరీక్షలకు అధ్యయన సామగ్రి మరియు మార్గదర్శకాలు',

    // Home
    'home.hero.title': 'భారతదేశపు AI-ఆధారిత పౌర సహాయకుడు',
    'home.hero.subtitle': 'ప్రభుత్వ పరీక్షలు, పథకాలు, స్కాలర్‌షిప్‌లు మరియు అవకాశాలు — అన్నీ ఒకే చోట, AI ద్వారా.',
    'home.hero.cta_primary': 'అవకాశాలను అన్వేషించండి',
    'home.hero.cta_secondary': 'AI సహాయకుడిని అడగండి',
    'home.featured.title': 'ప్రత్యేక అవకాశాలు',
    'home.featured.subtitle': 'మీ ప్రొఫైల్‌కు సరిపోయే క్యూరేటెడ్ అవకాశాలు',

    // Auth
    'auth.login': 'లాగిన్',
    'auth.signup': 'సైన్ అప్',
    'auth.logout': 'లాగ్‌అవుట్',
    'auth.email': 'ఇమెయిల్ చిరునామా',
    'auth.password': 'పాస్‌వర్డ్',
    'auth.name': 'పూర్తి పేరు',

    // Footer
    'footer.tagline': 'AI-ఆధారిత ప్రభుత్వ పరీక్ష మరియు విద్యార్థి అవకాశ వేదిక.',
    'footer.description': 'AI ద్వారా విద్యార్థులకు ప్రభుత్వ పరీక్షలు, స్కాలర్‌షిప్‌లు, సంక్షేమ పథకాలు మరియు ఉన్నత విద్యా అవకాశాలు కనుగొనడంలో సహాయపడటం.',
    'footer.quick_links': 'త్వరిత లింకులు',
    'footer.resources': 'వనరులు మరియు చట్టపరమైన',
    'footer.contact': 'సంప్రదింపు మరియు వేదిక',
    'footer.official_site': 'అధికారిక వెబ్‌సైట్',
    'footer.preparation': 'తయారీ వనరులు',
    'footer.rights': 'అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.',
  },

  Marathi: {
    // Nav
    'nav.home': 'मुखपृष्ठ',
    'nav.exams': 'परीक्षा',
    'nav.schemes': 'योजना',
    'nav.scholarships': 'शिष्यवृत्ती',
    'nav.education': 'उच्च शिक्षण',
    'nav.resources': 'संसाधने',
    'nav.settings': 'सेटिंग्ज',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.ask_ai': 'AI ला विचारा',
    'nav.notifications': 'सूचना',

    // Common
    'common.save': 'बदल जतन करा',
    'common.cancel': 'रद्द करा',
    'common.loading': 'लोड होत आहे...',
    'common.search': 'शोधा',
    'common.view_all': 'सर्व पहा',
    'common.apply_now': 'आता अर्ज करा',
    'common.learn_more': 'अधिक जाणून घ्या',
    'common.back': 'मागे',
    'common.close': 'बंद करा',
    'common.submit': 'सादर करा',
    'common.success': 'सेटिंग्ज यशस्वीपणे अपडेट केल्या!',
    'common.error': 'काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.',

    // Settings
    'settings.title': 'नागरिक सेटिंग्ज डेस्क',
    'settings.subtitle': 'प्रोफाइल निकष जुळणी फिल्टर आणि प्रमाणीकरण पॅरामीटर्स कॉन्फिगर करा.',
    'settings.profile': 'प्रोफाइल तपशील',
    'settings.password': 'पासवर्ड आणि सुरक्षा',
    'settings.language': 'भाषा पर्याय',
    'settings.notifications': 'सतर्कता सेटिंग्ज',
    'settings.theme': 'थीम मोड',
    'settings.privacy': 'गोपनीयता नियंत्रणे',
    'settings.account': 'खाते सेटिंग्ज',
    'settings.back_to_dashboard': 'डॅशबोर्डवर परत जा',
    'settings.language_title': 'पसंतीची पोर्टल भाषा',
    'settings.language_subtitle': 'प्रादेशिक भाषांतरांशी जुळणारा पोर्टल प्रदर्शन मजकूर कॉन्फिगर करा.',

    // Dashboard
    'dashboard.welcome': 'पुन्हा स्वागत आहे',
    'dashboard.subtitle': 'तुमचा वैयक्तिकृत नागरिक संधी डॅशबोर्ड',
    'dashboard.saved': 'जतन केलेल्या वस्तू',
    'dashboard.recommended': 'तुमच्यासाठी शिफारस',
    'dashboard.deadlines': 'आगामी अंतिम मुदती',
    'dashboard.profile_strength': 'प्रोफाइल ताकद',
    'dashboard.quick_actions': 'त्वरित क्रिया',

    // Pages
    'page.exams.title': 'सरकारी परीक्षा',
    'page.exams.subtitle': 'आगामी सरकारी भरती आणि स्पर्धात्मक परीक्षा पहा',
    'page.schemes.title': 'सरकारी योजना',
    'page.schemes.subtitle': 'नागरिकांसाठी कल्याण योजना आणि कार्यक्रम शोधा',
    'page.scholarships.title': 'शिष्यवृत्ती',
    'page.scholarships.subtitle': 'सर्व प्रवर्गातील विद्यार्थ्यांसाठी शिष्यवृत्ती शोधा',
    'page.education.title': 'उच्च शिक्षण',
    'page.education.subtitle': 'महाविद्यालये, विद्यापीठे आणि उच्च शिक्षणाच्या संधी पहा',
    'page.resources.title': 'तयारी संसाधने',
    'page.resources.subtitle': 'स्पर्धात्मक परीक्षांसाठी अभ्यास साहित्य आणि मार्गदर्शिका',

    // Home
    'home.hero.title': 'भारताचा AI-चालित नागरिक सहाय्यक',
    'home.hero.subtitle': 'सरकारी परीक्षा, योजना, शिष्यवृत्ती आणि संधी — सर्व एकाच ठिकाणी, AI द्वारे चालवलेले.',
    'home.hero.cta_primary': 'संधी पहा',
    'home.hero.cta_secondary': 'AI सहाय्यकाला विचारा',
    'home.featured.title': 'वैशिष्ट्यीकृत संधी',
    'home.featured.subtitle': 'तुमच्या प्रोफाइलशी जुळणाऱ्या क्युरेटेड संधी',

    // Auth
    'auth.login': 'लॉगिन',
    'auth.signup': 'साइन अप',
    'auth.logout': 'लॉगआउट',
    'auth.email': 'ईमेल पत्ता',
    'auth.password': 'पासवर्ड',
    'auth.name': 'पूर्ण नाव',

    // Footer
    'footer.tagline': 'AI-चालित सरकारी परीक्षा आणि विद्यार्थी संधी प्लॅटफॉर्म.',
    'footer.description': 'AI द्वारे विद्यार्थ्यांना सरकारी परीक्षा, शिष्यवृत्ती, कल्याण योजना आणि उच्च शिक्षणाच्या संधी शोधण्यात मदत करणे.',
    'footer.quick_links': 'त्वरित दुवे',
    'footer.resources': 'संसाधने आणि कायदेशीर',
    'footer.contact': 'संपर्क आणि प्लॅटफॉर्म',
    'footer.official_site': 'अधिकृत वेबसाइट',
    'footer.preparation': 'तयारी संसाधने',
    'footer.rights': 'सर्व हक्क राखीव.',
  },
};
