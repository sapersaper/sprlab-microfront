import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <h1>Angular Route Example</h1>
    <nav>
      <a routerLink="/page1">Page 1</a> | <a routerLink="/page2">Page 2</a>
    </nav>
    <router-outlet />
  `,
})
export class App {}
