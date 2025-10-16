# Server Monitor Tool

## Overview

The **Server Monitor** is a real-time monitoring and control interface for **cryo-studio-server**, providing direct access to the C++ HTTP REST API defined in `cryo_tooling.proto`. It's integrated into the **Cryo Build Lab Tools** Angular application.

### Architecture

**cryo-studio-server** (port 52009) is the **unified HTTP API server** that:
- ✅ **Single entry point** for all Arctic tooling HTTP operations
- ✅ Internally delegates to `data-driven-coregfx-renderer.exe` for rendering
- ✅ Provides endpoints for scenes, materials, shaders, builds, and monitoring
- ✅ Integrates with cryo-tooling for compilation and asset management

**DEPRECATED - No longer needed:**
- ❌ `shader-graph-renderer.exe` HTTP server (port 52010) - Functionality moved to cryo-studio-server
- ❌ Direct HTTP calls to individual renderers - Use cryo-studio-server unified API instead

**Server Monitor connects ONLY to cryo-studio-server** (port 52009)

## Features

### 1. System Status Monitoring
- **Real-time metrics**: FPS, frame time, draw calls
- **Server information**: Version, uptime, Vulkan version
- **Memory usage**: Optional memory tracking
- **Auto-refresh**: Configurable automatic status updates (default: 5 seconds)
- **Manual refresh**: Update status on demand

### 2. Camera Control
- **Position control**: Adjust X, Y, Z coordinates
- **Rotation control**: Set rotation angles (degrees)
- **Reset function**: Quick reset to default camera position (0, 3, 15)
- **Live updates**: Immediate feedback on camera changes

### 3. Screenshot Capture
- **Custom filenames**: Specify output filename
- **Success notification**: Confirmation with saved filename
- **Local storage**: Screenshots saved to server's working directory

### 4. Vulkan State Dumping
- **State inspection**: View detailed Vulkan renderer state
- **Resource counts**: Pipeline, buffer, and image counts
- **Debugging**: Essential for graphics debugging and optimization

### 5. API Endpoint Testing
- **Interactive testing**: Click any endpoint to test it
- **JSON response viewer**: View full API responses
- **Quick diagnostics**: Verify server endpoints are working

### 6. Connection Management
- **Connection indicator**: Visual status (online/offline)
- **Ping test**: Manual connection testing
- **Auto-reconnect**: Automatic reconnection attempts

## How to Use

### Start the Cryo Build Lab Tools

```bash
cd apps/cryo-build-lab-tools
npm install
npm start
```

The Angular development server will start on **http://localhost:4200**

### Start cryo-studio-server

The Server Monitor requires a running cryo-studio-server instance:

```bash
# Start with HTTP API enabled
./build-x64/bin/Debug/cryo-studio-server.exe --http-server

# Or use a custom port
./build-x64/bin/Debug/cryo-studio-server.exe --http-port 8080
```

Default server URL: **http://localhost:52009**

### Access the Server Monitor

1. Open browser to http://localhost:4200
2. Navigate to **Server Monitor** in the sidebar (🎮 icon)
3. The tool will automatically connect to http://localhost:52009
4. If connection fails, check that cryo-studio-server is running

### Monitor System Status

- **Auto-refresh enabled by default** - Status updates every 5 seconds
- Click **⏸** to pause auto-refresh
- Click **🔄** to manually refresh status
- View FPS, frame time, draw calls, uptime, and Vulkan version

### Control Camera

1. Enter position coordinates (X, Y, Z)
2. Enter rotation angles (X, Y, Z)
3. Click **Update Camera** to apply changes
4. Click **Reset** to restore default position

**Default camera position**: `(0, 3, 15)` - Positioned to see scene objects (not at origin!)

### Take Screenshots

1. Enter desired filename (e.g., `test_capture.png`)
2. Click **📸 Take Screenshot**
3. Screenshot is saved to server's working directory
   - Location: `build-x64/bin/Debug/` (or current server directory)

### Dump Vulkan State

1. Click **Dump Vulkan State**
2. View detailed state information in the text area
3. Click **Clear** to remove the dump

### Test API Endpoints

- Click any endpoint in the **API Endpoints** card
- View JSON response in popup alert
- Useful for verifying server functionality

## Architecture

### Technology Stack
- **Frontend**: Angular 17+ (standalone components)
- **HTTP Client**: RxJS observables for async operations
- **Service Layer**: `ArcticApiService` - Centralized HTTP API client
- **Styling**: SCSS with GitHub Dark theme

### File Structure

```
apps/cryo-build-lab-tools/src/app/tools/server-monitor/
├── server-monitor.component.ts       # Component logic
├── server-monitor.component.html     # Template
└── server-monitor.component.scss     # Styles
```

### Integration Points

**API Service** (`arctic-api.service.ts`):
- Centralized HTTP client for cryo-studio-server
- Endpoints mapped from `cryo_tooling.proto`
- Observable-based async operations
- Connection status tracking

**Routes** (`app.routes.ts`):
- `/server-monitor` - Main route
- Lazy-loaded component for performance

