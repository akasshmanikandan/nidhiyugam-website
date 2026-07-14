export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, service, message, source } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In Vercel, we can use process.env.RESEND_API_KEY
        // Or for local testing we can fallback if provided
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || 're_5P4RyLVi_KGuLYMHNBswAPX1kHbfsTBB9'}`,
      },
      body: JSON.stringify({
        from: 'Nidhi Yugam Contact <notifications@nidhiyuga.in>',
        to: ['sales@nidhiyuga.in', 'nidhiyugaassociates@gmail.com'],
        subject: `New Contact Form Submission from ${name} (${source})`,
        html: `
          <h3>New Contact Request</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Interested In:</strong> ${service || 'General Inquiry'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr/>
          <p><small>Source: ${source}</small></p>
        `,
      }),
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
