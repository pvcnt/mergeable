---
title: Introduction
sidebar:
  order: 1
---

Mergeable is designed from the beginning to be self-hosted.
While we provide a public instance, we encourage users to host their own instance.

## Features

Self-hosting Mergeable unlocks the following features:

- **Stability:** You decide when you are ready to upgrade to a newer version.
- **Security:** Even though it does not share any confidental data, in some corporate environments it may be a requirement to host Mergeable inside the corporate network.
- **Configuration:** By deploying your own instance, you may configure it to better fit your workflow.
  For example, you may connect to an internal GitHub Enterprise instance.

## Compare methods

The following deployment methods are currently supported:

| Name                     | Use cases                             |
| ------------------------ | ------------------------------------- |
| [Docker image](./docker/) | Local testing, bare metal, VMs, PaaS. |
| [Helm chart](./helm/)     | Kubernetes cluster.                   |
| [Static files](./static/) | Static website hosting platform.      |
