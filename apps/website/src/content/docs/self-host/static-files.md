---
title: Deploy static files
sidebar:
  order: 4
---

import { Aside } from '@astrojs/starlight/components';

Mergeable being an SPA (Single Page Application), it can be deployed behind any Web server supporting static files (e.g., Nginx, Caddy, Static Web Server).
It can also be deployed to any hosted platform supporting static websites (e.g., Cloudflare Pages, Netlify).

## Steps

The project is built with the following command:

```bash
pnpm build
```

This will create a static website under the `apps/webapp/dist` directory.
The content of this directory can then be dropped into your Web server of hosting platform.

:::caution
The Web server or hosting platform must be configured so that all traffic directed to a path that does not match an existing file should be redirected to `index.html`.
:::

## Configuration

Mergeable can be configured at build time using [using environment variables](../environment-variables/), e.g.:

```bash
MERGEABLE_GITHUB_URLS=https://api.github.com pnpm build
```