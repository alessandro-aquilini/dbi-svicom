import { reports, getReportById, type Report, type ReportPriority } from '$lib/data/ticket/reports';
import { getPropertyById } from '$lib/data/properties';

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

export interface ResidentTicketAiDraft {
	title: string;
	category: string;
	priority: ReportPriority;
	description: string;
	dynamicAnswers: Record<string, string>;
}

let residentLocalTickets: Report[] = [];
let residentLocalTicketMeta: ResidentTicketPresentationMeta[] = [];

export const residentTicketPriorityOptions: ResidentTicketOption[] = [
	{ value: 'bassa', label: 'Bassa', copy: 'Per richieste informative o non urgenti.' },
	{ value: 'media', label: 'Media', copy: 'Per problemi da gestire nel breve periodo.' },
	{ value: 'alta', label: 'Alta', copy: 'Per malfunzionamenti che impattano la quotidianita.' },
	{ value: 'critica', label: 'Critica', copy: 'Per situazioni bloccanti o da presidiare subito.' }
];

const residentTicketCategoryCopyByValue: Record<string, string> = {
	Idraulica: 'Perdite, acqua calda, scarichi, rubinetterie e impianti idrici comuni.',
	Elettrico: 'Luci, citofoni, alimentazione, quadri e impianti elettrici comuni.',
	Fabbro: 'Porte, portoni, cancelli, serrature e chiusure da regolare o riparare.'
};

