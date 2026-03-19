import { useState } from 'react'
import AddMatiereForm from '../components/AddMatiereForm'

const TestAddMatiere = () => {
  const [matieres, setMatieres] = useState([])

  const handleMatiereAdded = (newMatiere) => {
    setMatieres([...matieres, newMatiere])
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-color)' }}>
      <div className="container" style={{ paddingTop: '2rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Test - Ajouter une matière</h1>
        
        <AddMatiereForm onSuccess={handleMatiereAdded} />
        
        {matieres.length > 0 && (
          <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <div className="card-header">
              <h3 className="card-title">Matières ajoutées</h3>
            </div>
            <div className="card-body">
              {matieres.map((matiere, index) => (
                <div key={index} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <strong>{matiere.name}</strong> - {matiere.filiere?.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestAddMatiere