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
2. **Build and deployment**:
   - Source: **GitHub Actions** (NOT "Deploy from a branch")
3. The workflow will automatically deploy after setup

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

### Jekyll errors (No such file or directory @ dir_chdir0)

This means GitHub Pages is trying to use Jekyll instead of the GitHub Actions workflow.

**Solution**:
1. Go to **Settings** → **Pages**
2. Under "Build and deployment", set Source to **GitHub Actions**
3. Do NOT select "Deploy from a branch"
4. The `.nojekyll` file will prevent Jekyll processing

### 404 on routes

- Ensure `404.html` is created (copied from `index.html`)
- Verify Angular routing uses `HashLocationStrategy` or proper server configuration

### Assets not loading

- Check `--base-href` matches repository name exactly: `/cryo-build-lab-tools/`
- Verify `.nojekyll` file exists in deployed output
- Check browser console for path errors

### Build fails

- Run `npm install` to ensure dependencies are installed
- Check Node.js version (requires 18+)
- Review GitHub Actions logs under the **Actions** tab
- Verify `package.json` scripts are correct

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
