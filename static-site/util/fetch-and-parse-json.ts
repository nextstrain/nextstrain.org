export default async function fetchAndParseJSON<T = unknown>(
  jsonUrl: string,
): Promise<T> {
  const response = await fetch(jsonUrl, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`application/json request to ${jsonUrl} failed: ${response.status} ${response.statusText}`);
  } else {
    return await response.json();
  }
}
