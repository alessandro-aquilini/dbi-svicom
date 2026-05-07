import { browser } from '$app/environment';
import { reports, getReportById, type Report, type ReportPriority } from '$lib/data/ticket/reports';

const RESIDENT_LOCAL_TICKETS_STORAGE_KEY = 'svicom_resident_local_tickets';
const RESIDENT_LOCAL_TICKET_META_STORAGE_KEY = 'svicom_resident_local_ticket_meta';

export interface ResidentTicketDraftInput {
    title: string;
    description: string;
    priority: ReportPriority;
    category: string;
    reportedById: string;
    propertyId: string;
}

export interface ResidentTicketOption {
	value: string;
	label: string;
	copy: string;
}

export interface ResidentTicketAttachmentSummary {
	id: string;
	name: string;
	sizeLabel: string;
	typeLabel: string;
}

export interface ResidentTicketDynamicFieldDefinition {
	id: string;
	label: string;
	copy: string;
	placeholder: string;
	input: 'text' | 'textarea';
	categories: string[];
}

export interface ResidentTicketFieldAnswer {
	id: string;
	label: string;
	value: string;
}

export interface ResidentTicketPresentationMeta {
    ticketId: string;
    submittedAt: string;
    attachments: ResidentTicketAttachmentSummary[];
    fieldAnswers: ResidentTicketFieldAnswer[];
}

export interface ResidentTicketDraftPresentationInput {
	attachments?: ResidentTicketAttachmentSummary[];
	fieldAnswers?: ResidentTicketFieldAnswer[];
}

export const residentTicketPriorityOptions: ResidentTicketOption[] = [
	{ value: 'bassa', label: 'Bassa', copy: 'Per richieste informative o non urgenti.' },
	{ value: 'media', label: 'Media', copy: 'Per problemi da gestire nel breve periodo.' },
	{ value: 'alta', label: 'Alta', copy: 'Per malfunzionamenti che impattano la quotidianita.' },
	{ value: 'critica', label: 'Critica', copy: 'Per situazioni bloccanti o da presidiare subito.' }
];

const residentTicketCategoryCopyByValue: Record<string, string> = {
	impianti: 'Ascensore, acqua, contatori, energia e impianti comuni.',
	sicurezza: 'Accessi, cancelli, porte e situazioni da verificare rapidamente.'
};

const residentTicketDynamicFields: ResidentTicketDynamicFieldDefinition[] = [
	{
		id: 'impianti-area',
		label: 'Area interessata',
		copy: 'Indica impianto, scala o locale coinvolto.',
		placeholder: 'Es. ascensore scala B, locale contatori, citofono ingresso',
		input: 'text',
		categories: ['impianti']
	},
	{
		id: 'impianti-pattern',
		label: 'Quando si presenta',
		copy: 'Descrivi frequenza, fascia oraria o condizione in cui il problema si manifesta.',
		placeholder: 'Es. a intermittenza dalle 18, soprattutto al primo utilizzo del mattino',
		input: 'textarea',
		categories: ['impianti']
	},
	{
		id: 'sicurezza-varco',
		label: 'Varco o punto critico',
		copy: 'Specifica accesso, scala o area comune coinvolta.',
		placeholder: 'Es. portone via Marconi, corsello box, scala B',
		input: 'text',
		categories: ['sicurezza']
	},
	{
		id: 'sicurezza-accesso',
		label: 'Condizione di accesso',
		copy: 'Segnala se il tecnico trova accesso libero o se serve coordinamento.',
		placeholder: 'Es. accesso libero di giorno, serve avviso al custode',
		input: 'textarea',
		categories: ['sicurezza']
	}
];

export const residentTicketCategoryOptions: ResidentTicketOption[] = [
	...new Set(reports.map((r) => r.category))
]
	.sort((left, right) => left.localeCompare(right))
	.map((category) => ({
		value: category,
		label: category.charAt(0).toUpperCase() + category.slice(1),
		copy: residentTicketCategoryCopyByValue[category] ?? 'Categoria attualmente presente nel catalogo report.'
	}));

function isTicketPriority(value: string): value is ReportPriority {
	return residentTicketPriorityOptions.some((option) => option.value === value);
}

function parseResidentLocalTickets(rawValue: string | null): Report[] {
	if (!rawValue) return [];

	try {
		const parsed = JSON.parse(rawValue);
		if (!Array.isArray(parsed)) return [];

		return parsed.filter((ticket): ticket is Report => {
			return (
				typeof ticket?.id === 'string' &&
				typeof ticket?.title === 'string' &&
				typeof ticket?.description === 'string' &&
				typeof ticket?.priority === 'string' &&
				typeof ticket?.reportedById === 'string' &&
				typeof ticket?.propertyId === 'string' &&
				typeof ticket?.category === 'string' &&
				Array.isArray(ticket?.statusHistory)
			);
		});
	} catch {
		return [];
	}
}

function parseResidentLocalTicketMeta(rawValue: string | null): ResidentTicketPresentationMeta[] {
	if (!rawValue) return [];

	try {
		const parsed = JSON.parse(rawValue);
		if (!Array.isArray(parsed)) return [];

		return parsed.filter((item): item is ResidentTicketPresentationMeta => {
			return (
				typeof item?.ticketId === 'string' &&
				typeof item?.submittedAt === 'string' &&
				Array.isArray(item?.attachments) &&
				Array.isArray(item?.fieldAnswers)
			);
		});
	} catch {
		return [];
	}
}

