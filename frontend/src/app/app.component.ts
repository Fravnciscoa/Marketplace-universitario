//--app.component.ts--//
import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, ChatWidgetComponent],
})
export class AppComponent implements OnInit {
  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.reconnectSocket();
  }
}
