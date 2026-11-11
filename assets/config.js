/* =========================================================
   Site configuration — edit this file, not main.js.
   ========================================================= */
window.SITE_CONFIG = {
  email: 'abdulbasit08620022@gmail.com', // shown in contact + footer, used as mailto fallback

  // Optional hero background video (MP4/WebM, ~5–10 MB max, 1080p). It's shown in grayscale and
  // tinted by the hero's color field. Use footage you own or that is licensed for commercial use
  // (e.g. Pexels / Coverr / Mixkit free licenses). Leave empty to use the animated light field only.
  heroVideo: '', // e.g. 'assets/hero.mp4'

  form: {
    // Where the contact form POSTs (JSON). Options:
    //  '/api/contact'                         → bundled serverless function (api/contact.js, Vercel/Netlify)
    //  'https://formspree.io/f/XXXXXXX'       → Formspree
    //  'https://api.web3forms.com/submit'     → Web3Forms (also set extraFields.access_key)
    // GitHub Pages hosting → Web3Forms. To activate: put your key in access_key below and set
    // endpoint to 'https://api.web3forms.com/submit'. While endpoint is empty, the form shows an
    // 'email us directly' message instead of sending.
    endpoint: 'https://api.web3forms.com/submit',
    extraFields: { access_key: '790c89eb-9fc1-4296-b2fe-d02d270f3865', subject: 'New project inquiry — twobitcode.com', from_name: 'Two Bit Code website' },
    minFillMs: 2500,      // submissions faster than this are treated as bots
    timeoutMs: 15000,
  },

  /* Portfolio.
     image: real screenshot (shown in a browser frame)  — or —  mock: 'web' | 'mobile' | 'ai' | 'flow' (screens drawn in main.js)
     theme: 'mint' | 'warm' | 'ink' (look of a drawn screen)   accent: any CSS color
     url: optional link (opens in a new tab)   badge: optional small label on the preview */
  projects: [
    {
      title: 'Attachment Guard',
      category: 'SaaS · Xero integration',
      description: 'Holds each approved Xero invoice until its proof of delivery, timesheet or signed job sheet is attached, then sends it from the business\'s own Outlook or Gmail.',
      tags: ['Xero integration', 'Outlook & Gmail', 'Live product'],
      image: 'assets/projects/attachmentguard.jpg',
      accent: '#ff6a2b',
    },
    {
      title: 'TimeTracker',
      category: 'SaaS · Desktop & mobile apps',
      description: 'Time tracking for software and IT teams: one-click timers on Windows, Linux, Android, iPhone and browsers that keep counting offline, plus reports by person, project and task with Excel export.',
      tags: ['Desktop & mobile apps', 'Offline sync', 'Live product'],
      image: 'assets/projects/timetracker.jpg',
      accent: '#2dd4bf',
    },
    {
      title: 'TimTim',
      category: 'SaaS · Mobile app builder',
      description: 'Turns Shopify and WooCommerce stores into branded native iOS and Android apps, built automatically in the cloud, with app-only offers and announcement banners.',
      tags: ['Shopify & WooCommerce', 'iOS & Android', 'Live product'],
      image: 'assets/projects/timtim.jpg',
      accent: '#3fbf5a',
    },
    {
      theme: 'warm',
      title: 'CareSlot',
      category: 'Mobile Application',
      description: 'A patient booking app for clinics: find a doctor, pick a slot and get reminders, on iOS and Android from one codebase.',
      tags: ['Flutter', 'Firebase', 'REST API'],
      mock: 'mobile', accent: '#f4664a',
    },
  ],
};
