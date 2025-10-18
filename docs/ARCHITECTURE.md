# Cryo Lab Tools - Architecture

## Server Architecture (Updated 2025-10-11)

### Single Unified Server: cryo-studio-server

**cryo-studio-server** (port 52009) is the **ONLY HTTP server** used by all tooling.

**Key Points:**
- ✅ Single entry point for all HTTP operations (port 52009)
- ✅ Internally delegates to `data-driven-coregfx-renderer.exe` for rendering
- ✅ Integrates with cryo-tooling for builds, shaders, assets
- ❌ `shader-graph-renderer.exe` HTTP server (port 52010) - DEPRECATED
- ❌ Direct HTTP to individual renderers - DEPRECATED

### Cryo Lab Tools Configuration

**API Service**: `arctic-api.service.ts`
```typescript
private apiBaseUrl = 'http://localhost:52009'; // cryo-studio-server ONLY
```

**All tools connect to**: http://localhost:52009 (cryo-studio-server)

### Migration from Old Architecture

**Before (DEPRECATED):**
```typescript
const shaderGraphUrl = 'http://localhost:52010'; // ❌ No longer used
const dataRendererUrl = 'http://localhost:52011'; // ❌ No longer used
```

**After (CURRENT):**
```typescript
const studioServerUrl = 'http://localhost:52009'; // ✅ cryo-studio-server unified API
```

---

**Last Updated**: 2025-10-11  
**Version**: 2.0 (Unified Server Architecture)
