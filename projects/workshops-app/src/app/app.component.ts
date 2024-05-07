import { RouterLink, RouterOutlet } from '@angular/router';

import { Component } from '@angular/core';
import { MessagesComponent } from './components/messages/messages.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MessagesComponent, RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public readonly title: string = 'Workshops App';
}
