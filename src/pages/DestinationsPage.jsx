import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDestinations } from '../api/destinations'
import { getTags } from '../api/tags'
import '../App.css'

const CATEGORIES = [
  'CAFE',
  'RESTAURANT',
  'HOTEL',
  'TOURIST_ATTRACTION',
]

const STATUSES = ['ACTIVE', 'INACTIVE']

function formatCategory(category) {
  return category ? category.replaceAll('_', ' ') : ''
}

function DestinationsPage() {
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [tags, setTags] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [tagId, setTagId] = useState('')
  const [loading, setLoading] = useState(true)
  const [tagsLoading, setTagsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    async function loadTags() {
      try {
        setTagsLoading(true)
        const result = await getTags()
        setTags(result)
      } catch (err) {
        setError(err.message || 'Failed to load tags')
      } finally {
        setTagsLoading(false)
      }
    }

    loadTags()
  }, [])

  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoading(true)
        setError('')

        const result = await getDestinations({
          search,
          category,
          status,
          tagId,
          page,
          size: 10,
          sort: 'createdAt,desc',
        })

        setData(result)
      } catch (err) {
        setError(err.message || 'Failed to load destinations')
      } finally {
        setLoading(false)
      }
    }

    loadDestinations()
  }, [search, category, status, tagId, page])

  function clearFilters() {
    setSearch('')
    setCategory('')
    setStatus('')
    setTagId('')
    setPage(0)
  }

  return (
    <main className="content">
      <div className="page-heading">
        <div>
          <h1>Destinations</h1>

          {data && (
            <p className="result-count">
              {data.totalElements} destination
              {data.totalElements === 1 ? '' : 's'} found
            </p>
          )}
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => navigate('/destinations/new')}
        >
          + Add Destination
        </button>
      </div>

      <section className="filters">
        <input
          className="search-input"
          type="search"
          placeholder="Search by name or address..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(0)
          }}
        />

        <select
          className="filter-select"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value)
            setPage(0)
          }}
        >
          <option value="">All categories</option>

          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {formatCategory(item)}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(0)
          }}
        >
          <option value="">All statuses</option>

          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={tagId}
          disabled={tagsLoading}
          onChange={(event) => {
            setTagId(event.target.value)
            setPage(0)
          }}
        >
          <option value="">
            {tagsLoading ? 'Loading tags...' : 'All tags'}
          </option>

          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>

        {(search || category || status || tagId) && (
          <button
            className="clear-button"
            type="button"
            onClick={clearFilters}
          >
            Clear
          </button>
        )}
      </section>

      {loading && (
        <div className="state">
          Loading destinations...
        </div>
      )}

      {!loading && error && (
        <div className="state error-state">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {data.content.length === 0 ? (
            <div className="state">
              No destinations found.
            </div>
          ) : (
            <section className="destination-grid">
              {data.content.map((destination) => (
                <article
                  className="destination-card clickable"
                  key={destination.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/destinations/${destination.id}`)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      event.preventDefault()
                      navigate(
                        `/destinations/${destination.id}`,
                      )
                    }
                  }}
                >
                  <div className="card-top">
                    <div>
                      <h2 className="destination-name">
                        {destination.name}
                      </h2>

                      <p className="address">
                        {destination.address}
                      </p>
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

                  <div className="meta">
                    <span>
                      {formatCategory(destination.category)}
                    </span>
                  </div>

                  {destination.description && (
                    <p className="description">
                      {destination.description}
                    </p>
                  )}

                  <p className="coordinates">
                    {destination.latitude},{' '}
                    {destination.longitude}
                  </p>

                  {destination.tags?.length > 0 && (
                    <div className="tags">
                      {destination.tags.map((tag) => (
                        <span className="tag" key={tag.id}>
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </section>
          )}

          {data.totalPages > 1 && (
            <nav className="pagination">
              <button
                className="page-button"
                type="button"
                disabled={data.first}
                onClick={() =>
                  setPage((current) => current - 1)
                }
              >
                Previous
              </button>

              <span className="page-number">
                Page {data.number + 1} of {data.totalPages}
              </span>

              <button
                className="page-button"
                type="button"
                disabled={data.last}
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  )
}

export default DestinationsPage
