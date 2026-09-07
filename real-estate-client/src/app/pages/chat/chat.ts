import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { ChatMessage } from '../../models/chat';
import { Property } from '../../models/property';
import { ChatService } from '../../services/chat';
import { PropertyService } from '../../services/property';

@Component({
  selector: 'app-chat',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly chatService = inject(ChatService);
  private readonly propertyService = inject(PropertyService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private messagesSubscription?: Subscription;
  private replyTimers = new Set<ReturnType<typeof setTimeout>>();
  private propertyLoad?: Promise<void>;

  readonly messages: ChatMessage[] = [];
  conversationId = '';
  draft = '';
  connecting = true;
  sending = false;
  errorMessage = '';
  property?: Property;

  ngOnInit(): void {
    this.conversationId = this.route.snapshot.paramMap.get('conversationId') ?? '';
    if (!this.conversationId) {
      this.connecting = false;
      this.errorMessage = 'This chat conversation is not available.';
      return;
    }

    const propertyId = Number(this.conversationId);
    if (Number.isInteger(propertyId) && propertyId > 0) {
      this.propertyLoad = firstValueFrom(this.propertyService.getPropertyById(propertyId))
        .then(property => {
          this.property = property;
          this.changeDetector.detectChanges();
        })
        .catch(() => {
          this.property = undefined;
        });
    }

    this.messagesSubscription = this.chatService.messages$.subscribe(message => {
      if (!message.conversationId || message.conversationId === this.conversationId) {
        this.messages.push(message);
      }
    });

    this.connectToChat();
  }

  retryConnection(): void {
    this.errorMessage = '';
    this.connecting = true;
    this.connectToChat();
  }

  private connectToChat(): void {
    this.chatService.connect(this.conversationId)
      .catch(() => {
        this.errorMessage = 'Unable to connect to chat. Please try again.';
      })
      .finally(() => {
        this.connecting = false;
        this.changeDetector.detectChanges();
      });
  }

  async send(): Promise<void> {
    const content = this.draft.trim();
    if (!content || this.sending) {
      return;
    }

    this.sending = true;
    this.errorMessage = '';
    try {
      await this.chatService.sendMessage(this.conversationId, content);
      this.messages.push({
        id: Date.now(),
        conversationId: this.conversationId,
        senderId: Number(localStorage.getItem('userId')) || undefined,
        senderName: localStorage.getItem('fullName') ?? undefined,
        content,
        sentAt: new Date().toISOString(),
        isMine: true
      });
      this.draft = '';

      const replyTimer = setTimeout(() => {
        void Promise.resolve(this.propertyLoad).finally(() => {
          this.messages.push({
            id: Date.now(),
            conversationId: this.conversationId,
            senderName: 'Agent',
            content: this.getAutomaticReply(content),
            sentAt: new Date().toISOString(),
            isMine: false
          });
          this.replyTimers.delete(replyTimer);
          this.changeDetector.detectChanges();
        });
      }, 700);
      this.replyTimers.add(replyTimer);
    } catch {
      this.errorMessage = 'Message could not be sent. Please try again.';
    } finally {
      this.sending = false;
    }
  }

  private getAutomaticReply(question: string): string {
    const normalizedQuestion = question.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
    const property = this.property;

    if (/price|cost|rate|budget|expensive|cheap|crore|lakh/.test(normalizedQuestion)) {
      return property
        ? `${property.title} is listed at ${this.formatPrice(property.price)}.`
        : 'Property prices depend on the property and location. Please share the property you are interested in.';
    }

    if (/visit|view|tour|see|schedule|appointment/.test(normalizedQuestion)) {
      return 'Yes, we can arrange a property visit. Please share your preferred date and time.';
    }

    if (/location|where|address|city|situated/.test(normalizedQuestion)) {
      const location = [property?.address, property?.city, property?.location].filter(Boolean).join(', ');
      return location
        ? `${property?.title ?? 'This property'} is located at ${location}.`
        : 'Please tell me which property you mean, and I will share its location and address details.';
    }

    if (/available|availability|vacant|listed|booked|sold/.test(normalizedQuestion)) {
      return property
        ? `${property.title} is currently ${property.isActive === false ? 'not available' : 'available'}.`
        : 'I can help check availability. Please share the property title or property number.';
    }

    if (/bedroom|bathroom|area|size|sq ?ft|square feet|room/.test(normalizedQuestion)) {
      return property
        ? `${property.title} has ${property.bedrooms} bedroom(s), ${property.bathrooms} bathroom(s), and an area of ${property.area} ${property.areaUnit ?? 'sq.ft'}.`
        : 'Please share the property title or number, and I will provide its bedrooms, bathrooms, and area details.';
    }

    if (/amenit|parking|pool|gym|furnished|balcony|security/.test(normalizedQuestion)) {
      if (property) {
        const amenities = property.amenities?.join(', ') || 'No amenities listed';
        const furnishing = property.furnishedStatus || (property.isFurnished ? 'Furnished' : 'Not specified');
        return `${property.title} is ${furnishing}. Amenities: ${amenities}.`;
      }
      return 'Please share the property you are asking about, and I will provide its amenities and furnishing details.';
    }

    if (/contact|agent|owner|call|phone|email|talk/.test(normalizedQuestion)) {
      return 'Our agent can help you with this. Please share your preferred contact time, and the agent will get back to you.';
    }

    if (/hello|hi|hey|good morning|good afternoon|good evening/.test(normalizedQuestion)) {
      return 'Hello! I can help with property prices, availability, locations, amenities, and visits. What would you like to know?';
    }

    return 'I can help with property prices, availability, locations, amenities, and visits. Could you please clarify your question?';
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  }

  ngOnDestroy(): void {
    this.messagesSubscription?.unsubscribe();
    for (const replyTimer of this.replyTimers) {
      clearTimeout(replyTimer);
    }
    this.replyTimers.clear();
    void this.chatService.disconnect();
  }
}
