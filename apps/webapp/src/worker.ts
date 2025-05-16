import { v4 as uuidv4 } from "uuid";
import localforage from "localforage";
import { db } from "./lib/db";
import { isTruthy } from "remeda";

const sendTelemetryIntervalMillis = 24 * 60 * 60_000; // 1 day

// Domains that we do not need to hash.
const domainsWhitelist = new Set([
  "localhost",
  "mergeable.pages.dev",
  "app.usemergeable.dev",
]);

// Schema version is used to force bursting the local cache of pull requests
// when there is a change that requires it (e.g., adding a new field that must
// be populated).
export const LATEST_SCHEMA_VERSION = "v2";

declare const self: WorkerGlobalScope;

function schedule(fn: () => Promise<void>, intervalMillis: number) {
  fn()
    .then(() => setInterval(() => schedule(fn, intervalMillis), intervalMillis))
    .catch(console.error);
}

async function sha256(s: string) {
  const bytes = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const result = [...new Uint8Array(digest)];
  return result.map((x) => x.toString(16).padStart(2, "0")).join("");
}

export async function sendTelemetry() {
  if (isTruthy(import.meta.env.MERGEABLE_NO_TELEMETRY)) {
    return;
  }
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
    throw new Error(`Error while sending telemetry: ${await response.text()}`);
  }
}

// Send telemetry in background.
schedule(sendTelemetry, sendTelemetryIntervalMillis);
