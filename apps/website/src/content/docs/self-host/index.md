---
title: Introduction
sidebar:
  order: 1
---

Mergeable is designed from the beginning to be self-hosted.
While we provide a public instance, we encourage users to host their own instance.
This provides the following benefits:

* **Stability:** You decide when you are ready to upgrade to a newer version.
* **Security:** Even though it does not share any confidental data, in some corporate environments it will be a requirement to host Mergeable inside the corporate network.
* **Customizability:** By deploying your own instances, you may personalise it in such a way it fits your workflow.
For example, you may connect to an internal GitHub Enterprise instance.

## Comparison

The following table showcases the supported deployment methods:

| Name                     | Use cases                             |
|--------------------------|---------------------------------------|
| [Docker image](./docker) | Local testing, bare metal, VMs, PaaS. |
| [Helm chart](./helm)     | Kubernetes cluster.                   |
| [Static files](./static) | Static website hosting platform.      |