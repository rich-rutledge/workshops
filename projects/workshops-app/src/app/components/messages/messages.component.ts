import { Component } from '@angular/core';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent {
  public constructor(public readonly messageService: MessageService) {}
}
