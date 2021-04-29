
export async function fetchAndParseJSON(jsonUrl) {
  const jsonData = await fetch(jsonUrl)
    .then((res) => res.text())
    .then((text) => JSON.parse(text));
  return jsonData;
}
