---
title: Deploy Docker image
sidebar:
  order: 2
---

Mergeable is available as a standalone Docker image, with no external dependencies.
Using the Docker image is recommended for simple setups, e.g., when deploying directly on a bare VM or using a PaaS.

## Steps

The Docker image can be started with the following command:

```bash
docker run -p 8080:80 ghcr.io/pvcnt/mergeable
```

The Web UI will then be available at http://localhost:8080.

The above command starts the latest published image from the main branch.
You may refer to a specific commit by using the sha1 of the target commit as the image tag, e.g.:

```bash
docker run -p 8080:80 ghcr.io/pvcnt/mergeable:259cfbd2a855d72094f7dcecd8d08cc427d3e1c9
```

## Configuration

Mergeable can be configured [using environment variables](../environment-variables/), e.g.:

```bash
docker run -p 8080:80 -e MERGEABLE_GITHUB_URLS=https://api.github.com ghcr.io/pvcnt/mergeable
```