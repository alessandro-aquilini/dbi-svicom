export type TicketStatus = 'estimating' | 'approved' | 'in_progress' | 'completed' | 'paid';
export type TicketPriority = 'bassa' | 'media' | 'alta' | 'critica';

export interface StatusHistoryEntry {
	status: string;
	at: string;
}

export interface Ticket {
	id: string;
	title: string;
	description: string;
	priority: TicketPriority;
	propertyId: string;
	reportedById: string; // References Admin User.id (usually)
	assignedToId?: string; // References Supplier User.id
	createdAt: string;
	category: string;
	statusHistory: StatusHistoryEntry[];
}

export const tickets: Ticket[] = [
	{
		id: 'TCK-482',
		title: 'Perdita ricorrente nel locale contatori',
		description: 'Tre segnalazioni sullo stesso punto in meno di due ore: va capito se è un nuovo guasto o un ritorno di un caso chiuso.',
		priority: 'alta',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		assignedToId: 'frn-idroclima-nord',
		createdAt: '2024-04-29T09:14:00Z',
		category: 'impianti',
		statusHistory: [
			{ status: 'estimating', at: '2024-04-29T09:14:00Z' },
			{ status: 'approved', at: '2024-04-29T09:20:00Z' },
			{ status: 'in_progress', at: '2024-04-29T11:00:00Z' },
			{ status: 'completed', at: '2024-04-30T14:00:00Z' },
			{ status: 'paid', at: '2024-04-30T14:30:00Z' }
		]
	},
	{
		id: 'TCK-476',
		title: 'Ascensore scala B fermo a intermittenza',
		description: 'Il problema si presenta a ondate e richiede una squadra disponibile in finestra rapida.',
		priority: 'alta',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		assignedToId: 'frn-secure-entry',
		createdAt: '2024-04-29T08:40:00Z',
		category: 'sicurezza',
		statusHistory: [
			{ status: 'estimating', at: '2024-04-29T08:40:00Z' }
		]
	}
];

export function getTicketById(id: string): Ticket | undefined {
	return tickets.find((t) => t.id === id);
}

export function getTicketsByPropertyId(propertyId: string): Ticket[] {
	return tickets.filter((t) => t.propertyId === propertyId);
}

export function getTicketsByAssignedToId(assignedToId: string): Ticket[] {
	return tickets.filter((t) => t.assignedToId === assignedToId);
}
