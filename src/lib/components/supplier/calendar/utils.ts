import { bookings, inferBookingStatus, lastBookingEvent } from '$lib/data/ticket/booking';
import { supplierTasks } from '$lib/data/embeds/supplierTasks';
import { services } from '$lib/data/services';
import type { CalendarEvent, EventType, CalendarView } from './types';

export function getSupplierEvents(supplierId: string): CalendarEvent[] {
	const events: CalendarEvent[] = [];

	// 1. Map supplierTasks (sopralluogo, intervento)
	const filteredTasks = supplierTasks.filter((t) => t.supplierId === supplierId);
	for (const task of filteredTasks) {
		const start = new Date(`${task.date}T${task.startTime}`);
		const end = new Date(`${task.date}T${task.endTime}`);
		events.push({
			id: task.id,
			title: task.title,
			start,
			end,
			type: task.type as EventType,
			location: task.location,
			propertyId: task.propertyId,
			ticketId: task.ticketId,
			bookingId: task.bookingId,
			raw: task
		});
	}

	// 2. Map bookings (servizio)
	// We need to find services belonging to this supplier first
	const supplierServiceIds = services.filter((s) => s.supplierId === supplierId).map((s) => s.id);
	const filteredBookings = bookings.filter((b) => supplierServiceIds.includes(b.serviceId));

	for (const b of filteredBookings) {
		const lastEvent = lastBookingEvent(b);
		const slot = b.slot || (lastEvent?.kind === 'timeslot_updated' || lastEvent?.kind === 'request_created' ? lastEvent.slot : undefined);
		
		if (slot) {
			const service = services.find(s => s.id === b.serviceId);
			events.push({
				id: b.id,
				title: service?.name || 'Servizio',
				start: new Date(slot.start),
				end: new Date(slot.end),
				type: 'servizio',
				location: 'Presso Residente',
				bookingId: b.id,
				raw: b
			});
		}
	}

	return events;
}

export function formatTime(date: Date): string {
	return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function getDaysInMonth(year: number, month: number): Date[] {
	const date = new Date(year, month, 1);
	const days: Date[] = [];
	while (date.getMonth() === month) {
		days.push(new Date(date));
		date.setDate(date.getDate() + 1);
	}
	return days;
}

export function getWeekDays(date: Date): Date[] {
	const start = new Date(date);
	start.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Monday
	const days: Date[] = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		days.push(d);
	}
	return days;
}

export function navigate(date: Date, view: CalendarView, direction: number): Date {
	const next = new Date(date);
	if (view === 'day') next.setDate(next.getDate() + direction);
	else if (view === 'week') next.setDate(next.getDate() + direction * 7);
	else if (view === 'month') next.setMonth(next.getMonth() + direction);
	return next;
}

