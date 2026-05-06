import type { Payment } from '$lib/data/ticket-embeds/payments';

export type ResidentPaymentStatus = 'paid' | 'pending' | 'overdue';

export const residentPaymentStatusLabels: Record<ResidentPaymentStatus, string> = {
	paid: 'Registrato',
	pending: 'In attesa',
	overdue: 'Scaduto'
};

export function getResidentPaymentStatus(
	payment: Pick<Payment, 'dueDate' | 'paidAt'>,
	now = new Date()
): ResidentPaymentStatus {
	if (payment.paidAt) return 'paid';
	return new Date(payment.dueDate).getTime() < now.getTime() ? 'overdue' : 'pending';
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
	payment: Pick<Payment, 'dueDate' | 'paidAt'>,
	now = new Date()
): { label: string; value: string } {
	const status = getResidentPaymentStatus(payment, now);

	if (status === 'paid') {
		return {
			label: 'Registrato il',
			value: formatPaymentDateTime(payment.paidAt)
		};
	}

	if (status === 'overdue') {
		return {
			label: 'Scaduto il',
			value: formatPaymentDate(payment.dueDate)
		};
	}

	return {
		label: 'In scadenza il',
		value: formatPaymentDate(payment.dueDate)
	};
}
