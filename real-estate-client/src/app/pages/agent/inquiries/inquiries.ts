import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InquiryService } from '../../../services/inquiry';
import { Inquiry } from '../../../models/inquiry';

@Component({
  selector: 'app-agent-inquiries',
  imports: [CommonModule, RouterLink],
  templateUrl: './inquiries.html',
  styleUrl: './inquiries.css'
})
export class AgentInquiries implements OnInit {
  private readonly inquiryService = inject(InquiryService);

  inquiries: Inquiry[] = [];
  loading = true;
  errorMessage = '';
  agentName = localStorage.getItem('fullName') || 'Agent';

  ngOnInit(): void {
    const agentId = Number(localStorage.getItem('userId'));
    if (!agentId) {
      this.errorMessage = 'Your agent session is not available.';
      this.loading = false;
      return;
    }

    this.inquiryService.getForAgent(agentId).subscribe({
      next: response => {
        this.inquiries = Array.isArray(response) ? response : response.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load customer inquiries right now.';
        this.loading = false;
      }
    });
  }

  markRead(inquiry: Inquiry): void {
    if (!inquiry.id || inquiry.isRead) return;

    this.inquiryService.markRead(inquiry.id).subscribe({
      next: () => inquiry.isRead = true,
      error: () => this.errorMessage = 'Unable to update inquiry status.'
    });
  }

  getCustomerPhone(inquiry: Inquiry): string {
    return inquiry.phoneNumber || inquiry.phone || 'Not provided';
  }

  formatPreferredVisitDate(date?: string): string {
    if (!date) {
      return 'Not specified';
    }

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');
  }
}
