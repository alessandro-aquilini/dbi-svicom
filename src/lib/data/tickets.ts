export type TicketStatus = 'opened' | 'estimating' | 'approved' | 'in_progress' | 'completed' | 'paid';
export type TicketPriority = 'bassa' | 'media' | 'alta' | 'critica';

export interface StatusHistoryEntry {
	status: TicketStatus | string;
	at: string;
	authorId?: string; // Captures who triggered this status change (supplier vs admin)
}

export interface Ticket {
	id: string;
	title: string;
	description: string;
	priority: TicketPriority;
	creatorId: string; // References Admin or Resident User.id
	supplierId?: string; // References Supplier User.id
	propertyId: string; // The condomiunum. 
	category: string;
	statusHistory: StatusHistoryEntry[];
}

export const tickets: Ticket[] = [
	{
		id: 'TCK-482',
		title: 'Perdita ricorrente nel locale contatori',
		description: 'Tre segnalazioni sullo stesso punto in meno di due ore: va capito se è un nuovo guasto o un ritorno di un caso chiuso.',
		priority: 'alta',
		creatorId: 'adm-svicom-01',
		supplierId: 'frn-idroclima-nord',
		propertyId: 'cnd-marconi-14',
		category: 'impianti',
		statusHistory: [
			{ status: 'opened', at: '2024-04-29T09:14:00Z', authorId: 'adm-svicom-01' },
			{ status: 'estimating', at: '2024-04-29T09:14:00Z', authorId: 'frn-idroclima-nord' },
			{ status: 'approved', at: '2024-04-29T09:20:00Z', authorId: 'adm-svicom-01' },
			{ status: 'in_progress', at: '2024-04-29T11:00:00Z', authorId: 'frn-idroclima-nord' },
			{ status: 'completed', at: '2024-04-30T14:00:00Z', authorId: 'frn-idroclima-nord' },
			{ status: 'paid', at: '2024-04-30T14:30:00Z', authorId: 'adm-svicom-01' }
		]
	},
	{
		id: 'TCK-476',
		title: 'Ascensore scala B fermo a intermittenza',
		description: 'Il problema si presenta a ondate e richiede una squadra disponibile in finestra rapida.',
		priority: 'alta',
		creatorId: 'res-bianchi-01',
		supplierId: 'frn-secure-entry',
		propertyId: 'cnd-marconi-14',
		category: 'sicurezza',
		statusHistory: [
			{ status: 'opened', at: '2024-04-29T08:40:00Z', authorId: 'res-bianchi-01' },
			{ status: 'estimating', at: '2024-04-29T08:40:00Z', authorId: 'frn-secure-entry' }
		]
	}
];

export function getTicketById(id: string): Ticket | undefined {
	return tickets.find((t) => t.id === id);
}

export function getTicketsByPropertyId(propertyId: string): Ticket[] {
	return tickets.filter((t) => t.propertyId === propertyId);
}

export function getTicketsBySupplierId(supplierId: string): Ticket[] {
	return tickets.filter((t) => t.supplierId === supplierId);
}
