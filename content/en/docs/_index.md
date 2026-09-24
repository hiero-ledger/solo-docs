---
title: Documentation
linkTitle: Docs
description: >-
  Comprehensive guide to Solo: deploy Hiero consensus networks locally with
  one command or full manual control. Covers setup, deployment methods,
  operations, advanced features, integration, and troubleshooting.
categories: ["Getting Started"]
tags: ["beginner", "advanced", "cli", "deployment"]
menu: { main: { weight: 1 } }
---

{{% pageinfo color="warning td-max-width-on-larger-screens mx-0" %}}

This documentation provides a comprehensive guide to using Solo to launch a Hiero Consensus Node network, including setup instructions, usage guides, and information for developers. It covers everything from installation to advanced features and troubleshooting.

{{% /pageinfo %}}

{{% pageinfo color="warning td-max-width-on-larger-screens mx-0" %}}

**Known issue: MinIO image pulls are currently blocked.** MinIO stopped
publishing new community images as of 2025-10-23, so deployments with MinIO
enabled fail with `ImagePullBackOff`. This affects Solo versions **below
v0.91.0**; starting with v0.91.0, Solo replaces the default tenant image and
no workaround is needed.

- **Easiest fix:** run `ONE_SHOT_WITH_BLOCK_NODE=true BLOCK_STREAM_STREAM_MODE=BLOCKS solo one-shot single deploy` to skip MinIO entirely.
- **If you need MinIO** (record streams/backups): see the
  [values-file workaround](/docs/troubleshooting/#minio-image-pull-failures-imagepullbackoff-on-the-minio-tenant-pod)
  in Troubleshooting.

{{% /pageinfo %}}
