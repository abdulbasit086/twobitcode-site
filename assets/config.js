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

  /* Portfolio. badge: small label on the preview ('In-house product', 'Client project', …).
     mock: 'web' | 'mobile' | 'ai' | 'flow' (screens drawn in main.js)   accent: any CSS color   url: optional case-study link */
  projects: [
    {
      title: 'Tallyroom',
      category: 'Web Application · SaaS',
      description: 'Finance operations for small businesses: invoicing, cash-flow forecasting and client billing in one dashboard.',
      tags: ['Next.js', 'Node.js', 'PostgreSQL'],
      mock: 'web', accent: '#7aa2ff',
    },
    {
      title: 'CareSlot',
      category: 'Mobile Application',
      description: 'A patient booking app for clinics: find a doctor, pick a slot and get reminders, on iOS and Android from one codebase.',
      tags: ['Flutter', 'Firebase', 'REST API'],
      mock: 'mobile', accent: '#9d7bff',
    },
    {
      title: 'Quarry',
      category: 'AI & Automation',
      description: 'An AI assistant that answers team questions from company documents, citing the source behind every answer.',
      tags: ['Python', 'OpenAI API', 'Vector search'],
      mock: 'ai', accent: '#45e1f7',
    },
    {
      title: 'Signoff',
      category: 'Custom Software',
      description: 'Purchase approvals without email chains: requests move through manager and finance review with a full audit trail.',
      tags: ['Laravel', 'MySQL', 'Docker'],
      mock: 'flow', accent: '#6fe3b8',
    },
  ],
};
