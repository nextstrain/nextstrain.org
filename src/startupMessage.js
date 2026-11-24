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
  switch (app.locals.SERVER_MODE) {
    case 'production':
      console.log(`  Running in production mode`);
      break;
    case 'testing':
      console.log(`  Running in testing mode (development backend with production Next.js assets)`);
      break;
    case 'development':
      console.log(`  Running in development mode (hot reloading enabled)`);
      break;
    default:
      throw new Error(`Unknown SERVER_MODE: "${app.locals.SERVER_MODE}"`);
  }
  console.log(`  AWS credentials: ${awsId}`)
  console.log("  " + groupsSummary());
  console.log('  Github token present? ' + (process.env.GITHUB_TOKEN ? 'Yes' : 'No'))
  console.log("\n  -------------------------------------------------------------------------\n\n");
}
