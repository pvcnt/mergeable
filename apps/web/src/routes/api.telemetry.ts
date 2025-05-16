import { isTruthy } from "remeda";
import { data } from "react-router";
import type { Route } from "./+types/api.telemetry";

// Domains that we do not need to hash.
const domainsWhitelist = new Set([
  "localhost",
  "mergeable.pages.dev",
  "app.usemergeable.dev",
]);

export async function action({ request }: Route.ActionArgs) {
  if (isTruthy(import.meta.env.MERGEABLE_NO_TELEMETRY)) {
    return data({});
  }
  // Send a hash of the "host:port" string, unless it is whitelisted.
  const url = new URL(request.url);
  const domain = domainsWhitelist.has(url.hostname)
    ? url.hostname
    : await sha256(url.host);
  const payload = {
    domain,
    browser,
    version: import.meta.env.VITE_COMMIT_SHA || "devel",
    numSections,
    numConnections,
    numStars,
    numPulls: -1,
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
    console.error(`Error while sending telemetry: ${await response.text()}`);
  }
  return data({});
}

async function sha256(s: string) {
  const bytes = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const result = [...new Uint8Array(digest)];
  return result.map((x) => x.toString(16).padStart(2, "0")).join("");
}
