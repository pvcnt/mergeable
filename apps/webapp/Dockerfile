# syntax=docker/dockerfile:1.8.1

FROM joseluisq/static-web-server:2.32.0-alpine

WORKDIR /mergeable

COPY <<EOF config.toml
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

  # Block access to resources that are included in the public directory
  # but should not be displayed.
  [[advanced.redirects]]
  source = "**/*.{sh,toml}"
  destination = "/"
  kind = 301
EOF

COPY ./dist .

ENTRYPOINT ["sh", "-c", "./vite-envs.sh && static-web-server"]
EXPOSE 80