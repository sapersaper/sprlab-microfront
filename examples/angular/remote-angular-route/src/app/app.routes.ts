import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'page1', pathMatch: 'full' },
  { path: 'page1', loadComponent: () => import('./pages/page1').then(m => m.Page1) },
  { path: 'page2', loadComponent: () => import('./pages/page2').then(m => m.Page2) },
];
