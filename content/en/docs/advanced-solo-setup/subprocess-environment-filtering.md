---
title: "Subprocess Environment Filtering"
weight: 2
description: >
  How Solo decides which environment variables reach the external commands it runs
  (helm, kubectl, kind, container engines), how to tell when a variable was withheld,
  and how to forward an additional variable when a platform requires one.
categories: ["Reference", "Advanced"]
tags: ["advanced", "operator", "configuration", "security"]
type: docs
---

## Overview

Solo runs external commands on your behalf — `helm`, `kubectl`, `kind`, `docker`/`podman`,
`npm`, `gh` and `brew`. It does **not** hand those commands your whole environment. Each
command receives only the variables it is known to need, built from an allowlist.

The reason is that Solo is frequently run from a shell or CI runner holding credentials that
have nothing to do with deploying a network — registry tokens, cloud keys, SSH agent sockets.
Passing the whole environment would forward all of it to every tool, and onward to anything
those tools spawn: Helm plugins, kubectl credential plugins, package lifecycle scripts.

Filtering is deliberately **deny-by-default**. A variable that is not on the allowlist is not
forwarded, even if it looks harmless.

## Checking whether a variable was withheld

Solo records what it filtered. Search your Solo log for the variable name:

{{< tabpane text=true >}}
{{% tab header="Bash / Zsh" lang="bash" %}}
```bash
grep MY_VARIABLE ~/.solo/logs/solo.log
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
Select-String -Path "$HOME\.solo\logs\solo.log" -Pattern "MY_VARIABLE"
```
{{% /tab %}}
{{< /tabpane >}}

Solo writes a summary line followed by one or more lines carrying the names, so your variable
appears on a `withheld from` line rather than in the summary:

```text
[19:45:49.621] INFO: Withheld 83 environment variable(s) from 'helm' commands because they are not on the allowlist for that command:
[19:45:49.621] INFO:   withheld from 'helm': AI_AGENT, APPLICATION_INSIGHTS_NO_STATSBEAT, ..., MY_VARIABLE, ...
```

Searching for the variable name finds the second line, which also tells you which command withheld
it. To see everything withheld from one command instead, search for `withheld from 'helm'`.

This is logged at `info`, so it is present in the log by default — you do not need to re-run
with `--debug`. It is emitted once per command type per run, and long lists are split across
several lines so that every name remains searchable.

Two bounds apply, so that a hostile or unusual environment cannot forge log entries or fill your
disk:

* Names are only listed if they look like ordinary identifiers (letters, digits, `_`, `.`, `-`,
  `()`, up to 64 characters). Anything else is counted rather than printed — the line ends with
  something like `(3 with non-identifier names omitted)`.
* At most 2000 names are listed per command type. Beyond that the line ends with
  `(N further name(s) omitted)`. No ordinary environment comes close to this; if you hit it, the
  variable is still filtered exactly as described, it is simply not enumerated.

If your variable is not listed but also is not reaching the tool, forward it explicitly as
below — the two bounds above affect only what is *reported*, never what is *forwarded*.

If your config file is present but unusable — malformed YAML, unreadable, or with permissions
Solo will not trust — Solo fails with an error naming the file rather than starting up as if the
file were not there. A setting you believe is applied but silently is not would be worse than a
clear failure.

If your variable is in that list and the tool needs it, forward it explicitly as below.

## Forwarding an additional variable

Add the exact variable name to `subprocess.additionalEnvironmentVariables` in your Solo
config file — `~/.solo/solo-config.yaml` — under the command that needs it:

```yaml
subprocess:
  additionalEnvironmentVariables:
    helm:
      - MY_PLATFORM_SETTING
    kubectl:
      - MY_PLATFORM_SETTING
```

Recognised command keys are `generic`, `kubectl`, `helm`, `kind`, `containerEngine`, `brew`,
`npm` and `githubCli`.

The file is `solo-config.yaml` in your Solo home directory. It is optional — if you do not have
one, nothing changes. Create it if it is not already there.