const residentTicketDynamicFields: ResidentTicketDynamicFieldDefinition[] = [
	{
		id: 'idraulica-area',
		label: 'Area interessata',
		copy: 'Indica impianto, scala o locale coinvolto.',
		placeholder: 'Es. locale caldaia, scala B, bagno di servizio piano terra',
		input: 'text',
		categories: ['Idraulica']
	},
	{
		id: 'idraulica-pattern',
		label: 'Quando si presenta',
		copy: 'Descrivi frequenza, fascia oraria o condizione in cui il problema si manifesta.',
		placeholder: 'Es. perdita continua dalla mattina, acqua calda assente dalle 7',
		input: 'textarea',
		categories: ['Idraulica']
	},
	{
		id: 'elettrico-area',
		label: 'Area interessata',
		copy: 'Specifica scala, piano o dispositivo coinvolto.',
		placeholder: 'Es. pianerottolo secondo piano, videocitofono ingresso, scala B',
		input: 'text',
		categories: ['Elettrico']
	},
	{
		id: 'elettrico-pattern',
		label: 'Come si manifesta',
		copy: 'Descrivi se il problema e continuo, intermittente o legato a un momento preciso.',
		placeholder: 'Es. lampadina spenta da ieri sera, citofono senza audio in modo continuo',
		input: 'textarea',
		categories: ['Elettrico']
	},
	{
		id: 'fabbro-area',
		label: 'Punto critico',
		copy: 'Specifica porta, cancello, serratura o area coinvolta.',
		placeholder: 'Es. portone ingresso principale, cancelletto cortile, porta box',
		input: 'text',
		categories: ['Fabbro']
	},
	{
		id: 'fabbro-accesso',
		label: 'Condizione riscontrata',
		copy: 'Descrivi cosa succede quando si apre o si chiude.',
		placeholder: 'Es. rimane socchiuso, chiude con fatica, serratura bloccata in alcuni momenti',
		input: 'textarea',
		categories: ['Fabbro']
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

function getResidentLocalTicketStorage(): Report[] {
	return residentLocalTickets;
}

function getResidentLocalTicketMetaStorage(): ResidentTicketPresentationMeta[] {
	return residentLocalTicketMeta;
}

function setResidentLocalTicketStorage(localTickets: Report[]) {
	residentLocalTickets = localTickets;
}

function setResidentLocalTicketMetaStorage(metaItems: ResidentTicketPresentationMeta[]) {
	residentLocalTicketMeta = metaItems;
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
	const property = getPropertyById(input.propertyId);
	const ticket: Report = {
		id: generateResidentLocalTicketId([...reports, ...localTickets]),
		title: input.title.trim(),
		description: input.description.trim(),
		priority: input.priority,
		reportedById: input.reportedById,
		propertyId: input.propertyId,
		adminId: property?.adminId ?? 'adm-giorgio-01',
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

export function buildResidentTicketAiDraft(prompt: string): ResidentTicketAiDraft {
	const normalizedPrompt = prompt.trim();
	const lowerPrompt = normalizedPrompt.toLowerCase();
	const category = inferResidentTicketCategory(lowerPrompt);
	const area = inferResidentTicketArea(normalizedPrompt, category);
	const priority = inferResidentTicketPriority(lowerPrompt);

	return {
		title: inferResidentTicketTitle(normalizedPrompt, category, area),
		category,
		priority,
		description: buildResidentTicketDescription(normalizedPrompt, area),
		dynamicAnswers: buildResidentTicketDynamicAnswers(category, normalizedPrompt, lowerPrompt, area)
	};
}

function inferResidentTicketCategory(lowerPrompt: string): string {
	if (
		lowerPrompt.includes('perdita') ||
		lowerPrompt.includes('acqua') ||
		lowerPrompt.includes('caldaia') ||
		lowerPrompt.includes('scarico') ||
		lowerPrompt.includes('rubinetto')
	) {
		return 'Idraulica';
	}

	if (
		lowerPrompt.includes('lampadina') ||
		lowerPrompt.includes('luce') ||
		lowerPrompt.includes('citofono') ||
		lowerPrompt.includes('videocitofono') ||
		lowerPrompt.includes('corrente') ||
		lowerPrompt.includes('quadro')
	) {
		return 'Elettrico';
	}

	if (
		lowerPrompt.includes('portone') ||
		lowerPrompt.includes('porta') ||
		lowerPrompt.includes('cancello') ||
		lowerPrompt.includes('serratura') ||
		lowerPrompt.includes('chiudiporta')
	) {
		return 'Fabbro';
	}

	return residentTicketCategoryOptions[0]?.value ?? 'Idraulica';
}

function inferResidentTicketPriority(lowerPrompt: string): ReportPriority {
	if (
		lowerPrompt.includes('urgente') ||
		lowerPrompt.includes('allag') ||
		lowerPrompt.includes('grossa perdita') ||
		lowerPrompt.includes('bloccato') ||
		lowerPrompt.includes('non si apre') ||
		lowerPrompt.includes('non chiude')
	) {
		return 'critica';
	}

	if (
		lowerPrompt.includes('non funziona') ||
		lowerPrompt.includes('guasto') ||
		lowerPrompt.includes('manca') ||
		lowerPrompt.includes('perdita') ||
		lowerPrompt.includes('spento')
	) {
		return 'alta';
	}

	if (lowerPrompt.includes('verificare') || lowerPrompt.includes('controllare')) {
		return 'media';
	}

	return 'media';
}

function inferResidentTicketArea(prompt: string, category: string): string {
	const areaPatterns = [
		/(locale [a-zà-ù0-9 ]+)/i,
		/(scala [a-z0-9]+)/i,
		/(pianerottolo [a-zà-ù0-9 ]+)/i,
		/(secondo piano|primo piano|terzo piano|piano terra)/i,
		/(portone [a-zà-ù0-9 ]+)/i,
		/(videocitofono [a-zà-ù0-9 ]+)/i,
		/(ingresso principale)/i
	];

	for (const pattern of areaPatterns) {
		const match = prompt.match(pattern);
		if (match?.[1]) return sanitizeSentence(match[1]);
		if (match?.[0]) return sanitizeSentence(match[0]);
	}

	if (category === 'Idraulica') return 'Area impianto idrico';
	if (category === 'Elettrico') return 'Area impianto elettrico';
	return 'Accesso o chiusura comune';
}

function inferResidentTicketTitle(prompt: string, category: string, area: string): string {
	if (category === 'Idraulica') {
		if (prompt.toLowerCase().includes('acqua calda')) return `Mancanza acqua calda in ${area}`;
		if (prompt.toLowerCase().includes('perdita')) return `Perdita d'acqua in ${area}`;
		return `Problema idraulico in ${area}`;
	}

	if (category === 'Elettrico') {
		if (prompt.toLowerCase().includes('lampadina') || prompt.toLowerCase().includes('luce')) {
			return `Illuminazione non funzionante in ${area}`;
		}
		if (prompt.toLowerCase().includes('citofono')) return `Guasto citofono in ${area}`;
		return `Problema elettrico in ${area}`;
	}

	if (prompt.toLowerCase().includes('serratura')) return `Serratura da verificare in ${area}`;
	if (prompt.toLowerCase().includes('cancello')) return `Cancello da regolare in ${area}`;
	return `Porta o portone da sistemare in ${area}`;
}

function buildResidentTicketDescription(prompt: string, area: string): string {
	const text = sanitizeSentence(prompt);
	return text.includes(area) ? text : `${text} Area indicata: ${area}.`;
}

function buildResidentTicketDynamicAnswers(
	category: string,
	prompt: string,
	lowerPrompt: string,
	area: string
): Record<string, string> {
	if (category === 'Idraulica') {
		return {
			'idraulica-area': area,
			'idraulica-pattern': inferPatternText(
				lowerPrompt,
				prompt,
				'Il problema si presenta in modo continuativo e richiede verifica del punto di perdita o del servizio acqua.'
			)
		};
	}

	if (category === 'Elettrico') {
		return {
			'elettrico-area': area,
			'elettrico-pattern': inferPatternText(
				lowerPrompt,
				prompt,
				'Il malfunzionamento e visibile durante l uso ordinario dell area o del dispositivo segnalato.'
			)
		};
	}

	return {
		'fabbro-area': area,
		'fabbro-accesso': inferPatternText(
			lowerPrompt,
			prompt,
			'La chiusura o l apertura del varco non risultano regolari e serve una verifica sul punto indicato.'
		)
	};
}

function inferPatternText(lowerPrompt: string, prompt: string, fallback: string): string {
	if (lowerPrompt.includes('da ieri')) return `${sanitizeSentence(prompt)} Situazione presente da ieri.`;
	if (lowerPrompt.includes('da stamattina')) return `${sanitizeSentence(prompt)} Situazione presente da stamattina.`;
	if (lowerPrompt.includes('intermitten')) return `${sanitizeSentence(prompt)} Il problema si presenta in modo intermittente.`;
	return fallback;
}

function sanitizeSentence(value: string): string {
	return value.trim().replace(/\s+/g, ' ').replace(/[.]+$/, '');
}
