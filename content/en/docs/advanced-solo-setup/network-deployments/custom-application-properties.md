---
title: "Custom Application Properties"
description: >
  Configure consensus node application.properties with Solo's default merge mode
  or full overwrite mode.
categories: ["Advanced", "Deployment"]
tags: ["advanced", "operator", "configuration", "application-properties"]
weight: 4
type: docs
---

## Overview

Solo lets you provide a custom `application.properties` file for consensus nodes
with the `--application-properties` flag. By default, Solo merges your file with
its generated defaults. If you need complete control over the final file, add an
overwrite marker to your custom file.

Use the default merge mode when you only need to change or add a few properties.
Use overwrite mode only when you want your file to replace Solo's generated
`application.properties` content.

## Default merge mode

Pass your file to `solo consensus network deploy`:

```bash
solo consensus network deploy \
  --deployment "${SOLO_DEPLOYMENT}" \
  --application-properties ./config/application.properties
```

In merge mode, Solo starts with its generated `application.properties`, then
applies your file as key-level overrides:

- If your file contains a key that already exists in Solo's generated file, Solo
  replaces that key's value.
- If your file contains a new key, Solo appends it to the final file.
- Blank lines and comments in your file are ignored during the merge.
- Solo-generated keys that you do not mention remain in the final file.

Example custom file for merge mode:

```properties
# Override only the properties that need to change.
contracts.chainId=298
hedera.recordStream.logPeriod=1
```

This is the recommended mode for most deployments because Solo keeps its
generated defaults while still applying your overrides.

## Overwrite mode

To replace Solo's generated `application.properties` file, add the overwrite
marker as a comment in your custom file:

```properties
# SOLO_ENABLE_OVERWRITE=true

contracts.chainId=298
hedera.recordStream.logPeriod=1
# Include every other property your consensus nodes require.
```

Then deploy with the same flag:

```bash
solo consensus network deploy \
  --deployment "${SOLO_DEPLOYMENT}" \
  --application-properties ./config/application.properties
```

The marker must be on a comment line that starts with `#`. Solo looks for the
exact text `SOLO_ENABLE_OVERWRITE=true` inside a comment. If the marker is
missing, or if it is written as a normal property instead of a comment, Solo
uses default merge mode.

In overwrite mode, your file becomes the full `application.properties` content.
Solo does not carry over defaults that are missing from your file, so include
all properties required by the consensus node version and deployment topology
you are running.

## Falcon values file

For One-shot Falcon deployments, put the same flag under the `network` section:

```yaml
network:
  --application-properties: "./config/application.properties"
```

The merge or overwrite behavior is still controlled by the contents of the
referenced `application.properties` file. Add `# SOLO_ENABLE_OVERWRITE=true` to
that file only when you want overwrite mode.

For the complete list of Falcon network flags, see the
[Falcon Values File Reference](/docs/advanced-solo-setup/network-deployments/falcon-flags-reference).