The default location is `~/.solo` (`%USERPROFILE%\.solo` on Windows). Override it with
`SOLO_HOME`:

{{< tabpane text=true >}}
{{% tab header="Bash / Zsh" lang="bash" %}}
```bash
export SOLO_HOME=/path/to/solo-home
ls -l "$SOLO_HOME/solo-config.yaml"
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
$env:SOLO_HOME = "C:\path\to\solo-home"
Get-Item "$env:SOLO_HOME\solo-config.yaml" | Format-List Name, Length, LastWriteTime
```
{{% /tab %}}
{{< /tabpane >}}

{{% alert title="Not solo.yaml" color="info" %}}
The similarly named `~/.solo/solo.yaml` is a leftover from older Solo versions and holds an
unrelated `flags:` structure. Some test tooling deletes it automatically, so settings placed
there would be lost. Use `solo-config.yaml`.
{{% /alert %}}

### Scope and syntax rules

* **Exact names only.** Wildcards and prefixes are not supported. `AWS_*` will not work; list
  each name.
* **Per command.** A variable listed under `helm` reaches `helm` only. There is no "all
  commands" list — a variable a credential plugin needs has no business reaching `npm` or a
  container engine.
* **Config file only.** Unlike every other Solo setting, this one cannot be set through a
  `SOLO_*` environment variable. A setting that relaxes environment filtering must not itself
  be controllable by the environment being filtered. Attempts to set it via the environment are
  ignored, with a warning.

### Names that are always refused

Some variables are refused no matter what the config file says, because they change how a
spawned tool loads code, whom it trusts, or where it fetches credentials. Solo logs a warning
naming each refused entry rather than ignoring it silently.

| Family | Examples |
| --- | --- |
| Loader and interpreter hooks | `LD_PRELOAD`, `LD_LIBRARY_PATH`, `DYLD_INSERT_LIBRARIES`, `NODE_OPTIONS`, `BASH_ENV`, `PYTHONPATH`, `PERL5OPT`, `RUBYOPT`, `PS4`, `GIT_SSH_COMMAND`, `EDITOR` |
| TLS trust overrides | `SSL_CERT_FILE`, `SSL_CERT_DIR`, `CURL_CA_BUNDLE`, `NODE_EXTRA_CA_CERTS`, `REQUESTS_CA_BUNDLE`, `AWS_CA_BUNDLE`, `NODE_TLS_REJECT_UNAUTHORIZED` |
| Credential and endpoint redirection | `AWS_ENDPOINT_URL` and every `AWS_ENDPOINT_URL_<SERVICE>` form such as `AWS_ENDPOINT_URL_STS`, `AWS_CONFIG_FILE`, `AWS_SHARED_CREDENTIALS_FILE`, `AZURE_CLIENT_SECRET` |

Matching is case-insensitive, and the `LD_`, `DYLD_` and `AWS_ENDPOINT_URL` families are refused
by prefix rather than by exact name — `AWS_ENDPOINT_URL_STS` in particular takes precedence over
the global endpoint setting and would otherwise redirect the EKS credential exchange.

These would let anyone able to write your Solo config file run arbitrary code inside a process
holding cluster-admin, or silently intercept traffic to your Kubernetes API server.

{{% alert title="Solo verifies the file before trusting it" color="warning" %}}
`subprocess.additionalEnvironmentVariables` extends what Solo forwards to `helm` and `kubectl`,
so anyone able to edit the file can widen what those commands receive. Because **you** create
this file, Solo does not own its permissions — it checks them instead, and refuses to apply the
settings with an error if the file itself is a symbolic link, is not owned by you, or is writable
by group or other users. It applies a similar check to the directories above the file, and reads
the file through a descriptor opened without following symlinks, validating that descriptor rather
than the path.

What that does and does not guarantee, stated precisely:

* **The file itself** — on POSIX only — is checked and read through the same descriptor, so its
  contents cannot be swapped between the check and the read. On Windows there is no equivalent
  no-follow open, so the symlink check is a check-then-open and carries a small race; see the
  Windows note below.
