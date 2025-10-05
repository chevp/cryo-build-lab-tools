/**
 * Copyright (c) 2025 Patrice Chevillat
 * Licensed under the MIT License. See LICENSE.md for details.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-build-lab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tool-container">
      <div class="tool-header">
        <h2>🔧 Build Lab</h2>
        <p class="subtitle">Build system and compiler tools</p>
      </div>
      <div class="tool-content">
        <div class="placeholder">
          <h3>Build Lab</h3>
          <p>Build tools and compiler interface coming soon...</p>
          <ul>
            <li>CMake build configuration</li>
            <li>Shader compilation</li>
            <li>Asset pipeline</li>
            <li>Build log viewer</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tool-container {
      padding: 20px;
    }

    .tool-header h2 {
      font-size: 20px;
      margin-bottom: 8px;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 13px;
    }

    .tool-content {
      margin-top: 20px;
    }

    .placeholder {
      text-align: center;
      padding: 60px 20px;
      background: var(--bg-secondary);
      border-radius: 8px;
      border: 2px dashed var(--border-color);
    }

    .placeholder h3 {
      font-size: 18px;
      margin-bottom: 12px;
      color: var(--accent-blue);
    }

    .placeholder p {
      color: var(--text-secondary);
      margin-bottom: 20px;
    }

    .placeholder ul {
      list-style: none;
      padding: 0;
    }

    .placeholder li {
      padding: 8px 0;
      color: var(--text-secondary);
    }
  `]
})
export class BuildLabComponent {}
