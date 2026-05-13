export type ResidentLocalCalendarEventType = 'promemoria' | 'appuntamento';

export interface ResidentLocalCalendarEvent {
	id: string;
	residentId: string;
	propertyId: string;
	title: string;
	type: ResidentLocalCalendarEventType;
	date: string;
	startTime: string;
	endTime: string;
	location?: string;
	createdAt: string;
}

export interface CreateResidentLocalCalendarEventInput {
	residentId: string;
	propertyId: string;
	title: string;
	type: ResidentLocalCalendarEventType;
	date: string;
	startTime: string;
	endTime?: string;
	location?: string;
}

export interface ResidentLocalCalendarEventTypeOption {
	value: ResidentLocalCalendarEventType;
	label: string;
	copy: string;
}

const localResidentCalendarEvents: ResidentLocalCalendarEvent[] = [];
let localResidentCalendarEventCounter = 1;

export const residentLocalCalendarEventTypeOptions: ResidentLocalCalendarEventTypeOption[] = [
	{
		value: 'promemoria',
		label: 'Promemoria personale',
		copy: 'Per annotare una scadenza o un evento che vuoi tenere sott occhio.'
	},
	{
		value: 'appuntamento',
		label: 'Appuntamento personale',
		copy: 'Per segnare un appuntamento personale collegato alla vita condominiale.'
	}
];

function buildResidentLocalCalendarEventId() {
	const id = `res-cal-${localResidentCalendarEventCounter.toString().padStart(3, '0')}`;
	localResidentCalendarEventCounter += 1;
	return id;
}

export function getResidentLocalCalendarEventsByResidentId(
	residentId: string
): ResidentLocalCalendarEvent[] {
	return localResidentCalendarEvents
		.filter((event) => event.residentId === residentId)
		.sort(
			(a, b) =>
				a.date.localeCompare(b.date) ||
				a.startTime.localeCompare(b.startTime) ||
				a.createdAt.localeCompare(b.createdAt)
		);
}

export function createResidentLocalCalendarEvent(
	input: CreateResidentLocalCalendarEventInput
): ResidentLocalCalendarEvent {
	const event: ResidentLocalCalendarEvent = {
		id: buildResidentLocalCalendarEventId(),
		residentId: input.residentId,
		propertyId: input.propertyId,
		title: input.title.trim(),
		type: input.type,
		date: input.date,
		startTime: input.startTime,
		endTime: input.endTime?.trim() ?? '',
		location: input.location?.trim() || undefined,
		createdAt: new Date().toISOString()
	};

	localResidentCalendarEvents.unshift(event);

	return event;
}
