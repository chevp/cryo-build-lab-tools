/**
 * Copyright (c) 2025 Patrice Chevillat
 * Licensed under the MIT License. See LICENSE.md for details.
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/server-monitor',
    pathMatch: 'full'
  },
  {
    path: 'server-monitor',
    loadComponent: () => import('./tools/server-monitor/server-monitor.component').then(m => m.ServerMonitorComponent)
  },
  {
    path: 'io-monitor',
    loadComponent: () => import('./tools/io-monitor/io-monitor.component').then(m => m.IoMonitorComponent)
  },
  {
    path: 'scene-editor',
    loadComponent: () => import('./tools/scene-editor/scene-editor.component').then(m => m.SceneEditorComponent)
  },
  {
    path: 'material-editor',
    loadComponent: () => import('./tools/material-editor/material-editor.component').then(m => m.MaterialEditorComponent)
  },
  {
    path: 'showcase',
    loadComponent: () => import('./tools/showcase/showcase.component').then(m => m.ShowcaseComponent)
  },
  {
    path: 'build-lab',
    loadComponent: () => import('./tools/build-lab/build-lab.component').then(m => m.BuildLabComponent)
  },
  {
    path: 'container-runtime',
    loadComponent: () => import('./tools/container-runtime/container-runtime.component').then(m => m.ContainerRuntimeComponent)
  },
  {
    path: 'container-viewer',
    loadComponent: () => import('./tools/container-viewer/container-viewer.component').then(m => m.ContainerViewerComponent)
  },
  {
    path: '**',
    redirectTo: '/server-monitor'
  }
];
