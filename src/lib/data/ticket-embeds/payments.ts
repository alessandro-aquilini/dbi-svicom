export interface Payment {
	id: string;
	fromId: string; // References User.id
	toId: string; // References User.id
	amount: number;
	currency: string;
	dueDate: string;
	paidAt?: string;
	description: string;
	propertyId?: string;
	ticketId?: string;
}

export const payments: Payment[] = [
	{
		id: 'pay-001',
		fromId: 'res-bianchi-01',
		toId: 'adm-svicom-01',
		amount: 450.0,
		currency: 'EUR',
		dueDate: '2024-04-10T12:00:00Z',
		paidAt: '2024-04-08T09:30:00Z',
		description: 'Quota condominiale Q2 2024',
		propertyId: 'cnd-marconi-14'
	},
	{
		id: 'pay-003',
		fromId: 'adm-svicom-01',
		toId: 'frn-idroclima-nord',
		amount: 1250.0,
		currency: 'EUR',
		dueDate: '2024-04-30T14:35:00Z',
		paidAt: '2024-04-30T14:35:00Z',
		description: 'Intervento riparazione perdita locale contatori',
		propertyId: 'cnd-marconi-14',
		ticketId: 'TCK-482'
	},
	{
		id: 'pay-004',
		fromId: 'res-conti-02',
		toId: 'frn-idroclima-nord',
		amount: 180.0,
		currency: 'EUR',
		dueDate: '2024-05-18T10:00:00Z',
		description: 'Saldo fattura FT-2024-002. Lavori climatizzazione privato.',
		propertyId: 'cnd-marconi-14',
		ticketId: 'TCK-501'
	},
	{
		id: 'pay-005',
		fromId: 'adm-svicom-02',
		toId: 'frn-idroclima-nord',
		amount: 850.0,
		currency: 'EUR',
		dueDate: '2024-03-15T10:00:00Z',
		paidAt: '2024-03-10T10:00:00Z',
		description: 'Sostituzione pompa sommersa',
		propertyId: 'cnd-roma-12'
	},
	{
		id: 'pay-006',
		fromId: 'adm-svicom-01',
		toId: 'frn-idroclima-nord',
		amount: 320.0,
		currency: 'EUR',
		dueDate: '2024-02-28T10:00:00Z',
		paidAt: '2024-02-26T10:00:00Z',
		description: 'Manutenzione ordinaria caldaia',
		propertyId: 'cnd-marconi-14'
	},
	{
		id: 'pay-007',
		fromId: 'res-rossi-03',
		toId: 'frn-idroclima-nord',
		amount: 220.0,
		currency: 'EUR',
		dueDate: '2024-05-30T10:00:00Z',
		description: 'Sostituzione miscelatore lavabo (Acconto)',
		propertyId: 'cnd-marconi-14',
		ticketId: 'TCK-510'
	}
];

export function getPaymentById(id: string): Payment | undefined {
	return payments.find((p) => p.id === id);
}

export function getPaymentsByUserId(userId: string): Payment[] {
	return payments.filter((p) => p.fromId === userId || p.toId === userId);
}

export function getPaymentsByPropertyId(propertyId: string): Payment[] {
	return payments.filter((p) => p.propertyId === propertyId);
}
