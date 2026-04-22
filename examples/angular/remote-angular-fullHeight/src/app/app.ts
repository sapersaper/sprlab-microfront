import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="app-layout">
      <header>
        <h1>Angular FullHeight Example</h1>
        <nav>
          <a routerLink="/small">Small</a> |
          <a routerLink="/scroll">Scroll Internal</a> |
          <a routerLink="/tall">Tall Content</a>
        </nav>
      </header>
      <router-outlet />
    </div>
  `,
  styles: [`
    .app-layout {
      display: grid;
      grid-template-rows: auto 1fr;
      height: 100vh;
    }
    .app-layout router-outlet {
      display: none;
    }
  `],
})
export class App {}
