/**
 * Copyright (c) 2025 Patrice Chevillat
 * Licensed under the MIT License. See LICENSE.md for details.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArcticApiService, ContainerFile } from '../../services/arctic-api.service';
import { Subscription } from 'rxjs';

interface ContainerField {
  name: string;
  value: string;
  type: string;
  level: number;
}

interface ParsedContainer {
  rawContent: string;
  fields: ContainerField[];
  messageType: string;
  fieldCount: number;
}

@Component({
  selector: 'app-container-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './container-viewer.component.html',
  styleUrls: ['./container-viewer.component.scss']
})
export class ContainerViewerComponent implements OnInit, OnDestroy {
  // Connection state
  isConnected = false;
  private connectionSubscription?: Subscription;

  // Container files
  containerFiles: ContainerFile[] = [];
  selectedContainerPath: string = '';
  customPath: string = '';

  // Parsed container data
  parsedContainer: ParsedContainer | null = null;
  isLoading = false;
  errorMessage = '';

  // View options
  showRawContent = false;
  searchQuery = '';
  filteredFields: ContainerField[] = [];

  constructor(public api: ArcticApiService) {}

  ngOnInit() {
    // Subscribe to connection status
    this.connectionSubscription = this.api.isConnected$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        this.loadContainerList();
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
          this.selectedContainerPath = indexContainer.path;
        }
      },
      error: (err: any) => {
        console.error('Failed to load container list:', err);
        this.errorMessage = 'Failed to load container list';
      }
    });
  }

  /**
   * Load and parse the selected container file
   */
  loadContainer() {
    const path = this.selectedContainerPath || this.customPath;

    if (!path) {
      this.errorMessage = 'Please select or enter a container file path';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.parsedContainer = null;

    // Call API to get container content
    this.api.getContainerContent(path).subscribe({
      next: (response: { content: string; path: string }) => {
        this.parseContainer(response.content);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load container:', err);
        this.errorMessage = err.error?.message || 'Failed to load container file';
        this.isLoading = false;
      }
    });
  }

  /**
   * Parse protobuf text format content
   */
  private parseContainer(content: string) {
    const fields: ContainerField[] = [];
    const lines = content.split('\n');
    let messageType = 'CryoContainer';
    let fieldCount = 0;

    // Stack to track nesting level
    const levelStack: number[] = [0];
    let currentLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line || line.startsWith('#') || line.startsWith('//')) {
        continue; // Skip empty lines and comments
      }

      // Detect message type (first non-comment line often contains message type)
      if (i === 0 && line.includes(':')) {
        const parts = line.split(':');
        if (parts.length === 2) {
          messageType = parts[0].trim();
        }
      }

      // Parse field: "field_name: value" or "field_name {"
      const colonIndex = line.indexOf(':');
      const braceIndex = line.indexOf('{');

      if (braceIndex !== -1 && (colonIndex === -1 || braceIndex < colonIndex)) {
        // Nested message start
        const fieldName = line.substring(0, braceIndex).trim();
        fields.push({
          name: fieldName,
          value: '{',
          type: 'message',
          level: currentLevel
        });
        currentLevel++;
        levelStack.push(currentLevel);
        fieldCount++;
      } else if (line === '}') {
        // Nested message end
        levelStack.pop();
        currentLevel = levelStack[levelStack.length - 1] || 0;
        fields.push({
          name: '',
          value: '}',
          type: 'end',
          level: currentLevel
        });
      } else if (colonIndex !== -1) {
        // Regular field
        const fieldName = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Detect field type
        let type = 'string';
        if (value.match(/^-?\d+$/)) {
          type = 'int';
        } else if (value.match(/^-?\d+\.\d+$/)) {
          type = 'float';
        } else if (value === 'true' || value === 'false') {
          type = 'bool';
        } else if (value.startsWith('"') && value.endsWith('"')) {
          type = 'string';
          value = value.substring(1, value.length - 1); // Remove quotes
        }

        fields.push({
          name: fieldName,
          value: value,
          type: type,
          level: currentLevel
        });
        fieldCount++;
      }
    }

    this.parsedContainer = {
      rawContent: content,
      fields: fields,
      messageType: messageType,
      fieldCount: fieldCount
    };

    this.filteredFields = [...fields];
  }

  /**
   * Apply search filter to fields
   */
  applyFilter() {
    if (!this.parsedContainer) {
      return;
    }

    if (!this.searchQuery) {
      this.filteredFields = [...this.parsedContainer.fields];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredFields = this.parsedContainer.fields.filter(field =>
      field.name.toLowerCase().includes(query) ||
      field.value.toLowerCase().includes(query) ||
      field.type.toLowerCase().includes(query)
    );
  }

  /**
   * Refresh container list
   */
  refreshContainerList() {
    this.loadContainerList();
  }

  /**
   * Export parsed container as JSON
   */
  exportAsJson() {
    if (!this.parsedContainer) {
      return;
    }

    const json = JSON.stringify(this.parsedContainer, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = this.selectedContainerPath || this.customPath || 'container';
    a.download = `${filename.replace(/\.[^/.]+$/, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Copy raw content to clipboard
   */
  copyToClipboard() {
    if (!this.parsedContainer) {
      return;
    }

    navigator.clipboard.writeText(this.parsedContainer.rawContent).then(() => {
      alert('Container content copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    });
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * Get indentation for nested fields
   */
  getIndentation(level: number): string {
    return '  '.repeat(level);
  }

  /**
   * Get CSS class for field type
   */
  getFieldTypeClass(type: string): string {
    return `field-type-${type}`;
  }
}
