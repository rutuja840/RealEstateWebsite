import { Injectable, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatMessage, ChatMessagePayload } from '../models/chat';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly auth = inject(AuthService);
  private connection: HubConnection | null = null;
  private readonly messagesSubject = new Subject<ChatMessage>();
  readonly messages$ = this.messagesSubject.asObservable();

  async connect(conversationId: string): Promise<void> {
    if (!conversationId.trim()) {
      throw new Error('A conversation id is required.');
    }

    if (this.connection?.state === 'Connected') {
      void this.connection.send('JoinConversation', conversationId).catch(error => {
        console.warn('Unable to join chat conversation:', error);
      });
      return;
    }

    if (this.connection?.state === 'Connecting' || this.connection?.state === 'Reconnecting') {
      return;
    }

    const token = this.auth.getToken();
    if (!token) {
      throw new Error('You must be logged in to use chat.');
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(environment.chatHubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('ReceiveMessage', (payload: ChatMessagePayload) => {
      const message = this.normalizeMessage(payload, conversationId);
      if (message.content) {
        this.messagesSubject.next(message);
      }
    });

    const connection = this.connection;

    try {
      await Promise.race([
        connection.start(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Chat connection timed out.')), 10000);
        })
      ]);
      void connection.send('JoinConversation', conversationId).catch(error => {
        console.warn('Unable to join chat conversation:', error);
      });
    } catch (error) {
      await connection.stop();
      this.connection = null;
      throw error;
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<void> {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    if (this.connection?.state !== 'Connected') {
      throw new Error('Chat is not connected.');
    }

    await this.connection.send('SendMessage', conversationId, trimmedContent);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  private normalizeMessage(payload: ChatMessagePayload, fallbackConversationId: string): ChatMessage {
    const senderId = payload.senderId === undefined ? undefined : Number(payload.senderId);
    const currentUserId = Number(localStorage.getItem('userId'));

    return {
      id: payload.id ?? payload.messageId,
      conversationId: String(payload.conversationId ?? fallbackConversationId),
      senderId,
      senderName: payload.senderName,
      content: payload.content ?? payload.message ?? '',
      sentAt: payload.sentAt ?? payload.createdAt ?? new Date().toISOString(),
      isMine: senderId !== undefined && senderId === currentUserId
    };
  }
}
