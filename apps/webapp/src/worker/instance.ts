import * as Comlink from "comlink";
import { v4 as uuidv4 } from "uuid";
import localforage from "localforage";
import { db } from "../lib/db";
import { GitHubClient } from "@repo/github";
import { gitHubClient } from "../github";

const syncViewersIntervalMillis = 60 * 60_000; // 1 hour
const sendTelemetryIntervalMillis = 24 * 60 * 60_000; // 1 day

// Domains that we do not need to hash.
const domainsWhitelist = new Set(["localhost", "mergeable.pages.dev"]);

// Schema version is used to force bursting the local cache of pull requests
// when there is a change that requires it (e.g., adding a new field that must
// be populated).
export const LATEST_SCHEMA_VERSION = "v2";

declare const self: SharedWorkerGlobalScope;

function schedule(fn: () => Promise<void>, intervalMillis: number) {
  fn()
    .then(() => setInterval(() => schedule(fn, intervalMillis), intervalMillis))
    .catch(console.error);
}

async function executeActivity(
  name: string,
  intervalMillis: number,
  force: boolean,
  fn: () => Promise<void>,
): Promise<void> {
  const activity = await db.activities.get(name);
  /*if (activity !== undefined && activity.running) {
    // Do not run activities concurrently.
    return;
  }*/
  if (
    !force &&
    activity !== undefined &&
    activity.refreshTime > new Date(Date.now() - intervalMillis)
  ) {
    // Do not run activity if it has already recently run (unless forced).
    return;
  }
  if (activity === undefined) {
    await db.activities.add({ name, running: true, refreshTime: new Date(0) });
  } else {
    await db.activities.update(name, { running: true });
  }
  try {
    await fn();
  } finally {
    await db.activities.update(name, {
      running: false,
      refreshTime: new Date(),
    });
  }
}

export async function syncViewersOnce(
  client: GitHubClient,
  force: boolean = false,
): Promise<void> {
  await executeActivity(
    "syncViewers",
    syncViewersIntervalMillis,
    force,
    async () => {
      const connections = await db.connections.toArray();
      for (const connection of connections) {
        const viewer = await client.getViewer(connection);
        await db.connections.update(connection, { viewer });
      }
      console.log(`Synced ${connections.length} connections`);
    },
  );
}

async function sha256(s: string) {
  const bytes = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const result = [...new Uint8Array(digest)];
  return result.map((x) => x.toString(16).padStart(2, "0")).join("");
}

export async function sendTelemetry() {
  if (import.meta.env.MERGEABLE_NO_TELEMETRY.length > 0) {
    return;
  }
  await executeActivity(
    "sendTelemetry",
    sendTelemetryIntervalMillis,
    false,
    async () => {
      // Send a browser "fingerprint", which is really just a unique identifier stored locally.
      // I was not able to find a good open source fingerprinting library, so this looks like
      // the second best alternative, despite not being as resilient.
      let fingerprint = await localforage.getItem<string>("fingerprint");
      if (null === fingerprint) {
        fingerprint = uuidv4();
        await localforage.setItem("fingerprint", fingerprint);
      }
      // Send a hash of the "host:port" string, unless it is whitelisted.
      const domain = domainsWhitelist.has(self.location.hostname)
        ? self.location.hostname
        : await sha256(self.location.host);
      const payload = {
        domain,
        browser: fingerprint,
        version: import.meta.env.VITE_COMMIT_SHA || "devel",
        numSections: await db.sections.count(),
        numConnections: await db.connections.count(),
        numPulls: -1,
        numStars: await db.stars.count(),
      };
      const response = await fetch(
        "https://mergeable-telemetry.pvcnt.workers.dev/api/v1/sample",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (response.status !== 200) {
        throw new Error(
          `Error while sending telemetry: ${await response.text()}`,
        );
      }
    },
  );
}

export type Api = {
  refreshViewers: () => Promise<void>;
};

self.addEventListener("connect", (event: MessageEvent) => {
  // Start background sync with GitHub.
  schedule(() => syncViewersOnce(gitHubClient), syncViewersIntervalMillis);

  // Send telemetry in background.
  schedule(sendTelemetry, sendTelemetryIntervalMillis);

  // Expose an API to our clients.
  const api: Api = {
    refreshViewers: () => syncViewersOnce(gitHubClient, true),
  };
  Comlink.expose(api, event.ports[0]);
});

export default null;
