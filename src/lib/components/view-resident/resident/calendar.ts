import type { Assembly } from '$lib/data/events/assemblies';
import type { supplierTask } from '$lib/data/embeds/supplierTasks';
import { getUserById } from '$lib/data/users';
import type { ResidentLocalCalendarEvent } from './local-calendar-events';

export type ResidentCalendarTone = 'blue' | 'amber' | 'emerald';
export type ResidentCalendarKind = 'assembly' | 'maintenance' | 'personal';
export type ResidentCalendarFilter = 'all' | 'assembly' | 'maintenance' | 'personal';

export interface ResidentCalendarEvent {
	id: string;
	kind: ResidentCalendarKind;
	tone: ResidentCalendarTone;
	title: string;
	date: string;
	startTime: string;
	endTime: string;
	location: string;
	sourceLabel: string;
	supportLabel: string;
}

export interface ResidentCalendarFilterOption {
	value: ResidentCalendarFilter;
	label: string;
}

export const residentCalendarFilterOptions: ResidentCalendarFilterOption[] = [
	{ value: 'all', label: 'Tutti' },
	{ value: 'assembly', label: 'Assemblee' },
	{ value: 'maintenance', label: 'Manutenzioni' },
	{ value: 'personal', label: 'I tuoi eventi' }
];

export function buildResidentCalendarEvents(input: {
	assemblies: Assembly[];
	supplierTasks: supplierTask[];
	localEvents: ResidentLocalCalendarEvent[];
}): ResidentCalendarEvent[] {
	const assemblyEvents: ResidentCalendarEvent[] = input.assemblies.map((assembly) => ({
		id: assembly.id,
		kind: 'assembly',
		tone: 'blue',
		title: `Assemblea ${assembly.type}`,
		date: assembly.scheduledAt.split('T')[0] ?? '',
		startTime: assembly.scheduledAt.split('T')[1] ?? '',
		endTime: assembly.endTime ?? '',
		location: assembly.location,
		sourceLabel:
			assembly.status === 'pianificata' ? 'Assemblea in programma' : 'Assemblea svolta',
		supportLabel:
			assembly.status === 'pianificata'
				? `${assembly.agenda.length} punti all ordine del giorno`
				: assembly.minutes
					? `${assembly.minutes.resolutions.length} delibere verbalizzate`
					: 'Verbale in aggiornamento'
	}));

	const maintenanceEvents: ResidentCalendarEvent[] = input.supplierTasks.map((task) => ({
		id: task.id,
		kind: 'maintenance',
		tone: 'amber',
		title: task.title,
		date: task.date,
		startTime: task.startTime,
		endTime: task.endTime,
		location: task.location,
		sourceLabel:
			task.type === 'sopralluogo'
				? 'Sopralluogo tecnico'
				: task.type === 'intervento'
					? 'Intervento programmato'
					: 'Servizio condominiale',
		supportLabel: getUserById(task.supplierId)?.name ?? 'Fornitore incaricato'
	}));

	const personalEvents: ResidentCalendarEvent[] = input.localEvents.map((event) => ({
		id: event.id,
		kind: 'personal',
		tone: 'emerald',
		title: event.title,
		date: event.date,
		startTime: event.startTime,
		endTime: event.endTime,
		location: event.location ?? 'Promemoria personale',
		sourceLabel:
			event.type === 'appuntamento' ? 'Appuntamento personale' : 'Promemoria personale',
		supportLabel: 'Aggiunto dal tuo calendario'
	}));

	return [...assemblyEvents, ...maintenanceEvents, ...personalEvents].sort(
		(a, b) =>
			a.date.localeCompare(b.date) ||
			a.startTime.localeCompare(b.startTime) ||
			a.title.localeCompare(b.title)
	);
}

export function filterResidentCalendarEvents(
	events: ResidentCalendarEvent[],
	filter: ResidentCalendarFilter
): ResidentCalendarEvent[] {
	if (filter === 'all') {
		return events;
	}

	return events.filter((event) => {
		if (filter === 'assembly') return event.kind === 'assembly';
		if (filter === 'maintenance') return event.kind === 'maintenance';
		return event.kind === 'personal';
	});
}
