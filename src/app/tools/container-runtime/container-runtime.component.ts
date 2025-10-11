/**
 * Copyright (c) 2025 Patrice Chevillat
 * Licensed under the MIT License. See LICENSE.md for details.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArcticApiService, ContainerFile } from '../../services/arctic-api.service';
import { Subscription } from 'rxjs';

interface LoadStatus {
  isLoading: boolean;
  message: string;
  type: 'info' | 'success' | 'error';
}

@Component({
  selector: 'app-container-runtime',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './container-runtime.component.html',
  styleUrls: ['./container-runtime.component.scss']
})
export class ContainerRuntimeComponent implements OnInit, OnDestroy {
  // Connection state
  isConnected = false;
  private connectionSubscription?: Subscription;

  // Container files
  containerFiles: ContainerFile[] = [];
  selectedContainer: string = '';
  customContainerPath: string = 'index.container.pbtxt';

  // Loading status
  loadStatus: LoadStatus = {
    isLoading: false,
    message: '',
    type: 'info'
  };

  // Runtime info
  currentScene: string = '';
  sceneLoadTime: string = '';

  constructor(public api: ArcticApiService) {}

  ngOnInit() {
    // Subscribe to connection status
    this.connectionSubscription = this.api.isConnected$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        this.loadContainerList();
        this.getCurrentScene();
      }
    });

    // Check connection
    this.api.checkConnection();
  }

  ngOnDestroy() {
    this.connectionSubscription?.unsubscribe();
  }

  /**
   * Load list of available container files from server
   */
  loadContainerList() {
    this.api.getContainers().subscribe({
      next: (response: { containers: ContainerFile[] }) => {
        this.containerFiles = response.containers || [];

        // Auto-select index.container.pbtxt if it exists
        const indexContainer = this.containerFiles.find(c => c.name === 'index.container.pbtxt');
        if (indexContainer) {
          this.selectedContainer = indexContainer.path;
        }
      },
      error: (err: any) => {
        console.error('Failed to load container list:', err);
        this.setStatus('Failed to load container list', 'error');
      }
    });
  }

  /**
   * Get current scene information
   */
  getCurrentScene() {
    this.api.getCurrentScene().subscribe({
      next: (response: { sceneName: string; loadTime: string }) => {
        this.currentScene = response.sceneName || 'None';
        this.sceneLoadTime = response.loadTime || '';
      },
      error: (err: any) => {
        console.error('Failed to get current scene:', err);
      }
    });
  }

  /**
   * Run the selected container
   * Workflow:
   * 1. Load container data via cryo-asset
   * 2. Send to coregfx-scene-renderer for rendering
   */
  runContainer() {
    const containerPath = this.selectedContainer || this.customContainerPath;

    if (!containerPath) {
      this.setStatus('Please select or enter a container file path', 'error');
      return;
    }

    this.setStatus('Loading container: ' + containerPath, 'info');
    this.loadStatus.isLoading = true;

    // Step 1: Load container via cryo-asset
    this.api.loadContainer(containerPath).subscribe({
      next: (loadResponse: { success: boolean; assetId: string; message: string }) => {
        if (loadResponse.success) {
          this.setStatus('Container loaded, activating scene...', 'info');

          // Step 2: Activate scene in renderer
          this.activateScene(loadResponse.assetId);
        } else {
          this.setStatus('Failed to load container: ' + loadResponse.message, 'error');
          this.loadStatus.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error('Container load error:', err);
        this.setStatus('Container load failed: ' + (err.error?.message || err.message), 'error');
        this.loadStatus.isLoading = false;
      }
    });
  }

  /**
   * Activate the loaded scene in coregfx-scene-renderer
   */
  private activateScene(assetId: string) {
    this.api.activateScene(assetId).subscribe({
      next: (response: { success: boolean; message: string }) => {
        if (response.success) {
          this.setStatus('Scene activated successfully!', 'success');
          this.getCurrentScene(); // Refresh current scene info
        } else {
          this.setStatus('Failed to activate scene: ' + response.message, 'error');
        }
        this.loadStatus.isLoading = false;
      },
      error: (err: any) => {
        console.error('Scene activation error:', err);
        this.setStatus('Scene activation failed: ' + (err.error?.message || err.message), 'error');
        this.loadStatus.isLoading = false;
      }
    });
  }

  /**
   * Run the default startup container (index.container.pbtxt)
   */
  runStartupContainer() {
    this.customContainerPath = 'index.container.pbtxt';
    this.selectedContainer = '';
    this.runContainer();
  }

  /**
   * Reload current scene
   */
  reloadScene() {
    this.setStatus('Reloading current scene...', 'info');
    this.loadStatus.isLoading = true;

    this.api.reloadCurrentScene().subscribe({
      next: (response: { success: boolean; message: string }) => {
        if (response.success) {
          this.setStatus('Scene reloaded successfully!', 'success');
          this.getCurrentScene();
        } else {
          this.setStatus('Failed to reload scene: ' + response.message, 'error');
        }
        this.loadStatus.isLoading = false;
      },
      error: (err: any) => {
        console.error('Scene reload error:', err);
        this.setStatus('Scene reload failed: ' + (err.error?.message || err.message), 'error');
        this.loadStatus.isLoading = false;
      }
    });
  }

  /**
   * Clear current scene
   */
  clearScene() {
    this.setStatus('Clearing scene...', 'info');
    this.loadStatus.isLoading = true;

    this.api.clearCurrentScene().subscribe({
      next: (response: { success: boolean; message: string }) => {
        if (response.success) {
          this.setStatus('Scene cleared', 'success');
          this.currentScene = 'None';
          this.sceneLoadTime = '';
        } else {
          this.setStatus('Failed to clear scene: ' + response.message, 'error');
        }
        this.loadStatus.isLoading = false;
      },
      error: (err: any) => {
        console.error('Scene clear error:', err);
        this.setStatus('Scene clear failed: ' + (err.error?.message || err.message), 'error');
        this.loadStatus.isLoading = false;
      }
    });
  }

  /**
   * Refresh container list
   */
  refreshContainerList() {
    this.setStatus('Refreshing container list...', 'info');
    this.loadContainerList();
    setTimeout(() => {
      this.setStatus('Container list refreshed', 'success');
    }, 500);
  }

  /**
   * Set loading status message
   */
  private setStatus(message: string, type: 'info' | 'success' | 'error') {
    this.loadStatus.message = message;
    this.loadStatus.type = type;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
