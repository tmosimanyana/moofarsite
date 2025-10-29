// netlify/functions/contact.js
// Node 18+ runtime assumed (Netlify default recent runtimes).
// Uses Fetch to call SendGrid API. Configure SENDGRID_API_KEY + FROM_EMAIL + OWNER_EMAIL in Netlify env vars.
// Optional: RECAPTCHA_SECRET to enable recaptcha verification.

const SENDGRID_API = "https://api.sendgrid.com/v3/mail/send";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "Mookfara@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@moofar.co.bw";
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || null;

// helper: validate email rudimentarily
const validEmail = (email) =>
  typeof email === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// helper: safe stringify for email body
const esc = (s) => String(s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // Honeypot: field that legitimate users won't fill
  if (payload.website && payload.website.trim() !== "") {
    // bot detected
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  // Optional reCAPTCHA v2/v3 verification (if RECAPTCHA_SECRET set)
  if (RECAPTCHA_SECRET) {
    const token = payload["g-recaptcha-response"] || payload.recaptchaToken;
    if (!token) {
      return { statusCode: 400, body: JSON.stringify({ error: "reCAPTCHA token missing" }) };
    }
    // verify with Google
    try {
      const resp = await fetch(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`
        }
      );
      const json = await resp.json();
      if (!json.success) {
        return { statusCode: 400, body: JSON.stringify({ error: "reCAPTCHA verification failed", details: json }) };
      }
    } catch (e) {
      return { statusCode: 500, body: JSON.stringify({ error: "reCAPTCHA verification error" }) };
    }
  }

  // Basic server-side validation
  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim();
  const phone = (payload.phone || "").trim();
  const message = (payload.message || "").trim();

  if (!name || !email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields (name, email, message)" }) };
  }
  if (!validEmail(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid email address" }) };
  }

  // Prevent sending if no sendgrid key set
  if (!SENDGRID_KEY) {
    console.error("SENDGRID_API_KEY not set");
    // Return success so bots don't measure response differences, but log to netlify logs
    return { statusCode: 500, body: JSON.stringify({ error: "Email service not configured" }) };
  }

  // Compose owner email and auto-reply
  const subjectOwner = `New contact form submission from ${name}`;
  const htmlOwner = `
    <p>You received a new message from the website contact form.</p>
    <ul>
      <li><strong>Name:</strong> ${esc(name)}</li>
      <li><strong>Email:</strong> ${esc(email)}</li>
      <li><strong>Phone:</strong> ${esc(phone)}</li>
      <li><strong>IP:</strong> ${esc(event.requestContext?.identity?.sourceIp || context?.clientIp || "unknown")}</li>
    </ul>
    <h3>Message</h3>
    <p>${esc(message).replace(/\n/g, "<br>")}</p>
  `;

  const subjectAuto = `Thanks for contacting Moofar — we've received your message`;
  const htmlAuto = `
    <p>Hi ${esc(name)},</p>
    <p>Thanks for reaching out to Moofar. We have received your message and will get back to you within 1 business day.</p>
    <hr/>
    <p><strong>Your message:</strong></p>
    <p>${esc(message).replace(/\n/g, "<br>")}</p>
    <p>— Moofar Proprietary Limited</p>
  `;

  // Build SendGrid payload (send two personalizations)
  const sendgridPayload = {
    personalizations: [
      {
        to: [{ email: OWNER_EMAIL }],
        subject: subjectOwner
      },
      {
        to: [{ email }],
        subject: subjectAuto
      }
    ],
    from: { email: FROM_EMAIL, name: "Moofar Website" },
    content: [
      { type: "text/html", value: htmlOwner } // this will be used for the first personalization by default
    ],
    // We'll set dynamic_template_data per personalization if needed,
    // but for simplicity we'll send Owner email with htmlOwner and then send a separate request for auto-reply.
  };

  // Because SendGrid's single-request multiple-personalizations with different bodies is more complex,
  // we will send two requests: owner email, then auto-reply.
  const headers = {
    Authorization: `Bearer ${SENDGRID_KEY}`,
    "Content-Type": "application/json"
  };

  try {
    // Send to owner
    await fetch(SENDGRID_API, {
      method: "POST",
      headers,
      body: JSON.stringify({
        personalizations: [{ to: [{ email: OWNER_EMAIL }], subject: subjectOwner }],
        from: { email: FROM_EMAIL, name: "Moofar Website" },
        content: [{ type: "text/html", value: htmlOwner }]
      })
    });

    // Send auto-reply to user
    await fetch(SENDGRID_API, {
      method: "POST",
      headers,
      body: JSON.stringify({
        personalizations: [{ to: [{ email }], subject: subjectAuto }],
        from: { email: FROM_EMAIL, name: "Moofar Website" },
        content: [{ type: "text/html", value: htmlAuto }]
      })
    });

    // Optionally, you can log submission to Netlify Analytics / external DB here.

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("SendGrid error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to send email" }) };
  }
};

