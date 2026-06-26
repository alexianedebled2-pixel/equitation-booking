import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const COURS_TYPES = [
  'Tous',
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
}

export default function SlotList({ onSelectSlot }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('Tous')

  useEffect(() => {
    fetchSlots()
  }, [])

  async function fetchSlots() {
    const { data, error } = await supabase
      .from('slots_with_availability')
      .select('*')
      .order('date', { ascending: true })
    if (!error) setSlots(data)
    setLoading(false)
  }

  const slotsFiltres = filtre === 'Tous'
    ? slots
    : slots.filter(s => s.title.includes(filtre))

  if (loading) return <p style={{ textAlign: 'center', color: '#555' }}>Chargement des créneaux...</p>

  if (slots.length === 0) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>
      <p>Aucun créneau disponible pour le moment.</p>
      <p>Revenez bientôt ! 🐴</p>
    </div>
  )

  return (
    <div>
      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {COURS_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setFiltre(type)}
            style={{
              background: filtre === type ? COLORS.navy : 'white',
              color: filtre === type ? 'white' : COLORS.navy,
              border: `2px solid ${COLORS.navy}`,
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: filtre === type ? 'bold' : 'normal'
            }}>
            {type}
          </button>
        ))}
      </div>

      {slotsFiltres.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center' }}>Aucun créneau pour ce niveau.</p>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {slotsFiltres.map(slot => (
          <div key={slot.id} style={{
            background: 'white',
            border: slot.places_remaining > 0 ? `2px solid ${COLORS.navy}` : '2px solid #ddd',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            opacity: slot.places_remaining > 0 ? 1 : 0.6
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ color: COLORS.navy, margin: 0, fontSize: '1rem' }}>{slot.title}</h3>
              <span style={{
                background: slot.places_remaining > 0 ? '#d4edda' : '#f8d7da',
                color: slot.places_remaining > 0 ? '#155724' : '#721c24',
                padding: '0.2rem 0.7rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                {slot.places_remaining > 0 ? `✅ ${slot.places_remaining} place(s)` : '❌ Complet'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
              <span>📅 {new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <span>🕐 {slot.time_start.slice(0,5)} – {slot.time_end.slice(0,5)}</span>
            </div>

            <button
              disabled={slot.places_remaining <= 0}
              onClick={() => onSelectSlot(slot)}
              style={{
                background: slot.places_remaining > 0 ? COLORS.navy : '#ccc',
                color: 'white',
                border: 'none',
                padding: '0.7rem',
                borderRadius: '8px',
                cursor: slot.places_remaining > 0 ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                width: '100%'
              }}>
              {slot.places_remaining > 0 ? "M'inscrire" : 'Complet'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}