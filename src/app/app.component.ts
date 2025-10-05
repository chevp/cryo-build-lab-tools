/**
 * Copyright (c) 2025 Patrice Chevillat
 * Licensed under the MIT License. See LICENSE.md for details.
 */

import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container" [class.embedded]="isEmbedded">
      <nav class="sidebar" *ngIf="!isEmbedded">
        <div class="sidebar-header">
          <h1>🧊 Cryo Build Lab</h1>
          <p class="subtitle">Development Tools</p>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Monitoring</div>
          <a routerLink="/io-monitor" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-label">I/O Monitor</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Editing</div>
          <a routerLink="/scene-editor" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📐</span>
            <span class="nav-label">Scene Editor</span>
          </a>
          <a routerLink="/material-editor" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">✨</span>
            <span class="nav-label">Material Editor</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Showcase</div>
          <a routerLink="/showcase" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🎨</span>
            <span class="nav-label">Arctic Showcase</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Build</div>
          <a routerLink="/build-lab" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🔧</span>
            <span class="nav-label">Build Lab</span>
          </a>
        </div>

        <div class="sidebar-footer">
          <div class="connection-status">
            <span class="status-dot" [class.connected]="isRendererConnected"></span>
            <span class="status-text">{{ isRendererConnected ? 'Renderer Connected' : 'Disconnected' }}</span>
          </div>
        </div>
      </nav>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .app-container.embedded .content {
      width: 100%;
    }

    .sidebar {
      width: 250px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .sidebar-header h1 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .subtitle {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .nav-section {
      margin-top: 16px;
    }

    .nav-section-title {
      padding: 8px 20px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }

    .nav-item:hover {
      background: var(--bg-tertiary);
    }

    .nav-item.active {
      background: var(--accent-blue);
      color: white;
      font-weight: 500;
    }

    .nav-icon {
      font-size: 16px;
      margin-right: 12px;
      width: 20px;
      text-align: center;
    }

    .nav-label {
      font-size: 13px;
    }

    .sidebar-footer {
      margin-top: auto;
      padding: 16px 20px;
      border-top: 1px solid var(--border-color);
    }

    .connection-status {
      display: flex;
      align-items: center;
      font-size: 11px;
      color: var(--text-secondary);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-red);
      margin-right: 8px;
      transition: background 0.3s;
    }

    .status-dot.connected {
      background: var(--accent-green);
      box-shadow: 0 0 8px var(--accent-green);
    }

    .content {
      flex: 1;
      overflow-y: auto;
      background: var(--bg-primary);
    }
  `]
})
export class AppComponent {
  isRendererConnected = false;
  isEmbedded = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Check for embedded mode via query parameter
    this.route.queryParams.subscribe(params => {
      this.isEmbedded = params['embedded'] === 'true';
    });

    this.checkRendererConnection();
    setInterval(() => this.checkRendererConnection(), 5000);
  }

  async checkRendererConnection() {
    try {
      const response = await fetch('http://localhost:52009/api/status', {
        method: 'GET'
      });
      this.isRendererConnected = response.ok;
    } catch {
      this.isRendererConnected = false;
    }
  }
}
