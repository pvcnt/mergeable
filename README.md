# Reviewer

Reviewer is an inbox for GitHub pull requests.

**ℹ️ Please note that this project is still in its very early stage.**

This project is an attempt at being better than GitHub when providing an overview of open pull requests needing my attention.
Indeed, the "[Pull Requests](https://github.com/pulls)" page is not customisable at all.
It comes with four tabs associated with pre-defined search queries, that we cannot change.
Tabs are also inconvenient, as they requiring switching from one to another to see pull requests of interest.

Reviewer attempts to fill this gap by providing a single dashboard showing all pull requests one is interesting in at a glance.
It even allows to track pull requests associated with different accounts and/or several instances of GitHub (e.g., GitHub Enterprise).

## Features

Reviewer provides the following features:
* Fully customisable sections.
* Any number of GitHub instances can be connected (e.g., GitHub Enterprise).
* Number of pending pull requests is shown in the page's title.
* Local only, data is stored in your browser's storage.
* Dark mode.

You can use the demo instance hosted at [reviewer.pages.dev](https://reviewer.pages.dev/), or run your own instance.

## Run locally

This project is a simple SPA, built using [PnPM](https://pnpm.io), [Turborepo](https://turbo.build/repo) and [Vite](https://vitejs.dev/).
It can be started locally with the following command:

```bash
pnpm dev
```

# Self-host

This project can be built with the following command:

```bash
pnpm build
```

This will create a standard SPA website under the `apps/web/dist` directory.
It can then be deployed to any Web server able to serve static content, e.g., [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/) or [Netlify](https://docs.netlify.com/integrations/frameworks/vite/).
The only required configuration is that all traffic directed to a path that does not match an existing file should be redirected to `index.html`.

## Docker

A Dockerfile is provided that runs a simple nginx server serving the static content.