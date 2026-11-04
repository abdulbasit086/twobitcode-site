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

  /* Portfolio. Set placeholder:false and fill in real details as case studies are ready.
     mock: 'web' | 'mobile' | 'ai' | 'flow'   accent: any CSS color   url: optional case-study link */
  projects: [
    {
      placeholder: true,
      title: 'Operations SaaS Platform',
      category: 'Web Application · SaaS',
      description: 'Concept slot for a multi-tenant platform with role-based dashboards, reporting and billing.',
      tags: ['Next.js', 'Node.js', 'PostgreSQL'],
      mock: 'web', accent: '#7aa2ff',
    },
    {
      placeholder: true,
      title: 'Cross-Platform Customer App',
      category: 'Mobile Application',
      description: 'Concept slot for an iOS & Android app with accounts, bookings and push notifications.',
      tags: ['Flutter', 'Firebase', 'REST API'],
      mock: 'mobile', accent: '#9d7bff',
    },
    {
      placeholder: true,
      title: 'AI Knowledge Assistant',
      category: 'AI & Automation',
      description: 'Concept slot for an LLM-powered assistant that answers questions from internal documents.',
      tags: ['Python', 'OpenAI API', 'Vector search'],
      mock: 'ai', accent: '#45e1f7',
    },
    {
      placeholder: true,
      title: 'Workflow Automation Suite',
      category: 'Custom Software',
      description: 'Concept slot for digitizing a manual approval process into an automated, auditable workflow.',
      tags: ['Laravel', 'MySQL', 'Docker'],
      mock: 'flow', accent: '#6fe3b8',
    },
  ],
};
