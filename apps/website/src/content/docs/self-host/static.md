---
title: Deploy static files
sidebar:
  order: 4
---

Mergeable being an SPA (Single Page Application), it can be deployed behind any Web server supporting static files (e.g., Nginx, Caddy, Static Web Server).
It can also be deployed to any hosted platform supporting static websites (e.g., Cloudflare Pages, Netlify, GitHub Pages).

## Steps

The project is built with the following command:

```bash
pnpm build
```

The following environment variables may be defined to customise the build:

| Variable name | Description | Example |
|---------------|-------------|---------|
| VITE_COMMIT_SHA | sha1 of the commit from which the app has been built. Displayed in the footer. | `4584210` |
| VITE_GITHUB_URLS | Comma-separated list of allowed GitHub base URLs. When configured, a dropdown will be displayed instead of a text input when creating a new connection. | `https://api.github.com,https://git.mycompany.com/api/v3` |

This will create a static website under the `apps/webapp/dist directory`.
The only required configuration for the server or hosting platform is that all traffic directed to a path that does not match an existing file should be redirected to `index.html`.