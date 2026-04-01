# Solo Documentation Site

## What is Solo?

Solo is a command-line tool for deploying and managing Hedera network nodes and services on Kubernetes. This repository contains the official technical documentation site for Solo, built with Hugo and the Docsy theme.

The documentation covers:
- **Simple Setup**: Quick start guides for basic Solo deployments
- **Advanced Setup**: Complex network configurations and custom deployments
- **Using Solo**: Command reference and operational guides
- **Troubleshooting**: Common issues and solutions

## Quick Start

### Prerequisites
- Node.js 22+
- Go (for Hugo extended)
- Hugo extended 0.145.0+

### Build and Preview

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the site:
   ```bash
   hugo --cleanDestinationDir
   ```

3. Preview locally:
   ```bash
   hugo server -D --baseURL http://localhost:1313/ --cleanDestinationDir
   ```
   or simply
   ```bash
   hugo serve
   ```

   Open `http://localhost:1313/` in your browser.

## How to Contribute

We welcome contributions to improve the Solo documentation! Whether you're fixing typos, adding new guides, or improving existing content, here's how to get started:

### For Content Contributors
- **New to contributing?** Start with our [Contributing Guide](CONTRIBUTING.md)
- **Found an issue?** [Open an issue](https://github.com/hiero-ledger/solo-docs/issues) or submit a pull request
- **Need help?** Check our [troubleshooting guide](content/en/docs/troubleshooting.md)

### For Developers
- **Technical contributions**: See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup
- **Auto-generated content**: Documentation is automatically updated from Solo releases via GitHub Actions

## Documentation Structure

- `content/en/docs/` - Main documentation content
- `content/en/docs/simple-solo-setup/` - Getting started guides
- `content/en/docs/advanced-solo-setup/` - Advanced configuration
- `content/en/docs/using-solo/` - Usage and operations
- `content/en/docs/troubleshooting.md` - Common issues and solutions

## Deployment

The site is automatically deployed to [solo.hiero.org](https://solo.hiero.org/) when new Solo releases are published. Manual deployments can be triggered via GitHub Actions.

## Support

- **Documentation Issues**: [GitHub Issues](https://github.com/hiero-ledger/solo-docs/issues)
- **Solo Tool Issues**: [Solo Repository](https://github.com/hiero-ledger/solo)
- **Community**: Check our [community contributions](content/en/docs/community-contributions.md) guide
