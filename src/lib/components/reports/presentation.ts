import type { Report, ReportStatus } from '$lib/data/ticket/reports';
import {
	inferReportStatus,
	getReportCreatedAt,
	getReportUpdatedAt,
	reports
} from '$lib/data/ticket/reports';
import {
	getCurrentStatus as getOperationalTicketStatus,
	tickets,
	type Ticket,
	type TicketEvent,
	getCurrentSupplier
} from '$lib/data/ticket/tickets';
import { getUserById } from '$lib/data/users';

export const ticketStatusLabels: Record<string, string> = {
	nuova: 'Segnalazione inviata',
	presa_in_carico: 'In presa in carico',
	completata: 'Intervento completato',
	opened: 'Pratica aperta',
	estimating: 'In preventivazione',
	approved: 'Preventivo approvato',
	in_progress: 'Intervento in corso',
	paid: 'Pagamento registrato',
	closed: 'Pratica chiusa'
};

export const ticketPriorityLabels: Record<string, string> = {
	bassa: 'Bassa',
	media: 'Media',
	alta: 'Alta',
	critica: 'Critica'
};

export const ticketProgressValues: Record<string, number> = {
	nuova: 16,
	presa_in_carico: 60,
	completata: 100,
	opened: 12,
	estimating: 32,
	approved: 52,
	in_progress: 78,
	paid: 100,
	closed: 100
};

export interface ReportOperationalContext {
	ticket: Ticket;
	status: string;
	supplierLabel: string;
}

export interface ReportTimelineEvent {
	id: string;
	at: string;
	actorId?: string;
	toStatus?: string;
	note?: string;
	label?: string;
}

export function getCurrentStatus(report: Report): ReportStatus {
	return inferReportStatus(report);
}

export function isTicketStatus(value: string | undefined): boolean {
	return Boolean(value && value in ticketStatusLabels);
}

export function formatTicketDate(value: string | undefined): string {
	if (!value) return 'Data non disponibile';

	return new Intl.DateTimeFormat('it-IT', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(new Date(value));
}

export function getLinkedOperationalTicket(report: Report): Ticket | undefined {
	const reportReference = report.id.replace('rep-', 'REP-').toUpperCase();

	return tickets.find((ticket) => {
		if (ticket.propertyId !== report.propertyId) return false;
		const searchableText = `${ticket.title} ${ticket.description}`.toUpperCase();
		return searchableText.includes(reportReference);
	});
}

export function getReportOperationalContext(report: Report): ReportOperationalContext | undefined {
	const ticket = getLinkedOperationalTicket(report);
	if (!ticket) return undefined;

	return {
		ticket,
		status: getOperationalTicketStatus(ticket),
			supplierLabel: getCurrentSupplier(ticket)
				? (getUserById(getCurrentSupplier(ticket)!)?.name ?? 'Fornitore assegnato')
				: 'Da assegnare'
	};
}

export function buildOperationalTimelineEvents(ticket: Ticket): ReportTimelineEvent[] {
	return ticket.eventTimeline.map((event) => {
		// map new kinds into the report timeline representation
		if (event.kind === 'reportCompletion' || event.kind === 'validateAndClose' || event.kind === 'archiveTicket') {
			const toStatus = event.kind === 'reportCompletion' ? 'completed' : 'closed';
			return {
				id: event.id,
				at: event.at,
				actorId: getCurrentSupplier(ticket) ?? ticket.adminId,
				toStatus,
				label: ticketStatusLabels[toStatus]
			};
		}

		if (event.kind === 'createTicket') {
			return {
				id: event.id,
				at: event.at,
				actorId: ticket.adminId,
				label: 'Pratica operativa aperta',
				note: 'L amministrazione ha trasformato la segnalazione in una pratica operativa.'
			};
		}

		if (event.kind === 'assignToSupplier') {
			return {
				id: event.id,
				at: event.at,
				actorId: event.supplierId,
				label: 'Fornitore assegnato',
				note: event.supplierId
					? `Assegnata a ${getUserById(event.supplierId)?.name ?? 'fornitore esterno'}.`
					: 'Fornitore assegnato alla pratica.'
			};
		}


		return buildOperationalNarrativeEvent(event);
	});
}

function buildOperationalNarrativeEvent(event: TicketEvent): ReportTimelineEvent {
	return {
		id: event.id,
		at: event.at,
		actorId: event.supplierId ?? undefined,
		label: 'Aggiornamento operativo',
		note: event.body ?? 'Nuovo aggiornamento registrato sulla pratica operativa.'
	};
}
