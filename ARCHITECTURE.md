# Cryo Build Lab - Architecture Overview

**Arctic Game Client Ecosystem** - Multi-tier architecture with specialized backend services.

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     ARCTIC GAME CLIENT ECOSYSTEM                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────┐         ┌──────────────────────────┐ │
│  │  C++ Renderer         │  gRPC   │  Java/Quarkus Backend    │ │
│  │  (elyrion.coregfx)    │◄────────┤  (Haupt-CLI Server)      │ │
│  │                       │         │                          │ │
│  │  - Vulkan Rendering   │         │  - Task Management       │ │
│  │  - PBR Pipeline       │         │  - Plugin System         │ │
│  │  - Entity System      │         │  - Workflow Engine       │ │
│  │  - HTTP REST Server   │         │  - Build Orchestration   │ │
│  │    (port 52009)       │         │  - Asset Pipeline        │ │
│  │  - Runtime Shaderc    │         │  - Project Management    │ │
│  │  - Material System    │         │                          │ │
│  └───────────┬───────────┘         └────────────┬─────────────┘ │
│              │                                  │                │
│              │ HTTP REST                        │ HTTP/gRPC      │
│              │                                  │                │
│  ┌───────────▼──────────────────────────────────▼─────────────┐ │
│  │           Cryo Build Lab Tools (Angular Web App)           │ │
│  │                      http://localhost:4200                  │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Tools:                                              │  │ │
│  │  │                                                      │  │ │
│  │  │  📊 I/O Monitor          ──► Both Servers           │  │ │
│  │  │     - gRPC message monitoring                       │  │ │
│  │  │     - HTTP traffic analysis                         │  │ │
│  │  │                                                      │  │ │
│  │  │  🎨 Shader Graph Editor  ──► C++ Renderer           │  │ │
│  │  │     - Visual node editor                            │  │ │
│  │  │     - Runtime SPIR-V compilation via /api/shaders   │  │ │
│  │  │                                                      │  │ │
│  │  │  ✨ Material Editor      ──► C++ Renderer           │  │ │
│  │  │     - PBR material properties via /api/materials    │  │ │
│  │  │     - Live preview rendering                        │  │ │
│  │  │                                                      │  │ │
│  │  │  📐 Scene Editor         ──► C++ Renderer           │  │ │
│  │  │     - Entity management via /api/entities           │  │ │
│  │  │     - Scene hierarchy via /api/scenes               │  │ │
│  │  │                                                      │  │ │
│  │  │  🔧 Build Lab            ──► Java Backend           │  │ │
│  │  │     - Task execution via Java task API              │  │ │
│  │  │     - Plugin management                             │  │ │
│  │  │     - Build orchestration                           │  │ │
│  │  │     - Shader compilation tasks                      │  │ │
│  │  │     - Asset processing workflows                    │  │ │
│  │  │                                                      │  │ │
│  │  │  🎭 Showcase             ──► C++ Renderer           │  │ │
│  │  │     - Demo scenes via /api/showcase                 │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Services

### 1. C++ Renderer (elyrion.coregfx.renderer)

**Purpose**: Real-time Vulkan rendering engine with immediate feedback

**Port**: `52009` (HTTP REST API)

**Responsibilities**:
- Vulkan-based 3D rendering
- PBR material system
- Entity/component management
- Scene graph management
- Runtime shader compilation (shaderc)
- Real-time camera control
- Screenshot generation
- State dumps for debugging

**API Endpoints**: See [README.md](README.md) for complete API reference

**Key Features for Web Tools**:
- `/api/materials` - Material CRUD operations
- `/api/entities` - Entity management
- `/api/scenes` - Scene hierarchy
- `/api/shaders/compile` - Runtime SPIR-V compilation (future)
- `/api/camera` - Camera positioning
- `/api/screenshot` - Image capture

**Technology Stack**:
- C++17
- Vulkan API
- shaderc (runtime shader compilation)
- SPIRV-Reflect
- HTTP server (built-in)
- gRPC client (communicates with Java backend)

---

### 2. Java/Quarkus Backend (Haupt-CLI Server)

**Purpose**: Task orchestration, plugin system, build management

**Responsibilities**:
- **Task Management**: Execute long-running build tasks
- **Plugin System**: Extensible plugin architecture for custom tools
- **Workflow Engine**: Complex multi-step workflows (YAML-based)
- **Build Orchestration**: Coordinate shader compilation, asset processing
- **Project Management**: Manage Arctic projects and configurations
- **Asset Pipeline**: Batch processing of assets (GLTF, textures)
- **CLI Interface**: Command-line interface for developers

**Communication**:
- **To C++ Renderer**: gRPC (for rendering requests, state queries)
- **From Web Tools**: HTTP REST API (task submission, status queries)

