import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MessageService {
  public get messages(): readonly string[] {
    return this._messages;
  }

  // This architecture depends on the _messages array mutating
  private readonly _messages: string[] = [];

  public readonly add = (message: string): void => {
    this._messages.push(message);
  };

  public readonly clear = (): void => {
    this._messages.length = 0;
  };
}
