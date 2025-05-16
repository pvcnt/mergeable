import localforage from "localforage";
import { useIsClient, useInterval } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";

export function useTelemetry() {
  const isClient = useIsClient();
  useInterval(
    () => {
      if (isClient) {
        sendTelemetry().catch(console.error);
      }
    },
    24 * 60 * 60_000,
  );
}

async function sendTelemetry() {
  // Send a browser "fingerprint", which is really just a unique identifier stored locally.
  // I was not able to find a good open source fingerprinting library, so this looks like
  // the second best alternative, despite not being as resilient.
  let fingerprint = await localforage.getItem<string>("fingerprint");
  if (null === fingerprint) {
    fingerprint = uuidv4();
    await localforage.setItem("fingerprint", fingerprint);
  }
  const payload = {
    browser: fingerprint,
    numSections: await db.sections.count(),
    numConnections: await db.connections.count(),
    numStars: await db.stars.count(),
  };
  await fetch("/api/telemetry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
