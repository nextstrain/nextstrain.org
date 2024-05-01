import { getAwsId } from "./aws.js";
import { groupsSummary } from "./groups.js";

export const nextstrainAbout = `
  Nextstrain is an open-source project to harness the scientific and public
  health potential of pathogen genome data.
  See https://github.com/nextstrain/nextstrain.org for more.
`;

export async function startupMessage(server, app) {

  const awsId = await getAwsId();

  console.log("  -------------------------------------------------------------------------");
  console.log('                             NEXTSTRAIN SERVER');
  console.log(nextstrainAbout);
  console.log(`  Server listening on port ${server.address().port}, accessible at http://localhost:${server.address().port}`);
  console.log(`  Server is running in ${app.locals.production ? 'production' : 'development'} mode`);
  if (app.locals.STATIC_SITE_PRODUCTION) {
    console.log(`  Next.js frontend is running in production mode (statically generated assets)`)
  } else {
    console.log(`  Next.js frontend is running in development mode (hot reloading etc)`)
  }
  console.log(`  AWS credentials: ${awsId}`)
  console.log("  " + groupsSummary());
  console.log('  Github token present? ' + (process.env.GITHUB_TOKEN ? 'Yes' : 'No'))
  console.log("\n  -------------------------------------------------------------------------\n\n");
}
