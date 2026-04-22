import { Component } from '@angular/core';

@Component({
  selector: 'app-scroll-internal',
  template: `
    <div class="wrapper">
      <div>
        <h2>Scroll Internal</h2>
        <p>This page fills the available height and scrolls internally.</p>
      </div>
      @for (item of items; track item) {
        <p>Scrollable item {{ item }} — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
    }
    .wrapper {
      height: 100%;
      overflow: auto;
    }
  `],
})
export class ScrollInternal {
  items = Array.from({ length: 30 }, (_, i) => i + 1);
}
