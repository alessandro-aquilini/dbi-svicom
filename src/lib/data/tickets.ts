export type TicketType = 'segnalazione' | 'intervento' | 'amministrativo';
export type TicketStatus = 'nuovo' | 'assegnato' | 'in-corso' | 'risolto' | 'chiuso';
export type TicketPriority = 'bassa' | 'media' | 'alta' | 'critica';

export interface Ticket {
	id: string;
	title: string;
	description: string;
	type: TicketType;
	status: TicketStatus;
	priority: TicketPriority;
	propertyId: string;
	reportedById: string; // References User.id
	assignedToId?: string; // References User.id
	createdAt: string;
	updatedAt: string;
	category: string;
	location?: string;
	metadata?: Record<string, any>; // For role-specific fields (checkpoints, sla, etc.)
}

export const tickets: Ticket[] = [
	{
		id: 'TCK-482',
		title: 'Perdita ricorrente nel locale contatori',
		description: 'Tre segnalazioni sullo stesso punto in meno di due ore: va capito se è un nuovo guasto o un ritorno di un caso chiuso.',
		type: 'intervento',
		status: 'chiuso',
		priority: 'alta',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		assignedToId: 'adm-svicom-01',
		createdAt: '2024-04-29T09:14:00Z',
		updatedAt: '2024-04-30T14:25:00Z',
		category: 'impianti',
		location: 'Locale contatori',
		metadata: {
			channel: 'WhatsApp',
			sla: 'Prima presa in carico entro 38 min'
		}
	},
	{
		id: 'TCK-476',
		title: 'Ascensore scala B fermo a intermittenza',
		description: 'Il problema si presenta a ondate e richiede una squadra disponibile in finestra rapida.',
		type: 'intervento',
		status: 'assegnato',
		priority: 'alta',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		assignedToId: 'frn-secure-entry',
		createdAt: '2024-04-29T08:40:00Z',
		updatedAt: '2024-04-29T08:45:00Z',
		category: 'sicurezza',
		location: 'Scala B',
		metadata: {
			channel: 'Voce',
			sla: 'Escalation automatica tra 24 min'
		}
	},
	{
		id: '1047',
		title: 'Perdita acqua nel corridoio del 3 piano',
		description: 'Foto allegate da residente, possibile infiltrazione dalla colonna montante.',
		type: 'segnalazione',
		status: 'nuovo',
		priority: 'critica',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		createdAt: '2024-04-29T10:52:00Z',
		updatedAt: '2024-04-29T10:52:00Z',
		category: 'impianti',
		location: 'Scala B - 3 Piano',
		metadata: {
			channel: 'whatsapp'
		}
	},
	{
		id: '1043',
		title: 'Luci scale non funzionano al secondo piano',
		description: 'Messaggio WhatsApp con foto; probabile duplicato di richiesta aperta ieri.',
		type: 'segnalazione',
		status: 'in-corso',
		priority: 'media',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		assignedToId: 'adm-svicom-01',
		createdAt: '2024-04-29T09:00:00Z',
		updatedAt: '2024-04-29T09:30:00Z',
		category: 'impianti',
		location: 'Scala A - 2 Piano'
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
