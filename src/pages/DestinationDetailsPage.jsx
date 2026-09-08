import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  deleteDestination,
  getDestinationById,
  updateDestination,
} from '../api/destinations'
import { getTags } from '../api/tags'
import '../App.css'

const CATEGORIES = [
  'CAFE',
  'RESTAURANT',
  'HOTEL',
  'TOURIST_ATTRACTION',
]

function formatCategory(category) {
  return category
    ? category.replaceAll('_', ' ')
    : ''
}

function DestinationDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [destination, setDestination] = useState(null)
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    category: '',
    description: '',
    tagIds: [],
  })

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError('')

        const [destinationResult, tagsResult] =
          await Promise.all([
            getDestinationById(id),
            getTags(),
          ])

        setDestination(destinationResult)
        setTags(tagsResult)

        setForm({
          name: destinationResult.name || '',
          address: destinationResult.address || '',
          latitude: destinationResult.latitude ?? '',
          longitude: destinationResult.longitude ?? '',
          category: destinationResult.category || '',
          description: destinationResult.description || '',
          tagIds:
            destinationResult.tags?.map((tag) => tag.id) || [],
        })
      } catch (err) {
        setError(
          err.message || 'Failed to load destination',
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  function updateField(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function toggleTag(tagId) {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((existingId) => existingId !== tagId)
        : [...current.tagIds, tagId],
    }))
  }

  function resetFormFromDestination() {
    setForm({
      name: destination.name || '',
      address: destination.address || '',
      latitude: destination.latitude ?? '',
      longitude: destination.longitude ?? '',
      category: destination.category || '',
      description: destination.description || '',
      tagIds:
        destination.tags?.map((tag) => tag.id) || [],
    })
  }

  function cancelEdit() {
    setEditing(false)
    resetFormFromDestination()
    setError('')
  }

  async function handleSave(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      const updated = await updateDestination(
        id,
        {
          name: form.name.trim(),
          address: form.address.trim(),
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          category: form.category,
          description: form.description.trim() || null,
          tagIds: form.tagIds,
        },
      )

      setDestination(updated)
      setEditing(false)
    } catch (err) {
      setError(
        err.message || 'Failed to update destination',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${destination.name}"? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await deleteDestination(id)

      navigate('/')
    } catch (err) {
      setError(
        err.message || 'Failed to delete destination',
      )
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="content">
        <div className="state">
          Loading destination...
        </div>
      </main>
    )
  }

  if (error && !destination) {
    return (
      <main className="content">
        <div className="state error-state">
          {error}
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => navigate('/')}
        >
          Back to Destinations
        </button>
      </main>
    )
  }

  if (!destination) {
    return null
  }

  return (
    <main className="content">
      <div className="details-header">
        <button
          className="secondary-button"
          type="button"
          onClick={() => navigate('/')}
        >
          ← Back
        </button>

        {!editing && (
          <div className="details-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setError('')
                setEditing(true)
              }}
            >
              Edit
            </button>

            <button
              className="danger-button"
              type="button"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {editing ? (
        <form
          className="destination-form"
          onSubmit={handleSave}
        >
          <div className="page-heading">
            <div>
              <h1>Edit Destination</h1>
              <p className="result-count">
                Update destination information
              </p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Name</span>
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                required
              />
            </label>

            <label className="form-field">
              <span>Category</span>
              <select
                name="category"
                value={form.category}
                onChange={updateField}
                required
              >
                <option value="">
                  Select category
                </option>

                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
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
                required
              />
            </label>

            <label className="form-field form-field-wide">
              <span>Description</span>
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={updateField}
              />
            </label>
          </div>

          <div className="form-field">
            <span>Tags</span>

            <div className="tag-picker">
              {tags.map((tag) => {
                const selected =
                  form.tagIds.includes(tag.id)

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
          </div>

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <section className="details-card">
          <div className="details-title-row">
            <div>
              <h1>{destination.name}</h1>
              <p>{destination.address}</p>
            </div>

            <span
              className={`status-badge ${
                destination.status === 'INACTIVE'
                  ? 'inactive'
                  : ''
              }`}
            >
              {destination.status}
            </span>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <span>Category</span>
              <strong>
                {formatCategory(destination.category)}
              </strong>
            </div>

            <div className="detail-item">
              <span>Coordinates</span>
              <strong>
                {destination.latitude},{' '}
                {destination.longitude}
              </strong>
            </div>
          </div>

          {destination.description && (
            <div className="detail-section">
              <span>Description</span>
              <p>{destination.description}</p>
            </div>
          )}

          <div className="detail-section">
            <span>Tags</span>

            {destination.tags?.length > 0 ? (
              <div className="tags">
                {destination.tags.map((tag) => (
                  <span className="tag" key={tag.id}>
                    #{tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="empty-detail">
                No tags assigned
              </p>
            )}
          </div>

          <div className="detail-section">
            <span>Created</span>
            <p>
              {new Date(
                destination.createdAt,
              ).toLocaleString()}
            </p>
          </div>
        </section>
      )}
    </main>
  )
}

export default DestinationDetailsPage
