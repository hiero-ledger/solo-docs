---
title: 'Consensus Node Environment Variables'
description: >
  Pass environment variables to the consensus node JVM with application.env, and
  understand why chart extraEnv values alone do not reach the Java process.
categories: ['Advanced', 'Deployment']
tags: ['advanced', 'operator', 'configuration', 'environment-variables']
weight: 5
type: docs
---

## Overview

There are two places where environment variables for consensus nodes can be
defined, and they behave differently:

- **`application.env`** — a `KEY=VALUE` file that the consensus node start
  script loads when it launches the JVM. Any variable defined here is visible to
  the Java process. This is the recommended mechanism.
- **Helm chart `extraEnv` values** — entries under `defaults.root.extraEnv` in a
  custom values file. These set variables on the node **container**, but the JVM
  is started by the service manager inside the container with a controlled
  environment, so only the specific variables that the service definition passes
  through (for example `JAVA_OPTS`, `JAVA_HEAP_MIN`, and `JAVA_HEAP_MAX`) take
  effect. Any other variable set only through `extraEnv` will not appear in the
  Java process environment.

If you need a variable such as `MALLOC_ARENA_MAX` to be present in the running
JVM environment, define it in `application.env`.

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

Solo also mirrors each `KEY=VALUE` entry from `application.env` into the pod's
`extraEnv` values, so the container environment and the JVM environment stay
consistent without any extra configuration.

## Why extraEnv alone is not enough

A values file like the following sets the variable on the container, and
`kubectl exec ... env` will show it — but the Java process will still run
without it:

```yaml
defaults:
  root:
    extraEnv:
      - name: MALLOC_ARENA_MAX
        value: '4'
```

The service manager inside the consensus node image starts the JVM with a clean
environment and forwards only the variables its service definition declares.
`extraEnv` is therefore only useful for that limited set of variables (such as
`JAVA_OPTS`); everything else must go through `application.env`.

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
