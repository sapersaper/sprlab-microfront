import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { initAngularRemote } from '@sprlab/microfront/angular/remote';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const router = inject(Router);
        return () => {
          initAngularRemote({
            appName: 'remote-angular-route',
            router,
          });
        };
      },
    },
  ],
};
