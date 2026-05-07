import type { Ticket, TicketEvent, TicketPriority, TicketStatus } from '$lib/data/ticket/tickets';

export const ticketStatusLabels: Record<TicketStatus, string> = {
	opened: 'Segnalazione inviata',
	estimating: 'In valutazione',
	approved: 'Intervento approvato',
	in_progress: 'Intervento in corso',
	completed: 'Intervento completato',
	paid: 'Intervento chiuso',
	closed: 'Chiusa'
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
	bassa: 'Bassa',
	media: 'Media',
	alta: 'Alta',
	critica: 'Critica'
};

export const ticketProgressValues: Record<TicketStatus, number> = {
	opened: 16,
	estimating: 32,
	approved: 52,
	in_progress: 72,
	completed: 90,
	paid: 100,
	closed: 100
};

export function isTicketStatus(value: string | undefined): value is TicketStatus {
	return Boolean(value && value in ticketStatusLabels);
}

export function getCurrentStatus(ticket: Ticket): TicketStatus | undefined {
	const timeline = ticket.eventTimeline || [];
	// Look for the last event that sets a status
	const statusEvents = timeline.filter(
		(e): e is TicketEvent & { toStatus: TicketStatus } =>
			(e.kind === 'status' || e.kind === 'created' || e.kind === 'closed') && !!e.toStatus
	);
	return statusEvents.at(-1)?.toStatus;
}

export function getLatestTicketStatus(
	statusHistory: Array<{ status: string }>
): TicketStatus | undefined {
	const latestStatus = statusHistory.at(-1)?.status;
	return isTicketStatus(latestStatus) ? latestStatus : (undefined as any);
}

export function formatTicketDate(value: string | undefined): string {
	if (!value) return 'Data non disponibile';

	return new Intl.DateTimeFormat('it-IT', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(new Date(value));
}
