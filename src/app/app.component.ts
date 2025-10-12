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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isRendererConnected = false;
  isEmbedded = false;
  serverUrl = 'http://localhost:52009'; // Default local server

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Check for embedded mode and server URL via query parameters
    this.route.queryParams.subscribe(params => {
      this.isEmbedded = params['embedded'] === 'true';

      // Allow custom server URL via query parameter (for arctic-tool-runner)
      if (params['server']) {
        this.serverUrl = params['server'];
      }
    });

    this.checkRendererConnection();
    setInterval(() => this.checkRendererConnection(), 5000);
  }

  async checkRendererConnection() {
    try {
      const response = await fetch(`${this.serverUrl}/api/status`, {
        method: 'GET'
      });
      this.isRendererConnected = response.ok;
    } catch {
      this.isRendererConnected = false;
    }
  }
}
