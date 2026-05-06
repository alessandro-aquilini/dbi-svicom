import { getAssemblyById, getAssembliesByPropertyId, type Assembly } from '$lib/data/assemblies';
import { getDocumentsByPropertyId, type SvicomDocument } from '$lib/data/documents';
import { getPropertyById, type Property } from '$lib/data/properties';
import { getResidentById, type Resident } from '$lib/data/residents';
import { getTicketsByPropertyId, type Ticket } from '$lib/data/tickets-admin';
import { getUserById, type User } from '$lib/data/users';

export interface ResidentAssemblyContext {
	currentUser?: User;
	resident?: Resident;
	property?: Property;
	admin?: User;
	assembly?: Assembly;
	propertyAssemblies: Assembly[];
	relatedAssemblies: Assembly[];
	propertyDocuments: SvicomDocument[];
	propertyTickets: Ticket[];
	latestMinutesAssembly?: Assembly;
	isAccessible: boolean;
}

function getLatestTicketTimestamp(ticket: Ticket): string {
	return ticket.statusHistory.at(-1)?.at ?? '';
}

export function getResidentAssemblyContext(
	currentUserId: string | null | undefined,
	assemblyId: string
): ResidentAssemblyContext {
	const currentUser = currentUserId ? getUserById(currentUserId) : undefined;
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const assembly = getAssemblyById(assemblyId);
	const propertyAssemblies = property
		? [...getAssembliesByPropertyId(property.id)].sort((left, right) =>
				right.scheduledAt.localeCompare(left.scheduledAt)
		  )
		: [];
	const propertyDocuments = property
		? [...getDocumentsByPropertyId(property.id)].sort((left, right) =>
				right.updatedAt.localeCompare(left.updatedAt)
		  )
		: [];
	const propertyTickets = property
		? [...getTicketsByPropertyId(property.id)].sort((left, right) =>
				getLatestTicketTimestamp(right).localeCompare(getLatestTicketTimestamp(left))
		  )
		: [];
	const admin = property ? getUserById(property.adminId) : undefined;
	const isAccessible = Boolean(property && assembly && assembly.propertyId === property.id);
	const relatedAssemblies =
		isAccessible && assembly ? propertyAssemblies.filter((item) => item.id !== assembly.id) : [];
	const latestMinutesAssembly =
		isAccessible && assembly?.minutes ? assembly : propertyAssemblies.find((item) => item.minutes);

	return {
		currentUser,
		resident,
		property,
		admin,
		assembly,
		propertyAssemblies,
		relatedAssemblies,
		propertyDocuments,
		propertyTickets,
		latestMinutesAssembly,
		isAccessible
	};
}
