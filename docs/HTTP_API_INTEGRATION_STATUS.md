# Cryo Build Lab Tools - HTTP API Integration Status

## Overview

All cryo-build-lab-tools are now configured to access the cryo-studio-server HTTP REST API at `http://localhost:52009`.

**API Definition**: [cryo-tooling/proto/cryo_tooling.proto](../../cryo-tooling/proto/cryo_tooling.proto)
**Server Port**: 52009 (default) | 52010 (shader-graph-renderer)
**Configured in**: [arctic.config.xml](../../arctic.config.xml)

## Shared HTTP API Service

**Location**: `src/app/services/arctic-api.service.ts`

A unified Angular service providing type-safe HTTP client for all Arctic API endpoints:

```typescript
import { ArcticApiService } from './services/arctic-api.service';

constructor(private api: ArcticApiService) {}

// Example usage
this.api.getStatus().subscribe(status => {
  console.log(`FPS: ${status.fps}, Uptime: ${status.uptime_seconds}s`);
});
```

### Supported Endpoints

| Service | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| **System** | GET | `/api/ping` | Health check |
| | GET | `/api/status` | System status (FPS, uptime, Vulkan) |
| | GET | `/api/vulkan-state` | Vulkan state dump |
| | PUT | `/api/camera` | Update camera position/rotation |
| | GET | `/api/screenshot` | Take screenshot |
| | POST | `/api/render` | Trigger render frame |
| | GET | `/api/grpc-messages` | Get gRPC message logs |
| **Scene** | GET | `/api/scenes` | List scenes |
| | GET | `/api/scenes/{id}` | Get scene details |
| | POST | `/api/scenes` | Create scene |
| | PUT | `/api/scenes/{id}` | Update scene |
| | DELETE | `/api/scenes/{id}` | Delete scene |
| **Material** | GET | `/api/materials` | List materials |
| | GET | `/api/materials/{id}` | Get material details |
| | POST | `/api/materials` | Create material |
| | PUT | `/api/materials/{id}` | Update material |
| **Shader** | POST | `/api/shaders/compile` | Compile GLSL to SPIR-V |
| | POST | `/api/shaders/reflect` | Reflect shader uniforms |
| **Build Lab** | GET | `/api/build/status` | Build status |
| | POST | `/api/build/compile-shaders` | Compile shaders |
| | GET | `/api/build/logs` | Build logs |

## Tool Implementation Status

### ✅ IO Monitor (`io-monitor`)
**Status**: FULLY IMPLEMENTED
**Location**: `src/app/tools/io-monitor/io-monitor.component.ts`
**Features**:
- ✅ Connects to HTTP API on startup
- ✅ Polls `/api/grpc-messages` every 2 seconds
- ✅ Displays real-time gRPC/HTTP message logs
- ✅ Search and filter functionality
- ✅ Export messages to JSON
- ✅ Graceful fallback to demo data if server offline
- ✅ Connection status indicator

**Usage**:
```typescript
// Auto-connects to http://localhost:52009
// Polls for messages when monitoring is active
// Shows demo data if server is unavailable
```

### 🔶 Scene Editor (`scene-editor`)
**Status**: STUB COMPONENT (needs implementation)
**Location**: `src/app/tools/scene-editor/scene-editor.component.ts`
**Needs**:
- Scene CRUD operations (`getScenes`, `createScene`, `updateScene`, `deleteScene`)
- Entity management
- Real-time scene preview
- Camera control integration

**Suggested Implementation**:
```typescript
import { ArcticApiService } from '../../services/arctic-api.service';

export class SceneEditorComponent implements OnInit {
  scenes: SceneInfo[] = [];

  constructor(private api: ArcticApiService) {}

  ngOnInit() {
    this.loadScenes();
  }

  loadScenes() {
    this.api.getScenes().subscribe(response => {
      this.scenes = response.scenes;
    });
  }

  createNewScene() {
    this.api.createScene({ name: 'New Scene', entity_count: 0 })
      .subscribe(scene => this.scenes.push(scene));
  }
}
```

### 🔶 Build Lab (`build-lab`)
**Status**: STUB COMPONENT (needs implementation)
**Location**: `src/app/tools/build-lab/build-lab.component.ts`
**Needs**:
- Build status monitoring (`getBuildStatus`)
- Shader compilation (`compileShaders`)
- Build logs display (`getBuildLogs`)
- Real-time build progress

**Suggested Implementation**:
```typescript
export class BuildLabComponent implements OnInit {
  buildStatus = '';
  logs: string[] = [];

  constructor(private api: ArcticApiService) {}

  ngOnInit() {
    this.refreshStatus();
  }

  refreshStatus() {
    this.api.getBuildStatus().subscribe(status => {
      this.buildStatus = status.status;
    });

    this.api.getBuildLogs().subscribe(response => {
      this.logs = response.logs;
    });
  }

  compileAllShaders() {
    this.api.compileShaders().subscribe(result => {
      alert(`Compiled ${result.compiled_count} shaders`);
      this.refreshStatus();
    });
  }
}
```

