export type EventTone = 'blue' | 'amber' | 'emerald';
export type EventAudience = 'admin' | 'supplier' | 'resident';

export type EventTone = 'blue' | 'amber' | 'emerald';
export type EventAudience = 'admin' | 'supplier' | 'resident';

export interface SvicomEvent {
	id: string;
	title: string;
	date: string;
	startTime: string;
	endTime: string;
	location: string;
	group: string;
	participantIds: string[]; // References User.id
	tone: EventTone;
	audiences: EventAudience[];
	propertyId?: string;
	ticketId?: string; // Optional reference to a ticket
}

export const events: SvicomEvent[] = [
	{
		id: 'evt-riunione-team',
		title: 'Riunione team interna',
		date: '2026-04-02',
		startTime: '09:30',
		endTime: '10:00',
		location: 'HQ Svicom',
		group: 'Team amministrazione',
		participantIds: ['adm-svicom-01'],
		tone: 'blue',
		audiences: ['admin']
	},
	{
		id: 'evt-manutenzione-ascensore-carducci',
		title: 'Manutenzione ascensore',
		date: '2026-04-15',
		startTime: '15:30',
		endTime: '16:00',
		location: 'Via Carducci 21',
		group: 'Manutenzione impianti',
		participantIds: ['frn-secure-entry', 'adm-svicom-01'],
		tone: 'amber',
		audiences: ['admin', 'supplier', 'resident'],
		propertyId: 'cnd-carducci-21',
		ticketId: 'TCK-476'
	},
	{
		id: 'evt-assemblea-ordinaria-marconi',
		title: 'Assemblea ordinaria',
		date: '2026-04-22',
		startTime: '18:30',
		endTime: '20:30',
		location: 'Via Marconi 14 - Sala riunioni',
		group: 'Assemblea condominiale',
		participantIds: ['res-bianchi-01', 'adm-svicom-01'],
		tone: 'blue',
		audiences: ['resident', 'admin'],
		propertyId: 'cnd-marconi-14'
	}
];

export function getEventById(id: string): SvicomEvent | undefined {
	return events.find((e) => e.id === id);
}

export function getEventsByPropertyId(propertyId: string): SvicomEvent[] {
	return events.filter((e) => e.propertyId === propertyId);
}

export function getEventsByAudience(audience: EventAudience): SvicomEvent[] {
	return events.filter((e) => e.audiences.includes(audience));
}
