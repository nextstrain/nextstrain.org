export const parseSlug = (slug) => {
  const fields = slug.split('/')
  return {
    category: fields[1],
    chapter: fields[2],
    title: fields[3],
    path: slug
  }
}
