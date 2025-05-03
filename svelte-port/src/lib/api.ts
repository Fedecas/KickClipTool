export async function searchChannel(query: string): Promise<any[]> {
  if (!query) return []

  let result: any[] = []
  const params = new URLSearchParams({'searched_word': query})

  try {
    const response = await fetch(`/api/channels?${params}`)
    result = await response.json()
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  return result
}