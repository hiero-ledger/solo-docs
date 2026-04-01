# Contributing to Solo Documentation

We welcome contributions to improve the Solo documentation! This guide covers everything you need to know to contribute effectively, from fixing typos to adding new content and making technical improvements.

## Ways to Contribute

### Content Contributions
- **Fix typos and improve clarity** in existing documentation.
- **Add new guides or examples** for common use cases.
- **Update content** for new Solo features or changes.
- **Improve navigation** and information architecture.
- **Translate content** to additional languages.

### Technical Contributions
- **Improve the documentation site** (Hugo, Docsy, styling).
- **Fix build issues** or CI/CD problems.
- **Add new features** to the documentation platform.
- **Update dependencies** and maintain infrastructure.

## Quick Start for Content Contributors

### Prerequisites
- Git
- A GitHub account
- Basic knowledge of Markdown

### Making Your First Contribution

1. **Find something to improve**: Browse the documentation at [solo.hiero.org](https://solo.hiero.org/) or check open [issues](https://github.com/hiero-ledger/solo-docs/issues).

2. **Fork the repository**: Click the "Fork" button on [GitHub](https://github.com/hiero-ledger/solo-docs).

3. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/solo-docs.git
   cd solo-docs
   ```

4. **Create a branch** for your changes:
   ```bash
   git checkout -b docs/fix-typo-in-setup-guide
   ```

5. **Make your changes**: Edit the relevant `.md` files in `content/en/docs/`

6. **Preview your changes** (optional):
   ```bash
   npm install
   hugo server -D --baseURL http://localhost:1313/
   ```

7. **Commit and push**:
   ```bash
   git add .
   git commit -m "docs(setup-guide): fix typo in dependencies section"
   git push origin docs/fix-typo-in-setup-guide
   ```

8. **Create a Pull Request**: Go to GitHub and click "Compare & pull request"

## Git Commit Conventions

This repository uses **scoped semantic conventional commits** to maintain a clear and organized git history. All commit messages must follow the [Conventional Commits](https://conventionalcommits.org/) format with appropriate scopes.

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (build, dependencies, etc.)

### Scopes
Use specific scopes to categorize your changes:
- `docs`: General documentation changes
- `content`: Content updates (guides, examples)
- `style`: Styling and theming changes
- `build`: Build system and CI/CD changes
- `deps`: Dependency updates
- `config`: Configuration files
- `layout`: Hugo layout changes

### Examples
```
docs(installation): update installation prerequisites
fix(content): correct typo in troubleshooting guide
feat(style): add dark mode support
chore(deps): update Hugo to latest version
refactor(layout): simplify header component
```

### Commit Guidelines
- Use present tense ("add" not "added")
- Keep the description under 72 characters
- Use scopes consistently and appropriately
- Reference issues when relevant (e.g., `fix(#123): resolve dependency mapping`)

## Content Guidelines

### Writing Style
- Use clear, concise language.
- Write in active voice when possible.
- Use second person ("you") to address the reader.
- Keep sentences and paragraphs short.
- Use headings and subheadings for structure.

### Markdown Best Practices
- Use proper heading hierarchy (H1 → H2 → H3).
- Include alt text for images
- Use code blocks with language specification
- Link to related documentation sections
- Use tables for structured data

### Front Matter
Each content file should include proper front matter:

```yaml
---
title: "Your Page Title"
weight: 10
description: >
  Brief description for SEO and navigation
categories: ["Category"]
tags: ["tag1", "tag2"]
type: docs
---
```

## Development Setup (For Technical Contributors)

### Prerequisites
- Node.js 22+
- Go 1.18+ (for Hugo extended)
- Hugo extended 0.145.0+
- Git

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hiero-ledger/solo-docs.git
   cd solo-docs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   hugo server -D --baseURL http://localhost:1313/ --cleanDestinationDir
   ```

   Open `http://localhost:1313/` in your browser.

### Available Commands

```bash
# Build the site
npm run build

# Start development server
npm run serve

# Clean build artifacts
npm run clean

# Format code
npm run fix:format

# Run tests (link checking)
npm run test
```

## Content Structure

### Directory Layout
```
content/en/docs/
├── _index.md                 # Documentation home page
├── simple-solo-setup/        # Getting started guides
├── advanced-solo-setup/      # Complex configurations
├── using-solo/              # Usage and operations
├── troubleshooting.md       # Common issues
└── community-contributions.md # Community info
```

## Pull Request Process

### Before Submitting
- [ ] Test your changes locally
- [ ] Check that links work correctly
- [ ] Ensure proper formatting and spelling
- [ ] Follow the content guidelines above
- [ ] Update any related documentation

### PR Template
When creating a pull request, include:
- **Description**: What changes and why
- **Testing**: How you tested the changes
- **Screenshots**: For UI or layout changes
- **Related Issues**: Link to any related issues

### Review Process
1. Automated checks will run (formatting, link checking)
2. A maintainer will review your changes
3. Address any feedback or requested changes
4. Once approved, your PR will be merged

## Code Review Guidelines

### For Reviewers
- Be constructive and respectful
- Focus on the content and user experience
- Check for technical accuracy
- Verify adherence to style guidelines
- Test changes when possible

### For Contributors
- Be open to feedback
- Explain your reasoning when requested
- Make requested changes promptly
- Ask questions if anything is unclear

## Issue Reporting

### Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide environment details
- Add screenshots if relevant

### Feature Requests
- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider alternative approaches

### Content Improvements
- Be specific about what needs improvement
- Suggest concrete changes when possible
- Provide examples from other documentation

## Community and Support

- **Discussions**: Use [GitHub Discussions](https://github.com/hiero-ledger/solo-docs/discussions) for questions
- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/hiero-ledger/solo-docs/issues)
- **Solo Tool**: For questions about Solo itself, visit the [Solo repository](https://github.com/hiero-ledger/solo)

## Recognition

Contributors are recognized in several ways:
- Your name in the contributor list
- Attribution in release notes
- Recognition in community discussions

Thank you for contributing to Solo documentation! 🎉
