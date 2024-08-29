---
title: Environment variables
sidebar:
  order: 5
---

Mergeable is configured via environment variables.

## MERGEABLE_GITHUB_URLS

A comma-separated list of allowed GitHub base URLs.

* Default: `<empty>`
* Example: `https://api.github.com,https://git.mycompany.com/api/v3`

A GitHub URL must be a URL to the API endpoint.
When configured, a dropdown will be displayed instead of a text input when creating a new connection.

## MERGEABLE_PR_SIZES

A comma-separated list of thresholds to configure size labels.

* Default: `10,30,100,500,1000`
* Example: `1,10,100,1000,10000`

Each pull request is associated with a size XS, X, M, L, XL or XXL.
Size is computed by comparing the number of modified lines of a pull requests with some pre-defined thresholds.
Those thresholds can be personalized using this environment variable.
This environment variable should contain 5 integers to specify the boundaries between categories.

## MERGEABLE_NO_TELEMETRY

Set to a non-empty string to opt-out from anonymous telemetry.