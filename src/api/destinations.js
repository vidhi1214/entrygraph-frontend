const API_BASE_URL = 'http://localhost:8080/api/v1'

async function handleResponse(response, defaultMessage) {
  if (!response.ok) {
    let message = defaultMessage

    try {
      const error = await response.json()
      message = error.message || message
    } catch {
      // Keep default message.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export async function getDestinations({
  search = '',
  category = '',
  status = '',
  tagId = '',
  page = 0,
  size = 10,
  sort = '',
} = {}) {
  const params = new URLSearchParams()

  if (search.trim()) params.set('search', search.trim())
  if (category) params.set('category', category)
  if (status) params.set('status', status)
  if (tagId) params.set('tagId', tagId)

  params.set('page', page)
  params.set('size', size)

  if (sort) params.set('sort', sort)

  const response = await fetch(
    `${API_BASE_URL}/destinations?${params.toString()}`,
  )

  return handleResponse(
    response,
    'Failed to load destinations',
  )
}

export async function getDestinationById(id) {
  const response = await fetch(
    `${API_BASE_URL}/destinations/${id}`,
  )

  return handleResponse(
    response,
    'Failed to load destination',
  )
}

export async function createDestination(destination) {
  const response = await fetch(
    `${API_BASE_URL}/destinations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(destination),
    },
  )

  return handleResponse(
    response,
    'Failed to create destination',
  )
}

export async function updateDestination(id, destination) {
  const response = await fetch(
    `${API_BASE_URL}/destinations/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(destination),
    },
  )

  return handleResponse(
    response,
    'Failed to update destination',
  )
}

export async function deleteDestination(id) {
  const response = await fetch(
    `${API_BASE_URL}/destinations/${id}`,
    {
      method: 'DELETE',
    },
  )

  return handleResponse(
    response,
    'Failed to delete destination',
  )
}
