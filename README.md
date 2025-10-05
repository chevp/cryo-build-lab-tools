# 🧊 Cryo Build Lab Tools

**Consolidated Angular multi-tool application for Cryo Build Lab**

This is an application that consolidates all Cryo development tools into a single, cohesive web application with proper routing and state management.

## Features

- **📊 I/O Monitor** - Real-time gRPC/HTTP traffic monitoring
- **📐 Scene Editor** - Visual editing for .arctic files
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
npm run serve:io-monitor       # Port 3006
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

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages.

```bash
# Build for GitHub Pages
.\build-gh-pages.bat
```

See [GITHUB_PAGES.md](GITHUB_PAGES.md) for complete deployment instructions and troubleshooting.

## Integration with C++ Renderer

The Angular app communicates with the C++ renderer via HTTP REST API on `http://localhost:52009`.

Connection status is shown in the sidebar footer.

### Complete API Reference

#### System & Utility Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/status` | Server health check and renderer status | - | `{server_status, renderer, timestamp}` |
| `GET` | `/api/ping` | Quick ping with server info | - | `{message, timestamp, server_version}` |
| `GET` | `/api/vulkan-state` | Get Vulkan state information | - | `{vulkan_state, message, timestamp}` |
| `GET` | `/api/dump-state?filename=&delay=` | Request state dump to file | Query: `filename`, `delay` | `{message, filename, delay_seconds}` |
| `PUT` | `/api/camera` | Update camera position/rotation | `{position_x, position_y, position_z, rotation_x, rotation_y, rotation_z, fov}` | `{message, position, rotation, fov}` |
| `GET` | `/api/screenshot?filename=` | Capture screenshot | Query: `filename` | `{message, filename, timestamp}` |
| `POST` | `/api/render` | Render scene to image | `{scene_id, output_file, width, height, headless}` | `{message, scene_id, output_file, width, height}` |
| `POST` | `/api/headless-bake` | Headless lightmap baking | `{scene_id, output_file, width, height, samples, enable_gi, enable_ao}` | `{message, output_file, samples, bake_time_ms}` |
| `POST` | `/api/workflow` | Submit YAML workflow | YAML workflow body | `{message, workflow_id, status, workflow_size_bytes}` |
| `GET` | `/api/internal-monitor?since=&limit=` | Get internal events | Query: `since`, `limit` | `{events[], count, lastEventId, totalEvents}` |
| `GET` | `/api/grpc-messages?since=&limit=` | Get gRPC message history | Query: `since`, `limit` | `{messages[], total_count, since_timestamp}` |

#### Entity Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/entities` | List all entities | - | `{entities[], total_count}` |
| `GET` | `/api/entities/{id}` | Get single entity | - | `{entity data}` |
| `POST` | `/api/entities` | Create new entity | `{entity definition}` | `{entity_id, message, timestamp}` |
| `PUT` | `/api/entities/{id}` | Update entity | `{updated properties}` | `{entity_id, message}` |
| `DELETE` | `/api/entities/{id}` | Delete entity | - | `{entity_id, message}` |
| `POST` | `/api/entities/{id}/components` | Add component to entity | `{type, ...component data}` | `{entity_id, component_type, message}` |
| `DELETE` | `/api/entities/{id}/components/{cid}` | Remove component | - | `{entity_id, component_id, message}` |

#### Scene Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/api/scenes` | Create new scene | `{client_id, scene_id}` | `{scene_id, message, client_id}` |
| `GET` | `/api/scenes/{id}` | Get scene hierarchy | - | `{scene_id, name, entities[], camera}` |
| `PUT` | `/api/scenes/{id}` | Update scene properties | `{scene updates}` | `{scene_id, message}` |
| `DELETE` | `/api/scenes/{id}` | Delete scene | - | `{scene_id, message}` |
| `POST` | `/api/scenes/{id}/entities` | Add entity to scene | `{entity_id, entity_type, entity_name, entity_data, client_id}` | `{scene_id, entity_id, message}` |
| `GET` | `/api/scenes/{id}/entities/{eid}` | Get entity from scene | - | `{scene_id, entity_id, entity_name}` |
| `PUT` | `/api/scenes/{id}/entities/{eid}` | Update entity in scene | `{entity_name, entity_data, client_id}` | `{scene_id, entity_id, message}` |
| `DELETE` | `/api/scenes/{id}/entities/{eid}` | Remove entity from scene | - | `{scene_id, entity_id, message}` |
| `PUT` | `/api/scenes/{id}/camera` | Update camera in scene | `{camera data}` | `{scene_id, message, camera}` |

#### Material Editor

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/materials` | List all materials | - | `{materials[], total_count}` |
| `GET` | `/api/materials/{id}` | Get material properties | - | `{id, name, type, albedo, metallic, roughness, ao, emissive, textures}` |
| `POST` | `/api/materials` | Create new material | `{id, name, type, albedo, metallic, roughness, ao, emissive, textures}` | `{id, name, type, message}` |
| `PUT` | `/api/materials/{id}` | Update material | `{name, albedo, metallic, roughness, ao, emissive, textures}` | `{id, name, message}` |
| `DELETE` | `/api/materials/{id}` | Delete material | - | `{id, message}` |
| `GET` | `/api/materials/{id}/preview` | Get material preview image | - | `{material_id, preview_url, message}` |

#### Build Lab

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/build/status` | Get current build status | - | `{build_system, platform, configuration, status, compiler}` |
| `POST` | `/api/build/compile-shaders` | Trigger shader compilation | `{shader_path, force}` | `{message, shader_path, status, shaders_compiled}` |
| `GET` | `/api/build/logs` | Get build logs | - | `{logs[], total_count}` |
| `POST` | `/api/build/asset-pipeline` | Run asset pipeline | `{asset_type, optimize}` | `{message, asset_type, status, assets_processed}` |
| `GET` | `/api/build/config` | Get CMake configuration | - | `{build_system, cmake_version, generator, compiler, configurations[]}` |

#### Showcase

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/showcase/scenes` | List all showcase scenes | - | `{scenes[], total_count, categories[]}` |
| `GET` | `/api/showcase/scenes/{id}` | Load specific showcase scene | - | `{scene_id, name, message, status}` |

### Example Usage

```typescript
// Check server connection
const response = await fetch('http://localhost:52009/api/status');
const status = await response.json();

// Get all entities
const entitiesResp = await fetch('http://localhost:52009/api/entities');
const entities = await entitiesResp.json();

// Create new material
const materialResp = await fetch('http://localhost:52009/api/materials', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'MyMaterial',
    type: 'pbr',
    albedo: {r: 0.8, g: 0.8, b: 0.8},
    metallic: 0.5,
    roughness: 0.5
  })
});

// Update camera
await fetch('http://localhost:52009/api/camera', {
  method: 'PUT',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    position_x: 0,
    position_y: 3,
    position_z: 15,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    fov: 60
  })
});

// Capture screenshot
await fetch('http://localhost:52009/api/screenshot?filename=test.png');

// Monitor gRPC messages (polling)
const grpcResp = await fetch('http://localhost:52009/api/grpc-messages?since=0&limit=100');
const messages = await grpcResp.json();
```

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

## License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for details.

Copyright (c) 2025 Patrice Chevillat

---

**Built with Angular 17 • Standalone Components • Lazy Loading**
