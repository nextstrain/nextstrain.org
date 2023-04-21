import { contentTypesProvided } from '../negotiate.js';
import { visibleGroups } from '../user.js';
import * as nextApp from './nextApp.js';


// Provide the client-side app with info about the current user
const getWhoami = contentTypesProvided([
  ["html", nextApp.handleRequest],
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
