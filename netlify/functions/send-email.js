// netlify/functions/send-email.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    const SENDGRID_API_KEY = process.env.NETLIFY_SENDGRID_API_KEY;
    const TO_EMAIL = process.env.NETLIFY_TO_EMAIL || 'you@yourdomain.com';
    const FROM_EMAIL = process.env.NETLIFY_FROM_EMAIL || 'no-reply@yourdomain.com';

    if (!SENDGRID_API_KEY) {
      console.error('Missing SendGrid API key');
      return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured' }) };
    }

    const payload = {
      personalizations: [{ to: [{ email: TO_EMAIL }] }],
      from: { email: FROM_EMAIL },
      subject: `New contact from ${escapeHtml(name)}`,
      content: [
        {
          type: 'text/html',
          value: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
                  <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                  <p><strong>Message:</strong><br/>${escapeHtml(message)}</p>`
        }
      ]
    };

    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('SendGrid error', resp.status, text);
      return { statusCode: 502, body: JSON.stringify({ error: 'Email service error' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br/>');
}

