export interface Invoice {
	id: string;
	number: string;
	supplierId: string; // References User.id
	customerId: string; // References Admin or Resident User.id
	propertyId: string;
	ticketId: string;
	amount: number;
	currency: string;
	issueDate: string;
	/** Optional due date for invoice payment */
	dueDate?: string;
	description: string;
	attachments?: string[];
}

export const invoices: Invoice[] = [
	{
		id: 'inv-001',
		number: '2026/FT/154',
		supplierId: 'frn-idroclima-nord',
		customerId: 'adm-giorgio-01',
		propertyId: 'cnd-marconi-14',
		ticketId: 'tkt-001',
		amount: 450.0,
		currency: 'EUR',
		issueDate: '2026-05-02T09:00:00Z',
		dueDate: '2026-05-31T00:00:00Z',
		description: 'Intervento di riparazione idraulica presso Via Marconi 14.',
		attachments: ['fattura_idroclima_154.pdf']
	},
	{
		id: 'inv-002',
		number: '2026/FT/200',
		supplierId: 'frn-clean-green',
		customerId: 'res-bianchi-01',
		propertyId: 'cnd-marconi-14',
		ticketId: 'bkg-002',
		amount: 80.0,
		currency: 'EUR',
		issueDate: '2026-04-20T15:30:00Z',
		description: 'Pulizia appartamento - servizio extra',
		attachments: []
	},
	{
		id: 'inv-003',
		number: '2026/FT/210',
		supplierId: 'frn-idroclima-nord',
		customerId: 'res-bianchi-01',
		propertyId: 'cnd-marconi-14',
		ticketId: 'bkg-003',
		amount: 1200.00,
		currency: 'EUR',
		issueDate: '2026-05-03T10:00:00Z',
		description: 'Installazione climatizzatore - materiali e manodopera',
		attachments: ['fattura_idroclima_210.pdf']
	}
];

export function getInvoiceById(id: string): Invoice | undefined {
	return invoices.find((i) => i.id === id);
}

export function getInvoicesBySupplierId(supplierId: string): Invoice[] {
	return invoices.filter((i) => i.supplierId === supplierId);
}
