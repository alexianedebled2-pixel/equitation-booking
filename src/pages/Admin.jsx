import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = '0201'

const COURS_TYPES = [
  'Prépa Bronze/Argent',
  'Prépa Or',
  'Prépa Diamant',
  'Prépa Degré 1',
  'Prépa Degré 2',
  'Prépa Degré 3'
]

const COLORS = {
  navy: '#1a2744',
  sky: '#4aa8d8',
  skyLight: '#e8f4fd',
  green: '#2ecc71',
  red: '#e74c3c',
  bg: '#f0f7ff',
  white: '#ffffff'
}

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [password, setPassword] = useState('')
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState({})
  const [openSlot, setOpenSlot] = useState(null)
  const [newSlot, setNewSlot] = useState({ title: '', date: '', time_start: '', max_places: 6 })
  const [message, setMessage] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (auth) fetchSlots()
  }, [auth])

  async function fetchSlots() {
    const { data } = await supabase
      .from('slots_with_availability')
      .select('*')
      .order('date')
    setSlots(data || [])
  }

  async function fetchBookings(slotId) {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('slot_id', slotId)
    setBookings(prev => ({ ...prev, [slotId]: data || [] }))
  }

  async function createSlot() {
    if (!newSlot.title || !newSlot.date || !newSlot.time_start) {
      setMessage({ type: 'error', text: 'Remplis tous les champs !' })
      return
    }
    const startHour = parseInt(newSlot.time_start.slice(0, 2))
    const startMin = newSlot.time_start.slice(3, 5)
    const endHour = startHour === 23 ? 0 : startHour + 1
    const time_end = `${String(endHour).padStart(2, '0')}:${startMin}`

    const { error } = await supabase.from('slots').insert({ ...newSlot, time_end })
    if (!error) {
      setMessage({ type: 'success', text: 'Créneau créé avec succès !' })
      setNewSlot({ title: '', date: '', time_start: '', max_places: 6 })
      setShowForm(false)
      fetchSlots()
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la création.' })
    }
  }

  async function deleteSlot(slotId) {
    if (!confirm('Supprimer ce créneau et toutes ses inscriptions ?')) return
    await supabase.from('slots').delete().eq('id', slotId)
    setOpenSlot(null)
    fetchSlots()
  }

  function toggleSlot(slotId) {
    if (openSlot === slotId) {
      setOpenSlot(null)
    } else {
      setOpenSlot(slotId)
      fetchBookings(slotId)
    }
  }

  if (!auth) return (
    <div style={{ fontFamily: 'Georgia, serif', background: COLORS.bg, minHeight: '100vh' }}>
      <header style={{ background: COLORS.navy, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/logo.png" alt="Ecurie de Groynne" style={{ height: '80px', mixBlendMode: 'screen', filter: 'invert(1)' }} />
      </header>
      <div style={{ maxWidth: '400px', margin: '5rem auto', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(26,39,68,0.12)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔒</div>
          <h2 style={{ color: COLORS.navy, marginBottom: '1.5rem' }}>Espace Moniteurs</h2>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && password === ADMIN_PASSWORD && setAuth(true)}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #ddd', fontSize: '1rem', marginBottom: '1rem', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.3rem' }}
          />
          <button
            onClick={() => password === ADMIN_PASSWORD ? setAuth(true) : setMessage({ type: 'error', text: 'Mot de passe incorrect.' })}
            style={{ background: COLORS.navy, color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', width: '100%' }}>
            Connexion
          </button>
          {message && <p style={{ color: 'red', marginTop: '1rem' }}>{message.text}</p>}
        </div>
      </div>
    </div>
  )

  const today = new Date().toISOString().split('T')[0]
  const slotsAVenir = slots.filter(s => s.date >= today)
  const slotsPasses = slots.filter(s => s.date < today)

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: COLORS.bg, minHeight: '100vh' }}>
      <header style={{ background: COLORS.navy, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/logo.png" alt="Ecurie de Groynne" style={{ height: '80px', mixBlendMode: 'screen', filter: 'invert(1)' }} />
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: COLORS.navy, margin: 0 }}>🧑‍🏫 Espace Moniteurs</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: COLORS.sky, color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
            {showForm ? '✕ Fermer' : '➕ Nouveau créneau'}
          </button>
        </div>

        {message && (
          <div style={{
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
        )}

        {showForm && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 16px rgba(74,168,216,0.15)', border: `2px solid ${COLORS.sky}` }}>
            <h3 style={{ color: COLORS.navy, marginTop: 0 }}>➕ Nouveau créneau</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.3rem', fontWeight: 'bold' }}>Type de cours *</label>
                <select
                  value={newSlot.title}
                  onChange={e => setNewSlot({ ...newSlot, title: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}>
                  <option value="">-- Choisir --</option>
                  {COURS_TYPES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.3rem', fontWeight: 'bold' }}>Date *</label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={e => setNewSlot({ ...newSlot, date: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.3rem', fontWeight: 'bold' }}>Heure de début *</label>
                <input
                  type="time"
                  value={newSlot.time_start}
                  onChange={e => setNewSlot({ ...newSlot, time_start: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.3rem', fontWeight: 'bold' }}>Nombre de places *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newSlot.max_places}
                  onChange={e => setNewSlot({ ...newSlot, max_places: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                />
              </div>
            </div>
            <button
              onClick={createSlot}
              style={{ marginTop: '1rem', background: COLORS.navy, color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
              Créer le créneau
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: COLORS.navy, color: 'white', borderRadius: '12px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{slots.length}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total créneaux</div>
          </div>
          <div style={{ background: COLORS.sky, color: 'white', borderRadius: '12px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{slotsAVenir.length}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>À venir</div>
          </div>
          <div style={{ background: COLORS.green, color: 'white', borderRadius: '12px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{slots.reduce((acc, s) => acc + (s.booked_count || 0), 0)}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total inscrits</div>
          </div>
        </div>

        <h3 style={{ color: COLORS.navy }}>📅 Créneaux à venir</h3>
        {slotsAVenir.length === 0 && <p style={{ color: '#888' }}>Aucun créneau à venir.</p>}
        {slotsAVenir.map(slot => (
          <div key={slot.id} style={{ background: 'white', borderRadius: '12px', marginBottom: '0.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', border: `2px solid ${openSlot === slot.id ? COLORS.sky : 'transparent'}` }}>
            <div
              onClick={() => toggleSlot(slot.id)}
              style={{ padding: '1rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ background: COLORS.skyLight, color: COLORS.navy, padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginRight: '0.8rem' }}>
                  {new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <strong style={{ color: COLORS.navy }}>{slot.title}</strong>
                <span style={{ color: '#888', marginLeft: '0.5rem', fontSize: '0.9rem' }}>à {slot.time_start.slice(0,5)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  background: slot.places_remaining > 0 ? '#d4edda' : '#f8d7da',
                  color: slot.places_remaining > 0 ? '#155724' : '#721c24',
                  padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'
                }}>
                  {slot.booked_count}/{slot.max_places} inscrits
                </span>
                <span style={{ color: COLORS.sky }}>{openSlot === slot.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {openSlot === slot.id && (
              <div style={{ borderTop: `2px solid ${COLORS.skyLight}`, padding: '1rem 1.5rem' }}>
                {!bookings[slot.id] && <p style={{ color: '#888' }}>Chargement...</p>}
                {bookings[slot.id] && bookings[slot.id].length === 0 && <p style={{ color: '#888' }}>Aucun inscrit pour le moment.</p>}
                {bookings[slot.id] && bookings[slot.id].length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                    <thead>
                      <tr style={{ background: COLORS.skyLight }}>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left', color: COLORS.navy }}>Parent</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left', color: COLORS.navy }}>Enfant</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left', color: COLORS.navy }}>Email</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left', color: COLORS.navy }}>Téléphone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings[slot.id].map(b => (
                        <tr key={b.id}>
                          <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{b.parent_name}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{b.child_name}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                            <a href={`mailto:${b.email}`} style={{ color: COLORS.sky }}>{b.email}</a>
                          </td>
                          <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{b.phone || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <button
                  onClick={() => deleteSlot(slot.id)}
                  style={{ background: COLORS.red, color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  🗑️ Supprimer ce créneau
                </button>
              </div>
            )}
          </div>
        ))}

        {slotsPasses.length > 0 && (
          <>
            <h3 style={{ color: '#888', marginTop: '2rem' }}>📁 Créneaux passés</h3>
            {slotsPasses.map(slot => (
              <div key={slot.id} style={{ background: '#f9f9f9', borderRadius: '12px', marginBottom: '0.8rem', border: '1px solid #eee', overflow: 'hidden' }}>
                <div
                  onClick={() => toggleSlot(slot.id)}
                  style={{ padding: '0.8rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.85rem', marginRight: '0.8rem' }}>
                      {new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <strong style={{ color: '#555' }}>{slot.title}</strong>
                    <span style={{ color: '#aaa', marginLeft: '0.5rem', fontSize: '0.9rem' }}>à {slot.time_start.slice(0,5)}</span>
                  </div>
                  <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{slot.booked_count} inscrits — {openSlot === slot.id ? '▲' : '▼'}</span>
                </div>
                {openSlot === slot.id && (
                  <div style={{ borderTop: '1px solid #eee', padding: '1rem 1.5rem' }}>
                    {bookings[slot.id] && bookings[slot.id].length > 0 && (
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                        <thead>
                          <tr style={{ background: '#f0f0f0' }}>
                            <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Parent</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Enfant</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Téléphone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings[slot.id].map(b => (
                            <tr key={b.id}>
                              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{b.parent_name}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{b.child_name}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                                <a href={`mailto:${b.email}`} style={{ color: COLORS.sky }}>{b.email}</a>
                              </td>
                              <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{b.phone || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      style={{ background: COLORS.red, color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      🗑️ Supprimer ce créneau
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  )
}