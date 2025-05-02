export async function searchChannel(query: string): Promise<any[]> {
  if (!query) return [];

  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    const res = await fetch('https://dummyjson.com/products/search?q=' + query);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data?.products || [];
  } catch (error) {
    alert('Something went wrong.');
    return [];
  }
}