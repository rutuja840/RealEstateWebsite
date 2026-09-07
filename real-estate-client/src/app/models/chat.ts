export interface ChatMessage {
  id?: number;
  conversationId?: string;
  senderId?: number;
  senderName?: string;
  content: string;
  sentAt: string;
  isMine?: boolean;
}

export interface ChatMessagePayload {
  id?: number;
  messageId?: number;
  conversationId?: string | number;
  senderId?: number | string;
  senderName?: string;
  content?: string;
  message?: string;
  sentAt?: string;
  createdAt?: string;
}
