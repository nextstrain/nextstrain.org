const {BadRequest} = require("http-errors");

const {sendNarrativeSubresource} = require("../sources");

const getNarrative = async (req, res) => {
  const query = req.query;
  const validTypes = new Set(["markdown", "md"]);

  if (!validTypes.has((query.type || "").toLowerCase())) {
    throw new BadRequest(`Required query parameter 'type' has an unsupported value ('${query.type}').  Supported values are: ${Array.from(validTypes).join(', ')}`);
  }

  return await sendNarrativeSubresource("md")(req, res);
};

module.exports = {
  default: getNarrative
};
