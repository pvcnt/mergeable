#!/bin/sh -ex
envsubst < /mergeable/env.template.js > /mergeable/env.js
static-web-server "$@"