export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Payment {
	id: string;
	fromId: string; // References User.id
	toId: string; // References User.id
	amount: number;
	currency: string;
	status: PaymentStatus;
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
		status: 'paid',
		dueDate: '2024-04-10',
		paidAt: '2024-04-08',
		description: 'Quota condominiale Q2 2024',
		propertyId: 'cnd-marconi-14'
	},
	{
		id: 'pay-002',
		fromId: 'res-bianchi-01',
		toId: 'adm-svicom-01',
		amount: 120.0,
		currency: 'EUR',
		status: 'pending',
		dueDate: '2024-05-10',
		description: 'Fondo straordinario lavori scale',
		propertyId: 'cnd-marconi-14'
	},
	{
		id: 'pay-003',
		fromId: 'adm-svicom-01',
		toId: 'frn-idroclima-nord',
		amount: 850.0,
		currency: 'EUR',
		status: 'paid',
		dueDate: '2024-04-15',
		paidAt: '2024-04-14',
		description: 'Intervento riparazione perdita locale contatori',
		propertyId: 'cnd-marconi-14',
		ticketId: 'TCK-482'
	}
];

export function getPaymentsByUserId(userId: string): Payment[] {
	return payments.filter((p) => p.fromId === userId || p.toId === userId);
}

export function getPaymentsByPropertyId(propertyId: string): Payment[] {
	return payments.filter((p) => p.propertyId === propertyId);
}
