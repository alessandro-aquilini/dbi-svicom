import type { TicketAdminMetadata, TicketEvent } from '$lib/data/ticket/tickets';
import type { Quote } from '$lib/data/embeds/quotes';
import type { Invoice } from '$lib/data/embeds/invoices';
import type { Payment } from '$lib/data/embeds/payments';
import type { supplierTask } from '$lib/data/embeds/supplierTasks';

export type TicketTimelineItem =
	| { type: 'ticket-event'; id: string; at: string; data: TicketEvent }
	| { type: 'admin-metadata'; id: string; at: string; data: TicketAdminMetadata }
	| { type: 'quote'; id: string; at: string; data: Quote }
	| { type: 'invoice'; id: string; at: string; data: Invoice }
	| { type: 'payment'; id: string; at: string; data: Payment }
	| { type: 'intervention'; id: string; at: string; data: supplierTask };
