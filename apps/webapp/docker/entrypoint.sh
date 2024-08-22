#!/bin/sh -ex
envsubst -i /mergeable/env.template.js -o /mergeable/env.js
static-web-server "$@"