function getResidentLocalTicketStorage(): Report[] {
	if (!browser) return [];

	return parseResidentLocalTickets(localStorage.getItem(RESIDENT_LOCAL_TICKETS_STORAGE_KEY));
}

function getResidentLocalTicketMetaStorage(): ResidentTicketPresentationMeta[] {
	if (!browser) return [];

	return parseResidentLocalTicketMeta(localStorage.getItem(RESIDENT_LOCAL_TICKET_META_STORAGE_KEY));
}

function setResidentLocalTicketStorage(localTickets: Report[]) {
	if (!browser) return;

	localStorage.setItem(RESIDENT_LOCAL_TICKETS_STORAGE_KEY, JSON.stringify(localTickets));
}

function setResidentLocalTicketMetaStorage(metaItems: ResidentTicketPresentationMeta[]) {
	if (!browser) return;

	localStorage.setItem(RESIDENT_LOCAL_TICKET_META_STORAGE_KEY, JSON.stringify(metaItems));
}

function generateResidentLocalTicketId(existingTickets: Report[]): string {
	const maxId = existingTickets.reduce((currentMax, ticket) => {
		const match = /^rep-(\d+)$/.exec(ticket.id);
		return match ? Math.max(currentMax, Number(match[1])) : currentMax;
	}, 1000);

	return `rep-${String(maxId + 1).padStart(3, '0')}`;
}

export function getResidentVisibleTicketsByCreatorId(creatorId: string | undefined): Report[] {
	if (!creatorId) return [];

	return [
		...reports.filter((r) => r.reportedById === creatorId),
		...getResidentLocalTicketStorage().filter((r) => r.reportedById === creatorId)
	];
}

export function getResidentVisibleTicketById(id: string): Report | undefined {
	return getResidentLocalTicketStorage().find((ticket) => ticket.id === id) ?? getReportById(id);
}

export function createResidentLocalTicket(input: ResidentTicketDraftInput): Report {
	const localTickets = getResidentLocalTicketStorage();
	const now = new Date().toISOString();
	const ticket: Report = {
		id: generateResidentLocalTicketId([...reports, ...localTickets]),
		title: input.title.trim(),
		description: input.description.trim(),
		priority: input.priority,
		reportedById: input.reportedById,
		propertyId: input.propertyId,
		category: input.category,
		status: 'nuova',
		createdAt: now,
		updatedAt: now,
		statusHistory: [
			{ status: 'nuova', at: now }
		]
	};

	setResidentLocalTicketStorage([ticket, ...localTickets]);
	return ticket;
}

export function createResidentLocalTicketWithPresentation(
	input: ResidentTicketDraftInput,
	presentation?: ResidentTicketDraftPresentationInput
): Report {
	const ticket = createResidentLocalTicket(input);

	if (presentation?.attachments?.length || presentation?.fieldAnswers?.length) {
		const metaItems = getResidentLocalTicketMetaStorage().filter((item) => item.ticketId !== ticket.id);
		const meta: ResidentTicketPresentationMeta = {
			ticketId: ticket.id,
			submittedAt: ticket.statusHistory[0]?.at ?? new Date().toISOString(),
			attachments: presentation.attachments ?? [],
			fieldAnswers: presentation.fieldAnswers ?? []
		};

		setResidentLocalTicketMetaStorage([meta, ...metaItems]);
	}

	return ticket;
}

export function getResidentTicketPresentationMetaById(
	ticketId: string
): ResidentTicketPresentationMeta | undefined {
	return getResidentLocalTicketMetaStorage().find((item) => item.ticketId === ticketId);
}

export function getResidentTicketCategoryOption(value: string | undefined): ResidentTicketOption | undefined {
	return residentTicketCategoryOptions.find((option) => option.value === value);
}

export function getResidentTicketPriorityOption(value: string | undefined): ResidentTicketOption | undefined {
	return residentTicketPriorityOptions.find((option) => option.value === value);
}

export function sanitizeResidentTicketPriority(value: string | undefined): ReportPriority {
	return value && isTicketPriority(value) ? value : 'media';
}

export function getResidentTicketDynamicFields(
	category: string | undefined
): ResidentTicketDynamicFieldDefinition[] {
	if (!category) return [];
	return residentTicketDynamicFields.filter((field) => field.categories.includes(category));
}

export function buildResidentTicketAttachmentSummary(
	files: ArrayLike<Pick<File, 'name' | 'size' | 'type'>>
): ResidentTicketAttachmentSummary[] {
	return Array.from(files).map((file, index) => ({
		id: `attachment-${index + 1}-${file.name}`,
		name: file.name,
		sizeLabel: formatResidentTicketAttachmentSize(file.size),
		typeLabel: file.type.startsWith('image/') ? 'Foto' : 'Allegato'
	}));
}

function formatResidentTicketAttachmentSize(size: number): string {
	if (size >= 1024 * 1024) {
		return `${(size / (1024 * 1024)).toFixed(1)} MB`;
	}

	if (size >= 1024) {
		return `${Math.round(size / 1024)} KB`;
	}

	return `${size} B`;
}
