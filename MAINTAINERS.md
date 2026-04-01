# Solo Documentation - Maintainer Guide

This document contains information specifically for maintainers of the Solo documentation site.

## Dependency Management

### Updating Docsy
Update Docsy to the latest tagged release:
```bash
npm run update:docsy:mod
```

Update to the latest commit on the main branch:
```bash
npm run update:docsy:main
```

### Updating Other Dependencies
```bash
# Update all npm packages
npm run update:packages

# Update Hugo
npm run update:hugo
```

## Site Configuration

### Hugo Configuration
- `hugo.yaml` - Main site configuration
- BaseURL varies by deployment target
- Uses Docsy as a Hugo module

### Branding and Theming
- Logo: `assets/icons/logo.svg`
- Colors: Hiero palette defined in `assets/scss/_variables_project.scss`
- Typography: Custom font stack with Space Grotesk/Inter

### Content Organization
- `content/en/` - English content
- `content/en/templates/` - Auto-generation templates
- `layouts/` - Hugo layout overrides
- `assets/` - SCSS, icons, and other assets

## Deployment

### Automatic Deployment
- Triggered by Solo releases
- Deploys to `https://solo.hiero.org/`
- Uses GitHub Pages for hosting

### Manual Deployment Options
- **GitHub Pages**: `https://hiero-ledger.github.io/solo-docs/`
- **Production**: `https://solo.hiero.org/`
- **Custom**: Any baseURL for testing

## Quality Assurance

### Automated Checks
- Prettier for code formatting
- CSpell for spell checking
- HTML link checking
- Markdown linting

### Manual Testing
- Build the site: `npm run build`
- Test locally: `npm run serve`
- Check links: `npm run test`

## Troubleshooting

### Common Issues
- **Hugo version conflicts**: Ensure Hugo extended is installed
- **Module issues**: Run `hugo mod tidy` and `hugo mod graph`
- **Styling problems**: Check SCSS compilation and asset paths
- **Link failures**: Verify internal and external links

### Build Errors
- Clear cache: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Hugo version: `hugo version`
   
## Release Process

### Documentation Releases
1. Manual updates can be triggered by running the `Update Generated Docs` workflow from GitHub Actions
2. Test the deployed site

### Maintenance Tasks
- Monitor GitHub Issues and Discussions
- Review and merge contributor PRs
- Update dependencies regularly
- Maintain CI/CD workflows

## Security Considerations

- Review third-party dependencies regularly
- Monitor for security advisories in Hugo, Docsy, and npm packages
- Keep GitHub Actions workflows up to date
- Use Dependabot for automated dependency updates

## Performance Monitoring

- Monitor build times and site performance
- Check for broken links regularly
- Optimize images and assets
