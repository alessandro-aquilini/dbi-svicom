export interface Payment {
	id: string;
	fromId: string; // References User.id
	toId: string; // References User.id
	amount: number;
	currency: string;
	dueDate: string;
	/** Undefined when the payment is still outstanding. */
	paidAt?: string;
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
	,
	{
		id: 'pay-002',
		fromId: 'res-bianchi-01',
		toId: 'frn-clean-green',
		amount: 80.00,
		currency: 'EUR',
		dueDate: '2026-05-20T00:00:00Z',
		paidAt: '2026-04-20T16:00:00Z',
		description: 'Pagamento pulizie extra - bkg-002',
		propertyId: 'cnd-marconi-14',
		ticketId: 'bkg-002'
	},
	{
		id: 'pay-003',
		fromId: 'res-bianchi-01',
		toId: 'frn-idroclima-nord',
		amount: 1200.00,
		currency: 'EUR',
		dueDate: '2026-06-03T00:00:00Z',
		paidAt: '2026-05-04T11:00:00Z',
		description: 'Acconto + saldo per installazione climatizzatore - bkg-003',
		propertyId: 'cnd-marconi-14',
		ticketId: 'bkg-003'
	},

	// ─── Quote condominiali in ritardo (morosi) ─────────────────────────────────
	{
		id: 'pay-quota-bianchi-q1',
		fromId: 'res-bianchi-01',
		toId: 'adm-giorgio-01',
		amount: 420.00,
		currency: 'EUR',
		dueDate: '2026-03-27T00:00:00Z',
		description: 'Quota condominiale Q1 2026 — Via Marconi 14',
		propertyId: 'cnd-marconi-14'
	},
	{
		id: 'pay-quota-conti-q1',
		fromId: 'res-conti-02',
		toId: 'adm-giorgio-01',
		amount: 860.00,
		currency: 'EUR',
		dueDate: '2026-04-05T00:00:00Z',
		description: 'Quota condominiale Q1 2026 — Corso Europa 7',
		propertyId: 'cnd-europa-7'
	},
	{
		id: 'pay-quota-greco-q1',
		fromId: 'res-greco-04',
		toId: 'adm-giorgio-01',
		amount: 1240.00,
		currency: 'EUR',
		dueDate: '2026-03-12T00:00:00Z',
		description: 'Quota condominiale + spese straordinarie — Via Carducci 21',
		propertyId: 'cnd-carducci-21'
	},
	{
		id: 'pay-quota-bruno-q1',
		fromId: 'res-bruno-08',
		toId: 'adm-giorgio-01',
		amount: 900.00,
		currency: 'EUR',
		dueDate: '2026-04-10T00:00:00Z',
		description: 'Quota condominiale Q1 2026 — Via Tortona 12',
		propertyId: 'cnd-tortona-12'
	}
];

/**
 * Returns payments that are past their due date and not yet paid.
 * Optionally restricted to a single property and/or to a minimum number of days overdue.
 */
export function getOverduePayments(options: {
	now?: Date;
	propertyId?: string | null;
	minDaysOverdue?: number;
} = {}): Payment[] {
	const now = options.now ?? new Date();
	const min = options.minDaysOverdue ?? 0;
	return payments.filter((p) => {
		if (p.paidAt) return false;
		if (options.propertyId && p.propertyId !== options.propertyId) return false;
		const due = new Date(p.dueDate).getTime();
		const daysOverdue = (now.getTime() - due) / 86_400_000;
		return daysOverdue >= min;
	});
}

export function getDaysOverdue(payment: Payment, now: Date = new Date()): number {
	const due = new Date(payment.dueDate).getTime();
	return Math.max(0, Math.floor((now.getTime() - due) / 86_400_000));
}

export function getPaymentById(id: string): Payment | undefined {
	return payments.find((p) => p.id === id);
}

export function getPaymentsByUserId(userId: string): Payment[] {
	return payments.filter((p) => p.fromId === userId || p.toId === userId);
}

export function getPaymentsByPropertyId(propertyId: string): Payment[] {
	return payments.filter((p) => p.propertyId === propertyId);
}
