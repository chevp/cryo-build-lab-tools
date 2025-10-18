@echo off
REM Build script for GitHub Pages deployment
REM Copies Angular build output to docs/ directory for hosting

echo Building Cryo Lab Tools for GitHub Pages...

REM Build Angular app for production
echo Building Angular application...
call npm run build

REM Check if build succeeded
if not exist "dist\cryo-build-lab-tools" (
    echo ERROR: Build failed - dist\cryo-build-lab-tools not found
    exit /b 1
)

REM Clean docs directory
if exist docs rmdir /s /q docs
mkdir docs

REM Copy build output to docs
echo Copying build output to docs/...
xcopy /E /I /Y dist\cryo-build-lab-tools docs

REM Create .nojekyll to disable Jekyll processing
echo. > docs\.nojekyll

REM Create 404.html for client-side routing
copy docs\index.html docs\404.html

echo.
echo ========================================
echo GitHub Pages build complete!
echo ========================================
echo.
echo Output directory: docs/
echo.
echo Next steps:
echo 1. Commit the docs/ directory (or let GitHub Actions handle it)
echo 2. Go to GitHub Settings ^> Pages
echo 3. Set source to "main" branch, "/docs" folder
echo 4. Save and wait for deployment
echo.
echo Your site will be available at:
echo https://YOUR-USERNAME.github.io/cryo-build-lab-tools/
echo.
