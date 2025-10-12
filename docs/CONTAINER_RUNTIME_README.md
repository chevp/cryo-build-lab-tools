# Container Runtime Tool

**Container Runtime** is an Angular-based tool for loading and running Arctic container files (.pbtxt) in the Arctic renderer.

## Features

- **Quick Start**: Load the default `index.container.pbtxt` startup file
- **Container Browser**: List and select available .pbtxt container files
- **Custom Path Loading**: Enter custom container file paths
- **Scene Management**: View current scene, reload, or clear
- **Status Monitoring**: Real-time loading status and error messages
- **Workflow Visualization**: Step-by-step loading process display

## Usage

### Access the Tool

1. Navigate to **Container Runtime** in the sidebar
2. The tool requires **cryo-studio-server** to be running on `http://localhost:52009`

### Loading Containers

#### Quick Start (Default Container)
1. Click **"Run Startup Container"** to load `index.container.pbtxt`
2. This loads the default startup scene

#### From Container List
1. Browse available container files in the list
2. Click on a container to select it
3. Click the **"Run"** button for that container

#### Custom Path
1. Enter a custom path in the **"Custom Container Path"** field
2. Path is relative to asset root (e.g., `scenes/my_scene.container.pbtxt`)
3. Click **"Run"** to load the container

### Scene Management

- **Current Scene**: View which scene is currently loaded
- **Reload Scene**: Reload the current scene
- **Clear Scene**: Clear the current scene from the renderer

## How It Works

The Container Runtime tool follows this workflow:

### Step 1: Load Container
- Container file (.pbtxt) is loaded via **cryo-asset** system
- File is parsed and validated by cryo-studio-server
- Returns an `assetId` for the loaded container

### Step 2: Parse Scene Data
- Container data is processed by cryo-studio-server
- Scene entities, materials, and assets are validated

### Step 3: Activate Rendering
- Scene is sent to **coregfx-scene-renderer** (pbr_app)
- Renderer activates the scene for display
- Scene becomes visible in the renderer window

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/containers/list` | GET | List available container files |
| `/api/containers/load` | POST | Load container via cryo-asset |
| `/api/scenes/activate` | POST | Activate scene in renderer |
| `/api/scenes/current` | GET | Get current scene info |
| `/api/scenes/reload` | POST | Reload current scene |
| `/api/scenes/clear` | POST | Clear current scene |

## Startup File Support

### index.container.pbtxt

Similar to how `index.arctic` works on renderer startup, you can now use **index.container.pbtxt** as a startup file:

1. Place `index.container.pbtxt` in the asset root directory
2. cryo-studio-server will automatically detect and load it on startup
3. Click **"Run Startup Container"** to reload it at any time

## Workflow Comparison

### Traditional Startup (index.arctic)
```
cryo-studio-server starts
  → Loads index.arctic
  → Sends to data-driven-renderer
  → Scene rendered
```

### Container Runtime (index.container.pbtxt)
```
cryo-studio-server starts
  → Loads index.container.pbtxt via cryo-asset
  → Parses container format
  → Sends to coregfx-scene-renderer
  → Scene rendered
```

## Container File Format

Container files use Protocol Buffer text format (.pbtxt):

```protobuf
# Example: index.container.pbtxt
scene_name: "MyScene"
entities {
  entity_id: "cube_1"
  mesh: "models/cube.gltf"
  transform {
    position { x: 0 y: 1 z: 0 }
    rotation { x: 0 y: 0 z: 0 }
    scale { x: 1 y: 1 z: 1 }
  }
  material: "default_pbr"
}
materials {
  material_id: "default_pbr"
  pbr_params {
    base_color { r: 0.8 g: 0.8 b: 0.8 a: 1.0 }
    metallic: 0.0
    roughness: 0.5
  }
}
```

## Troubleshooting

### Server Not Connected
- Ensure **cryo-studio-server** is running: `./build-x64/bin/Debug/cryo-studio-server.exe --http-server`
- Check that port 52009 is not blocked by firewall
- Click **"Retry Connection"** button

### Container Load Failed
- Verify container file exists at the specified path
- Check container file syntax (valid Protocol Buffer text format)
- View error message in status display

### Scene Not Visible
- Check camera position is not at origin (should be away from 0,0,0)
- Verify entities have valid mesh references
- Check renderer window is active

### Container List Empty
- Place .pbtxt files in the asset directory
- Click **refresh** button (🔄) to reload list
- Check file permissions

## Architecture

```
┌─────────────────────────┐
│  Container Runtime UI   │
│     (Angular Tool)      │
└────────────┬────────────┘
             │ HTTP REST
             ▼
┌─────────────────────────┐
│   cryo-studio-server    │
│    (HTTP Server)        │
└────────────┬────────────┘
             │
             ├─► cryo-asset (load .pbtxt)
             │
             └─► coregfx-scene-renderer
                 (pbr_app - render scene)
```

## Related Documentation

- [Server Monitor](SERVER_MONITOR_README.md) - System status and control
- [Architecture](ARCHITECTURE.md) - Unified server architecture
- **cryo_tooling.proto** - API endpoint definitions
- **arctic_container.proto** - Container format specification

---

**Container Runtime** provides a flexible way to load and manage Arctic container files, complementing the traditional index.arctic startup workflow.
