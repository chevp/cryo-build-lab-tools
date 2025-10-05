# 🧊 Cryo Build Lab Tools

**Consolidated Angular multi-tool application for Arctic Build Lab**

This is a modern Angular 17 standalone-component application that consolidates all Arctic development tools into a single, cohesive web application with proper routing and state management.

## Features

- **📊 I/O Monitor** - Real-time gRPC/HTTP traffic monitoring (Keysight-style)
- **📐 Scene Editor** - Visual editing for .arctic and .elyrion.xml files
- **✨ Material Editor** - PBR material editing with real-time preview
- **🎨 Showcase** - Demo scenes and feature galleries
- **🔧 Build Lab** - Build system integration and asset pipeline

## Architecture

- **Framework**: Angular 17 (Standalone Components)
- **Routing**: Lazy-loaded routes for optimal bundle size
- **Styling**: SCSS with CSS variables (VS Code dark theme)
- **Build**: Angular CLI with production optimizations

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

```bash
cd apps/cryo-build-lab-tools
npm install
```

### Development

```bash
# Start dev server on port 4200
npm start

# Or serve specific tools on their assigned ports
npm run serve:io-monitor      # Port 3006
npm run serve:showcase         # Port 3007
npm run serve:build-lab        # Port 3008
npm run serve:material-editor  # Port 3005
npm run serve:scene-editor     # Port 3001
```

### Production Build

```bash
npm run build
```

Output will be in `dist/cryo-build-lab-tools/`

## Integration with C++ Renderer

The Angular app communicates with the C++ renderer via HTTP REST API:

- **Renderer API**: `http://localhost:52009/api/*`
- **Shader Graph**: `http://localhost:52009/shader-graph/*`

Connection status is shown in the sidebar footer.

## Project Structure

```
cryo-build-lab-tools/
├── src/
│   ├── app/
│   │   ├── tools/
│   │   │   ├── io-monitor/
│   │   │   ├── scene-editor/
│   │   │   ├── material-editor/
│   │   │   ├── showcase/
│   │   │   └── build-lab/
│   │   ├── app.component.ts    # Main app with sidebar nav
│   │   └── app.routes.ts       # Lazy-loaded routes
│   ├── styles.scss             # Global dark theme styles
│   ├── main.ts                 # Bootstrap entry point
│   └── index.html
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## Development Guidelines

### Adding a New Tool

1. Create component in `src/app/tools/your-tool/`
2. Add route to `app.routes.ts`
3. Add navigation item to `app.component.ts` sidebar
4. Add npm script to `package.json` if custom port needed

### Styling

Use the CSS variables defined in `styles.scss`:

- `--bg-primary` - Main background (#1e1e1e)
- `--bg-secondary` - Panel background (#252526)
- `--bg-tertiary` - Button/input background (#2d2d30)
- `--border-color` - Border color (#3e3e42)
- `--text-primary` - Main text (#d4d4d4)
- `--text-secondary` - Muted text (#969696)
- `--accent-blue` - Primary accent (#007acc)
- `--accent-green` - Success/active (#4ec9b0)
- `--accent-orange` - Warning (#ce9178)
- `--accent-red` - Error (#f48771)

### API Communication

Use the fetch API for HTTP requests to the renderer:

```typescript
async checkRendererConnection() {
  try {
    const response = await fetch('http://localhost:52009/api/status');
    return response.ok;
  } catch {
    return false;
  }
}
```

## Testing

```bash
npm test
```

Runs Jasmine/Karma unit tests.

## Contributing

When migrating tools from `apps/tools/`, follow this process:

1. Extract business logic from vanilla JS to TypeScript services
2. Convert HTML to Angular templates with proper binding
3. Add proper TypeScript interfaces for data models
4. Integrate with renderer HTTP API
5. Update routing and navigation

---

**Built with Angular 17 • Standalone Components • Lazy Loading**
