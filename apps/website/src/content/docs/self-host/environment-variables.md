---
title: Environment variables
sidebar:
  order: 5
---

Mergeable is configured via environment variables.

## MERGEABLE_GITHUB_URLS

A comma-separated list of allowed GitHub base URLs.
A GitHub URL must be a URL to the API endpoint.
For GitHub Enterprise instances, it ends with `/api/v3`.
When configured, a dropdown will be displayed instead of a text input when creating a new connection.

Example: `https://api.github.com,https://git.mycompany.com/api/v3`