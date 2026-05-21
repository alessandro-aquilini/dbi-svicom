import { browser } from '$app/environment';
import type { Payment } from '$lib/data/embeds/payments';
import type { ResidentPaymentsContext } from './context';
import { formatMoney } from './presentation';

const RESIDENT_PAYMENT_RECEIPTS_STORAGE_KEY = 'svicom_resident_payment_receipts';

export type ResidentPaymentMethod = 'Carta condominiale' | 'Bonifico digitale' | 'Addebito ricorrente';

export interface ResidentPaymentReminder {
	id: string;
	sourcePaymentId: string;
	residentId: string;
	propertyId: string;
	title: string;
	description: string;
	amount: number;
	currency: string;
	dueDate: string;
	amountLabel: string;
}

export interface ResidentPaymentReceipt {
	reference: string;
	sourcePaymentId: string;
	reminderId: string;
	residentId: string;
	propertyId: string;
	title: string;
	description: string;
	amount: number;
	currency: string;
	method: ResidentPaymentMethod;
	paidAt: string;
	createdAt?: string;
	displayAmount: string;
}

const residentPaymentMethods: ResidentPaymentMethod[] = [
	'Carta condominiale',
	'Bonifico digitale',
	'Addebito ricorrente'
];

export function getResidentPaymentMethodOptions(): Array<{
	value: ResidentPaymentMethod;
	label: string;
	copy: string;
}> {
	return residentPaymentMethods.map((method) => ({
		value: method,
		label: method,
		copy:
			method === 'Carta condominiale'
				? 'Conferma il pagamento in un passaggio e ricevi subito la ricevuta.'
				: method === 'Bonifico digitale'
					? 'Mantieni un riferimento immediato della disposizione registrata.'
					: 'Imposta il promemoria ricorrente sul tuo profilo residente.'
	}));
}

function getStoredReceipts(): ResidentPaymentReceipt[] {
	if (!browser) return [];

	try {
		const raw = localStorage.getItem(RESIDENT_PAYMENT_RECEIPTS_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		return parsed.filter((receipt): receipt is ResidentPaymentReceipt => {
			return (
				typeof receipt?.reference === 'string' &&
				typeof receipt?.sourcePaymentId === 'string' &&
				typeof receipt?.reminderId === 'string' &&
				typeof receipt?.residentId === 'string' &&
				typeof receipt?.propertyId === 'string' &&
				typeof receipt?.title === 'string' &&
				typeof receipt?.description === 'string' &&
				typeof receipt?.amount === 'number' &&
				typeof receipt?.currency === 'string' &&
				typeof receipt?.method === 'string' &&
				typeof receipt?.paidAt === 'string'
			);
		});
	} catch {
		return [];
	}
}

function setStoredReceipts(receipts: ResidentPaymentReceipt[]) {
	if (!browser) return;
	localStorage.setItem(RESIDENT_PAYMENT_RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
}

function getQuarterLabel(date: Date): string {
	const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
	return `Q${quarter} ${date.getUTCFullYear()}`;
}

function inferNextRecurringDueDate(sourcePayment: Pick<Payment, 'paidAt'>, now = new Date()): Date {
	// sourcePayment.paidAt is the scheduled/recurring date in the new model
	const inferredDate = new Date(sourcePayment.paidAt as string);

	while (inferredDate.getTime() <= now.getTime()) {
		inferredDate.setUTCMonth(inferredDate.getUTCMonth() + 3);
	}

	return inferredDate;
}

export function getResidentPaymentReminder(
	context: Pick<ResidentPaymentsContext, 'currentUser' | 'resident' | 'property' | 'personalPayments'>,
	now = new Date()
): ResidentPaymentReminder | undefined {
	const latestPersonalPayment = [...context.personalPayments]
		.sort((left, right) => (right.paidAt ?? '').localeCompare(left.paidAt ?? ''))
		.at(0);

	if (!latestPersonalPayment || !context.currentUser || !context.resident || !context.property) {
		return undefined;
	}

	const dueDate = inferNextRecurringDueDate(latestPersonalPayment as Pick<Payment, 'paidAt'>, now);
	const dueDateIso = dueDate.toISOString();
	const title = `Quota condominiale ${getQuarterLabel(dueDate)}`;

	return {
		id: `${latestPersonalPayment.id}-reminder`,
		sourcePaymentId: latestPersonalPayment.id,
		residentId: context.currentUser.id,
		propertyId: context.property.id,
		title,
		description: `Promemoria ricorrente basato sull'ultima quota disponibile per ${context.property.name}.`,
		amount: latestPersonalPayment.amount,
		currency: latestPersonalPayment.currency,
		dueDate: dueDateIso,
		amountLabel: formatMoney(latestPersonalPayment.amount, latestPersonalPayment.currency)
	};
}

export function createResidentPaymentReceipt(input: {
	reminder: ResidentPaymentReminder;
	method: ResidentPaymentMethod;
}): ResidentPaymentReceipt {
	const createdAt = new Date().toISOString();
	const receipt: ResidentPaymentReceipt = {
	reference: `RCV-${createdAt.slice(0, 10).replaceAll('-', '')}-${Math.random()
			.toString(36)
			.slice(2, 7)
			.toUpperCase()}`,
		sourcePaymentId: input.reminder.sourcePaymentId,
		reminderId: input.reminder.id,
		residentId: input.reminder.residentId,
		propertyId: input.reminder.propertyId,
		title: input.reminder.title,
		description: input.reminder.description,
		amount: input.reminder.amount,
		currency: input.reminder.currency,
		method: input.method,
	// For local receipts we record the transaction date as the creation time
	paidAt: createdAt,
	createdAt,
		displayAmount: input.reminder.amountLabel
	};

	setStoredReceipts([receipt, ...getStoredReceipts().filter((item) => item.reference !== receipt.reference)]);
	return receipt;
}

export function getResidentLatestReceipt(residentId: string | undefined): ResidentPaymentReceipt | undefined {
	if (!residentId) return undefined;

	return getStoredReceipts()
		.filter((receipt) => receipt.residentId === residentId)
	.sort((left, right) => (right.createdAt ?? '').localeCompare(left.createdAt ?? ''))
		.at(0);
}

export function getResidentReceiptByReference(
	residentId: string | undefined,
	reference: string | undefined
): ResidentPaymentReceipt | undefined {
	if (!residentId || !reference) return undefined;

	return getStoredReceipts().find(
		(receipt) => receipt.residentId === residentId && receipt.reference === reference
	);
}
