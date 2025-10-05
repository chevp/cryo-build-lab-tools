# Changelog

All notable changes to the Cryo Build Lab Tools project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Pages deployment configuration for hosting the Angular application
  - Created `build-gh-pages.bat` script for automated build and deployment preparation
  - Added GitHub Actions workflow (`.github/workflows/deploy-gh-pages.yml`) for automatic deployment on push to main
  - Created `GITHUB_PAGES.md` documentation with setup and troubleshooting instructions
- MIT License for the project (LICENSE.md)
- Copyright headers added to all source files (© Patrice Chevillat)
- Updated `.gitignore` to exclude generated `docs/` directory from version control

### Changed
- Angular build configuration updated to support base href `/cryo-build-lab-tools/` for GitHub Pages

## [1.0.0] - 2025-10-05

### Added
- Initial Angular 17 application structure
- Consolidated multi-tool application for Arctic Build Lab
- SCSS styling support
- Karma/Jasmine testing framework
- Multiple serve scripts for different development ports

---

**Maintained by**: Patrice Chevillat
**License**: MIT
