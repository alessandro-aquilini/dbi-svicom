import type { Booking } from '$lib/data/ticket/booking';
import type { supplierTask } from '$lib/data/embeds/supplierTasks';

export type CalendarView = 'day' | 'week' | 'month';

export type EventType = 'sopralluogo' | 'intervento' | 'servizio';

export interface CalendarEvent {
	id: string;
	title: string;
	description?: string;
	start: Date;
	end: Date;
	type: EventType;
	location: string;
	propertyId?: string;
	ticketId?: string;
	bookingId?: string;
	raw?: Booking | supplierTask;
}

export const EVENT_COLORS: Record<EventType, string> = {
	sopralluogo: 'bg-amber-100 text-amber-700 border-amber-200',
	intervento: 'bg-emerald-100 text-emerald-700 border-emerald-200',
	servizio: 'bg-blue-100 text-blue-700 border-blue-200'
};

export const EVENT_COLORS_DOT: Record<EventType, string> = {
	sopralluogo: 'bg-amber-500',
	intervento: 'bg-emerald-500',
	servizio: 'bg-blue-500'
};
