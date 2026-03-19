import { useState, useEffect } from 'react'
import axios from 'axios'

const AddMatiereForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    filiere_id: ''
  })
  const [filieres, setFilieres] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/filieres')
        setFilieres(response.data)
      } catch (error) {
        console.error('Erreur lors du chargement des filières:', error)
      }
    }
    fetchFilieres()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:8000/api/matieres', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      alert('Matière ajoutée avec succès!')
      setFormData({ name: '', filiere_id: '' })
      if (onSuccess) onSuccess(response.data)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'ajout de la matière: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <div className="card-header">
        <h3 className="card-title">Ajouter une matière</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom de la matière</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="Ex: Mathématiques"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Filière</label>
            <select
              className="form-select"
              value={formData.filiere_id}
              onChange={(e) => setFormData({...formData, filiere_id: e.target.value})}
              required
            >
              <option value="">Sélectionnez une filière</option>
              {filieres.map(filiere => (
                <option key={filiere.id} value={filiere.id}>
                  {filiere.name || filiere.nom} - {filiere.niveau}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Ajout en cours...' : 'Ajouter la matière'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddMatiereForm