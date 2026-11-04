/**
 * Contact form endpoint — Vercel serverless function (Node 18+), no dependencies.
 * Sends each inquiry to your inbox via Resend (https://resend.com).
 *
 * Required environment variables:
 *   RESEND_API_KEY      — from resend.com → API Keys
 *   CONTACT_TO_EMAIL    — where inquiries are delivered, e.g. founders@yourdomain.com
 *   CONTACT_FROM_EMAIL  — a sender on a domain verified in Resend, e.g. "Two Bit Code <inquiries@yourdomain.com>"
 * Optional:
 *   ALLOWED_ORIGIN      — e.g. https://yourdomain.com (blocks posts from other sites)
 */
const SERVICES = ['Web Application', 'Mobile Application', 'Custom Software', 'AI & Automation', 'UI/UX Design', 'Cloud & Infrastructure', 'Something Else'];
const LIMITS = { name: 100, email: 160, phone: 30, company: 120, service: 40, budget: 40, message: 4000 };

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

module.exports = async function handler(req, res) {
  const origin = process.env.ALLOWED_ORIGIN;
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (origin && req.headers.origin && req.headers.origin !== origin) return res.status(403).json({ ok: false, error: 'Forbidden' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  // Spam: honeypot or a too-fast submission → pretend success, send nothing.
  if (body.website || (Number(body.elapsedMs) > 0 && Number(body.elapsedMs) < 2000)) return res.status(200).json({ ok: true });

  const d = Object.fromEntries(Object.entries(LIMITS).map(([k, max]) => [k, clean(body[k], max)]));
  const errors = {};
  if (d.name.length < 2) errors.name = 'Name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errors.email = 'Valid email is required.';
  if (!SERVICES.includes(d.service)) errors.service = 'Choose a service.';
  if (d.message.length < 20) errors.message = 'Message is too short.';
  if (Object.keys(errors).length) return res.status(422).json({ ok: false, error: 'Validation failed', errors });

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    console.error('Contact form: missing RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL');
    return res.status(500).json({ ok: false, error: 'Email service not configured' });
  }

  const rows = [['Name', d.name], ['Email', d.email], ['Phone', d.phone], ['Company', d.company], ['Service', d.service], ['Budget', d.budget || 'Not sure yet']];
  const html = `<h2 style="font-family:sans-serif">New project inquiry</h2>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${k}</td><td>${esc(v || '—')}</td></tr>`).join('')}</table>
<h3 style="font-family:sans-serif">Project</h3><p style="font-family:sans-serif;white-space:pre-wrap">${esc(d.message)}</p>`;
  const text = rows.map(([k, v]) => `${k}: ${v || '-'}`).join('\n') + `\n\n${d.message}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_TO_EMAIL.split(',').map(s => s.trim()),
        reply_to: d.email,
        subject: `New inquiry: ${d.service} — ${d.name}${d.company ? ` (${d.company})` : ''}`,
        html, text,
      }),
    });
    if (!r.ok) {
      console.error('Resend error', r.status, await r.text());
      return res.status(502).json({ ok: false, error: 'Could not send message' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact form failure', err);
    return res.status(502).json({ ok: false, error: 'Could not send message' });
  }
};
