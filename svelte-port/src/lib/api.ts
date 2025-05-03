export async function searchChannel(query: string): Promise<any[]> {
  let result: any[] = [];
  if (query) {
    const params = new URLSearchParams({'searched_word': query});
    const response = await fetch(`/api/channels?${params}`);

    if (response.ok) {
      const res = await response.json();
      result = res?.content || [];
    } else {
      console.error(`Network response was not ok (${response.status})`);
    }
  }

  return result;
}