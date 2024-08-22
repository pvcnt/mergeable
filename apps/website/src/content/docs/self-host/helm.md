---
title: Deploy Helm chart
sidebar:
  order: 3
---

Mergeable is available as a Helm chart.
This is the recommended method when deploying to a Kubernetes cluster.

## Steps

The Helm chart can be deployed with the following command:

```bash
helm install mergeable oci://ghcr.io/pvcnt/helm/mergeable
```

The above command deploys the latest published Helm chart from the main branch.
You may refer to a specific commit by using the sha1 of the target commit as the chart version, e.g.:

```bash
helm install mergeable oci://ghcr.io/pvcnt/helm/mergeable --version 0.0.81
```

## Configuration

Mergeable can be configured [using environment variables](../environment-variables/), e.g.:

```bash

helm install mergeable oci://ghcr.io/pvcnt/helm/mergeable --set env.MERGEABLE_GITHUB_URLS=https://api.github.com
```

Any environment variable may be defined under the `env` top-level key.