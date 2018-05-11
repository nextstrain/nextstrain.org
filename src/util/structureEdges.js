const parseSlug = require("./parseSlug");

const parseEdges = (edges, sectionWanted) => {
  const relevantNodes = edges
    .map((e) => ({
      ...parseSlug.parseSlug(e.node.fields.slug),
      chapterOrder: e.node.fields.chapterOrder,
      postOrder: e.node.fields.postOrder
    }))
    .filter((n) => n.section === sectionWanted);

  const hasChapters = !!relevantNodes[0].chapter;

  let data = []; /* no chapters by default */
  if (hasChapters) {
    /* generate an array where each entry corresponds to a chapter
    no posts have yeat to be added, but the ordering of chapters is correct */
    data = relevantNodes
      .sort((a, b) => {
        if (parseInt(a.chapterOrder, 10) < parseInt(b.chapterOrder, 10)) return -1;
        if (parseInt(a.chapterOrder, 10) > parseInt(b.chapterOrder, 10)) return 1;
        return 0;
      })
      .map((d) => d.chapter)
      .filter((cv, idx, arr) => arr.indexOf(cv)===idx) /* filter to unique values */
      .map((d) => ({name: d, posts: []}));
  }

  /* add each post to the correct chapter within data */
  relevantNodes.forEach((meta) => {
    const nodeData = {
      title: meta.title,
      path: meta.path,
      order: parseInt(meta.postOrder, 10)
    };
    if (hasChapters) {
      const chapterIdx = data.findIndex((el) => el.name === meta.chapter);
      data[chapterIdx].posts.push(nodeData);
    } else {
      data.push(nodeData);
    }
  });

  /* sort posts within each chapter */
  const postSorter = (a, b) => {
    if (parseInt(a.order, 10) < parseInt(b.order, 10)) return -1;
    if (parseInt(a.order, 10) > parseInt(b.order, 10)) return 1;
    return 0;
  };
  if (hasChapters) {
    data.forEach((d) => {d.posts = d.posts.sort(postSorter);});
  } else {
    data.sort(postSorter);
  }

  return [hasChapters, data];
};

exports.parseEdges = parseEdges;
