// Preventivi 

export interface Quote {
	id: string;
	ticketId?: string;
	bookingId?: string; 
	supplierId: string; // References User.id
	customerId: string; // References Admin or Resident User.id
	propertyId: string;
	title: string;
	amount: number;
	currency: string;
	/** Timestamp when the quote was created/sent */
	createdAt: string;
	expiresAt: string;
	description: string;
	attachments?: string[];
}

export const quotes: Quote[] = [
	{
		id: 'quo-001',
		ticketId: 'tkt-001',
		supplierId: 'frn-idroclima-nord',
		customerId: 'adm-giorgio-01',
		propertyId: 'cnd-marconi-14',
		title: 'Riparazione urgente collettore e valvole',
		amount: 450.00,
		currency: 'EUR',
		createdAt: '2026-05-01T11:45:00',
		expiresAt: '2026-05-08T11:45:00',
		description: 'Sostituzione guarnizioni collettore principale e valvola a tre vie bloccata.',
		attachments: ['preventivo_idroclima_001.pdf']
	},
	{
		id: 'quo-002',
		ticketId: 'tkt-002',
		supplierId: 'frn-secure-entry',
		customerId: 'adm-giorgio-01',
		propertyId: 'cnd-europa-7',
		title: 'Sostituzione modulo telecamera',
		amount: 280.00,
		currency: 'EUR',
		createdAt: '2026-05-04T09:00:00',
		expiresAt: '2026-05-11T09:00:00',
		description: 'Fornitura e posa in opera di nuovo modulo telecamera compatibile con sistema esistente.',
		attachments: ['preventivo_secure_entry_04.pdf']
	}
	,
	{
		id: 'quo-003',
		ticketId: 'bkg-003',
		supplierId: 'frn-idroclima-nord',
		customerId: 'res-bianchi-01',
		propertyId: 'cnd-marconi-14',
		title: 'Installazione climatizzatore - preventivo completo',
		amount: 1200.00,
		currency: 'EUR',
		createdAt: '2026-05-01T11:30:00',
		expiresAt: '2026-05-15T11:30:00',
		description: 'Preventivo per fornitura e installazione di climatizzatore monosplit (materiali + manodopera).',
		attachments: ['preventivo_idroclima_003.pdf']
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
