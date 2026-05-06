import type { Announcement } from '$lib/data/announcements';
import type { Assembly } from '$lib/data/events/assemblies';
import type { DocumentCategory, SvicomDocument } from '$lib/data/documents';
import type { Property } from '$lib/data/properties';
import type { User } from '$lib/data/users';

const documentStatusToneMap = {
	Essenziale: 'essential',
	Aggiornato: 'updated',
	'In valutazione': 'review'
} as const;

type DocumentStatusTone =
	| (typeof documentStatusToneMap)[keyof typeof documentStatusToneMap]
	| 'neutral';

export const documentTypeLabels: Record<SvicomDocument['type'], string> = {
	pdf: 'PDF',
	doc: 'DOC',
	image: 'IMG'
};

export const documentCategoryLabels: Record<DocumentCategory, string> = {
	verbale: 'Verbale',
	contratto: 'Contratto',
	compliance: 'Compliance',
	preventivo: 'Preventivo',
	regolamento: 'Regolamento',
	bilancio: 'Bilancio',
	lavori: 'Lavori'
};

export function getDocumentStatusTone(status: string): DocumentStatusTone {
	return documentStatusToneMap[status as keyof typeof documentStatusToneMap] ?? 'neutral';
}

export function formatDocumentDate(value: string): string {
	return new Intl.DateTimeFormat('it-IT', {
		dateStyle: 'medium'
	}).format(new Date(value));
}

export interface DocumentDemoCitation {
	id: string;
	label: string;
	text: string;
}

export interface DocumentDemoPrompt {
	id: string;
	question: string;
}

export interface DocumentDemoAnswer {
	text: string;
	citations: DocumentDemoCitation[];
}

export interface DocumentDemoContext {
	document: SvicomDocument;
	property: Property;
	uploader?: User;
	admin?: User;
	announcements: Announcement[];
	assemblies: Assembly[];
}

export function getDocumentDemoPrompts(context: DocumentDemoContext): DocumentDemoPrompt[] {
	const commonPrompts: DocumentDemoPrompt[] = [
		{ id: 'summary', question: 'Di cosa parla questo documento?' },
		{ id: 'resident', question: 'Cosa devo sapere come residente?' },
		{ id: 'uploader', question: 'Quando e stato aggiornato?' }
	];

	switch (context.document.category) {
		case 'regolamento':
			return [
				{ id: 'rules', question: 'Quali regole sono piu rilevanti nella vita quotidiana?' },
				...commonPrompts
			];
		case 'bilancio':
			return [
				{ id: 'costs', question: 'Quali spese vengono evidenziate?' },
				...commonPrompts
			];
		default:
			return [
				{ id: 'highlights', question: 'Quali sono i punti principali?' },
				...commonPrompts
			];
	}
}

