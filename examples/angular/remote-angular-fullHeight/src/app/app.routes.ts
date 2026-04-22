import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'small', pathMatch: 'full' },
  { path: 'small', loadComponent: () => import('./pages/small-content').then(m => m.SmallContent) },
  { path: 'scroll', loadComponent: () => import('./pages/scroll-internal').then(m => m.ScrollInternal) },
  { path: 'tall', loadComponent: () => import('./pages/tall-content').then(m => m.TallContent) },
];
