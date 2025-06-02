import os from "node:os";
import pino from "pino";

export const logger = pino({
  level: "info",
  base: {
    "service.name": "mergeable-web",
    "host.name": os.hostname(),
    "process.pid": process.pid,
    "process.parent_pid": process.ppid,
  },
  mixin() {
    return {
      "system.uptime": os.uptime(),
      "process.uptime": process.uptime(),
    };
  },
});
