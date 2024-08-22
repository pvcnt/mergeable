# syntax=docker/dockerfile:1.8.1

FROM joseluisq/static-web-server:2.32.0-alpine

ARG TARGETARCH

COPY --chmod=0755 docker/envsubst-${TARGETARCH} /bin/envsubst
COPY --chmod=0755 docker/entrypoint.sh /

COPY <<EOF /config.toml
  [general]

  host = "::"
  port = 80
  root = "/mergeable"
  log-level = "info"

  page-fallback = "/mergeable/index.html"
  cache-control-headers = true
  compression = true
  security-headers = true
  directory-listing = false
  redirect-trailing-slash = true
  compression-static = true
  ignore-hidden-files = true
EOF

COPY ./dist /mergeable

ENV SERVER_CONFIG_FILE=config.toml

ENTRYPOINT ["/entrypoint.sh"]
EXPOSE 80