**Navigation** (`app.component.html`):
- Sidebar navigation item with 🎮 icon
- Set as default landing page

## API Reference

All endpoints are defined in:
```
cryo-tooling/proto/cryo_tooling.proto
```

### Cryo System Service

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ping` | GET | Health check |
| `/api/status` | GET | System status (FPS, uptime, Vulkan) |
| `/api/vulkan-state` | GET | Vulkan state dump |
| `/api/camera` | PUT | Update camera position/rotation |
| `/api/screenshot` | GET | Take screenshot |
| `/api/render` | POST | Trigger render frame |

### Additional Services

- **Scene Service**: `/api/scenes/*`
- **Material Service**: `/api/materials/*`
- **Shader Compiler**: `/api/shaders/*`
- **Build Lab**: `/api/build/*`

## Configuration

### Change API Base URL

If cryo-studio-server runs on a different port, update `ArcticApiService`:

```typescript
// arctic-api.service.ts
private apiBaseUrl = 'http://localhost:8080'; // Custom port
```

### Adjust Auto-Refresh Interval

```typescript
// server-monitor.component.ts
refreshInterval = 5000; // 5 seconds (default)
refreshInterval = 2000; // 2 seconds (faster)
```

## Comparison with HTML Dashboards

| Feature | status-dashboard.html | status-monitor.html | Server Monitor (Angular) |
|---------|---------------------|---------------------|--------------------------|
| Framework | Vanilla HTML/JS | Vanilla HTML/JS | Angular 17+ |
| Auto-refresh | ✓ (5s) | ✓ (2s) | ✓ (configurable) |
| Camera control | ✓ | ✗ | ✓ |
| Screenshot | ✓ | ✗ | ✓ |
| Vulkan state | ✓ | ✗ | ✓ |
| API testing | ✓ | ✗ | ✓ |
| Navigation | ✗ | ✗ | ✓ (integrated sidebar) |
| TypeScript | ✗ | ✗ | ✓ (type safety) |
| Build required | ✗ | ✗ | ✓ (npm build) |

**When to use**:
- **HTML dashboards**: Quick standalone monitoring, no build step
- **Server Monitor (Angular)**: Full-featured development environment, integrated tooling

## Troubleshooting

### Server Monitor shows "Offline"

1. Check cryo-studio-server is running:
   ```bash
   curl http://localhost:52009/api/ping
   ```

2. Verify HTTP server started (check console output):
   ```
   HTTP server listening on port 52009
   ```

3. Check firewall settings (allow port 52009)

### Auto-refresh not working

- Click the **▶** button to enable auto-refresh
- Check browser console for errors
- Verify server is responding to `/api/status`

### Camera updates not reflected

- Ensure renderer window is visible (not minimized)
- Try taking a screenshot to verify visual changes
- Check server logs for camera update acknowledgments

### CORS Errors

The server should include CORS headers. If you see CORS errors:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

Check server HTTP handler configuration.

### Build Errors

```bash
# Clear node_modules and reinstall
cd apps/cryo-build-lab-tools
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Development

### Run Development Server

```bash
cd apps/cryo-build-lab-tools
npm start
```

Development server runs on http://localhost:4200 with:
- Live reload on file changes
- Source maps for debugging
- Faster build times (no optimization)

### Build for Production

```bash
npm run build
```

Production build outputs to:
```
apps/cryo-build-lab-tools/dist/cryo-build-lab-tools/
```

Deploy to:
- **Local static server**: Use `npx http-server dist/cryo-build-lab-tools`
- **GitHub Pages**: Use `build-gh-pages.bat` script
- **Web server**: Copy `dist/` contents to web root

## Future Enhancements

Potential improvements for Server Monitor:

- [ ] **Workflow execution**: Execute YAML workflows from UI
- [ ] **Scene management**: Load/unload scenes via API
- [ ] **Material editing**: Inline material property editing
- [ ] **Shader compilation**: Compile GLSL shaders in browser
- [ ] **Log streaming**: Real-time server log viewing
- [ ] **Performance graphs**: Chart FPS/frame time over time
- [ ] **Preset management**: Save/load camera positions
- [ ] **Batch operations**: Multiple screenshots, camera sequences
- [ ] **WebSocket support**: Replace polling with real-time push
- [ ] **Multi-server monitoring**: Monitor multiple renderers simultaneously

## Related Files

- **Component**: `apps/cryo-build-lab-tools/src/app/tools/server-monitor/`
- **API Service**: `apps/cryo-build-lab-tools/src/app/services/arctic-api.service.ts`
- **Routes**: `apps/cryo-build-lab-tools/src/app/app.routes.ts`
- **Navigation**: `apps/cryo-build-lab-tools/src/app/app.component.html`
- **API Definition**: `cryo-tooling/proto/cryo_tooling.proto` (reference only)
- **HTML Dashboards**: `apps/status-dashboard.html`, `apps/status-monitor.html`

---

**Created**: 2025-10-11
**Author**: Patrice Chevillat (with Claude Code assistance)
**License**: MIT
