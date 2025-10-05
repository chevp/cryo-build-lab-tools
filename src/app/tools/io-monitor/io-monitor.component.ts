/**
 * Copyright (c) 2025 Patrice Chevillat
 * Licensed under the MIT License. See LICENSE.md for details.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface IoMessage {
  timestamp: string;
  program: string;
  address: string;
  source: string;
  methodCall: string;
  ioData: string;
  returnValue: string;
  timeMs: number;
}

@Component({
  selector: 'app-io-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './io-monitor.component.html',
  styleUrls: ['./io-monitor.component.scss']
})
export class IoMonitorComponent {
  messages: IoMessage[] = [];
  filteredMessages: IoMessage[] = [];
  selectedMessage: IoMessage | null = null;
  isMonitoring = false;
  searchQuery = '';

  ngOnInit() {
    this.loadDemoMessages();
  }

  toggleMonitoring() {
    this.isMonitoring = !this.isMonitoring;
    if (this.isMonitoring) {
      this.startMonitoring();
    }
  }

  startMonitoring() {
    // TODO: Connect to WebSocket or HTTP polling
    console.log('Monitoring started - connect to http://localhost:52009/api/grpc-messages');
  }

  clearMessages() {
    this.messages = [];
    this.filteredMessages = [];
    this.selectedMessage = null;
  }

  exportMessages() {
    const json = JSON.stringify(this.messages, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `io-monitor-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  selectMessage(msg: IoMessage) {
    this.selectedMessage = msg;
  }

  loadDemoMessages() {
    // Demo messages for testing
    this.messages = [
      {
        timestamp: new Date().toISOString(),
        program: 'elyrion.coregfx.renderer',
        address: 'localhost:52009',
        source: 'gRPC',
        methodCall: 'LoadScene',
        ioData: '{"scenePath": "java-entity-scene.elyrion.xml"}',
        returnValue: 'OK',
        timeMs: 45
      },
      {
        timestamp: new Date().toISOString(),
        program: 'shader-graph-renderer',
        address: 'localhost:52010',
        source: 'gRPC',
        methodCall: 'CompileShaderGraph',
        ioData: '{"graphId": "water_caustics"}',
        returnValue: 'OK',
        timeMs: 128
      }
    ];
    this.filteredMessages = [...this.messages];
  }
}