export function answerDocumentPrompt(
	context: DocumentDemoContext,
	question: string
): DocumentDemoAnswer {
	const normalizedQuestion = question.toLowerCase();
	const documentCitation = buildDocumentCitation(context);
	const metadataCitation = buildMetadataCitation(context);
	const propertyCitation = buildPropertyCitation(context);
	const announcementCitation = buildAnnouncementCitation(context);
	const assemblyCitation = buildAssemblyCitation(
		context,
		normalizedQuestion.includes('verbali') || normalizedQuestion.includes('decisioni')
	);

	if (
		normalizedQuestion.includes('spesa') ||
		normalizedQuestion.includes('bilancio') ||
		normalizedQuestion.includes('costi')
	) {
		return {
			text: `Questo documento riassume le principali voci economiche del condominio: ${context.document.summary.toLowerCase()} Qui trovi quindi una sintesi delle spese evidenziate nel periodo considerato.`,
			citations: [documentCitation, metadataCitation]
		};
	}

	if (
		normalizedQuestion.includes('regole') ||
		normalizedQuestion.includes('animali') ||
		normalizedQuestion.includes('rumori') ||
		normalizedQuestion.includes('spazi comuni')
	) {
		return {
			text: `Dal documento emergono indicazioni su ${context.document.summary.toLowerCase()} I temi centrali riguardano l'uso degli spazi comuni, la convivenza e la gestione delle attivita straordinarie.`,
			citations: [documentCitation, metadataCitation]
		};
	}

	if (
		normalizedQuestion.includes('residente') ||
		normalizedQuestion.includes('sapere') ||
		normalizedQuestion.includes('punti principali')
	) {
		return {
			text: `Per te e utile concentrarti su questo punto: ${context.document.summary} Il documento e collegato a ${context.property.name}, quindi va letto come riferimento operativo per il tuo stabile.`,
			citations: [documentCitation, propertyCitation]
		};
	}

	if (
		normalizedQuestion.includes('chi ha caricato') ||
		normalizedQuestion.includes('quando') ||
		normalizedQuestion.includes('aggiornato')
	) {
		return {
			text: `Il documento e stato caricato da ${context.uploader?.name ?? 'Operatore Svicom'} per ${context.property.name}. L'ultimo aggiornamento registrato e del ${formatDocumentDate(context.document.updatedAt)}.`,
			citations: [metadataCitation]
		};
	}

	if (
		normalizedQuestion.includes('assemblee') ||
		normalizedQuestion.includes('decisioni') ||
		normalizedQuestion.includes('verbali')
	) {
		return {
			text: assemblyCitation
				? `Per questo stabile risultano riferimenti utili anche sul piano assembleare, che possono aiutare a interpretare meglio il documento.`
				: `Per questo documento non emergono riferimenti assembleari ulteriori rispetto alle informazioni principali gia disponibili.`,
			citations: assemblyCitation ? [assemblyCitation, propertyCitation] : [propertyCitation]
		};
	}

	if (
		normalizedQuestion.includes('comunicazioni') ||
		normalizedQuestion.includes('bacheca') ||
		normalizedQuestion.includes('avvisi')
	) {
		return {
			text: announcementCitation
				? `Per questo stabile risultano anche comunicazioni utili che possono aggiungere contesto alla lettura del documento.`
				: `Per questo documento non emergono comunicazioni aggiuntive oltre alle informazioni principali gia disponibili.`,
			citations: announcementCitation ? [announcementCitation, propertyCitation] : [propertyCitation]
		};
	}

	if (
		normalizedQuestion.includes('contesto') ||
		normalizedQuestion.includes('condominiale') ||
		normalizedQuestion.includes('stabile')
	) {
		return {
			text: `Il documento appartiene al condominio ${context.property.name}. Dal contesto disponibile emergono indirizzo, numero di unita e stato operativo dello stabile, elementi utili per inquadrare correttamente il contenuto.`,
			citations: [propertyCitation, metadataCitation]
		};
	}

	return {
		text: `Il documento "${context.document.title}" riguarda ${context.document.summary.toLowerCase()} Se vuoi, puoi approfondire uno degli aspetti principali con una delle domande rapide.`,
		citations: [documentCitation, metadataCitation, propertyCitation]
	};
}

function buildDocumentCitation(context: DocumentDemoContext): DocumentDemoCitation {
	return {
		id: `${context.document.id}-summary`,
		label: 'Documento',
		text: context.document.summary
	};
}

function buildMetadataCitation(context: DocumentDemoContext): DocumentDemoCitation {
	return {
		id: `${context.document.id}-metadata`,
		label: 'Metadati',
		text: `${context.document.title} (${documentCategoryLabels[context.document.category]}) caricato da ${context.uploader?.name ?? 'Operatore Svicom'} il ${formatDocumentDate(context.document.updatedAt)}. Stato documento: ${context.document.status}.`
	};
}

function buildPropertyCitation(context: DocumentDemoContext): DocumentDemoCitation {
	return {
		id: `${context.property.id}-property`,
		label: 'Condominio',
		text: `${context.property.name}, ${context.property.address.street}, ${context.property.units} unita. Stato ${context.property.status}, salute ${context.property.health}, ${context.property.activeTickets} pratiche attive.`
	};
}

function buildAnnouncementCitation(
	context: DocumentDemoContext
): DocumentDemoCitation | undefined {
	const latestAnnouncement = [...context.announcements].sort((left, right) =>
		right.createdAt.localeCompare(left.createdAt)
	)[0];
	if (!latestAnnouncement) return undefined;

	return {
		id: latestAnnouncement.id,
		label: 'Bacheca',
		text: `${latestAnnouncement.title}: ${latestAnnouncement.content}`
	};
}

function buildAssemblyCitation(
	context: DocumentDemoContext,
	preferPublishedMinutes = false
): DocumentDemoCitation | undefined {
	const sortedAssemblies = [...context.assemblies].sort((left, right) =>
		right.scheduledAt.localeCompare(left.scheduledAt)
	);
	const highlightedAssembly = preferPublishedMinutes
		? sortedAssemblies.find((assembly) => assembly.minutes) ?? sortedAssemblies[0]
		: sortedAssemblies[0];
	if (!highlightedAssembly) return undefined;

	const resolutionSummary = highlightedAssembly.minutes?.resolutions.length
		? ` Delibere: ${highlightedAssembly.minutes.resolutions
				.map((resolution) => resolution.title)
				.join('; ')}`
		: '';

	return {
		id: highlightedAssembly.id,
		label: 'Assemblea',
		text: `${highlightedAssembly.location} - ${highlightedAssembly.agenda.join('; ')}${resolutionSummary}`
	};
}
