
export const fetchAndParseJSON = async (jsonUrl) => {
  return fetch(jsonUrl, { headers: { Accept: 'application/json' }})
    .then((res) => res.json());
};
