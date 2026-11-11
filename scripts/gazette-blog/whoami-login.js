// whoami-login.js — the only dynamic part of the chrome.
//
// The Next chrome shows a LOGIN link that is swapped for the signed-in user's
// name by a client-side fetch("/whoami") (see components/user-data-wrapper +
// components/nav/user-or-login-link.tsx). None of that needs server rendering,
// so here it is ~15 lines of vanilla JS against the same /whoami endpoint the
// Express server already serves. The initial HTML always ships the LOGIN link,
// so the page is correct with JS disabled.
//
// The snapshotted chrome renders the real <UserOrLoginLink/> in its logged-out
// state: `<a href="/login">LOGIN</a>` (no id). We find it by that href within
// the header chrome and, when signed in, mirror the component's logged-in markup
// (`<a href="/whoami">👤 username</a>`).
(function () {
  var link = document.querySelector('.site-chrome a[href="/login"]');
  if (!link) return;

  fetch("/whoami", { headers: { Accept: "application/json" } })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (whoami) {
      if (whoami && whoami.user && whoami.user.username) {
        link.setAttribute("href", "/whoami");
        link.textContent = "👤 " + whoami.user.username;
      }
    })
    .catch(function () {
      /* leave the LOGIN link as-is on error */
    });
})();
