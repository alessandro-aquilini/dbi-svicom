import type { Report } from '$lib/data/ticket/reports';

export const ticketStatusLabels: Record<string, string> = {
	nuova: 'Segnalazione inviata',
	presa_in_carico: 'In presa in carico',
	completata: 'Intervento completato'
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
	completata: 100
};

export function isTicketStatus(value: string | undefined): boolean {
	return Boolean(value && value in ticketStatusLabels);
}

// Get the current status from a report's statusHistory
export function getCurrentStatus(report: Report): string | undefined {
	const history = report.statusHistory || [];
	return history.at(-1)?.status;
}

export function getLatestTicketStatus(statusHistory: Array<{ status: string }>): string | undefined {
	const latestStatus = statusHistory.at(-1)?.status;
	return isTicketStatus(latestStatus) ? latestStatus : undefined;
}

export function formatTicketDate(value: string | undefined): string {
	if (!value) return 'Data non disponibile';

	return new Intl.DateTimeFormat('it-IT', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(new Date(value));
}
