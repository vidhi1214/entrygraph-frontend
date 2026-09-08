import { useEffect, useState } from 'react'
import { getDestinations } from '../api/destinations'

function DestinationList() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoading(true)
        setError('')

        const data = await getDestinations()
        setDestinations(data.content || [])
      } catch (err) {
        setError(err.message || 'Failed to load destinations')
      } finally {
        setLoading(false)
      }
    }

    loadDestinations()
  }, [])

  if (loading) {
    return <p>Loading destinations...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (destinations.length === 0) {
    return <p>No destinations found.</p>
  }

  return (
    <section>
      <h2>Destinations</h2>

      <div>
        {destinations.map((destination) => (
          <article key={destination.id}>
            <h3>{destination.name}</h3>

            <p>{destination.address}</p>

            <p>
              {destination.category} · {destination.status}
            </p>

            {destination.description && (
              <p>{destination.description}</p>
            )}

            <p>
              {destination.latitude}, {destination.longitude}
            </p>

            {destination.tags?.length > 0 && (
              <div>
                {destination.tags.map((tag) => (
                  <span key={tag.id}>
                    #{tag.name}{' '}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default DestinationList
