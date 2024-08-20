# Mergeable

[![codecov](https://codecov.io/github/pvcnt/mergeable/graph/badge.svg?token=ZZN3FRNP86)](https://codecov.io/github/pvcnt/mergeable)

Mergeable is a better inbox for GitHub pull requests.

![Screenshot](docs/screenshot.png)

## Features

Mergeable provides the following features:
* Organize pull requests into sections, defined by flexible search queries.
* Data is all stored locally, in the browser storage.
* Keyboard shortcuts (e.g., `cmd+k`) allow to navigate quickly.
* Connect to multiple GitHub instances, including GitHub Enterprise.
* Attention set, highlighting pull requests for which it is your turn to act.
* Does not require any GitHub app to be installed. 

## Public instance

You can use the public instance hosted at https://mergeable.pages.dev/.

## Documentation

Documentation is available at https://pvcnt.github.io/mergeable/.

It includes a user guide and instructions to self-host your own instance.

## Run locally

This project is built using [PnPM](https://pnpm.io), [Turborepo](https://turbo.build/repo) and [Vite](https://vitejs.dev/).
It can be started locally with the following command:

```bash
pnpm dev
```