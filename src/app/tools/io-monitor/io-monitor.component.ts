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
  template: `
    <div class="io-monitor">
      <div class="toolbar">
        <h2>📊 Arctic I/O Monitor</h2>
        <div class="toolbar-actions">
          <button (click)="toggleMonitoring()" [class.active]="isMonitoring">
            {{ isMonitoring ? '⏸ Pause' : '▶ Start' }}
          </button>
          <button (click)="clearMessages()">🗑️ Clear</button>
          <button (click)="exportMessages()">💾 Export</button>
          <input
            type="text"
            placeholder="Search messages..."
            [(ngModel)]="searchQuery"
            class="search-input"
          />
        </div>
      </div>

      <div class="content-area">
        <div class="message-table-container">
          <table class="message-table">
            <thead>
              <tr>
                <th>Time Stamp</th>
                <th>Program</th>
                <th>Address</th>
                <th>Source</th>
                <th>Method Call</th>
                <th>I/O Data</th>
                <th>Return Value</th>
                <th>Time(ms)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let msg of filteredMessages"
                  (click)="selectMessage(msg)"
                  [class.selected]="selectedMessage === msg">
                <td>{{ msg.timestamp }}</td>
                <td>{{ msg.program }}</td>
                <td>{{ msg.address }}</td>
                <td>{{ msg.source }}</td>
                <td>{{ msg.methodCall }}</td>
                <td>{{ msg.ioData }}</td>
                <td>{{ msg.returnValue }}</td>
                <td>{{ msg.timeMs }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="detail-panel" *ngIf="selectedMessage">
          <div class="detail-header">
            <h3>Message Details</h3>
            <button (click)="selectedMessage = null">✕</button>
          </div>
          <div class="detail-content">
            <div class="detail-section">
              <h4>Parameters</h4>
              <table>
                <tr>
                  <td><strong>Method:</strong></td>
                  <td>{{ selectedMessage.methodCall }}</td>
                </tr>
                <tr>
                  <td><strong>Source:</strong></td>
                  <td>{{ selectedMessage.source }}</td>
                </tr>
                <tr>
                  <td><strong>Address:</strong></td>
                  <td>{{ selectedMessage.address }}</td>
                </tr>
              </table>
            </div>
            <div class="detail-section">
              <h4>I/O Data</h4>
              <pre>{{ selectedMessage.ioData }}</pre>
            </div>
          </div>
        </div>
      </div>

      <div class="status-bar">
        <span>Messages: {{ messages.length }}</span>
        <span>Filtered: {{ filteredMessages.length }}</span>
        <span class="status-indicator" [class.active]="isMonitoring">
          {{ isMonitoring ? 'Monitoring Active' : 'Monitoring Paused' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .io-monitor {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .toolbar {
      padding: 16px 20px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .toolbar h2 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .toolbar-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .search-input {
      width: 250px;
    }

    button.active {
      background: var(--accent-green);
      border-color: var(--accent-green);
      color: white;
    }

    .content-area {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .message-table-container {
      flex: 1;
      overflow: auto;
    }

    .message-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    .message-table th {
      position: sticky;
      top: 0;
      background: var(--bg-tertiary);
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid var(--border-color);
      font-size: 11px;
      text-transform: uppercase;
    }

    .message-table td {
      padding: 6px 8px;
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    .message-table tr {
      cursor: pointer;
    }

    .message-table tr:hover {
      background: var(--bg-secondary);
    }

    .message-table tr.selected {
      background: var(--accent-blue);
      color: white;
    }

    .detail-panel {
      width: 400px;
      background: var(--bg-secondary);
      border-left: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
    }

    .detail-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-header h3 {
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }

    .detail-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .detail-section {
      margin-bottom: 20px;
    }

    .detail-section h4 {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--accent-blue);
      text-transform: uppercase;
    }

    .detail-section table {
      width: 100%;
      font-size: 12px;
    }

    .detail-section table td {
      padding: 4px 0;
      border: none;
    }

    .detail-section pre {
      background: var(--bg-tertiary);
      padding: 12px;
      border-radius: 4px;
      font-size: 11px;
      overflow-x: auto;
      white-space: pre-wrap;
    }

    .status-bar {
      padding: 8px 20px;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: 20px;
      font-size: 11px;
      color: var(--text-secondary);
    }

    .status-indicator {
      margin-left: auto;
    }

    .status-indicator.active {
      color: var(--accent-green);
      font-weight: 600;
    }
  `]
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
