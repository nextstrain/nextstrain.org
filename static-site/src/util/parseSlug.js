const parseSlug = (slug) => {
  const fields = slug.split('/');
  if (fields.length === 3) {
    return {
      section: fields[1],
      chapter: undefined,
      title: fields[2],
      path: slug
    };
  }
  return {
    section: fields[1],
    chapter: fields[2],
    title: fields[3],
    path: slug
  };
};

exports.parseSlug = parseSlug;
