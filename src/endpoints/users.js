import { contentTypesProvided } from '../negotiate.js';
import { Whoami } from '../pages/index.js';
import { sendPage } from '../renderer.js';
import { visibleGroups } from '../user.js';


// Provide the client-side app with info about the current user
const getWhoami = contentTypesProvided([
  ["html", sendPage(Whoami)],
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
