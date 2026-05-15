/**
 * Copyright (c) 2025 Patrice Chevillat
 * Licensed under the MIT License. See LICENSE.md for details.
 *
 * Server Monitor Component
 *
 * Real-time monitoring and control interface for cryo-studio-server
 * Provides direct C++ HTTP API access for:
 * - System status monitoring (FPS, uptime, Vulkan state)
 * - Camera control (position, rotation)
 * - Screenshot capture
 * - Vulkan state dumping
 * - API endpoint testing
 *
 * Integrates with cryo_tooling.proto HTTP REST API
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArcticApiService, SystemStatus, CameraUpdate, VulkanState } from '../../services/arctic-api.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-server-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './server-monitor.component.html',
  styleUrls: ['./server-monitor.component.scss']
})
export class ServerMonitorComponent implements OnInit, OnDestroy {
  // Connection state
  isConnected = false;
  apiBaseUrl = '';

  // System status
  systemStatus: SystemStatus | null = null;
  lastUpdateTime = '';

  // Camera controls
  cameraPosition = { x: 0, y: 3, z: 15 };
  cameraRotation = { x: 0, y: 0, z: 0 };
  cameraMessage = '';
  cameraMessageType: 'success' | 'error' | '' = '';

  // Screenshot
  screenshotFilename = 'dashboard_capture.png';
  screenshotMessage = '';
  screenshotMessageType: 'success' | 'error' | '' = '';

  // Vulkan state
  vulkanStateDump = '';
  vulkanStateMessage = '';
  vulkanStateMessageType: 'success' | 'error' | '' = '';

  // Auto-refresh
  autoRefreshEnabled = true;
  refreshInterval = 5000; // 5 seconds

  private statusSubscription?: Subscription;
  private connectionSubscription?: Subscription;

  constructor(private api: ArcticApiService) {}

  ngOnInit() {
    this.apiBaseUrl = this.api.getApiBaseUrl();

    // Subscribe to connection status
    this.connectionSubscription = this.api.isConnected$.subscribe(
      connected => {
        this.isConnected = connected;
        if (connected && this.autoRefreshEnabled) {
          this.startAutoRefresh();
        } else if (!connected) {
          this.stopAutoRefresh();
        }
      }
    );

    // Check connection and initial status
    this.api.checkConnection();
    this.refreshStatus();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
  }

  // ============================================================================
  // Status Monitoring
  // ============================================================================

  refreshStatus() {
    this.api.getStatus().subscribe({
      next: (status) => {
        this.systemStatus = status;
        this.lastUpdateTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      },
      error: (err) => {
        console.error('Failed to fetch status:', err);
        this.systemStatus = null;
      }
    });
  }

  startAutoRefresh() {
    if (this.statusSubscription) {
      return; // Already running
    }

    this.statusSubscription = interval(this.refreshInterval)
      .pipe(
        switchMap(() => this.api.getStatus())
      )
      .subscribe({
        next: (status) => {
          this.systemStatus = status;
          this.lastUpdateTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        },
        error: (err) => {
          console.error('Auto-refresh failed:', err);
          this.stopAutoRefresh();
        }
      });
  }

  stopAutoRefresh() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
      this.statusSubscription = undefined;
    }
  }

  toggleAutoRefresh() {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;

    if (this.autoRefreshEnabled && this.isConnected) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  // ============================================================================
  // Camera Control
  // ============================================================================

  updateCamera() {
    const update: CameraUpdate = {
      position: { ...this.cameraPosition },
      rotation: { ...this.cameraRotation }
    };

    this.api.updateCamera(update).subscribe({
      next: (response) => {
        if (response.success) {
          this.cameraMessage = 'Camera updated successfully!';
          this.cameraMessageType = 'success';
          setTimeout(() => {
            this.cameraMessage = '';
            this.cameraMessageType = '';
          }, 3000);
        } else {
          this.cameraMessage = 'Failed to update camera';
          this.cameraMessageType = 'error';
        }
      },
      error: (err) => {
        this.cameraMessage = `Error: ${err.message}`;
        this.cameraMessageType = 'error';
      }
    });
  }

  resetCamera() {
    this.cameraPosition = { x: 0, y: 3, z: 15 };
    this.cameraRotation = { x: 0, y: 0, z: 0 };
    this.updateCamera();
  }

  // ============================================================================
  // Screenshot
  // ============================================================================

  takeScreenshot() {
    this.api.takeScreenshot(this.screenshotFilename).subscribe({
      next: (response) => {
        if (response.success) {
          this.screenshotMessage = `Screenshot saved: ${response.filename}`;
          this.screenshotMessageType = 'success';
          setTimeout(() => {
            this.screenshotMessage = '';
            this.screenshotMessageType = '';
          }, 5000);
        } else {
          this.screenshotMessage = 'Failed to take screenshot';
          this.screenshotMessageType = 'error';
        }
      },
      error: (err) => {
        this.screenshotMessage = `Error: ${err.message}`;
        this.screenshotMessageType = 'error';
      }
    });
  }

  // ============================================================================
  // Vulkan State
  // ============================================================================

  dumpVulkanState() {
    this.api.getVulkanState().subscribe({
      next: (state) => {
        if (state.state_dump) {
          this.vulkanStateDump = state.state_dump;
          this.vulkanStateMessage = 'Vulkan state dumped successfully';
          this.vulkanStateMessageType = 'success';
        } else {
          this.vulkanStateMessage = 'No state dump available';
          this.vulkanStateMessageType = 'error';
        }
      },
      error: (err) => {
        this.vulkanStateMessage = `Error: ${err.message}`;
        this.vulkanStateMessageType = 'error';
      }
    });
  }

  clearVulkanState() {
    this.vulkanStateDump = '';
    this.vulkanStateMessage = '';
    this.vulkanStateMessageType = '';
  }

  // ============================================================================
  // API Testing
  // ============================================================================

  async testEndpoint(endpoint: string) {
    try {
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`);
      const data = await response.json();
      alert(`Endpoint: ${endpoint}\n\nResponse:\n${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      alert(`Endpoint: ${endpoint}\n\nError: ${error.message}`);
    }
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  pingServer() {
    this.api.ping().subscribe({
      next: () => {
        alert('Server is online!\n\nConnection successful.');
      },
      error: (err) => {
        alert(`Server is offline!\n\nError: ${err.message || 'Connection failed'}`);
      }
    });
  }
}