**Key Features**:
- Task queue and scheduling
- Plugin discovery and loading
- Workflow definition (YAML)
- Build caching and incremental builds
- Asset dependency tracking

**Technology Stack**:
- Java 17+
- Quarkus framework
- gRPC (client to C++ renderer)
- HTTP REST API
- Task scheduling system
- Plugin architecture

---

## Web Frontend (Cryo Build Lab Tools)

**Framework**: Angular 19 (Standalone Components)

**Purpose**: Unified web-based tooling interface

**Architecture**:
- Lazy-loaded routes for optimal performance
- Standalone components (no NgModule)
- Shared services for HTTP communication
- Real-time connection monitoring

**Tool Routing**:

| Tool | Route | Primary Backend | Secondary Backend |
|------|-------|-----------------|-------------------|
| I/O Monitor | `/io-monitor` | Both | - |
| Shader Graph Editor | `/shader-graph-editor` | C++ Renderer | - |
| Material Editor | `/material-editor` | C++ Renderer | - |
| Scene Editor | `/scene-editor` | C++ Renderer | - |
| Build Lab | `/build-lab` | **Java Backend** | C++ Renderer (for asset validation) |
| Showcase | `/showcase` | C++ Renderer | - |

---

## Communication Patterns

### 1. Web Tools ↔ C++ Renderer

**Protocol**: HTTP REST API

**Use Cases**:
- Real-time rendering updates
- Material property changes
- Entity manipulation
- Camera control
- Screenshot capture
- Runtime shader compilation

**Example**:
```typescript
// Angular service
async updateMaterial(id: string, properties: MaterialProperties) {
  const response = await fetch(`http://localhost:52009/api/materials/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(properties)
  });
  return await response.json();
}
```

---

### 2. Web Tools ↔ Java Backend

**Protocol**: HTTP REST API

**Use Cases**:
- Task submission (shader compilation, asset processing)
- Plugin management
- Workflow execution
- Build orchestration
- Project configuration

**Example**:
```typescript
// Angular service
async submitTask(task: BuildTask) {
  const response = await fetch(`http://localhost:8080/api/tasks`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(task)
  });
  return await response.json();
}

