---
title: 'Consensus Node Environment Variables'
description: >
  Pass environment variables to the consensus node JVM with an application.env
  file and the --application-env flag.
categories: ['Advanced', 'Deployment']
tags: ['advanced', 'operator', 'configuration', 'environment-variables']
weight: 5
type: docs
---

## Overview

Solo lets you define environment variables for consensus nodes with an
`application.env` file, passed through the `--application-env` flag. The
consensus node start script loads this file when it launches the JVM, so every
variable defined in it is visible to the Java process.

Variables that are only set on the node container, for example through custom
Helm chart values, are not forwarded to the Java process. If you need a variable
such as `MALLOC_ARENA_MAX` to be present in the running JVM environment, define
it in `application.env`.

## The application.env file

Write the variables as plain `KEY=VALUE` lines. Blank lines and lines starting
with `#` are ignored:

```properties
# Limit glibc malloc arenas to reduce memory fragmentation.
MALLOC_ARENA_MAX=4
JAVA_OPTS=-XX:+UseG1GC -XX:MaxDirectMemorySize=128M
```

Pass the file to `solo consensus network deploy`:

```bash
solo consensus network deploy \
  --deployment "${SOLO_DEPLOYMENT}" \
  --application-env ./config/application.env
```

Solo stages your file as the `application.env` ConfigMap for the consensus
nodes. The file replaces Solo's default `application.env` content, so include
every variable your nodes require.

Solo also sets the same variables on the node container, so the container
environment and the JVM environment stay consistent without any extra
configuration.

## Verifying the JVM environment

To confirm a variable reached the running Java process, inspect the process
environment inside the root container:

```bash
kubectl exec -n "${SOLO_NAMESPACE}" network-node1-0 -c root-container -- \
  sh -c 'tr "\0" "\n" < /proc/$(pgrep java)/environ | grep MALLOC_ARENA_MAX'
```

The command prints `MALLOC_ARENA_MAX=4` when the variable is in effect and
prints nothing when it is not.

## Falcon values file

For One-shot Falcon deployments, put the same flag under the `network` section:

```yaml
network:
  --application-env: './config/application.env'
```

For the complete list of Falcon network flags, see the
[Falcon Values File Reference](/docs/advanced-solo-setup/network-deployments/falcon-flags-reference).
