export interface Payment {
	id: string;
	fromId: string; // References User.id
	toId: string; // References User.id
	amount: number;
	currency: string;
	/** Optional scheduled / expected payment date (was previously "dueDate").
	 * This field is used to determine when the payment is expected to occur.
	 */
	paidAt?: string;
	/** Timestamp when the payment record was created (was previously "paidAt").
	 * Use this to sort timeline messages and for UI ordering.
	 */
	createdAt?: string;
	description: string;
	ticketId?: string;
	bookingId?: string;
	propertyId?: string;
}

export const payments: Payment[] = [
	{
		id: 'pay-001',
		fromId: 'adm-giorgio-01',
		toId: 'frn-idroclima-nord',
		amount: 450.00,
		currency: 'EUR',
		paidAt: '2026-06-02T00:00:00',
		createdAt: '2026-05-03T10:15:00',
		description: 'Saldo fattura 2026/FT/154 per intervento idraulico',
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
		paidAt: '2026-05-20T00:00:00',
		createdAt: '2026-04-20T16:00:00',
		description: 'Pagamento pulizie extra',
		propertyId: 'cnd-marconi-14',
		ticketId: 'bkg-002'
	},
	{
		id: 'pay-003',
		fromId: 'res-bianchi-01',
		toId: 'frn-idroclima-nord',
		amount: 1200.00,
		currency: 'EUR',
		paidAt: '2026-06-03T00:00:00',
		createdAt: '2026-05-04T11:00:00',
		description: 'Acconto + saldo per installazione climatizzatore',
		propertyId: 'cnd-marconi-14',
		ticketId: 'bkg-003'
	},
	// Payments to frd-idroclima nord (not related to ticket / booking). This is in order to make the supplier/finances/payments populated. 
	// Should be removed if we add more tickets.
	{
		id: 'pay-004',
		fromId: 'adm-giorgio-01',
		toId: 'frn-idroclima-nord',
		amount: 320.00,
		currency: 'EUR',
		paidAt: '2026-05-18T00:00:00',
		createdAt: '2026-05-18T09:30:00',
		description: 'Intervento riparazione caldaia - Condominio Europa',
		propertyId: 'cnd-europa-7'
	},
	{
		id: 'pay-005',
		fromId: 'res-conti-02',
		toId: 'frn-idroclima-nord',
		amount: 150.00,
		currency: 'EUR',
		paidAt: '2026-05-15T00:00:00',
		createdAt: '2026-05-15T14:20:00',
		description: 'Manutenzione ordinaria condizionatore',
		propertyId: 'cnd-europa-7'
	},
	{
		id: 'pay-006',
		fromId: 'adm-giorgio-01',
		toId: 'frn-idroclima-nord',
		amount: 2100.00,
		currency: 'EUR',
		paidAt: '2026-05-10T00:00:00',
		createdAt: '2026-05-10T11:00:00',
		description: 'Sostituzione pompe di calore - Acconto',
		propertyId: 'cnd-marconi-14'
	},

	// ─── Quote condominiali in ritardo (morosi) ─────────────────────────────────
	{
		id: 'pay-quota-bianchi-q1',
		fromId: 'res-bianchi-01',
		toId: 'adm-giorgio-01',
		amount: 420.00,
		currency: 'EUR',
		paidAt: '2026-03-27T00:00:00',
		description: 'Quota condominiale Q1 2026',
		propertyId: 'cnd-marconi-14'
	},
	{
		id: 'pay-quota-conti-q1',
		fromId: 'res-conti-02',
		toId: 'adm-giorgio-01',
		amount: 860.00,
		currency: 'EUR',
		paidAt: '2026-04-05T00:00:00',
		description: 'Quota condominiale Q1 2026',
		propertyId: 'cnd-europa-7'
	}
];

/**
 * Returns payments that are past their due date and not yet paid.
 * Optionally restricted to a single property and/or to a minimum number of days overdue.
 */
// Overdue/due-date based logic removed: payments use `paidAt` as transaction date and `createdAt` for record timestamp.

export function getPaymentById(id: string): Payment | undefined {
	return payments.find((p) => p.id === id);
}

export function createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Payment {
	const newPayment: Payment = {
		...payment,
		id: `pay-${Math.random().toString(36).substr(2, 9)}`,
		createdAt: new Date().toISOString()
	};
	payments.push(newPayment);
	return newPayment;
}

export function getPaymentsByUserId(userId: string): Payment[] {
	return payments.filter((p) => p.fromId === userId || p.toId === userId);
}

export function getPaymentsByPropertyId(propertyId: string): Payment[] {
	return payments.filter((p) => p.propertyId === propertyId);
}
