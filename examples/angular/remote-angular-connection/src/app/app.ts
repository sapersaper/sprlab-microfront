import { Component, signal } from '@angular/core';
import { microfrontConnection } from '../main';

@Component({
  selector: 'app-root',
  template: `
    <h1>Angular Connection Example</h1>
    <p>Shell counter: {{ shellCounter() }}</p>
    <button (click)="sendToShell()">Send to Shell: {{ localCounter() }}</button>
    <br /><br />
    <button (click)="showLorem.set(!showLorem())">
      {{ showLorem() ? 'Hide' : 'Show' }} Lorem Ipsum
    </button>
    @if (showLorem()) {
      <div>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
      </div>
    }
  `,
})
export class App {
  shellCounter = signal(0);
  localCounter = signal(0);
  showLorem = signal(false);

  constructor() {
    microfrontConnection?.onMessage((payload: any) => {
      this.shellCounter.set(payload.counter);
    });
  }

  sendToShell() {
    this.localCounter.update(v => v + 1);
    microfrontConnection?.send({ counter: this.localCounter() });
  }
}
