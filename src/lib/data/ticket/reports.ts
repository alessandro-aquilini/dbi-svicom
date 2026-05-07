export type ReportStatus = 'nuova' | 'presa_in_carico' | 'completata';
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
		id: 'rep-001',
		title: 'Perdita acqua nel locale caldaia',
		description: 'C\'è una grossa pozzanghera nel locale tecnico vicino alla caldaia principale. Sembra venire da un tubo di mandata.',
		status: 'completata',
		priority: 'alta',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		createdAt: '2026-05-01T08:30:00Z',
		updatedAt: '2026-05-01T10:00:00Z',
		category: 'Idraulica',
		statusHistory: [
			{ status: 'nuova', at: '2026-05-01T08:30:00Z' },
			{ status: 'presa_in_carico', at: '2026-05-01T09:15:00Z' },
			{ status: 'completata', at: '2026-05-01T10:00:00Z' }
		]
	},
	{
		id: 'rep-002',
		title: 'Mancanza acqua calda scala B',
		description: 'Dalle 7 di stamattina non esce acqua calda negli appartamenti della scala B.',
		status: 'completata',
		priority: 'critica',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-ext-05',
		createdAt: '2026-05-01T07:45:00Z',
		updatedAt: '2026-05-01T10:00:00Z',
		category: 'Idraulica',
		statusHistory: [
			{ status: 'nuova', at: '2026-05-01T07:45:00Z' },
			{ status: 'presa_in_carico', at: '2026-05-01T09:15:00Z' },
			{ status: 'completata', at: '2026-05-01T10:00:00Z' }
		]
	},
	{
		id: 'rep-003',
		title: 'Malfunzionamento videocitofono',
		description: 'Il videocitofono esterno non mostra l\'immagine quando suonano.',
		status: 'presa_in_carico',
		priority: 'media',
		propertyId: 'cnd-europa-7',
		reportedById: 'res-conti-02',
		createdAt: '2026-05-03T14:20:00Z',
		updatedAt: '2026-05-03T16:00:00Z',
		category: 'Elettrico',
		statusHistory: [
			{ status: 'nuova', at: '2026-05-03T14:20:00Z' },
			{ status: 'presa_in_carico', at: '2026-05-03T16:00:00Z' }
		]
	},
	{
		id: 'rep-004',
		title: 'Portone d\'ingresso non chiude bene',
		description: 'Il chiudiporta automatico sembra essersi allentato, il portone rimane socchiuso.',
		status: 'nuova',
		priority: 'media',
		propertyId: 'cnd-verdi-3',
		reportedById: 'res-rossi-03',
		createdAt: '2026-05-05T11:00:00Z',
		updatedAt: '2026-05-05T11:00:00Z',
		category: 'Fabbro',
		statusHistory: [
			{ status: 'nuova', at: '2026-05-05T11:00:00Z' }
		]
	}
];

export function getReportById(id: string): Report | undefined {
	return reports.find((r) => r.id === id);
}

export function getReportsByPropertyId(propertyId: string): Report[] {
	return reports.filter((r) => r.propertyId === propertyId);
}
