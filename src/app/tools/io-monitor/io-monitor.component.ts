/**
 * Copyright (c) 2025 Patrice Chevillat
 * Licensed under the MIT License. See LICENSE.md for details.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArcticApiService, GrpcMessage } from '../../services/arctic-api.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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
export class IoMonitorComponent implements OnInit, OnDestroy {
  messages: IoMessage[] = [];
  filteredMessages: IoMessage[] = [];
  selectedMessage: IoMessage | null = null;
  isMonitoring = false;
  isConnected = false;
  searchQuery = '';
  apiBaseUrl = '';

  private pollingSubscription?: Subscription;
  private connectionSubscription?: Subscription;

  constructor(private api: ArcticApiService) {}

  ngOnInit() {
    this.apiBaseUrl = this.api.getApiBaseUrl();

    // Subscribe to connection status
    this.connectionSubscription = this.api.isConnected$.subscribe(
      connected => {
        this.isConnected = connected;
        if (!connected && this.isMonitoring) {
          this.stopMonitoring();
        }
      }
    );

    // Test connection
    this.api.ping().subscribe({
      next: () => {
        console.log('✓ Connected to Arctic HTTP API');
        this.loadDemoMessages();
      },
      error: () => {
        console.warn('⚠ Arctic HTTP server not available - using demo data');
        this.loadDemoMessages();
      }
    });
  }

  ngOnDestroy() {
    this.stopMonitoring();
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
  }

  toggleMonitoring() {
    if (this.isMonitoring) {
      this.stopMonitoring();
    } else {
      this.startMonitoring();
    }
  }

  startMonitoring() {
    if (!this.isConnected) {
      alert('Cannot start monitoring: Server not connected');
      return;
    }

    this.isMonitoring = true;
    console.log(`Monitoring started - polling ${this.apiBaseUrl}/api/grpc-messages`);

    // Poll for new messages every 2 seconds
    this.pollingSubscription = interval(2000)
      .pipe(
        switchMap(() => this.api.getGrpcMessages())
      )
      .subscribe({
        next: (response) => {
          if (response.messages && response.messages.length > 0) {
            const newMessages = response.messages.map(msg => this.convertGrpcMessage(msg));
            this.messages = [...newMessages, ...this.messages].slice(0, 1000); // Keep last 1000
            this.applyFilter();
          }
        },
        error: (err) => {
          console.error('Failed to fetch gRPC messages:', err);
          this.stopMonitoring();
        }
      });
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
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

  applyFilter() {
    if (!this.searchQuery) {
      this.filteredMessages = [...this.messages];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredMessages = this.messages.filter(msg =>
      msg.program.toLowerCase().includes(query) ||
      msg.methodCall.toLowerCase().includes(query) ||
      msg.ioData.toLowerCase().includes(query) ||
      msg.source.toLowerCase().includes(query)
    );
  }

  private convertGrpcMessage(msg: GrpcMessage): IoMessage {
    return {
      timestamp: msg.timestamp,
      program: msg.program,
      address: msg.address,
      source: msg.source,
      methodCall: msg.method_call,
      ioData: msg.io_data,
      returnValue: msg.return_value,
      timeMs: msg.time_ms
    };
  }

  loadDemoMessages() {
    // Demo messages for testing UI when server is not available
    this.messages = [
      {
        timestamp: new Date().toISOString(),
        program: 'cryo-studio-server',
        address: 'localhost:52009',
        source: 'HTTP',
        methodCall: 'GET /api/status',
        ioData: '{}',
        returnValue: '{"fps": 60, "uptime": 120}',
        timeMs: 5
      },
      {
        timestamp: new Date().toISOString(),
        program: 'cryo-studio-server',
        address: 'localhost:52009',
        source: 'HTTP',
        methodCall: 'PUT /api/camera',
        ioData: '{"position": {"x": 0, "y": 3, "z": 15}}',
        returnValue: '{"success": true}',
        timeMs: 12
      },
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
