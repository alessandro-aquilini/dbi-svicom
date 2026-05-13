// Meeting between Svicom and Admins.

export interface Meeting {
	id: string;
	title: string;
	date: string;
	startTime: string;
	endTime: string;
	location: string;
	group: string;
	participantIds: string[]; // References User.id
	propertyId?: string;
}

export const meetings: Meeting[] = [
	{
		id: 'evt-riunione-team',
		title: 'Riunione team interna',
		date: '2026-04-02',
		startTime: '09:30',
		endTime: '10:00',
		location: 'HQ Svicom',
		group: 'Team amministrazione',
		participantIds: ['adm-svicom-01, adm-svicom-02']
	},
	{
		id: 'evt-sopralluogo-solari',
		title: 'Sopralluogo plafoniere scala B',
		date: '2026-05-14',
		startTime: '09:30',
		endTime: '10:30',
		location: 'Via Andrea Solari 30, Milano',
		group: 'Manutenzione',
		participantIds: ['adm-giorgio-01', 'frn-secure-entry'],
		propertyId: 'cnd-solari-30'
	},
	{
		id: 'evt-assemblea-europa',
		title: 'Assemblea ordinaria Corso Europa 7',
		date: '2026-05-15',
		startTime: '18:00',
		endTime: '19:30',
		location: 'Sala condominiale, Corso Europa 7',
		group: 'Condomini',
		participantIds: ['adm-giorgio-01', 'res-conti-02'],
		propertyId: 'cnd-europa-7'
	},
	{
		id: 'evt-preventivo-pacini',
		title: 'Scadenza preventivo revisione antincendio',
		date: '2026-05-17',
		startTime: '12:00',
		endTime: '12:30',
		location: 'Studio Svicom Milano',
		group: 'Pratiche',
		participantIds: ['adm-giorgio-01'],
		propertyId: 'cnd-pacini-44'
	},
	{
		id: 'evt-assemblea-marconi',
		title: 'Assemblea ordinaria Via Marconi 14',
		date: '2026-05-19',
		startTime: '18:30',
		endTime: '20:00',
		location: 'Sala condominiale, Via Marconi 14',
		group: 'Condomini',
		participantIds: ['adm-giorgio-01', 'res-bianchi-01', 'res-bellini-05'],
		propertyId: 'cnd-marconi-14'
	}
];

export function getUpcomingMeetings(options: {
	now?: Date;
	withinDays?: number;
	propertyId?: string | null;
} = {}): Meeting[] {
	const now = options.now ?? new Date();
	const horizon = new Date(now.getTime() + (options.withinDays ?? 7) * 86_400_000);
	return meetings
		.filter((m) => {
			if (options.propertyId && m.propertyId !== options.propertyId) return false;
			const at = new Date(`${m.date}T${m.startTime}:00`);
			return at >= now && at <= horizon;
		})
		.sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
}

export function getMeetingById(id: string): Meeting | undefined {
	return meetings.find((m) => m.id === id);
}

export function getMeetingsByPropertyId(propertyId: string): Meeting[] {
	return meetings.filter((m) => m.propertyId === propertyId);
}
