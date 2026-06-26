import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = '0201'

const COURS_TYPES = [
  'Licol Blanc',
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
  bg: '#f0f7ff'
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
  const [addingEleve, setAddingEleve] = useState(null)
  const [newEleve, setNewEleve] = useState({ parent_name: '', child_name: '', email: '', phone: '' })
  const [editingSlot, setEditingSlot] = useState(null)
  const [editForm, setEditForm] = useState({})

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

  function toggleCours(cours) {
    const selected = newSlot.title ? newSlot.title.split(' + ') : []
    if (selected.includes(cours)) {
      setNewSlot({ ...newSlot, title: selected.filter(x => x !== cours).join(' + ') })
    } else {
      setNewSlot({ ...newSlot, title: [...selected, cours].join(' + ') })
    }
  }

  function toggleEditCours(cours) {
    const selected = editForm.title ? editForm.title.split(' + ') : []
    if (selected.includes(cours)) {
      setEditForm({ ...editForm, title: selected.filter(x => x !== cours).join(' + ') })
    } else {
      setEditForm({ ...editForm, title: [...selected, cours].join(' + ') })
    }
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
      setMessage({ type: 'success', text: 'Créneau créé !' })
      setNewSlot({ title: '', date: '', time_start: '', max_places: 6 })
      setShowForm(false)
      fetchSlots()
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la création.' })
    }
  }

  async function updateSlot() {
    if (!editForm.title || !editForm.date || !editForm.time_start) {
      setMessage({ type: 'error', text: 'Remplis tous les champs !' })
      return
    }
    const startHour = parseInt(editForm.time_start.slice(0, 2))
    const startMin = editForm.time_start.slice(3, 5)
    const endHour = startHour === 23 ? 0 : startHour + 1
    const time_end = `${String(endHour).padStart(2, '0')}:${startMin}`
    const { error } = await supabase.from('slots').update({ ...editForm, time_end }).eq('id', editingSlot)
    if (!error) {
      setMessage({ type: 'success', text: 'Créneau modifié !' })
      setEditingSlot(null)
      setEditForm({})
      fetchSlots()
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la modification.' })
    }
  }

  async function deleteSlot(slotId) {
    if (!confirm('Supprimer ce créneau et toutes ses inscriptions ?')) return
    await supabase.from('slots').delete().eq('id', slotId)
    setOpenSlot(null)
    fetchSlots()
  }

  async function deleteBooking(bookingId, slotId) {
    if (!confirm('Supprimer cet élève du créneau ?')) return
    await supabase.from('bookings').delete().eq('id', bookingId)
    fetchBookings(slotId)
    fetchSlots()
  }

  async function addEleve(slotId) {
    if (!newEleve.child_name || !newEleve.parent_name) {
      setMessage({ type: 'error', text: "Le nom du parent et de l'enfant sont obligatoires." })
      return
    }
    const { error } = await supabase.from('bookings').insert({ ...newEleve, slot_id: slotId })
    if (!error) {
      setMessage({ type: 'success', text: 'Élève ajouté !' })
      setNewEleve({ parent_name: '', child_name: '', email: '', phone: '' })
      setAddingEleve(null)
      fetchBookings(slotId)
      fetchSlots()
    } else {
      setMessage({ type: 'error', text: "Erreur lors de l'ajout." })
    }
  }

  function toggleSlot(slotId) {
    if (openSlot === slotId) {
      setOpenSlot(null)
    } else {
      setOpenSlot(slotId)
      fetchBookings(slotId)
    }
  }

  function startEdit(slot) {
    setEditingSlot(slot.id)
    setEditForm({
      title: slot.title,
      date: slot.date,
      time_start: slot.time_start.slice(0, 5),
      max_places: slot.max_places
    })
    window.scrollTo(0, 0)
  }

  const Header = () => (
    <header style={{ background: COLORS.navy, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/logo.png" alt="Ecurie de Groynne" style={{ height: '60px', mixBlendMode: 'screen', filter: 'invert(1)' }} />
    </header>
  )

  if (!auth) return (
    <div style={{ fontFamily: 'Georgia, serif', background: COLORS.bg, minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(26,39,68,0.12)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
          <h2 style={{ color: COLORS.navy, marginBottom: '1.5rem', fontSize: '1.3rem' }}>Espace Moniteurs</h2>
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
      <Header />

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '1rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h1 style={{ color: COLORS.navy, margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.6rem)' }}>🧑‍🏫 Espace Moniteurs</h1>
          <button onClick={() => { setShowForm(!showForm); setEditingSlot(null) }}
            style={{ background: COLORS.sky, color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
            {showForm ? '✕ Fermer' : '➕ Nouveau créneau'}
          </button>
        </div>

        {message && (
          <div style={{ background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
        )}

        {showForm && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.2rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(74,168,216,0.15)', border: `2px solid ${COLORS.sky}` }}>
            <h3 style={{ color: COLORS.navy, marginTop: 0, fontSize: '1rem' }}>➕ Nouveau créneau</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Niveaux *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {COURS_TYPES.map(c => (
                    <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.2rem 0.4rem', borderRadius: '6px', background: newSlot.title.split(' + ').includes(c) ? COLORS.skyLight : 'transparent' }}>
                      <input type="checkbox" checked={newSlot.title.split(' + ').includes(c)} onChange={() => toggleCours(c)}
                        style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: COLORS.navy }} />
                      <span style={{ color: COLORS.navy, fontSize: '0.9rem', fontWeight: newSlot.title.split(' + ').includes(c) ? 'bold' : 'normal' }}>{c}</span>
                    </label>
                  ))}
                </div>
                {newSlot.title && <p style={{ color: COLORS.sky, fontSize: '0.8rem', marginTop: '0.4rem', fontStyle: 'italic' }}>✓ {newSlot.title}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Date *</label>
                  <input type="date" value={newSlot.date} onChange={e => setNewSlot({ ...newSlot, date: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Heure de début *</label>
                  <input type="time" value={newSlot.time_start} onChange={e => setNewSlot({ ...newSlot, time_start: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Nb places *</label>
                  <input type="number" min="1" max="20" value={newSlot.max_places} onChange={e => setNewSlot({ ...newSlot, max_places: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <button onClick={createSlot}
                  style={{ background: COLORS.navy, color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', width: '100%' }}>
                  Créer le créneau
                </button>
              </div>
            </div>
          </div>
        )}

        {editingSlot && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.2rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(255,165,0,0.2)', border: '2px solid orange' }}>
            <h3 style={{ color: COLORS.navy, marginTop: 0, fontSize: '1rem' }}>✏️ Modifier le créneau</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Niveaux *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {COURS_TYPES.map(c => (
                    <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.2rem 0.4rem', borderRadius: '6px', background: editForm.title && editForm.title.split(' + ').includes(c) ? '#fff3e0' : 'transparent' }}>
                      <input type="checkbox" checked={editForm.title ? editForm.title.split(' + ').includes(c) : false} onChange={() => toggleEditCours(c)}
                        style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'orange' }} />
                      <span style={{ color: COLORS.navy, fontSize: '0.9rem' }}>{c}</span>
                    </label>
                  ))}
                </div>
                {editForm.title && <p style={{ color: 'orange', fontSize: '0.8rem', marginTop: '0.4rem', fontStyle: 'italic' }}>✓ {editForm.title}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Date *</label>
                  <input type="date" value={editForm.date || ''} onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Heure de début *</label>
                  <input type="time" value={editForm.time_start || ''} onChange={e => setEditForm({ ...editForm, time_start: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: COLORS.navy, marginBottom: '0.3rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Nb places *</label>
                  <input type="number" min="1" max="20" value={editForm.max_places || 6} onChange={e => setEditForm({ ...editForm, max_places: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={updateSlot}
                    style={{ background: 'orange', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', flex: 1 }}>
                    Sauvegarder
                  </button>
                  <button onClick={() => { setEditingSlot(null); setEditForm({}) }}
                    style={{ background: '#ccc', border: 'none', padding: '0.7rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.7rem', marginBottom: '1.5rem' }}>
          <div style={{ background: COLORS.navy, color: 'white', borderRadius: '12px', padding: '0.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{slots.length}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total créneaux</div>
          </div>
          <div style={{ background: COLORS.sky, color: 'white', borderRadius: '12px', padding: '0.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{slotsAVenir.length}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>À venir</div>
          </div>
          <div style={{ background: COLORS.green, color: 'white', borderRadius: '12px', padding: '0.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{slots.reduce((acc, s) => acc + (s.booked_count || 0), 0)}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total inscrits</div>
          </div>
        </div>

        <h3 style={{ color: COLORS.navy, fontSize: '1rem' }}>📅 Créneaux à venir</h3>
        {slotsAVenir.length === 0 && <p style={{ color: '#888' }}>Aucun créneau à venir.</p>}
        {slotsAVenir.map(slot => (
          <div key={slot.id} style={{ background: 'white', borderRadius: '12px', marginBottom: '0.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', border: `2px solid ${openSlot === slot.id ? COLORS.sky : 'transparent'}` }}>
            <div onClick={() => toggleSlot(slot.id)}
              style={{ padding: '0.8rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ background: COLORS.skyLight, color: COLORS.navy, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginRight: '0.5rem' }}>
                  {new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <strong style={{ color: COLORS.navy, fontSize: '0.9rem' }}>{slot.title}</strong>
                <span style={{ color: '#888', marginLeft: '0.4rem', fontSize: '0.85rem' }}>à {slot.time_start.slice(0,5)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: slot.places_remaining > 0 ? '#d4edda' : '#f8d7da', color: slot.places_remaining > 0 ? '#155724' : '#721c24', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {slot.booked_count}/{slot.max_places}
                </span>
                <span style={{ color: COLORS.sky }}>{openSlot === slot.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {openSlot === slot.id && (
              <div style={{ borderTop: `2px solid ${COLORS.skyLight}`, padding: '0.8rem 1rem' }}>
                {bookings[slot.id] && bookings[slot.id].length > 0 && (
                  <div style={{ overflowX: 'auto', marginBottom: '0.8rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: COLORS.skyLight }}>
                          <th style={{ padding: '0.4rem', border: '1px solid #ddd', textAlign: 'left', color: COLORS.navy }}>Parent</th>
                          <th style={{ padding: '0.4rem', border: '1px solid #ddd', textAlign: 'left', color: COLORS.navy }}>Enfant</th>
                          <th style={{ padding: '0.4rem', border: '1px solid #ddd', textAlign: 'left', color: COLORS.navy }}>Email</th>
                          <th style={{ padding: '0.4rem', border: '1px solid #ddd', textAlign: 'left', color: COLORS.navy }}>Tél.</th>
                          <th style={{ padding: '0.4rem', border: '1px solid #ddd', textAlign: 'center', color: COLORS.navy }}>❌</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings[slot.id].map(b => (
                          <tr key={b.id}>
                            <td style={{ padding: '0.4rem', border: '1px solid #ddd' }}>{b.parent_name}</td>
                            <td style={{ padding: '0.4rem', border: '1px solid #ddd' }}>{b.child_name}</td>
                            <td style={{ padding: '0.4rem', border: '1px solid #ddd' }}>{b.email ? <a href={`mailto:${b.email}`} style={{ color: COLORS.sky }}>{b.email}</a> : '—'}</td>
                            <td style={{ padding: '0.4rem', border: '1px solid #ddd' }}>{b.phone || '—'}</td>
                            <td style={{ padding: '0.4rem', border: '1px solid #ddd', textAlign: 'center' }}>
                              <button onClick={() => deleteBooking(b.id, slot.id)}
                                style={{ background: COLORS.red, color: 'white', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {bookings[slot.id] && bookings[slot.id].length === 0 && <p style={{ color: '#888', fontSize: '0.9rem' }}>Aucun inscrit.</p>}

                {addingEleve === slot.id ? (
                  <div style={{ background: COLORS.skyLight, borderRadius: '8px', padding: '0.8rem', marginBottom: '0.8rem' }}>
                    <h4 style={{ color: COLORS.navy, marginTop: 0, fontSize: '0.9rem' }}>➕ Ajouter un élève</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <input placeholder="Nom du parent *" value={newEleve.parent_name}
                        onChange={e => setNewEleve({ ...newEleve, parent_name: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }} />
                      <input placeholder="Prénom enfant *" value={newEleve.child_name}
                        onChange={e => setNewEleve({ ...newEleve, child_name: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }} />
                      <input placeholder="Email (optionnel)" value={newEleve.email}
                        onChange={e => setNewEleve({ ...newEleve, email: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }} />
                      <input placeholder="Tél. (optionnel)" value={newEleve.phone}
                        onChange={e => setNewEleve({ ...newEleve, phone: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => addEleve(slot.id)}
                        style={{ background: COLORS.navy, color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Confirmer
                      </button>
                      <button onClick={() => { setAddingEleve(null); setNewEleve({ parent_name: '', child_name: '', email: '', phone: '' }) }}
                        style={{ background: '#ccc', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingEleve(slot.id)}
                    style={{ background: COLORS.sky, color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                    ➕ Ajouter un élève
                  </button>
                )}

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                  <button onClick={() => startEdit(slot)}
                    style={{ background: 'orange', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>
                    ✏️ Modifier
                  </button>
                  <button onClick={() => { setNewSlot({ title: slot.title, date: slot.date, time_start: slot.time_start.slice(0,5), max_places: slot.max_places }); setShowForm(true); window.scrollTo(0,0) }}
                    style={{ background: COLORS.green, color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>
                    📋 Copier
                  </button>
                  <button onClick={() => deleteSlot(slot.id)}
                    style={{ background: COLORS.red, color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {slotsPasses.length > 0 && (
          <>
            <h3 style={{ color: '#888', marginTop: '1.5rem', fontSize: '1rem' }}>📁 Créneaux passés</h3>
            {slotsPasses.map(slot => (
              <div key={slot.id} style={{ background: '#f9f9f9', borderRadius: '12px', marginBottom: '0.8rem', border: '1px solid #eee', overflow: 'hidden' }}>
                <div onClick={() => toggleSlot(slot.id)}
                  style={{ padding: '0.7rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7, flexWrap: 'wrap', gap: '0.3rem' }}>
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ color: '#888', marginRight: '0.5rem' }}>
                      {new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <strong style={{ color: '#555' }}>{slot.title}</strong>
                    <span style={{ color: '#aaa', marginLeft: '0.4rem' }}>à {slot.time_start.slice(0,5)}</span>
                  </div>
                  <span style={{ color: '#aaa', fontSize: '0.82rem' }}>{slot.booked_count} inscrits {openSlot === slot.id ? '▲' : '▼'}</span>
                </div>
                {openSlot === slot.id && (
                  <div style={{ borderTop: '1px solid #eee', padding: '0.8rem 1rem' }}>
                    {bookings[slot.id] && bookings[slot.id].length > 0 && (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                              <th style={{ padding: '0.4rem', border: '1px solid #ddd', textAlign: 'left' }}>Parent</th>
                              <th style={{ padding: '0.4rem', border: '1px solid #ddd', textAlign: 'left' }}>Enfant</th>
                              <th style={{ padding: '0.4rem', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                              <th style={{ padding: '0.4rem', border: '1px solid #ddd', textAlign: 'left' }}>Tél.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings[slot.id].map(b => (
                              <tr key={b.id}>
                                <td style={{ padding: '0.4rem', border: '1px solid #ddd' }}>{b.parent_name}</td>
                                <td style={{ padding: '0.4rem', border: '1px solid #ddd' }}>{b.child_name}</td>
                                <td style={{ padding: '0.4rem', border: '1px solid #ddd' }}>{b.email || '—'}</td>
                                <td style={{ padding: '0.4rem', border: '1px solid #ddd' }}>{b.phone || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <button onClick={() => deleteSlot(slot.id)}
                      style={{ marginTop: '0.5rem', background: COLORS.red, color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>
                      🗑️ Supprimer
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