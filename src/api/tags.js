const API_BASE_URL = 'http://localhost:8080/api/v1'

async function handleResponse(response, defaultMessage) {
  if (!response.ok) {
    let message = defaultMessage

    try {
      const error = await response.json()
      message = error.message || message
    } catch {
      // Keep the default message.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export async function getTags() {
  const response = await fetch(`${API_BASE_URL}/tags`)

  return handleResponse(
    response,
    'Failed to load tags',
  )
}
