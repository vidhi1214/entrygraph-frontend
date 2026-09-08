import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDestination } from '../api/destinations'
import { getTags } from '../api/tags'
import '../App.css'

const CATEGORIES = [
  'CAFE',
  'RESTAURANT',
  'HOTEL',
  'TOURIST_ATTRACTION',
]

function CreateDestinationPage() {
  const navigate = useNavigate()

  const [tags, setTags] = useState([])
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    category: '',
    description: '',
    tagIds: [],
  })

  const [loadingTags, setLoadingTags] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    async function loadTags() {
      try {
        const result = await getTags()
        setTags(result)
      } catch (err) {
        setError(err.message || 'Failed to load tags')
      } finally {
        setLoadingTags(false)
      }
    }

    loadTags()
  }, [])

  function updateField(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setFieldErrors((current) => ({
      ...current,
      [name]: undefined,
    }))
  }

  function toggleTag(tagId) {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((id) => id !== tagId)
        : [...current.tagIds, tagId],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setSaving(true)
    setError('')
    setFieldErrors({})

    try {
      const created = await createDestination({
        name: form.name.trim(),
        address: form.address.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        category: form.category,
        description: form.description.trim() || null,
        tagIds: form.tagIds,
      })

      navigate(`/destinations/${created.id}`)
    } catch (err) {
      setError(err.message || 'Failed to create destination')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="content">
      <div className="page-heading">
        <div>
          <h1>Create Destination</h1>
          <p className="result-count">
            Add a new destination to EntryGraph
          </p>
        </div>
      </div>

      <form className="destination-form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="form-grid">
          <label className="form-field">
            <span>Name</span>
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Destination name"
              required
            />
            {fieldErrors.name && (
              <small>{fieldErrors.name}</small>
            )}
          </label>

          <label className="form-field">
            <span>Category</span>
            <select
              name="category"
              value={form.category}
              onChange={updateField}
              required
            >
              <option value="">Select category</option>

              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field form-field-wide">
            <span>Address</span>
            <input
              name="address"
              value={form.address}
              onChange={updateField}
              placeholder="Address"
              required
            />
          </label>

          <label className="form-field">
            <span>Latitude</span>
            <input
              name="latitude"
              type="number"
              step="any"
              value={form.latitude}
              onChange={updateField}
              placeholder="19.076"
              required
            />
          </label>

          <label className="form-field">
            <span>Longitude</span>
            <input
              name="longitude"
              type="number"
              step="any"
              value={form.longitude}
              onChange={updateField}
              placeholder="72.877"
              required
            />
          </label>

          <label className="form-field form-field-wide">
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="Optional description"
              rows="4"
            />
          </label>
        </div>

        <div className="form-field">
          <span>Tags</span>

          {loadingTags ? (
            <p className="form-help">Loading tags...</p>
          ) : tags.length === 0 ? (
            <p className="form-help">
              No tags available.
            </p>
          ) : (
            <div className="tag-picker">
              {tags.map((tag) => {
                const selected = form.tagIds.includes(tag.id)

                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`tag-option ${
                      selected ? 'selected' : ''
                    }`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    #{tag.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => navigate('/')}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Destination'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default CreateDestinationPage
