const { Resend } = require('resend');

let resend;
const recipientEmail = process.env.TO_EMAIL || process.env.RECIPIENT_EMAIL || 'lijoevince@gmail.com';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

function sanitizeValue(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function validatePayload(payload) {
  const errors = [];

  if (!payload.name || !sanitizeValue(payload.name)) {
    errors.push('Name is required.');
  }

  if (!payload.email || !sanitizeValue(payload.email)) {
    errors.push('Email is required.');
  }

  if (!payload.message || !sanitizeValue(payload.message)) {
    errors.push('Message is required.');
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizeValue(payload.email))) {
    errors.push('Email must be a valid address.');
  }

  return errors;
}

function buildEmailHtml(data) {
  const submittedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return `
    <div style="font-family: Inter, Arial, sans-serif; background:#0f172a; color:#f8fafc; padding:24px; border-radius:16px; max-width:680px; margin:0 auto;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <div style="width:48px; height:48px; border-radius:999px; background:linear-gradient(135deg,#38bdf8,#22c55e); display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff;">JL</div>
        <div>
          <h2 style="margin:0; font-size:20px;">New Portfolio Inquiry</h2>
          <p style="margin:4px 0 0; color:#94a3b8;">A new message was sent through your portfolio contact form.</p>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:20px;">
        <p style="margin:0 0 12px; color:#cbd5e1;"><strong>Name:</strong> ${data.name}</p>
        <p style="margin:0 0 12px; color:#cbd5e1;"><strong>Email:</strong> ${data.email}</p>
        <p style="margin:0 0 12px; color:#cbd5e1;"><strong>Subject:</strong> ${data.subject}</p>
        <p style="margin:0 0 12px; color:#cbd5e1;"><strong>Company:</strong> ${data.company || 'Not provided'}</p>
        <p style="margin:0 0 12px; color:#cbd5e1;"><strong>Project Type:</strong> ${data.projectType || 'Not provided'}</p>
        <p style="margin:0 0 12px; color:#cbd5e1;"><strong>Budget:</strong> ${data.budget || 'Not provided'}</p>
        <p style="margin:0 0 12px; color:#cbd5e1;"><strong>Timeline:</strong> ${data.timeline || 'Not provided'}</p>
        <p style="margin:0 0 12px; color:#cbd5e1;"><strong>Date Submitted:</strong> ${submittedAt}</p>
        <div style="margin-top:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.12);">
          <p style="margin:0 0 8px; color:#cbd5e1;"><strong>Message:</strong></p>
          <p style="margin:0; white-space:pre-wrap; color:#f8fafc; line-height:1.6;">${data.message}</p>
        </div>
      </div>
    </div>
  `;
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Method not allowed.' })
    };
  }

  if (!process.env.RESEND_API_KEY || !recipientEmail) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Email service is not configured.' })
    };
  }

  let payload;

  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Invalid request body.' })
    };
  }

  const cleanPayload = {
    name: sanitizeValue(payload.name),
    email: sanitizeValue(payload.email),
    subject: sanitizeValue(payload.subject || 'New Portfolio Inquiry'),
    company: sanitizeValue(payload.company),
    projectType: sanitizeValue(payload.projectType),
    budget: sanitizeValue(payload.budget),
    timeline: sanitizeValue(payload.timeline),
    message: sanitizeValue(payload.message)
  };

  const validationErrors = validatePayload(cleanPayload);

  if (validationErrors.length > 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: validationErrors[0] })
    };
  }

  const resendClient = getResendClient();

  if (!resendClient) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Email service is not configured.' })
    };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      replyTo: cleanPayload.email,
      subject: cleanPayload.subject || 'New Portfolio Inquiry',
      html: buildEmailHtml(cleanPayload)
    });

    if (error) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: 'Unable to send your inquiry. Please try again later.' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Email sent successfully.' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Unable to send your inquiry. Please try again later.' })
    };
  }
};
