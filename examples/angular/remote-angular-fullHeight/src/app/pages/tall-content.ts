import { Component } from '@angular/core';

@Component({
  selector: 'app-tall-content',
  template: `
    <div>
      <h2>Tall Content</h2>
      <p>This page has content that exceeds 1000px without internal scroll.</p>
      <p>The iframe should expand to fit all the content.</p>
      @for (item of items; track item) {
        <div style="padding: 16px; margin: 8px 0; background: #f0f0f0; border-radius: 4px;">
          <strong>Block {{ item }}</strong> — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </div>
      }
    </div>
  `,
})
export class TallContent {
  items = Array.from({ length: 25 }, (_, i) => i + 1);
}
