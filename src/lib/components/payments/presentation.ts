import type { Payment } from '$lib/data/embeds/payments';

export type ResidentPaymentStatus = 'paid' | 'pending' | 'overdue';

export const residentPaymentStatusLabels: Record<ResidentPaymentStatus, string> = {
	paid: 'Registrato',
	pending: 'In attesa',
	overdue: 'Scaduto'
};

export function getResidentPaymentStatus(
	payment: Pick<Payment, 'paidAt' | 'createdAt'>,
	now = new Date()
): ResidentPaymentStatus {
	// paidAt is the transaction date (may be empty). If it's set and in the past (<= now) it's paid.
	if (payment.paidAt) {
		return new Date(payment.paidAt).getTime() <= now.getTime() ? 'paid' : 'pending';
	}
	// No transaction date: treat as pending (not yet paid). Overdue logic is handled elsewhere.
	return 'pending';
}

export function formatPaymentDate(value: string | undefined): string {
	if (!value) return 'Data non disponibile';

	return new Intl.DateTimeFormat('it-IT', {
		dateStyle: 'medium'
	}).format(new Date(value));
}

export function formatPaymentDateTime(value: string | undefined): string {
	if (!value) return 'Data non disponibile';

	return new Intl.DateTimeFormat('it-IT', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(new Date(value));
}

export function formatMoney(amount: number, currency: string): string {
	return new Intl.NumberFormat('it-IT', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount);
}

export function getPaymentFootnote(
	payment: Pick<Payment, 'paidAt' | 'createdAt'>,
	now = new Date()
): { label: string; value: string } {
	const status = getResidentPaymentStatus(payment, now);

	if (status === 'paid') {
		// Show the transaction date (paidAt) when available; fall back to createdAt
		return {
			label: 'Registrato il',
			value: formatPaymentDateTime(payment.paidAt ?? payment.createdAt)
		};
	}

	// pending: show scheduled/transaction date if present, otherwise creation date
	return {
		label: 'In scadenza il',
		value: formatPaymentDate(payment.paidAt ?? payment.createdAt)
	};
}
