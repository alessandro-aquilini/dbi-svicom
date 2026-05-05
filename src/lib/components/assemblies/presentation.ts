import type { Assembly, AssemblyStatus, AssemblyType, Resolution, VoteOutcome } from '$lib/data/assemblies';

export const assemblyStatusLabels: Record<AssemblyStatus, string> = {
	pianificata: 'Pianificata',
	svolta: 'Svolta',
	annullata: 'Annullata'
};

export const assemblyTypeLabels: Record<AssemblyType, string> = {
	ordinaria: 'Assemblea ordinaria',
	straordinaria: 'Assemblea straordinaria'
};

export const resolutionOutcomeLabels: Record<VoteOutcome, string> = {
	approvata: 'Approvata',
	respinta: 'Respinta',
	rinviata: 'Rinviata'
};

export interface AssemblyMinutesHighlight {
	id: string;
	label: string;
	value: string;
	copy: string;
}

export interface AssemblyTranscriptPoint {
	id: string;
	title: string;
	copy: string;
}

export function normalizeAssemblyText(value: string): string {
	return value.replaceAll('\u00e2\u201a\u00ac', 'EUR ').replace(/\s{2,}/g, ' ').trim();
}

export function formatAssemblySchedule(value: string): string {
	return new Intl.DateTimeFormat('it-IT', {
		dateStyle: 'full',
		timeStyle: 'short'
	}).format(new Date(value));
}

export function formatAssemblyDate(value: string): string {
	return new Intl.DateTimeFormat('it-IT', {
		dateStyle: 'medium'
	}).format(new Date(value));
}

export function formatAssemblyTime(value: string): string {
	return new Intl.DateTimeFormat('it-IT', {
		timeStyle: 'short'
	}).format(new Date(value));
}

export function formatAssemblyTimeRange(scheduledAt: string, endTime?: string): string {
	const start = formatAssemblyTime(scheduledAt);
	return endTime ? `${start} - ${endTime}` : start;
}

export function getAssemblyCallHref(assemblyId: string): string {
	return `/resident/assemblies/${assemblyId}/call`;
}

export function getAssemblyVoteHref(assemblyId: string): string {
	return `/resident/assemblies/${assemblyId}/vote`;
}

export function getAssemblyCallPreviewUrl(assemblyId: string): string {
	return `https://rooms.svicomliving.it/session/${getAssemblySessionCode(assemblyId)}`;
}

export function getAssemblyVotePreviewUrl(assemblyId: string): string {
	return `https://vote.svicomliving.it/session/${getAssemblySessionCode(assemblyId)}`;
}

export function getAssemblyCalendarHref(assembly: Assembly, propertyName: string): string {
	const start = formatIcsDate(assembly.scheduledAt);
	const end = formatIcsDate(
		assembly.endTime
			? `${assembly.scheduledAt.slice(0, 11)}${assembly.endTime}`
			: new Date(new Date(assembly.scheduledAt).getTime() + 60 * 60 * 1000).toISOString()
	);
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Svicom Living Hub//Resident Assembly//IT',
		'BEGIN:VEVENT',
		`UID:${getAssemblySessionCode(assembly.id)}@svicomliving.it`,
		`DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
		`DTSTART:${start}`,
		`DTEND:${end}`,
		`SUMMARY:${escapeIcsText(`${assemblyTypeLabels[assembly.type]} - ${propertyName}`)}`,
		`LOCATION:${escapeIcsText(normalizeAssemblyText(assembly.location))}`,
		`DESCRIPTION:${escapeIcsText(assembly.agenda.map((item) => normalizeAssemblyText(item)).join(' | '))}`,
		'END:VEVENT',
		'END:VCALENDAR'
	].join('\r\n');

	return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines)}`;
}

export function getAssemblySessionCode(assemblyId: string): string {
	return assemblyId.replace(/[^a-z0-9]+/gi, '-').toUpperCase();
}

export function getAssemblySummaryCopy(assembly: Assembly): string {
	if (assembly.minutes) {
		return normalizeAssemblyText(assembly.minutes.text);
	}

	const firstAgendaPoint = normalizeAssemblyText(assembly.agenda[0] ?? 'i punti indicati in convocazione');
	return `Convocazione aperta per discutere ${firstAgendaPoint}.`;
}

export function getAssemblyMinutesHighlights(
	assembly: Assembly,
	unitsCount?: number
): AssemblyMinutesHighlight[] {
	if (!assembly.minutes) return [];

	const approvedResolutions = assembly.minutes.resolutions.filter(
		(resolution) => resolution.outcome === 'approvata'
	).length;
	const participationValue =
		typeof unitsCount === 'number' && unitsCount > 0
			? `${assembly.minutes.attendeesCount}/${unitsCount}`
			: `${assembly.minutes.attendeesCount}`;

	return [
		{
			id: `${assembly.id}-focus`,
			label: 'Focus',
			value: normalizeAssemblyText(assembly.agenda[0] ?? 'Verbale disponibile'),
			copy: normalizeAssemblyText(assembly.minutes.text)
		},
		{
			id: `${assembly.id}-attendance`,
			label: 'Presenti',
			value: participationValue,
			copy: `${assembly.minutes.millesimalPresent} millesimi registrati in assemblea`
		},
		{
			id: `${assembly.id}-resolutions`,
			label: 'Delibere approvate',
			value: `${approvedResolutions}`,
			copy: `${assembly.minutes.resolutions.length} delibere totali nel verbale pubblicato`
		}
	];
}

export function getAssemblyTranscriptPoints(assembly: Assembly): AssemblyTranscriptPoint[] {
	if (!assembly.minutes) return [];

	const points: AssemblyTranscriptPoint[] = [
		{
			id: `${assembly.id}-opening`,
			title: 'Apertura lavori',
			copy: normalizeAssemblyText(assembly.minutes.text)
		}
	];

	for (const [index, agendaItem] of assembly.agenda.entries()) {
		points.push({
			id: `${assembly.id}-agenda-${index}`,
			title: `Punto ${index + 1}`,
			copy: normalizeAssemblyText(agendaItem)
		});
	}

	for (const [index, resolution] of assembly.minutes.resolutions.entries()) {
		points.push({
			id: `${assembly.id}-resolution-${index}`,
			title: `Delibera ${index + 1}`,
			copy: `${normalizeAssemblyText(resolution.title)}. ${getResolutionVoteSummary(resolution)}${resolution.notes ? ` ${normalizeAssemblyText(resolution.notes)}` : ''}`
		});
	}

	return points;
}

export function getResolutionVoteSummary(resolution: Resolution): string {
	return `${resolutionOutcomeLabels[resolution.outcome]} con ${resolution.millesimalFor} favorevoli, ${resolution.millesimalAgainst} contrari e ${resolution.millesimalAbstain} astenuti.`;
}

function formatIcsDate(value: string): string {
	const normalized = value.includes('T') ? value : `${value}T00:00:00`;
	return new Date(normalized).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string): string {
	return value.replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n');
}
