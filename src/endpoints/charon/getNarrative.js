import { BadRequest } from 'http-errors';
import { sendNarrativeSubresource } from '../sources';

const getNarrative = async (req, res) => {
  const query = req.query;
  const validTypes = new Set(["markdown", "md"]);

  if (!validTypes.has((query.type || "").toLowerCase())) {
    throw new BadRequest(`Required query parameter 'type' has an unsupported value ('${query.type}').  Supported values are: ${Array.from(validTypes).join(', ')}`);
  }

  return await sendNarrativeSubresource("md")(req, res);
};

export default {
  default: getNarrative
};
