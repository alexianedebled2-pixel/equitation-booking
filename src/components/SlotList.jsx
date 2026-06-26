import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SlotList({ onSelectSlot }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <p style={{ textAlign: 'center', color: '#555' }}>Chargement des créneaux...</p>

  if (slots.length === 0) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#555' }}>
      <p>Aucun créneau disponible pour le moment.</p>
      <p>Revenez bientôt ! 🐴</p>
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
      {slots.map(slot => (
        <div key={slot.id} style={{
          background: 'white',
          border: slot.places_remaining > 0 ? '2px solid #1a2744' : '2px solid #ddd',
          borderRadius: '10px',
          padding: '1.2rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: slot.places_remaining > 0 ? 1 : 0.6
        }}>
          <div>
            <h3 style={{ color: '#1a2744', margin: '0 0 0.3rem 0' }}>{slot.title}</h3>
            <p style={{ margin: '0.2rem 0', color: '#555' }}>
              📅 {new Date(slot.date).toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </p>
            <p style={{ margin: '0.2rem 0', color: '#555' }}>
              🕐 {slot.time_start.slice(0,5)} – {slot.time_end.slice(0,5)}
            </p>
            <p style={{ margin: '0.2rem 0', color: slot.places_remaining > 0 ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
              {slot.places_remaining > 0
                ? `✅ ${slot.places_remaining} place(s) disponible(s)`
                : '❌ Complet'}
            </p>
          </div>

          <button
            disabled={slot.places_remaining <= 0}
            onClick={() => onSelectSlot(slot)}
            style={{
              background: slot.places_remaining > 0 ? '#1a2744' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '0.7rem 1.5rem',
              borderRadius: '8px',
              cursor: slot.places_remaining > 0 ? 'pointer' : 'not-allowed',
              fontSize: '0.95rem',
              whiteSpace: 'nowrap'
            }}
          >
            {slot.places_remaining > 0 ? "M'inscrire" : 'Complet'}
          </button>
        </div>
      ))}
    </div>
  )
}