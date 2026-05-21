import { getDocumentsByPropertyId, type PropertyDocument } from '$lib/data/documents';
import {
	getPaymentsByPropertyId,
	getPaymentsByUserId,
	type Payment
} from '$lib/data/embeds/payments';
import { getPropertyById, type Property } from '$lib/data/properties';
import { getResidentById, type Resident } from '$lib/data/residents';
import { getUserById, type User } from '$lib/data/users';

export interface ResidentPaymentsContext {
	currentUser?: User;
	resident?: Resident;
	property?: Property;
	admin?: User;
	personalPayments: Payment[];
	propertyPayments: Payment[];
	propertyOperationalPayments: Payment[];
	allVisiblePayments: Payment[];
	propertyDocuments: PropertyDocument[];
	accountingDocuments: PropertyDocument[];
}

export function getResidentPaymentsContext(userId: string | undefined): ResidentPaymentsContext {
	const currentUser = userId ? getUserById(userId) : undefined;
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const admin = property ? getUserById(property.adminId) : undefined;

	const personalPayments = currentUser
		? getPaymentsByUserId(currentUser.id).sort((left, right) => (right.createdAt ?? right.paidAt ?? '').localeCompare(left.createdAt ?? left.paidAt ?? ''))
		: [];
	const propertyPayments = property
		? getPaymentsByPropertyId(property.id).sort((left, right) => (right.createdAt ?? right.paidAt ?? '').localeCompare(left.createdAt ?? left.paidAt ?? ''))
		: [];
	const personalIds = new Set(personalPayments.map((payment) => payment.id));
	const propertyOperationalPayments = propertyPayments.filter((payment) => !personalIds.has(payment.id));
	const allVisiblePayments = [...personalPayments, ...propertyOperationalPayments].sort((left, right) =>
		(right.createdAt ?? right.paidAt ?? '').localeCompare(left.createdAt ?? left.paidAt ?? '')
	);

	const propertyDocuments = property
		? getDocumentsByPropertyId(property.id).sort((left, right) =>
				right.updatedAt.localeCompare(left.updatedAt)
			)
		: [];
	const accountingDocuments = propertyDocuments.filter(
		(document) => document.category === 'bilancio' || document.category === 'regolamento'
	);

	return {
		currentUser,
		resident,
		property,
		admin,
		personalPayments,
		propertyPayments,
		propertyOperationalPayments,
		allVisiblePayments,
		propertyDocuments,
		accountingDocuments
	};
}

export function getResidentVisiblePaymentById(
	userId: string | undefined,
	paymentId: string
): Payment | undefined {
	return getResidentPaymentsContext(userId).allVisiblePayments.find((payment) => payment.id === paymentId);
}

export function isResidentPersonalPayment(
	context: Pick<ResidentPaymentsContext, 'currentUser'>,
	payment: Pick<Payment, 'fromId' | 'toId'>
): boolean {
	return Boolean(
		context.currentUser &&
			(payment.fromId === context.currentUser.id || payment.toId === context.currentUser.id)
	);
}
