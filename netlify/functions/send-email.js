exports.handler = async (event) => {
  const { emails, subject, message } = JSON.parse(event.body)

  if (!emails || emails.length === 0) {
    return { statusCode: 200, body: 'Aucun email à envoyer' }
  }

  const results = await Promise.all(emails.map(async (email) => {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Ecurie de Groynne <onboarding@resend.dev>',
        to: [email],
        subject: subject,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem;">
            <div style="background: #1a2744; padding: 1.5rem; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 1.4rem;">Ecurie de Groynne</h1>
            </div>
            <div style="background: #f5f0e8; padding: 2rem; border-radius: 0 0 8px 8px;">
              <p style="color: #333; font-size: 1rem; line-height: 1.8;">${message}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 1.5rem 0;" />
              <p style="color: #888; font-size: 0.85rem;">
                Ecurie de Groynne — François Jadot<br/>
                Rue de Groynne 28, 5300 Andenne<br/>
                📞 0478/60.56.89
              </p>
            </div>
          </div>
        `
      })
    })
    return res.ok
  }))

  return {
    statusCode: 200,
    body: JSON.stringify({ sent: results.filter(Boolean).length })
  }
}