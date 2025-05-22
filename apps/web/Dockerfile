# syntax=docker/dockerfile:1.8.1

FROM node:23 AS base

RUN corepack enable pnpm

ENV PNPM_HOME=/app/.pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV CI=1
ENV TURBO_TELEMETRY_DISABLED=1

WORKDIR /src

FROM base AS pruner

RUN pnpm install --global turbo@^2

COPY . . 
RUN turbo prune web --docker

FROM base AS builder

COPY --from=pruner /src/out/json/ .
RUN pnpm install --frozen-lockfile
 
COPY --from=pruner /src/out/full/ .
RUN NODE_ENV=production pnpm run build

FROM base AS runtime

ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini /tini
RUN chmod +x /tini

COPY --from=pruner /src/out/json/ .
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /src/apps/web/dist /src/apps/web/dist
COPY --from=builder /src/apps/web/server /src/apps/web/server

WORKDIR /src/apps/web
EXPOSE 3000

ENTRYPOINT ["/tini", "-g", "--"]

CMD ["node", "server/node.ts"]