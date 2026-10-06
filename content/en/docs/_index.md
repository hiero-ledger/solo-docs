---
title: Documentation
linkTitle: Docs
description: >-
  Comprehensive guide to Solo: deploy Hiero consensus networks locally with
  one command or full manual control. Covers setup, deployment methods,
  operations, advanced features, integration, and troubleshooting.
categories: ["Getting Started"]
tags: ["beginner", "advanced", "cli", "deployment"]
hide_section_index: true
---

{{% pageinfo color="info mx-0" %}}

**New to Solo?** [Start with the Quickstart →](/docs/simple-solo-setup/quickstart/) to deploy your first local network in one command.

{{% /pageinfo %}}

{{% pageinfo color="warning mx-0" %}}

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

## Browse the docs

{{< doc-section-cards "docs/simple-solo-setup" "docs/advanced-solo-setup" "docs/using-solo" "docs/troubleshooting" >}}