// Poll task status
async getTaskStatus(taskId: string) {
  const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`);
  return await response.json();
}
```

---

### 3. Java Backend ↔ C++ Renderer

**Protocol**: gRPC (bidirectional streaming)

**Use Cases**:
- Java backend requests rendering for asset validation
- Java backend queries renderer state
- Java backend submits entities/scenes for visualization
- C++ renderer reports rendering progress to Java

**Example** (Protobuf definition):
```protobuf
service RendererService {
  rpc RenderScene(RenderRequest) returns (RenderResponse);
  rpc ValidateAsset(AssetValidationRequest) returns (AssetValidationResponse);
  rpc StreamRenderingProgress(stream ProgressUpdate) returns (stream ProgressUpdate);
}
```

---

## Data Flow Examples

### Example 1: Shader Graph Compilation (Runtime)

```
1. User creates shader graph in Angular Shader Graph Editor
2. User clicks "Compile"
3. Angular → C++ Renderer: POST /api/shaders/compile { graphJson }
4. C++ Renderer uses shaderc to compile GLSL → SPIR-V
5. C++ Renderer → Angular: { success: true, spirv: [...], uniforms: [...] }
6. Angular displays GLSL source and uniform list
7. User applies shader to material in real-time
```

---

### Example 2: Batch Shader Compilation (Build-Time)

```
1. User opens Build Lab tool in Angular
2. User selects "Compile All Shaders" task
3. Angular → Java Backend: POST /api/tasks { type: "compile_shaders", ... }
4. Java Backend creates task, returns taskId
5. Java Backend executes task:
   a. Finds all .vert/.frag files
   b. Calls glslc for each shader (or uses C++ renderer API)
   c. Validates compiled SPIR-V
6. Java Backend → Angular: Task progress updates via WebSocket/polling
7. Angular displays compilation log and results
```

---

### Example 3: Asset Pipeline with Validation

```
1. User uploads GLTF model via Build Lab tool
2. Angular → Java Backend: POST /api/assets/upload
3. Java Backend:
   a. Saves file to project directory
   b. Creates processing task
   c. Optimizes GLTF (compression, mesh merging)
4. Java Backend → C++ Renderer (gRPC): ValidateAsset(gltf_path)
5. C++ Renderer loads GLTF, validates structure
6. C++ Renderer → Java Backend (gRPC): ValidationResult { valid: true }
7. Java Backend → Angular: Task complete with validation report
```

---

## Build Lab Tool - Java Backend Integration

### Purpose
The **Build Lab** tool is the primary interface for interacting with the Java/Quarkus backend's task and plugin system.

### Features

1. **Task Management**
   - View all available tasks (shader compilation, asset processing, etc.)
   - Submit tasks with parameters
   - Monitor task progress in real-time
   - View task logs and results

2. **Plugin Management**
   - List installed plugins
   - Enable/disable plugins
   - View plugin documentation
   - Configure plugin settings

3. **Workflow Execution**
   - Load YAML workflow definitions
   - Execute multi-step workflows
   - Monitor workflow progress
   - Debug workflow failures

4. **Build Configuration**
   - View CMake configuration
   - Trigger CMake reconfiguration
   - View build system status

### Java Backend API (for Build Lab)

```typescript
// Example API endpoints (implemented in Java backend)

// Tasks
GET    /api/tasks                    // List all tasks
POST   /api/tasks                    // Submit new task
GET    /api/tasks/{id}               // Get task status
DELETE /api/tasks/{id}               // Cancel task
GET    /api/tasks/{id}/logs          // Get task logs

// Plugins
GET    /api/plugins                  // List plugins
POST   /api/plugins/{id}/enable      // Enable plugin
POST   /api/plugins/{id}/disable     // Disable plugin
GET    /api/plugins/{id}/config      // Get plugin config
PUT    /api/plugins/{id}/config      // Update plugin config

// Workflows
GET    /api/workflows                // List workflows
POST   /api/workflows/execute        // Execute workflow
GET    /api/workflows/{id}/status    // Get workflow status

// Build System
GET    /api/build/config             // Get build configuration
POST   /api/build/reconfigure        // Trigger CMake reconfigure
GET    /api/build/status             // Get build system status
```

---

## Technology Stack Summary

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **C++ Renderer** | C++17, Vulkan, shaderc | 52009 | Real-time rendering, runtime shader compilation |
| **Java Backend** | Java 17+, Quarkus, gRPC | 8080 (assumed) | Task orchestration, plugin system, build management |
| **Web Frontend** | Angular 19, TypeScript | 4200 | Unified tooling interface |
| **Build System** | CMake, vcpkg | - | C++ compilation, dependency management |
| **Asset Pipeline** | Node.js, gltf-transform | - | GLTF optimization, texture processing |

---

## Directory Structure

```
arctic-game-client/
├── apps/
│   ├── cryo-build-lab-tools/        # Angular web app (this project)
│   │   ├── src/
│   │   │   └── app/
│   │   │       └── tools/
│   │   │           ├── build-lab/   # Java Backend integration
│   │   │           ├── shader-graph-editor/  # C++ Renderer integration
│   │   │           ├── material-editor/      # C++ Renderer integration
│   │   │           └── scene-editor/         # C++ Renderer integration
│   │   └── tools/
│   │       ├── shader-compiler/     # Shader compilation tools
│   │       └── asset-processing/    # Asset pipeline tools
│   └── java-backend/                # Java/Quarkus backend (assumed)
│       ├── src/
│       │   └── main/
│       │       └── java/
│       │           ├── tasks/       # Task system
│       │           ├── plugins/     # Plugin architecture
│       │           └── workflows/   # Workflow engine
│       └── pom.xml
├── coregfx/                         # Core C++ graphics framework
├── elyrion.coregfx.renderer/        # C++ renderer executable
└── assets/                          # Shared assets
```

---

## Deployment Scenarios

### Development (Local)

```bash
# Terminal 1: Start C++ Renderer
cd build-x64/bin/Debug
elyrion.coregfx.renderer.exe java-entity-scene.elyrion.xml --http-server

# Terminal 2: Start Java Backend (assumed)
cd apps/java-backend
./gradlew quarkusDev  # or mvn quarkus:dev

# Terminal 3: Start Angular Dev Server
cd apps/cryo-build-lab-tools
npm run start

# Open browser: http://localhost:4200
```

---

### Production (Distributed)

```bash
# C++ Renderer (on rendering machine)
elyrion.coregfx.renderer.exe --http-server --port 52009

# Java Backend (on build server)
java -jar java-backend.jar --port 8080

# Angular App (deployed to GitHub Pages or static hosting)
# Access via: https://your-domain.com/cryo-build-lab-tools/
```

---

## Future Enhancements

1. **WebSocket Support**: Real-time updates instead of polling
2. **Authentication**: User authentication for multi-user scenarios
3. **Distributed Rendering**: Multiple C++ renderer instances
4. **Cloud Integration**: Deploy Java backend to cloud for remote builds
5. **Collaborative Editing**: Multiple users editing same scene

---

**Last Updated**: 2025-10-06
**Maintainer**: Arctic Game Client Development Team
