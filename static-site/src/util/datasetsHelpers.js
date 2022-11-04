
export const fetchAndParseJSON = async (jsonUrl) => {
  return fetch(jsonUrl, { headers: { Accept: 'application/json' }}).then((res) => {
    if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
    return res.json();
  });
};
