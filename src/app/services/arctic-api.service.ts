/**
 * Copyright (c) 2025 Patrice Chevillat
 * Licensed under the MIT License. See LICENSE.md for details.
 *
 * Arctic HTTP API Service
 *
 * Provides HTTP client interface to **cryo-studio-server** REST API (port 52009)
 *
 * ARCHITECTURE:
 * - cryo-studio-server is the ONLY HTTP server (replaces individual renderer servers)
 * - cryo-studio-server internally delegates to:
 *   - data-driven-coregfx-renderer.exe (for rendering operations)
 *   - shader-graph-renderer.exe (DEPRECATED - no longer needed)
 *   - cryo-tooling endpoints (for build operations, shader compilation, etc.)
 *
 * All HTTP API endpoints are defined in: cryo-tooling/proto/cryo_tooling.proto
 *
 * Default server: http://localhost:52009 (cryo-studio-server)
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// API Response Types
export interface SystemStatus {
  version: string;
  uptime_seconds: number;
  vulkan_version: string;
  fps: number;
  frame_time_ms: number;
  draw_calls: number;
  memory_usage_mb?: number;
}

export interface CameraUpdate {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export interface CameraResponse {
  success: boolean;
  message?: string;
}

export interface ScreenshotResponse {
  success: boolean;
  filename: string;
  path?: string;
}

export interface VulkanState {
  state_dump: string;
  pipeline_count?: number;
  buffer_count?: number;
  image_count?: number;
}

export interface SceneInfo {
  scene_id: string;
  name: string;
  entity_count: number;
  loaded: boolean;
}

export interface Material {
  material_id: string;
  name: string;
  pbr_params: {
    base_color: { r: number; g: number; b: number; a: number };
    metallic: number;
    roughness: number;
    ao: number;
  };
}

export interface ShaderCompileRequest {
  glsl_code: string;
  shader_type: 'vertex' | 'fragment' | 'compute';
  entry_point?: string;
}

export interface ShaderCompileResponse {
  success: boolean;
  spirv_bytecode?: string;
  error_message?: string;
}

export interface GrpcMessage {
  timestamp: string;
  program: string;
  address: string;
  source: string;
  method_call: string;
  io_data: string;
  return_value: string;
  time_ms: number;
}

@Injectable({
  providedIn: 'root'
})
export class ArcticApiService {
  private apiBaseUrl = 'http://localhost:52009';
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Connection check happens lazily when components call checkConnection()
  }

  // Configuration
  setApiBaseUrl(url: string) {
    this.apiBaseUrl = url;
    this.checkConnection();
  }

  getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }

  // Connection check - call this manually from components
  checkConnection() {
    this.ping().subscribe({
      next: () => this.isConnectedSubject.next(true),
      error: () => this.isConnectedSubject.next(false)
    });
  }

  // ============================================================================
  // System Service Endpoints
  // ============================================================================

  /**
   * Ping the server (health check)
   * GET /api/ping
   */
  ping(): Observable<{ status: string; timestamp: string }> {
    return this.http.get<any>(`${this.apiBaseUrl}/api/ping`).pipe(
      tap(() => this.isConnectedSubject.next(true)),
      catchError(err => {
        this.isConnectedSubject.next(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Get system status (FPS, uptime, Vulkan info)
   * GET /api/status
   */
  getStatus(): Observable<SystemStatus> {
    return this.http.get<SystemStatus>(`${this.apiBaseUrl}/api/status`);
  }

  /**
   * Get Vulkan state dump
   * GET /api/vulkan-state
   */
  getVulkanState(): Observable<VulkanState> {
    return this.http.get<VulkanState>(`${this.apiBaseUrl}/api/vulkan-state`);
  }

  /**
   * Update camera position and rotation
   * PUT /api/camera
   */
  updateCamera(update: CameraUpdate): Observable<CameraResponse> {
    return this.http.put<CameraResponse>(`${this.apiBaseUrl}/api/camera`, update);
  }

  /**
   * Take screenshot
   * GET /api/screenshot?filename=...
   */
  takeScreenshot(filename: string): Observable<ScreenshotResponse> {
    return this.http.get<ScreenshotResponse>(
      `${this.apiBaseUrl}/api/screenshot?filename=${encodeURIComponent(filename)}`
    );
  }

  /**
   * Trigger render frame
   * POST /api/render
   */
  render(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiBaseUrl}/api/render`, {});
  }

  /**
   * Get gRPC message logs (for IO Monitor)
   * GET /api/grpc-messages
   */
  getGrpcMessages(): Observable<{ messages: GrpcMessage[] }> {
    return this.http.get<{ messages: GrpcMessage[] }>(`${this.apiBaseUrl}/api/grpc-messages`);
  }

  // ============================================================================
  // Scene Service Endpoints
  // ============================================================================

  /**
   * List all scenes
   * GET /api/scenes
   */
  getScenes(): Observable<{ scenes: SceneInfo[] }> {
    return this.http.get<{ scenes: SceneInfo[] }>(`${this.apiBaseUrl}/api/scenes`);
  }

  /**
   * Get scene details
   * GET /api/scenes/{scene_id}
   */
  getScene(sceneId: string): Observable<SceneInfo> {
    return this.http.get<SceneInfo>(`${this.apiBaseUrl}/api/scenes/${sceneId}`);
  }

  /**
   * Create new scene
   * POST /api/scenes
   */
  createScene(scene: Partial<SceneInfo>): Observable<SceneInfo> {
    return this.http.post<SceneInfo>(`${this.apiBaseUrl}/api/scenes`, scene);
  }

  /**
   * Update scene
   * PUT /api/scenes/{scene_id}
   */
  updateScene(sceneId: string, scene: Partial<SceneInfo>): Observable<SceneInfo> {
    return this.http.put<SceneInfo>(`${this.apiBaseUrl}/api/scenes/${sceneId}`, scene);
  }

  /**
   * Delete scene
   * DELETE /api/scenes/{scene_id}
   */
  deleteScene(sceneId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiBaseUrl}/api/scenes/${sceneId}`);
  }

  // ============================================================================
  // Material Service Endpoints
  // ============================================================================

  /**
   * List all materials
   * GET /api/materials
   */
  getMaterials(): Observable<{ materials: Material[] }> {
    return this.http.get<{ materials: Material[] }>(`${this.apiBaseUrl}/api/materials`);
  }

  /**
   * Get material details
   * GET /api/materials/{material_id}
   */
  getMaterial(materialId: string): Observable<Material> {
    return this.http.get<Material>(`${this.apiBaseUrl}/api/materials/${materialId}`);
  }

  /**
   * Create new material
   * POST /api/materials
   */
  createMaterial(material: Partial<Material>): Observable<Material> {
    return this.http.post<Material>(`${this.apiBaseUrl}/api/materials`, material);
  }

  /**
   * Update material
   * PUT /api/materials/{material_id}
   */
  updateMaterial(materialId: string, material: Partial<Material>): Observable<Material> {
    return this.http.put<Material>(`${this.apiBaseUrl}/api/materials/${materialId}`, material);
  }

  // ============================================================================
  // Shader Compiler Service Endpoints
  // ============================================================================

  /**
   * Compile GLSL to SPIR-V
   * POST /api/shaders/compile
   */
  compileShader(request: ShaderCompileRequest): Observable<ShaderCompileResponse> {
    return this.http.post<ShaderCompileResponse>(`${this.apiBaseUrl}/api/shaders/compile`, request);
  }

  /**
   * Reflect shader (extract uniforms)
   * POST /api/shaders/reflect
   */
  reflectShader(spirvBytecode: string): Observable<{ uniforms: any[] }> {
    return this.http.post<{ uniforms: any[] }>(`${this.apiBaseUrl}/api/shaders/reflect`, {
      spirv_bytecode: spirvBytecode
    });
  }

  // ============================================================================
  // Build Lab Service Endpoints
  // ============================================================================

  /**
   * Get build status
   * GET /api/build/status
   */
  getBuildStatus(): Observable<{ status: string; last_build_time?: string }> {
    return this.http.get<any>(`${this.apiBaseUrl}/api/build/status`);
  }

  /**
   * Compile shaders
   * POST /api/build/compile-shaders
   */
  compileShaders(): Observable<{ success: boolean; compiled_count: number }> {
    return this.http.post<any>(`${this.apiBaseUrl}/api/build/compile-shaders`, {});
  }

  /**
   * Get build logs
   * GET /api/build/logs
   */
  getBuildLogs(): Observable<{ logs: string[] }> {
    return this.http.get<{ logs: string[] }>(`${this.apiBaseUrl}/api/build/logs`);
  }

  // ============================================================================
  // Container Runtime Service Endpoints
  // ============================================================================

  /**
   * List available container files
   * GET /api/containers/list
   */
  getContainers(): Observable<{ containers: ContainerFile[] }> {
    return this.http.get<{ containers: ContainerFile[] }>(`${this.apiBaseUrl}/api/containers/list`);
  }

  /**
   * Load container via cryo-asset
   * POST /api/containers/load
   */
  loadContainer(containerPath: string): Observable<{ success: boolean; assetId: string; message: string }> {
    return this.http.post<{ success: boolean; assetId: string; message: string }>(
      `${this.apiBaseUrl}/api/containers/load`,
      { containerPath }
    );
  }

  /**
   * Activate scene in renderer
   * POST /api/scenes/activate
   */
  activateScene(assetId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiBaseUrl}/api/scenes/activate`,
      { assetId }
    );
  }

  /**
   * Get current scene info
   * GET /api/scenes/current
   */
  getCurrentScene(): Observable<{ sceneName: string; loadTime: string }> {
    return this.http.get<{ sceneName: string; loadTime: string }>(`${this.apiBaseUrl}/api/scenes/current`);
  }

  /**
   * Reload current scene
   * POST /api/scenes/reload
   */
  reloadCurrentScene(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiBaseUrl}/api/scenes/reload`, {});
  }

  /**
   * Clear current scene
   * POST /api/scenes/clear
   */
  clearCurrentScene(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiBaseUrl}/api/scenes/clear`, {});
  }
}

// Container file interface
export interface ContainerFile {
  name: string;
  path: string;
  size: number;
  lastModified: string;
}
