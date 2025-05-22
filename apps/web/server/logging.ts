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

export function logHttpRequest(
  request: Request,
  attrs: { status?: number; duration?: number },
) {
  const url = URL.parse(request.url);
  logger.info({
    "http.request.method": request.method,
    "url.scheme": url?.protocol.substring(0, -1),
    "url.path": url?.pathname,
    "http.response.status_code": attrs.status,
    "http.server.request.duration": attrs.duration,
  });
}
