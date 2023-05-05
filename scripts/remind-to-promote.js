#!/usr/bin/env node
import {ArgumentParser} from "argparse";
import {DateTime} from "luxon";
import fetch from "node-fetch";
import process from "process";
import readStream from "raw-body";

const workingDays = new Set([1, 2, 3, 4, 5]);
const workingHours = new Set([9, 10, 11, 12, 13, 14, 15, 16, 17]);
const workingTimezones = [
  "America/Los_Angeles",
  "Europe/Zurich",
  "Pacific/Auckland",
];

const pipeline = "38f67fc7-d93c-40c6-a182-501da2f89d9d";
const staging = "nextstrain-canary";
const production = "nextstrain-server";


function parseArgs() {
  const argparser = new ArgumentParser();

  argparser.addArgument("--check", {
    help: "Check mode",
    action: "storeConst",
    dest: "mode",
    constant: "check",
  });

  argparser.addArgument("--send", {
    help: "Send mode",
    action: "storeConst",
    dest: "mode",
    constant: "send",
  });

  argparser.addArgument("--grace-period", {
    help: `Grace period (in work days) during which not to remind after a release to ${staging}`,
    metavar: "<days>",
    dest: "gracePeriod",
    type: "int",
    defaultValue: 3,
  });

  const args = argparser.parseArgs();

  if (!args.mode) args.mode = "check";

  return args;
}


async function main({mode, gracePeriod}) {
  switch (mode) {
    case "check":
      await check({gracePeriod});
      break;

    case "send":
      await send();
      break;

    default:
      throw new Error(`Unknown mode of operation: ${mode}`);
  }
}


async function check({gracePeriod}) {
  const now = DateTime.now();

  // Don't run when no one's around.  We'll keep being invoked every hour and
  // will eventually start passing this check again.
  const tzWithFolksAround = isThereAnybodyOutThere(now);
  if (!tzWithFolksAround) {
    console.warn(`No one's around; skipping check.`);
    return;
  }

  console.warn(`working timezone: ${tzWithFolksAround}`);

  // Fetch latest releases of all apps in the pipeline
  const pipelineReleases = await heroku(`/pipelines/${pipeline}/latest-releases`);

  // Find staging and production app releases
  const stagingRelease = pipelineReleases.find(r => r.app.name === staging);
  const productionRelease = pipelineReleases.find(r => r.app.name === production);

  if (!stagingRelease) throw new Error(`Unable to find release for ${staging} in ${JSON.stringify(pipelineReleases)}`);
  if (!productionRelease) throw new Error(`Unable to find release for ${production} in ${JSON.stringify(pipelineReleases)}`);

  const stagingSlugId = stagingRelease.slug.id;
  const productionSlugId = productionRelease.slug.id;

  // Is there anything to promote?
  if (stagingSlugId === productionSlugId) {
    console.warn(`Nothing to promote.`);
    return;
  }

  const stagingReleasedAt = DateTime.fromISO(stagingRelease.created_at);
  const stagingReleasedAgo = now.diff(stagingReleasedAt);

  const stagingReleasedAgoHumanized =
    stagingReleasedAgo
      .shiftTo("days", "hours", "minutes")
      .normalize()
      .toHuman({unitDisplay: "short"});

  const workDaysSinceStagingReleased = workDaysBetween(
    stagingReleasedAt.setZone(tzWithFolksAround),
    now.setZone(tzWithFolksAround)
  );

  console.warn(`${staging} slug: ${stagingSlugId} (${stagingReleasedAgoHumanized} ago)`);
  console.warn(`${production} slug: ${productionSlugId}`);

  // Is it ok to stew a bit longer?
  if (workDaysSinceStagingReleased <= gracePeriod) {
    console.warn(`Still in the grace period (${workDaysSinceStagingReleased} ≤ ${gracePeriod} work days); skipping output.`);
    return;
  }

  // Fetch both slugs for comparison
  const [stagingSlug, productionSlug] = await Promise.all([
    heroku(`/apps/${staging}/slugs/${stagingSlugId}`),
    heroku(`/apps/${production}/slugs/${productionSlugId}`),
  ]);

  console.warn(`${staging} commit: ${stagingSlug.commit}`);
  console.warn(`${production} commit: ${productionSlug.commit}`);

  console.log(
    JSON.stringify({
      config: {
        pipeline,
        staging,
        production,
      },
      staging: {
        slug: stagingSlug.id,
        commit: stagingSlug.commit,
        releasedAt: stagingRelease.created_at,
      },
      production: {
        slug: productionSlug.id,
        commit: productionSlug.commit,
      },
    }, null, 2)
  );
}


async function send() {
  const state = JSON.parse(await readStream(process.stdin, {encoding: 'utf-8'}));

  const msg = `
Changes are lingering on <https://next.nextstrain.org|next.nextstrain.org>.

<https://github.com/nextstrain/nextstrain.org/compare/${state.production.commit}...${state.staging.commit}|Review the changes> and promote (if appropriate) via the <https://dashboard.heroku.com/pipelines/${state.config.pipeline}|Heroku Dashboard>.
  `;

  console.warn(`Sending to ${process.env.SLACK_CHANNEL}:\n\n${msg}`);

  const url = "https://slack.com/api/chat.postMessage";
  const response = await fetch(
    url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        channel: process.env.SLACK_CHANNEL,
        text: msg,
        icon_emoji: ":bird:",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`POST ${url} failed: ${response.status} ${response.statusText}`);
  }

  console.warn(await response.json());
}


function isThereAnybodyOutThere(now) {
  // If we're not running under automation (e.g. CI), then assume we're being
  // manually invoked by someone and always want to run.  Return their local
  // zone.
  if (!process.env.CI) return now.zoneName;

  for (const tz of workingTimezones) {
    const local = now.setZone(tz);

    if (workingDays.has(local.weekday) && workingHours.has(local.hour)) {
      return tz;
    }
  }
  return null;
}


function workDaysBetween(a, b) {
  if (a > b) throw new Error(`assert(a ≤ b) in workDaysBetween(a, b) failed: ${a} > ${b}`);

  let days = 0;
  let t = a.plus({ days: 1 });

  while (t < b) {
    if (workingDays.has(t.weekday)) {
      days += 1;
    }
    t = t.plus({ days: 1 });
  }

  return days;
}


async function heroku(path) {
  const url = new URL(path, "https://api.heroku.com");
  const response = await fetch(
    url, {
      headers: {
        Authorization: `Bearer ${process.env.HEROKU_TOKEN}`,
        Accept: "application/vnd.heroku+json; version=3",
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}


await main(parseArgs());
