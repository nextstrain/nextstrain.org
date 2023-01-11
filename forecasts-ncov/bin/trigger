#!/bin/bash
set -euo pipefail

: "${PAT_GITHUB_DISPATCH:=}"

repo="${1:?A repository name is required as the first argument.}"
event_type="${2:?An event type is required as the second argument.}"
shift 2

if [[ $# -eq 0 && -z $PAT_GITHUB_DISPATCH ]]; then
    cat >&2 <<.
You must specify options to curl for your GitHub credentials.  For example, you
can specify your GitHub username, and will be prompted for your password:

  $0 $repo $event_type --user <your-github-username>

Be sure to enter a personal access token¹ as your password since GitHub has
discontinued password authentication to the API starting on November 13, 2020².

You can also store your credentials or a personal access token in a netrc
file³:

  machine api.github.com
  login <your-username>
  password <your-token>

and then tell curl to use it:

  $0 $repo $event_type --netrc

which will then not require you to type your password every time.

¹ https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line
² https://docs.github.com/en/rest/overview/other-authentication-methods#via-username-and-password
³ https://ec.haxx.se/usingcurl/usingcurl-netrc
.
    exit 1
fi

auth=':'
if [[ -n $PAT_GITHUB_DISPATCH ]]; then
  auth="Authorization: Bearer ${PAT_GITHUB_DISPATCH}"
fi

if curl -fsS "https://api.github.com/repos/nextstrain/${repo}/dispatches" \
    -H 'Accept: application/vnd.github.v3+json' \
    -H 'Content-Type: application/json' \
    -H "$auth" \
    -d '{"event_type":"'"$event_type"'"}' \
    "$@"
then
    echo "Successfully triggered $event_type"
else
    echo "Request failed" >&2
    exit 1
fi
