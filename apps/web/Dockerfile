# syntax=docker/dockerfile:1.8.1

FROM node:24-alpine AS base

RUN apk add --no-cache libc6-compat
RUN apk update
RUN corepack enable pnpm

ENV PNPM_HOME=/app/.pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV CI=1
ENV TURBO_TELEMETRY_DISABLED=1

WORKDIR /src

FROM base AS preparer

RUN pnpm install --global turbo@^2

COPY . . 
RUN turbo prune web --docker

FROM base AS builder

COPY --from=preparer /src/out/json/ .
RUN pnpm install --frozen-lockfile
 
COPY --from=preparer /src/out/full/ .
RUN pnpm run build

FROM base AS runtime

RUN apk add --no-cache tini

COPY --from=preparer /src/out/json/ .
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /src/apps/web/dist /src/apps/web/dist

WORKDIR /src/apps/web

RUN pwd && ls -la *

EXPOSE 3000

ENTRYPOINT ["tini", "-g", "--"]

CMD ["pnpm", "run", "start"]