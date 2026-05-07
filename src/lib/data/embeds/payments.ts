export interface Payment {
	id: string;
	fromId: string; // References User.id
	toId: string; // References User.id
	amount: number;
	currency: string;
	dueDate: string;
	paidAt: string;
	description: string;
	ticketId?: string;
	propertyId?: string;
}

export const payments: Payment[] = [
	{
		id: 'pay-001',
		fromId: 'adm-giorgio-01',
		toId: 'frn-idroclima-nord',
		amount: 450.00,
		currency: 'EUR',
		dueDate: '2026-06-02T00:00:00Z',
		paidAt: '2026-05-03T10:15:00Z',
		description: 'Saldo fattura 2026/FT/154 per intervento idraulico Marconi 14',
		propertyId: 'cnd-marconi-14',
		ticketId: 'tkt-001'
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
