# Solo Docs Site

## Overview

This repository contains the Hugo + Docsy site for Solo. It ships with Hiero
branding (logo, palette, typography) and a lightweight build/preview workflow.

Solo Docs uses Docsy as a Hugo module. You can inspect module dependencies
with:

```console
hugo mod graph
```

For Docsy documentation, see [Docsy user guide][].

## Prerequisites

- Node 18+ and npm
- Go (for Hugo extended and Hugo modules)
- Hugo extended 0.145.0 or newer

## Quick Start

1. Install site dependencies and Hugo modules:

```bash
npm install
```

1. Build the site (no Kind required):

```bash
hugo --cleanDestinationDir
```

This outputs the generated site to `public/`.

1. Run with live reload:

```bash
hugo server -D --baseURL http://localhost:1313/main/ --cleanDestinationDir
```

Open `http://localhost:1313/main/` in your browser.

## Common Commands

- Full docs site build: `hugo --cleanDestinationDir`
- Local preview with live reload:
   `hugo server -D --baseURL http://localhost:1313/main/ --cleanDestinationDir`
- Clean generated artifacts: `npm run clean`

Note: Typedoc generation is not a native Hugo command. If you use generated API
docs, run the typedoc command from your API docs/tooling project, then copy its
output to `static/` as needed.

## Branding and Theming

- Logo: `assets/icons/logo.svg` (Docsy inlines it via `navbar_logo`)
- Design tokens and component overrides:
   `assets/scss/_variables_project.scss`
- Colors: Hiero palette is defined as CSS variables (primary `#b81a56`,
   primary-dark `#992350`, primary-light `#d92d6a`, secondary `#1ebdc4`)
- Typography: branding notes include Space Grotesk/Inter-based typography
   updates across headings, body, and UI elements

## Editing Styles

1. Update SCSS in `assets/scss/_variables_project.scss` (buttons, badges,
    sidebar, code, tokens).
2. Rebuild with `hugo --cleanDestinationDir` or run `hugo server` to regenerate
    site CSS in `public/`.

## Content Structure

- `content/en` holds pages and landing content
- `assets/` contains SCSS, fonts, and icons
- `layouts/` has partial overrides
- `static/` can serve generated API docs (for example under `static/classes`)

## Running a Container Locally

You can run solo-docs inside a [Docker](https://docs.docker.com/) container.
The container uses a volume bound to this repo.

1. Build the Docker image:

```bash
docker-compose build
```

1. Run the image:

```bash
docker-compose up
```

You can run both with:

```bash
docker-compose up --build
```

Open `http://localhost:1313` to verify it is working.

### Cleanup

Stop Docker Compose with `Ctrl + C`.

Remove produced images:

```bash
docker-compose rm
```

For more information see [Docker Compose documentation][].

## Using a Local Docsy Clone

Make sure your installed Go version is `1.18` or higher.

Clone Docsy to a sibling folder:

```bash
cd root-of-your-site
git clone --branch v0.12.0 https://github.com/google/docsy.git ../docsy
```

Then run:

```bash
HUGO_MODULE_WORKSPACE=docsy.work hugo server --ignoreVendorPaths "**"
```

Or use npm:

```bash
npm run local serve
```

This lets Hugo hot-reload local changes from `../docsy` too.

## Notes

- `navbar_logo` is enabled in `hugo.yaml`; placing the SVG at
   `assets/icons/logo.svg` is enough for it to render.
- For quick local preview, use `hugo --cleanDestinationDir` + `hugo server`
   rather than heavier full pipelines.
- For color/contrast tweaks, adjust CSS variables in
   `_variables_project.scss` and rebuild.

Recent Hiero branding notes:

- Hiero logo added at `assets/icons/logo.svg`
- Palette/token updates in `assets/scss/_variables_project.scss`
- Component styling updates for buttons, badges, sidebar, callouts, cards,
   inputs, and typography scale

Accessibility contrast notes (against white):

- Primary `#C91F47`: 5.57
- Primary dark `#A31835`: 7.67
- Body gray `#666666`: 5.74
- Light gray `#888888`: 3.54 (use carefully for small/critical text)

## Troubleshooting

- Hugo not found: ensure Go is installed and `$(go env GOPATH)/bin` is on
   `PATH`.
- Styles not updating: rerun `hugo --cleanDestinationDir` or restart
   `hugo server`.
- Typedoc missing: regenerate typedoc from your API docs/tooling project and
   copy output to `static/`.

You may also encounter these Hugo errors while running locally:

```console
$ hugo server
WARN 2023/06/27 16:59:06 Module "project" is not compatible with this Hugo version; run "hugo mod graph" for more information.
Start building sites …
hugo v0.101.0-466fa43c16709b4483689930a4f9ac8add5c9f66+extended windows/amd64 BuildDate=2022-06-16T07:09:16Z VendorInfo=gohugoio
Error: Error building site: "C:\Users\foo\path\to\solo-docs\content\en\_index.md:5:1": failed to extract shortcode: template for shortcode "blocks/cover" not found
Built in 27 ms
```

This usually means Hugo is outdated. Install a newer Hugo extended release.

```console
$ hugo server

INFO 2021/01/21 21:07:55 Using config file:
Building sites … INFO 2021/01/21 21:07:55 syncing static files to /
Built in 288 ms
Error: Error building site: TOCSS: failed to transform "scss/main.scss" (text/x-scss): resource "scss/scss/main.scss_9fadf33d895a46083cdd64396b57ef68" not found in file cache
```

This usually means you are not using Hugo extended.

```console
$ hugo server

Error: failed to download modules: binary with name "go" not found
```

This means Go is not available in your shell.

[Docsy user guide]: https://docsy.dev/docs
[Docker Compose documentation]: https://docs.docker.com/compose/gettingstarted/

<!-- cSpell:ignore hugo docsy TOCSS typedoc -->
