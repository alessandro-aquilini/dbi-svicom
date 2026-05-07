export interface Invoice {
	id: string;
	number: string;
	supplierId: string; // References User.id
	customerId: string; // References Admin or Resident User.id
	propertyId: string;
	ticketId?: string;
	amount: number;
	currency: string;
	issueDate: string;
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
		amount: 450.00,
		currency: 'EUR',
		issueDate: '2026-05-02T09:00:00Z',
		description: 'Intervento di riparazione idraulica presso Via Marconi 14.',
		attachments: ['fattura_idroclima_154.pdf']
	}
];

export function getInvoiceById(id: string): Invoice | undefined {
	return invoices.find((i) => i.id === id);
}

export function getInvoicesBySupplierId(supplierId: string): Invoice[] {
	return invoices.filter((i) => i.supplierId === supplierId);
}
