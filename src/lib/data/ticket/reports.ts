export type ReportStatus = 'nuova' | 'presa_in_carico' | 'trasformata';
export type ReportPriority = 'bassa' | 'media' | 'alta' | 'critica';

export interface StatusHistoryEntry {
	status: string;
	at: string;
}

export interface Report {
	id: string;
	title: string;
	description: string;
	status: ReportStatus;
	priority: ReportPriority;
	propertyId: string;
	reportedById: string; // References User.id
	assignedToId?: string; // References User.id
	createdAt: string;
	updatedAt: string;
	category: string;
	location?: string;
	statusHistory: StatusHistoryEntry[];
}

export const reports: Report[] = [
	{
		id: '1047',
		title: 'Perdita acqua nel corridoio del 3 piano',
		description: 'Foto allegate da residente, possibile infiltrazione dalla colonna montante.',
		status: 'nuova',
		priority: 'critica',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		createdAt: '2024-04-29T10:52:00Z',
		updatedAt: '2024-04-29T10:52:00Z',
		category: 'impianti',
		location: 'Scala B - 3 Piano',
		statusHistory: [
			{ status: 'nuova', at: '2024-04-29T10:52:00Z' }
		]
	},
	{
		id: '1043',
		title: 'Luci scale non funzionano al secondo piano',
		description: 'Messaggio WhatsApp con foto; probabile duplicato di richiesta aperta ieri.',
		status: 'presa_in_carico',
		priority: 'media',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		assignedToId: 'adm-giorgio-01',
		createdAt: '2024-04-29T09:00:00Z',
		updatedAt: '2024-04-29T09:30:00Z',
		category: 'impianti',
		location: 'Scala A - 2 Piano',
		statusHistory: [
			{ status: 'nuova', at: '2024-04-29T09:00:00Z' },
			{ status: 'presa_in_carico', at: '2024-04-29T09:30:00Z' }
		]
	}
];

export function getReportById(id: string): Report | undefined {
	return reports.find((r) => r.id === id);
}

export function getReportsByPropertyId(propertyId: string): Report[] {
	return reports.filter((r) => r.propertyId === propertyId);
}
