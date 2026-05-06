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
		participantIds: ['adm-svicom-01, adm-svicom-02'],
	},
];

export function getMeetingById(id: string): Meeting | undefined {
	return meetings.find((m) => m.id === id);
}

export function getMeetingsByPropertyId(propertyId: string): Meeting[] {
	return meetings.filter((m) => m.propertyId === propertyId);
}
