import { beforeEach, afterEach } from "vitest";
import { Polly, type PollyConfig } from "@pollyjs/core";

/* eslint-disable */
Polly.register(require("@pollyjs/persister-fs"));
Polly.register(require("@pollyjs/adapter-fetch"));
/* eslint-enable */

/**
 * Sets up Polly for recording and replaying HTTP interactions in tests.
 *
 * @param {Object} [options={}] - Configuration options for the recording.
 * @param {string} [options.recordingName] - The name of the recording. If not provided, the suite name will be used.
 * @param {string} [options.recordingPath] - The path to save the recordings. If not provided, the recordings will be saved in a "__recordings__" directory next to the test file.
 * @see https://github.com/Netflix/pollyjs/issues/499
 */
export function useRecording(
  options: { recordingName?: string; recordingPath?: string } = {},
) {
  let polly: Polly | undefined;
  let recordIfMissing = true;
  let mode: PollyConfig["mode"] = "replay";

  switch (process.env.POLLY_MODE) {
    case "record":
      mode = "record";
      break;
    case "replay":
      mode = "replay";
      break;
    case "offline":
      mode = "replay";
      recordIfMissing = false;
      break;
  }

  beforeEach((context) => {
    polly = new Polly(options.recordingName ?? context.task.name, {
      adapters: ["fetch"],
      mode,
      recordIfMissing,
      recordFailedRequests: true,
      persister: "fs",
      persisterOptions: {
        fs: {
          recordingsDir:
            options.recordingPath ??
            `${context.task.file.filepath.substring(0, context.task.file.filepath.lastIndexOf("/"))}/__recordings__`,
        },
      },
      matchRequestsBy: {
        method: true,
        headers: { exclude: ["authorization", "user-agent"] },
        body: true,
        order: true,
        url: {
          protocol: true,
          username: true,
          password: true,
          hostname: true,
          port: true,
          pathname: true,
          query: true,
          hash: false,
        },
      },
    });
  });

  afterEach(async () => {
    if (polly) {
      await polly.stop();
    }
  });

  return;
}
