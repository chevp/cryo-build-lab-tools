import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/io-monitor',
    pathMatch: 'full'
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
    path: '**',
    redirectTo: '/io-monitor'
  }
];
