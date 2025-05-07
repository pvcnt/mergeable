import { TestGitHubClient } from "../testing";
import { afterEach, beforeEach, it, describe, expect, vi } from "vitest";
import { syncViewersOnce, sendTelemetry } from "../../src/worker/instance";
import { db } from "../../src/lib/db";
import { mockConnection } from "../testing";
import nock from "nock";

describe("sync viewers", () => {
  beforeEach(async () => {
    await db.connections.add(mockConnection({ id: "1" }));
    await db.connections.add(mockConnection({ id: "2" }));
  });

  afterEach(async () => {
    await db.activities.clear();
    await db.connections.clear();
  });

  it("should update connections", async () => {
    let activity = await db.activities.get("syncViewers");
    expect(activity).toBeUndefined();

    const client = new TestGitHubClient();
    await syncViewersOnce(client);

    let connection = await db.connections.get("1");
    expect(connection?.viewer).toBeDefined();
    expect(connection?.viewer?.user).toEqual({
      id: "u1",
      name: "test[https://api.github.com]",
      avatarUrl: "",
      bot: false,
    });

    connection = await db.connections.get("2");
    expect(connection?.viewer).toBeDefined();
    expect(connection?.viewer?.user).toEqual({
      id: "u1",
      name: "test[https://api.github.com]",
      avatarUrl: "",
      bot: false,
    });

    activity = await db.activities.get("syncViewers");
    expect(activity?.running).toBeFalsy();
    expect(activity?.refreshTime.getTime()).toBeGreaterThan(0);
    expect(activity?.refreshTime.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("should not update connections if recently completed", async () => {
    await db.activities.add({
      name: "syncViewers",
      running: false,
      refreshTime: new Date(),
    });

    const client = new TestGitHubClient();
    await syncViewersOnce(client);

    const connection = await db.connections.get("1");
    expect(connection?.viewer).toBeUndefined();
  });
});

describe("send telemetry", () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    nock.enableNetConnect();
    await db.activities.clear();
  });

  it("should send telemetry", async () => {
    let activity = await db.activities.get("sendTelemetry");
    expect(activity).toBeUndefined();

    // WHEN sending telemetry.
    nock("https://mergeable-telemetry.pvcnt.workers.dev")
      .post("/api/v1/sample")
      .reply(200);
    await sendTelemetry();

    // THEN the activity should have been updated.
    activity = await db.activities.get("sendTelemetry");
    expect(activity?.running).toBeFalsy();
    expect(activity?.refreshTime.getTime()).toBeGreaterThan(0);
    expect(activity?.refreshTime.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("should not send telemetry if recently completed", async () => {
    await db.activities.add({
      name: "sendTelemetry",
      running: false,
      refreshTime: new Date(),
    });
    await sendTelemetry();
  });

  it("should not send telemetry if disabled", async () => {
    vi.stubEnv("MERGEABLE_NO_TELEMETRY", "1");
    await sendTelemetry();
  });
});
