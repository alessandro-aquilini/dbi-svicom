export interface Invoice {
	id: string;
	number: string;
	supplierId: string; // References User.id
	propertyId: string;
	ticketId?: string;
	amount: number;
	currency: string;
	issueDate: string;
	dueDate: string;
	paidAt?: string;
	description: string;
	attachments?: string[];
}

export const invoices: Invoice[] = [
	{
		id: 'inv-001',
		number: 'FT-2024-001',
		supplierId: 'frn-idroclima-nord',
		propertyId: 'cnd-marconi-14',
		ticketId: 'TCK-482',
		amount: 1250.0,
		currency: 'EUR',
		issueDate: '2024-04-30T08:00:00Z',
		dueDate: '2024-05-30T23:59:59Z',
		description: 'Intervento urgente riparazione colonna montante',
		attachments: ['fattura-idroclima-001.pdf']
	}
];

export function getInvoiceById(id: string): Invoice | undefined {
	return invoices.find((i) => i.id === id);
}

export function getInvoicesBySupplierId(supplierId: string): Invoice[] {
	return invoices.filter((i) => i.supplierId === supplierId);
}
