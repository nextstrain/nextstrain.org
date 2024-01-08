import {ListResources} from "../resourceIndex.js";

/**
 * TKTK
 *
 *
 * @type {asyncExpressHandler}
 */
export const send = async (req, res) => {
  console.log("&&&& endpoints::listResources::send() &&&&"); // FIXME
  console.log(req.query)

  const resources = new ListResources();

  const data = {
    WARNING: `This API is intended for internal use only. The API, including the address, may change at any point without notice.`,
    ...resources.data
  }

  return res.json(data);
};
