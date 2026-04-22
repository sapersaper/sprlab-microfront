import { bootstrapApplication } from '@angular/platform-browser';
import { initAngularRemote } from '@sprlab/microfront/angular/remote';
import { App } from './app/app';

// Initialize microfront (returns null if not in iframe)
export const microfrontConnection = initAngularRemote({ appName: 'remote-angular-connection' });

bootstrapApplication(App)
  .catch((err) => console.error(err));