### 🔶 Material Editor (`material-editor`)
**Status**: STUB COMPONENT (needs implementation)
**Location**: `src/app/tools/material-editor/material-editor.component.ts`
**Needs**:
- Material list (`getMaterials`)
- Material CRUD operations
- PBR parameter editing
- Live preview with camera control

**Suggested Implementation**:
```typescript
export class MaterialEditorComponent implements OnInit {
  materials: Material[] = [];
  selectedMaterial: Material | null = null;

  constructor(private api: ArcticApiService) {}

  ngOnInit() {
    this.loadMaterials();
  }

  loadMaterials() {
    this.api.getMaterials().subscribe(response => {
      this.materials = response.materials;
    });
  }

  updateMaterial() {
    if (!this.selectedMaterial) return;

    this.api.updateMaterial(this.selectedMaterial.material_id, this.selectedMaterial)
      .subscribe(() => alert('Material updated'));
  }
}
```

### 🔶 Showcase (`showcase`)
**Status**: STUB COMPONENT (needs implementation)
**Location**: `src/app/tools/showcase/showcase.component.ts`
**Needs**:
- Demo scene loader
- Screenshot carousel
- Camera animation control
- Presentation mode

**Suggested Implementation**:
```typescript
export class ShowcaseComponent implements OnInit {
  scenes = ['demo1', 'demo2', 'demo3'];
  currentScene = 0;
  screenshots: string[] = [];

  constructor(private api: ArcticApiService) {}

  nextScene() {
    this.currentScene = (this.currentScene + 1) % this.scenes.length;
    this.loadScene(this.scenes[this.currentScene]);
  }

  loadScene(sceneId: string) {
    this.api.getScene(sceneId).subscribe(scene => {
      console.log('Loaded:', scene.name);
    });
  }

  takeShowcaseScreenshot() {
    const filename = `showcase_${Date.now()}.png`;
    this.api.takeScreenshot(filename).subscribe(response => {
      this.screenshots.push(response.filename);
    });
  }
}
```

## Configuration

All tools are configured in **arctic.config.xml**:

```xml
<studio>
  <tools>
    <tool id="io-monitor" name="Arctic IO Monitor">
      <url>https://chevp.github.io/cryo-build-lab-tools/io-monitor?embedded=true</url>
      <local-path>apps/cryo-build-lab-tools</local-path>
      <route>/io-monitor</route>
    </tool>
    <tool id="scene-editor" name="Arctic Scene Editor">
      <url>https://chevp.github.io/cryo-build-lab-tools/scene-editor?embedded=true</url>
      <route>/scene-editor</route>
    </tool>
    <tool id="build-lab" name="Arctic Build Lab">
      <url>https://chevp.github.io/cryo-build-lab-tools/build-lab?embedded=true</url>
      <route>/build-lab</route>
    </tool>
    <tool id="material-editor" name="Material Editor">
      <url>https://chevp.github.io/cryo-build-lab-tools/material-editor?embedded=true</url>
      <route>/material-editor</route>
    </tool>
    <tool id="showcase" name="Arctic Showcase">
      <url>https://chevp.github.io/cryo-build-lab-tools/showcase?embedded=true</url>
      <route>/showcase</route>
    </tool>
  </tools>

  <http-server>
    <elyrion-renderer-port>52009</elyrion-renderer-port>
    <shader-graph-renderer-port>52010</shader-graph-renderer-port>
  </http-server>
</studio>
```

## Testing the Tools

### 1. Start the HTTP Server
```bash
cd c:/workspaces/projects/graphics/arctic-game-client
./build-x64/bin/Debug/cryo-studio-server.exe --http-server
```

⚠️ **Known Issue**: Server currently crashes with segmentation fault. Once fixed, proceed to step 2.

### 2. Build the Angular App
```bash
cd apps/cryo-build-lab-tools
npm install
npm start
```

### 3. Open Tools in Browser
```
http://localhost:4200/io-monitor        - IO Monitor
http://localhost:4200/scene-editor      - Scene Editor
http://localhost:4200/build-lab         - Build Lab
http://localhost:4200/material-editor   - Material Editor
http://localhost:4200/showcase          - Showcase
```

### 4. Test API Connection

**IO Monitor** will automatically:
1. Try to connect to `http://localhost:52009`
2. Show connection status (green = connected, red = offline)
3. Load demo data if server unavailable
4. Poll `/api/grpc-messages` when monitoring is active

## Next Steps

1. **Fix cryo-studio-server crash** - Currently segfaults on `--http-server` flag
2. **Implement remaining tools** - scene-editor, build-lab, material-editor, showcase
3. **Add WebSocket support** - For real-time updates instead of polling
4. **Implement authentication** - If deploying to production
5. **Add error handling** - Retry logic, exponential backoff
6. **Create integration tests** - E2E tests for each tool

## Benefits

✅ **Unified API** - All tools use same service
✅ **Type Safety** - TypeScript interfaces for all endpoints
✅ **Connection Management** - Auto-reconnect, status indicators
✅ **Demo Mode** - Works offline with mock data
✅ **Real-time Updates** - Polling (or WebSocket in future)
✅ **Extensible** - Easy to add new endpoints

---

**Last Updated**: 2025-10-11
**API Version**: 1.0
**Server Port**: 52009