* **The directories above it** are checked for a static misconfiguration — a group-writable
  `SOLO_HOME`, for instance. This is *not* race-free: someone who already has write access to one
  of those directories could replace a component between the check and the open. Closing that
  would require component-by-component opens, which Node's filesystem API does not offer.
* On POSIX the directory walk reaches the filesystem root, and accepts directories owned by you or
  by root, plus sticky directories such as `/tmp`. On Windows it stops before the volume root,
  because `C:\` legitimately carries broad write grants.

In short: this protects you from a misconfigured or shared `SOLO_HOME`, not from an attacker who
already holds write access somewhere on the path to it.

Keep both owner-only:

{{< tabpane text=true >}}
{{% tab header="Bash / Zsh" lang="bash" %}}
```bash
# Secure the directory as well as the file: write access to the directory is enough to
# replace the file inside it. Solo also checks every parent directory up to the filesystem root.
chmod 700 ~/.solo
chmod 600 ~/.solo/solo-config.yaml
```
{{% /tab %}}
{{% tab header="PowerShell" lang="powershell" %}}
```powershell
# NTFS ACLs replace POSIX mode bits. Secure the directory as well as the file: write access to
# the directory is enough to replace the file inside it.
icacls "$HOME\.solo" /inheritance:r /grant:r "$($env:USERNAME):(OI)(CI)F"
icacls "$HOME\.solo\solo-config.yaml" /inheritance:r /grant:r "$($env:USERNAME):(F)"
```
{{% /tab %}}
{{< /tabpane >}}

On Windows, Solo reads the DACL with `icacls` and refuses the file if any principal other than
you, `SYSTEM`, `Administrators` or `CREATOR OWNER` holds write access. Inherit-only entries are
ignored, since they apply to items created later rather than to the path itself.

{{% alert title="Windows support is not yet usable" color="warning" %}}
The ACL checks described here are implemented but have **not** been exercised on a real Windows
machine — only reasoned about and unit-tested on POSIX. The Windows guarantee is also weaker: the
volume root is not inspected, and the symlink check on the file is a check-then-open rather than
an atomic no-follow open. Do not rely on `subprocess.additionalEnvironmentVariables` on Windows
yet; please report what you find if you try it.
{{% /alert %}}
{{% /alert %}}

## Managed Kubernetes and workload identity

Solo forwards the variables the AWS credential plugin needs, so **EKS IRSA** works without any
configuration:

`AWS_ROLE_ARN`, `AWS_WEB_IDENTITY_TOKEN_FILE`, `AWS_REGION`, `AWS_DEFAULT_REGION`,
`AWS_STS_REGIONAL_ENDPOINTS`, `AWS_PROFILE`

**GKE and AKS are not yet covered.** The variables their credential plugins need have not been
verified against a real cluster, and adding unverified names risks both breakage and security
holes, so they are not in the built-in allowlist. Until they are verified, forward them
yourself:

```yaml
subprocess:
  additionalEnvironmentVariables:
    kubectl:
      - GOOGLE_APPLICATION_CREDENTIALS
      - USE_GKE_GCLOUD_AUTH_PLUGIN
    helm:
      - GOOGLE_APPLICATION_CREDENTIALS
      - USE_GKE_GCLOUD_AUTH_PLUGIN
```

If you confirm the required set for GKE or AKS on a real cluster, please open an issue on
[hiero-ledger/solo](https://github.com/hiero-ledger/solo/issues) so it can be added to the
built-in allowlist.

Note that `AZURE_AUTHORITY_HOST` and `AWS_ENDPOINT_URL` are intentionally excluded from the
built-in list: they redirect which authority or endpoint the credential plugin contacts.
Sovereign clouds that genuinely need a non-default authority can add `AZURE_AUTHORITY_HOST`
explicitly, which makes it a deliberate local decision rather than something inherited silently
from the surrounding environment.

## See also

* [Using Environment Variables]({{< relref "using-environment-variables.md" >}}) — variables
  that configure Solo itself, as opposed to the ones Solo passes on to external tools.
