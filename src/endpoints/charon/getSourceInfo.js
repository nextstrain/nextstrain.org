/**
 * Prototype implementation.
 */
const getSourceInfo = async (req, res) => {
  return res.json(await req.context.source.getInfo());
};


export {
  getSourceInfo,
};
