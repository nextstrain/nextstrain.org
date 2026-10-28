export function url(path) {
  return new URL(path, BASE_URL);
}

export function accept(mediaType) {
  return {
    headers: {
      Accept: mediaType,
    },
  };
}

