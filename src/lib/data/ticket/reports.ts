// NOTE: Segnalazioni

export type ReportStatus = 'nuova' | 'presa in carico' | 'chiusa';
export type ReportPriority = 'bassa' | 'media' | 'alta' | 'critica';

// Timeline event kinds for reports
export type ReportEventKind = 'reported' | 'acknowledged' | 'resolved';

export interface ReportEvent {
	id: string;
	kind: ReportEventKind;
	authorId: string; // user who performed the action
	at: string; // ISO datetime
	// optional payload (for escalated we can attach assignedToId)
	assignedToId?: string;
}

export interface Message {
	id: string;
	senderId: string; // References User.id
	text: string;
	timestamp: string; // ISO datetime
}

export interface Report {
	id: string;
	title: string;
	description: string;
	priority: ReportPriority;
	propertyId: string;
	reportedById: string; // References User.id
	adminId: string; // Admin reference
	assignedToId?: string; // optional current assignee
	category: string;
	location?: string;

	// New: timeline of actions that drives status and timestamps
	timeline?: ReportEvent[];

	// Message timeline (moved from chats)
	messageTimeline?: Message[];
}

export const reports: Report[] = [
	{
		id: 'rep-001',
		title: 'Perdita acqua nel locale caldaia',
		description: 'C\'è una grossa pozzanghera nel locale tecnico vicino alla caldaia principale. Sembra venire da un tubo di mandata.',
		priority: 'alta',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		adminId: 'adm-giorgio-01',
		category: 'Idraulica',
		timeline: [
			{ id: 'rep-001-e1', kind: 'reported', authorId: 'res-bianchi-01', at: '2026-05-01T08:30:00' },
			{ id: 'rep-001-e2', kind: 'acknowledged', authorId: 'adm-giorgio-01', at: '2026-05-01T09:15:00' },
			{ id: 'rep-001-e3', kind: 'resolved', authorId: 'adm-giorgio-01', at: '2026-05-01T10:00:00' }
		],
		messageTimeline: [
			{ id: 'msg-res-001', senderId: 'adm-giorgio-01', text: 'Grazie Marco, ho preso in carico la segnalazione. Chiamo subito Idroclima.', timestamp: '2026-05-01T09:15:00' }
		]
	},
	{
		id: 'rep-002',
		title: 'Mancanza acqua calda scala B',
		description: 'Dalle 7 di stamattina non esce acqua calda negli appartamenti della scala B.',
		priority: 'critica',
		propertyId: 'cnd-marconi-14',
		adminId: 'adm-giorgio-01',
		reportedById: 'res-bellini-05',
		category: 'Idraulica',
		timeline: [
			{ id: 'rep-002-e1', kind: 'reported', authorId: 'res-bellini-05', at: '2026-05-01T07:45:00' },
			{ id: 'rep-002-e2', kind: 'acknowledged', authorId: 'adm-giorgio-01', at: '2026-05-01T09:15:00' },
			{ id: 'rep-002-e3', kind: 'resolved', authorId: 'adm-giorgio-01', at: '2026-05-01T10:00:00' }
		],
		messageTimeline: [
			{ id: 'msg-res-101', senderId: 'res-bellini-05', text: 'Manca l\'acqua calda nella scala B da stamattina!', timestamp: '2026-05-01T07:45:00' },
			{ id: 'msg-res-102', senderId: 'adm-giorgio-01', text: 'Sì, è collegato alla perdita in caldaia. Risolveremo in mattinata.', timestamp: '2026-05-01T09:15:00' }
		]
	},
	{
		id: 'rep-003',
		title: 'Malfunzionamento videocitofono',
		description: 'Il videocitofono esterno non mostra l\'immagine quando suonano.',
		priority: 'media',
		propertyId: 'cnd-europa-7',
		adminId: 'adm-giorgio-01',
		reportedById: 'res-conti-02',
		category: 'Elettrico',
		timeline: [
			{ id: 'rep-003-e1', kind: 'reported', authorId: 'res-conti-02', at: '2026-05-03T14:20:00' },
			{ id: 'rep-003-e2', kind: 'acknowledged', authorId: 'adm-giorgio-01', at: '2026-05-03T16:00:00' }
		],
		messageTimeline: [
			{ id: 'msg-res-201', senderId: 'res-conti-02', text: 'Ciao Giorgio, il videocitofono non funziona più bene. Non si vede nulla.', timestamp: '2026-05-03T14:20:00' },
			{ id: 'msg-res-202', senderId: 'adm-giorgio-01', text: 'Ricevuto. Contatto Secure Entry per un controllo domani.', timestamp: '2026-05-03T16:00:00' }
		]
	},
	{
		id: 'rep-004',
		title: 'Portone d\'ingresso non chiude bene',
		description: 'Il chiudiporta automatico sembra essersi allentato, il portone rimane socchiuso.',
		priority: 'media',
		propertyId: 'cnd-verdi-3',
		reportedById: 'res-rossi-03',
		adminId: 'adm-giorgio-01',
		category: 'Fabbro',
		timeline: [
			{ id: 'rep-004-e1', kind: 'reported', authorId: 'res-rossi-03', at: '2026-05-05T11:00:00' }
		],
		messageTimeline: []
	},
	{
		id: 'rep-005',
		title: 'Lampadina fulminata pianerottolo secondo piano',
		description: 'La lampadina del pianerottolo di fronte all\'interno 5 è fulminata da ieri sera.',
		priority: 'bassa',
		propertyId: 'cnd-marconi-14',
		reportedById: 'res-bianchi-01',
		adminId: 'adm-giorgio-01',
		category: 'Elettrico',
		timeline: [
			{ id: 'rep-005-e1', kind: 'reported', authorId: 'res-bianchi-01', at: '2026-05-07T09:00:00' }
		],
		messageTimeline: [
			// message comes from the shared admin-residenct chat (mapped here)
			{ id: 'msg-res-001-dup', senderId: 'adm-giorgio-01', text: 'Grazie Marco, ho preso in carico la segnalazione. Chiamo subito Idroclima.', timestamp: '2026-05-01T09:15:00' }
		]
	}
];

