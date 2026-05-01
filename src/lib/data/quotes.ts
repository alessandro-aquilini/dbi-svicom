// Preventivi 

export type QuoteStatus = 'pending' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface Quote {
	id: string;
	ticketId?: string; // References Ticket.id
	supplierId: string; // References User.id
	propertyId: string;
	title: string;
	amount: number;
	currency: string;
	status: QuoteStatus;
	sentAt: string;
	expiresAt: string;
	description: string;
	attachments?: string[];
}

export const quotes: Quote[] = [
	{
		id: 'prv-tinteggiatura-vano-scale',
		ticketId: '1044',
		supplierId: 'frn-green-habit',
		propertyId: 'cnd-carducci-21',
		title: 'Tinteggiatura vano scale',
		amount: 2500.0,
		currency: 'EUR',
		status: 'pending',
		sentAt: '2024-04-25T10:00:00Z',
		expiresAt: '2024-05-25T10:00:00Z',
		description: 'Tinteggiatura completa scale A e B con vernice lavabile.'
	},
	{
		id: 'prv-revisione-ascensore',
		ticketId: 'TCK-476',
		supplierId: 'frn-secure-entry',
		propertyId: 'cnd-marconi-14',
		title: 'Revisione straordinaria ascensore',
		amount: 450.0,
		currency: 'EUR',
		status: 'sent',
		sentAt: '2024-04-29T10:00:00Z',
		expiresAt: '2024-05-15T10:00:00Z',
		description: 'Intervento urgente per ripristino schede elettroniche.'
	},
	{
		id: 'prv-riparazione-colonna',
		ticketId: 'TCK-482',
		supplierId: 'frn-idroclima-nord',
		propertyId: 'cnd-marconi-14',
		title: 'Riparazione colonna montante',
		amount: 1250.0,
		currency: 'EUR',
		status: 'sent',
		sentAt: '2024-04-29T12:05:00Z',
		expiresAt: '2024-05-09T12:05:00Z',
		description: 'Preventivo per la riparazione urgente della colonna montante e verifica tubazioni di risalita.',
		attachments: ['preventivo-riparazione-colonna.pdf']
	}
];

export function getQuotesByTicketId(ticketId: string): Quote[] {
	return quotes.filter((q) => q.ticketId === ticketId);
}

export function getQuoteById(id: string): Quote | undefined {
	return quotes.find((q) => q.id === id);
}

export function getQuotesBySupplierId(supplierId: string): Quote[] {
	return quotes.filter((q) => q.supplierId === supplierId);
}
