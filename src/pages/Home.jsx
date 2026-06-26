import { useState } from 'react'
import SlotList from '../components/SlotList'
import BookingForm from '../components/BookingForm'
import Calendar from '../components/Calendar'

export default function Home() {
  const [showSlots, setShowSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f5f0e8', minHeight: '100vh' }}>
      
      <header style={{
        background: '#1a2744',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img src="/logo.png" alt="Ecurie de Groynne" style={{ height: '80px', mixBlendMode: 'screen', filter: 'invert(1)' }} />
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        
        <h1 style={{ color: '#1a2744', fontSize: '2rem', marginBottom: '0.5rem', letterSpacing: '1px' }}>
          Réservation des cours — Congés scolaires
        </h1>

        <div style={{ width: '60px', height: '3px', background: '#1a2744', margin: '1rem auto 2rem auto' }} />

        {confirmed ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '3rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</p>
            <h2 style={{ color: '#1a2744', marginBottom: '1rem' }}>Inscription confirmée !</h2>
            <p style={{ color: '#555', marginBottom: '2rem' }}>
              Merci ! Votre inscription a bien été enregistrée. À très bientôt à l'Ecurie de Groynne !
            </p>
            <button
              onClick={() => { setConfirmed(false); setSelectedSlot(null); setShowSlots(false) }}
              style={{ background: '#1a2744', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
              Retour à l'accueil
            </button>
          </div>

        ) : selectedSlot ? (
          <div style={{ textAlign: 'left' }}>
            <button onClick={() => setSelectedSlot(null)}
              style={{ background: 'none', border: 'none', color: '#1a2744', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '1rem' }}>
              ← Retour
            </button>
            <BookingForm
              slot={selectedSlot}
              onSuccess={() => setConfirmed(true)}
              onCancel={() => setSelectedSlot(null)}
            />
          </div>

        ) : (
          <div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '2rem', textAlign: 'left' }}>
              <p style={{ color: '#333', fontSize: '1.1rem', lineHeight: '1.8' }}>
                Bienvenue à l'<strong>Ecurie de Groynne</strong> ! 🐴
              </p>
              <p style={{ color: '#555', fontSize: '1rem', lineHeight: '1.8' }}>
                C'est ici que vous pouvez <strong>réserver votre leçon d'équitation</strong> durant 
                les congés scolaires. Consultez les créneaux disponibles, choisissez celui qui vous 
                convient et inscrivez-vous en quelques clics !
              </p>
              <p style={{ color: '#555', fontSize: '1rem', lineHeight: '1.8' }}>
                Les places sont limitées, alors n'attendez pas trop longtemps. 😊
              </p>
            </div>

            {/* Calendrier */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '2rem', textAlign: 'left' }}>
              <h2 style={{ color: '#1a2744', marginTop: 0, fontSize: '1.2rem' }}>📅 Agenda de l'écurie</h2>
              <Calendar onSelectSlot={setSelectedSlot} />
            </div>

            <button 
              onClick={() => setShowSlots(true)}
              style={{ background: '#1a2744', color: 'white', border: 'none', padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '8px', cursor: 'pointer', letterSpacing: '1px' }}>
              Voir tous les créneaux disponibles →
            </button>

            {showSlots && (
              <div style={{ textAlign: 'left', marginTop: '2rem' }}>
                <button onClick={() => setShowSlots(false)}
                  style={{ background: 'none', border: 'none', color: '#1a2744', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  ← Masquer
                </button>
                <h2 style={{ color: '#1a2744' }}>Créneaux disponibles</h2>
                <SlotList onSelectSlot={setSelectedSlot} />
              </div>
            )}
          </div>
        )}

      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: '0.85rem', borderTop: '1px solid #ddd', marginTop: '3rem' }}>
        <img src="/logo.png" alt="Ecurie de Groynne" style={{ height: '50px', marginBottom: '0.8rem', mixBlendMode: 'multiply', opacity: 0.7 }} />
        <p style={{ color: '#1a2744', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.3rem' }}>Ecurie de Groynne</p>
        <p style={{ marginBottom: '0.2rem' }}>François Jadot</p>
        <p style={{ marginBottom: '0.2rem' }}>Rue de Groynne 28, 5300 Andenne</p>
        <p style={{ marginBottom: '1rem' }}>📞 0478/60.56.89</p>
        <p style={{ fontSize: '0.8rem' }}>© 2026 Ecurie de Groynne — Tous droits réservés</p>
      </footer>

    </div>
  )
}