export function getReportById(id: string): Report | undefined {
	return reports.find((r) => r.id === id);
}

export function getReportsByPropertyId(propertyId: string): Report[] {
	return reports.filter((r) => r.propertyId === propertyId);
}

// Helpers
export function firstReportEvent(report: Report): ReportEvent | undefined {
	const timeline = report.timeline;
	if (!timeline || timeline.length === 0) return undefined;
	return timeline.reduce((first, ev) => (new Date(ev.at) < new Date(first.at) ? ev : first));
}

export function lastReportEvent(report: Report): ReportEvent | undefined {
	const timeline = report.timeline;
	if (!timeline || timeline.length === 0) return undefined;
	return timeline.reduce((last, ev) => (new Date(ev.at) > new Date(last.at) ? ev : last));
}

export function inferReportStatus(report: Report): ReportStatus {
	const last = lastReportEvent(report);
	if (!last) return 'nuova';
	switch (last.kind) {
		case 'reported':
			return 'nuova';
		case 'acknowledged':
			return 'presa in carico';
		case 'resolved':
			return 'chiusa';
		default:
			return 'nuova';
	}
}

export function getReportCreatedAt(report: Report): string | undefined {
	const first = firstReportEvent(report);
	return first?.at;
}

export function getReportUpdatedAt(report: Report): string | undefined {
	const last = lastReportEvent(report);
	return last?.at;
}

// Actions
const STORAGE_KEY = 'svicom.reports';

function persistReports(): void {
	if (typeof window === 'undefined') return;
	const baseIds = new Set(['rep-001', 'rep-002', 'rep-003', 'rep-004', 'rep-005']);
	const dynamicReports = reports.filter((r) => !baseIds.has(r.id));
	localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicReports));
}

export function addReportEvent(reportId: string, event: Omit<ReportEvent, 'id' | 'at'>): void {
	const report = getReportById(reportId);
	if (!report) return;

	if (!report.timeline) report.timeline = [];

	const newEvent: ReportEvent = {
		...event,
		id: `rep-${reportId.split('-').pop()}-e${report.timeline.length + 1}`,
		at: new Date().toISOString()
	};

	report.timeline.push(newEvent);
	persistReports();
}

export function acknowledgeReport(reportId: string, authorId: string): void {
	addReportEvent(reportId, { kind: 'acknowledged', authorId });
}

export function resolveReport(reportId: string, authorId: string): void {
	addReportEvent(reportId, { kind: 'resolved', authorId });
}