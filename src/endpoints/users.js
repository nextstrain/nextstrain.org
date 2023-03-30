import { contentTypesProvided } from '../negotiate.js';
import { visibleGroups } from '../user.js';
import { sendGatsbyPage } from './static.js';


// Provide the client-side app with info about the current user
const getWhoami = contentTypesProvided([
  ["html", sendGatsbyPage("whoami/index.html")],
  ["json", (req, res) =>
    // Express's JSON serialization drops keys with undefined values
    res.json({
      user: req.user || null,
      visibleGroups: visibleGroups(req.user),
    })
  ],
]);


export {
  getWhoami,
};
