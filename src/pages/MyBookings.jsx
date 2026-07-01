import { useState } from 'react'
import { supabase } from '../lib/supabase'

const COLORS = {
  navy: '#1a2744',
  sky: '#4aa8d8',
  beige: '#f5f0e8',
  beigeLight: '#faf7f2',
  textLight: '#7a6a5a'
}

export default function MyBookings({ onBack }) {
  const [email, setEmail] = useState('')
  const [bookings, setBookings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchMyBookings() {
    if (!email) {
      setError('Veuillez entrer votre email.')
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select('*, slots(title, date, time_start, time_end)')
      .eq('email', email)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError('Une erreur est survenue.')
    } else {
      setBookings(data)
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: COLORS.beigeLight, minHeight: '100vh' }}>
      <header style={{
        background: COLORS.navy,
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)'
      }}>
        <img src="/logo.png" alt="Ecurie de Groynne" style={{ height: '60px', mixBlendMode: 'screen', filter: 'invert(1)' }} />
        <button onClick={onBack}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.4)', color: 'white', cursor: 'pointer', fontSize: '0.9rem', padding: '0.4rem 1rem', borderRadius: '20px' }}>
          ← Retour
        </button>
      </header>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ color: COLORS.navy, fontSize: '1.8rem', marginBottom: '0.5rem' }}>📋 Mes inscriptions</h1>
        <p style={{ color: COLORS.textLight, marginBottom: '2rem' }}>
          Entrez votre email pour voir vos cours réservés.
        </p>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(26,39,68,0.06)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchMyBookings()}
              style={{ flex: 1, minWidth: '200px', padding: '0.7rem 1rem', borderRadius: '8px', border: `2px solid #ddd`, fontSize: '1rem', outline: 'none' }}
            />
            <button onClick={fetchMyBookings} disabled={loading}
              style={{ background: COLORS.navy, color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {loading ? '⏳...' : 'Voir mes cours'}
            </button>
          </div>
          {error && <p style={{ color: 'red', marginTop: '0.8rem', fontSize: '0.9rem' }}>{error}</p>}
        </div>

        {bookings !== null && (
          <div>
            {bookings.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(26,39,68,0.06)' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</p>
                <p style={{ color: COLORS.textLight }}>Aucune inscription trouvée pour cet email.</p>
              </div>
            ) : (
              <div>
                <p style={{ color: COLORS.textLight, marginBottom: '1rem' }}>
                  {bookings.length} inscription(s) trouvée(s)
                </p>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {bookings.map(b => (
                    <div key={b.id} style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '1.2rem 1.5rem',
                      boxShadow: '0 4px 20px rgba(26,39,68,0.06)',
                      borderLeft: `5px solid ${COLORS.sky}`
                    }}>
                      <h3 style={{ color: COLORS.navy, margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                        {b.slots?.title}
                      </h3>
                      <p style={{ margin: '0.2rem 0', color: COLORS.textLight, fontSize: '0.9rem' }}>
                        📅 {b.slots?.date ? new Date(b.slots.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
                      </p>
                      <p style={{ margin: '0.2rem 0', color: COLORS.textLight, fontSize: '0.9rem' }}>
                        🕐 {b.slots?.time_start?.slice(0,5)} – {b.slots?.time_end?.slice(0,5)}
                      </p>
                      <p style={{ margin: '0.4rem 0 0 0', color: COLORS.navy, fontSize: '0.9rem' }}>
                        🐴 Enfant : <strong>{b.child_name}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}