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
		customerId: 'adm-giorgio-01',
		propertyId: 'cnd-marconi-14',
		ticketId: 'TCK-482',
		amount: 1250.0,
		currency: 'EUR',
		issueDate: '2024-04-30T08:00:00Z',
		dueDate: '2024-05-30T23:59:59Z',
		description: 'Intervento urgente riparazione colonna montante',
		attachments: ['fattura-idroclima-001.pdf']
	},
	{
		id: 'inv-002',
		number: 'FT-2024-002',
		supplierId: 'frn-idroclima-nord',
		customerId: 'res-conti-02',
		propertyId: 'cnd-marconi-14',
		ticketId: 'TCK-501',
		amount: 180.0,
		currency: 'EUR',
		issueDate: '2024-05-03T14:00:00Z',
		dueDate: '2024-05-18T23:59:59Z',
		description: 'Intervento tecnico in appartamento privato. Sostituzione pompa di scarico condensa.',
		attachments: ['fattura-idroclima-002.pdf']
	}
];

export function getInvoiceById(id: string): Invoice | undefined {
	return invoices.find((i) => i.id === id);
}

export function getInvoicesBySupplierId(supplierId: string): Invoice[] {
	return invoices.filter((i) => i.supplierId === supplierId);
}
