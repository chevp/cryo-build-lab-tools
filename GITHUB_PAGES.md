# GitHub Pages Deployment Guide

## Overview

This Angular application can be deployed to GitHub Pages for public access.

## Quick Start

### Automatic Deployment (Recommended)

1. Push changes to `main` branch
2. GitHub Actions automatically builds and deploys
3. Visit https://YOUR-USERNAME.github.io/cryo-build-lab-tools/

### Manual Deployment

```bash
# Build for GitHub Pages
.\build-gh-pages.bat

# Or with npm
npm run build -- --base-href /cryo-build-lab-tools/
```

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Source: Deploy from `gh-pages` branch
3. Click **Save**

### 2. Configure Workflow Permissions

1. **Settings** → **Actions** → **General**
2. Workflow permissions: "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"
4. Click **Save**

## Build Configuration

The build uses `--base-href /cryo-build-lab-tools/` to ensure assets load correctly on GitHub Pages.

### angular.json

Update if needed:
```json
{
  "architect": {
    "build": {
      "configurations": {
        "production": {
          "baseHref": "/cryo-build-lab-tools/"
        }
      }
    }
  }
}
```

## Local Testing

Test the production build locally:

```bash
# Build
npm run build

# Serve (requires http-server)
npx http-server dist/cryo-build-lab-tools -p 8080
```

## Troubleshooting

### 404 on routes

- Ensure `404.html` is created (copied from `index.html`)
- Verify Angular routing uses `HashLocationStrategy` or proper server configuration

### Assets not loading

- Check `--base-href` matches repository name
- Verify `.nojekyll` file exists in docs/

### Build fails

- Run `npm install` to ensure dependencies are installed
- Check Node.js version (requires 16+)
- Review GitHub Actions logs

## Custom Domain (Optional)

1. Add CNAME file:
   ```bash
   echo your-domain.com > docs/CNAME
   ```

2. Configure DNS:
   ```
   Type: CNAME
   Host: www
   Value: YOUR-USERNAME.github.io
   ```

3. Update GitHub Pages settings with custom domain

---

**Repository**: https://github.com/YOUR-USERNAME/cryo-build-lab-tools
**Live Site**: https://YOUR-USERNAME.github.io/cryo-build-lab-tools/
