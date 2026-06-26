const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  const { code } = event.queryStringParameters

  if (!code) {
    return { statusCode: 400, body: 'Code manquant' }
  }

  // Échange le code contre un token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.URL}/.netlify/functions/google-callback`,
      grant_type: 'authorization_code'
    })
  })

  const tokens = await tokenRes.json()

  if (!tokens.access_token) {
    return { statusCode: 400, body: 'Erreur lors de la récupération du token' }
  }

  // Stocke les tokens dans Supabase
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  await supabase.from('google_tokens').upsert({
    id: 'moniteur',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000
  })

  return {
    statusCode: 302,
    headers: { Location: '/admin?google=connected' }
  }
}