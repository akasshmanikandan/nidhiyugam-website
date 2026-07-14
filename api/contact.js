export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, service, message, source } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const adminEmailHtml = `
      <h3>New Contact Request</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Interested In:</strong> ${service || 'General Inquiry'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr/>
      <p><small>Source: ${source}</small></p>
    `;

    const userEmailHtml = `
      <p>Dear ${name},</p>
      <p>Thank you for reaching out to Nidhiyuga Associates.</p>
      <p>We have received your inquiry and our team will get back to you shortly regarding your request.</p>
      <p><strong>Your Message:</strong></p>
      <blockquote style="border-left: 4px solid #eee; padding-left: 1rem; color: #555;">
        ${message}
      </blockquote>
      <br/>
      <p>Best regards,</p>
      <p><strong>Nidhiyuga Associates Team</strong><br/>
      <a href="mailto:sales@nidhiyuga.com">sales@nidhiyuga.com</a></p>
    `;

    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || 're_5P4RyLVi_KGuLYMHNBswAPX1kHbfsTBB9'}`,
      },
      body: JSON.stringify([
        // 1. Email to Admin
        {
          from: 'Nidhiyuga Associates <sales@nidhiyuga.com>',
          to: ['sales@nidhiyuga.com', 'nidhiyugaassociates@gmail.com'],
          subject: `New Contact Form Submission from ${name} (${source})`,
          html: adminEmailHtml,
        },
        // 2. Auto-reply to User
        {
          from: 'Nidhiyuga Associates <sales@nidhiyuga.com>',
          to: [email],
          subject: 'Thank you for contacting Nidhiyuga Associates',
          html: userEmailHtml,
        }
      ]),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, error: data.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
