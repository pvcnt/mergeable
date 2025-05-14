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

FROM base AS builder

RUN pnpm install --global turbo@^2

COPY . . 
RUN turbo prune webapp --docker

FROM base AS installer

COPY --from=builder /src/out/json/ .
RUN pnpm install --frozen-lockfile
 
COPY --from=builder /src/out/full/ .
RUN pnpm run build

FROM base AS runtime

RUN apk add --no-cache tini

COPY --from=builder /src/out/json/ .
RUN pnpm install --frozen-lockfile --prod

COPY --from=installer /src/apps/webapp/dist /src/apps/webapp/dist

WORKDIR /src/apps/webapp

EXPOSE 3000

ENTRYPOINT ["tini", "-g", "--"]

CMD ["pnpm", "run", "start"]