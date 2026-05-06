export type TicketStatus = 'opened' | 'estimating' | 'approved' | 'in_progress' | 'completed' | 'paid';
export type TicketPriority = 'bassa' | 'media' | 'alta' | 'critica';

export interface StatusHistoryEntry {
	status: TicketStatus | string;
	at: string;
	authorId?: string; // Captures who triggered this status change (supplier vs admin)
}

export interface Ticket {
	id: string;
	title: string;
	description: string;
	priority: TicketPriority;
	creatorId: string; // References Admin or Resident User.id
	supplierId?: string; // References Supplier User.id
	propertyId: string; // The condomiunum. 
	category: string;
	statusHistory: StatusHistoryEntry[];
}

export const tickets: Ticket[] = [
	{
		id: 'TCK-482',
		title: 'Perdita ricorrente nel locale contatori',
		description: 'Tre segnalazioni sullo stesso punto in meno di due ore: va capito se è un nuovo guasto o un ritorno di un caso chiuso.',
		priority: 'alta',
		creatorId: 'adm-svicom-01',
		supplierId: 'frn-idroclima-nord',
		propertyId: 'cnd-marconi-14',
		category: 'impianti',
		statusHistory: [
			{ status: 'opened', at: '2024-04-29T09:14:00Z', authorId: 'adm-svicom-01' },
			{ status: 'estimating', at: '2024-04-29T09:14:00Z', authorId: 'frn-idroclima-nord' },
			{ status: 'approved', at: '2024-04-29T09:20:00Z', authorId: 'adm-svicom-01' },
			{ status: 'in_progress', at: '2024-04-29T11:00:00Z', authorId: 'frn-idroclima-nord' },
			{ status: 'completed', at: '2024-04-30T14:00:00Z', authorId: 'frn-idroclima-nord' },
			{ status: 'paid', at: '2024-04-30T14:30:00Z', authorId: 'adm-svicom-01' }
		]
	},
	{
		id: 'TCK-476',
		title: 'Ascensore scala B fermo a intermittenza',
		description: 'Il problema si presenta a ondate e richiede una squadra disponibile in finestra rapida.',
		priority: 'alta',
		creatorId: 'res-bianchi-01',
		supplierId: 'frn-secure-entry',
		propertyId: 'cnd-marconi-14',
		category: 'sicurezza',
		statusHistory: [
			{ status: 'opened', at: '2024-04-29T08:40:00Z', authorId: 'res-bianchi-01' },
			{ status: 'estimating', at: '2024-04-29T08:40:00Z', authorId: 'frn-secure-entry' }
		]
	},
	{
		id: 'TCK-501',
		title: 'Perdita dal condizionatore in sala',
		description: 'Il condizionatore in sala perde acqua copiosamente dallo split interno. Urge intervento tecnico in appartamento privato.',
		priority: 'alta',
		creatorId: 'res-conti-02',
		supplierId: 'frn-idroclima-nord',
		propertyId: 'cnd-marconi-14',
		category: 'impianti privati',
		statusHistory: [
			{ status: 'opened', at: '2024-05-02T10:15:00Z', authorId: 'res-conti-02' },
			{ status: 'estimating', at: '2024-05-02T11:00:00Z', authorId: 'frn-idroclima-nord' },
			{ status: 'approved', at: '2024-05-02T11:30:00Z', authorId: 'res-conti-02' },
			{ status: 'in_progress', at: '2024-05-03T09:00:00Z', authorId: 'frn-idroclima-nord' },
			{ status: 'completed', at: '2024-05-03T12:00:00Z', authorId: 'frn-idroclima-nord' }
		]
	},
	{
		id: 'TCK-510',
		title: 'Sostituzione rubinetto bagno',
		description: 'Richiesta uscita per preventivo e sostituzione del rubinetto del lavabo bagno patronale.',
		priority: 'bassa',
		creatorId: 'res-rossi-03',
		supplierId: 'frn-idroclima-nord',
		propertyId: 'cnd-marconi-14',
		category: 'impianti privati',
		statusHistory: [
			{ status: 'opened', at: '2024-05-04T08:00:00Z', authorId: 'res-rossi-03' },
			{ status: 'estimating', at: '2024-05-04T09:00:00Z', authorId: 'frn-idroclima-nord' }
		]
	}
];

export function getTicketById(id: string): Ticket | undefined {
	return tickets.find((t) => t.id === id);
}

export function getTicketsByPropertyId(propertyId: string): Ticket[] {
	return tickets.filter((t) => t.propertyId === propertyId);
}

export function getTicketsBySupplierId(supplierId: string): Ticket[] {
	return tickets.filter((t) => t.supplierId === supplierId);
}

// ─── AI-derived narratives ──────────────────────────────────────────────
// Simulated assistant outputs. Deterministic: depend only on the ticket
// state and its related entities. Replace with real model calls when the
// AI integration ships.

export interface TicketNextStep {
	title: string;
	detail: string;
}

const STATUS_PHRASE: Record<TicketStatus, string> = {
	nuovo: 'In attesa di triage: nessun owner operativo ha ancora preso in carico la richiesta.',
	assegnato: 'Presa in carico, in attesa di conferma intervento dal fornitore designato.',
	'in-corso': 'Lavorazione attiva: monitorare avanzamento sul posto.',
	risolto: 'Intervento concluso, in attesa di chiusura formale e feedback.',
	chiuso: 'Pratica archiviata, nessuna azione richiesta.'
};

function relativeOpened(iso: string): string {
	const ms = Date.now() - new Date(iso).getTime();
	const days = Math.floor(ms / (1000 * 60 * 60 * 24));
	if (days <= 0) return 'oggi';
	if (days === 1) return 'ieri';
	if (days < 30) return `${days} giorni fa`;
	const months = Math.floor(days / 30);
	return months === 1 ? '1 mese fa' : `${months} mesi fa`;
}

function resolveSupplier(ticket: Ticket) {
	if (!ticket.assignedToId) return undefined;
	const u = getUserById(ticket.assignedToId);
	return u?.role === 'supplier' ? u : undefined;
}

export function getTicketAiSummary(ticketId: string): string | undefined {
	const ticket = getTicketById(ticketId);
	if (!ticket) return undefined;
	const property = getPropertyById(ticket.propertyId);
	const reporter = getUserById(ticket.reportedById);
	const propName = property?.name ?? 'condominio non identificato';
	const reporterName = reporter?.name ?? 'utente';
	const channel = ticket.metadata?.channel ? ` via ${ticket.metadata.channel}` : '';
	const opened = relativeOpened(ticket.createdAt);
	return `Pratica ${ticket.type} di priorità ${ticket.priority} su ${propName}, aperta ${opened} da ${reporterName}${channel}. ${STATUS_PHRASE[ticket.status]}`;
}

// ─── Timeline ──────────────────────────────────────────────────────────
// Per-ticket activity stream. Seed events are derived deterministically
// from ticket fields; user-added notes are owned by the UI layer (the
// data simulation is read-only).

export type TicketEventKind = 'created' | 'status' | 'assigned' | 'note' | 'ai';

export interface TicketEvent {
	id: string;
	kind: TicketEventKind;
	at: string; // ISO date
	actorId?: string; // References User.id (author / system trigger)
	body?: string; // For note / ai events
	fromStatus?: TicketStatus; // status events
	toStatus?: TicketStatus; // status events
	targetUserId?: string; // assigned events
}

function demoNoteFor(ticket: Ticket): string {
	if (ticket.priority === 'critica')
		return 'Allerta squadra di pronto intervento, monitoro evoluzione nel pomeriggio.';
	if (ticket.status === 'in-corso')
		return "Squadra sul posto, mi aggiorno entro fine giornata sull'esito.";
	if (ticket.status === 'assegnato')
		return 'Confermato preventivo telefonicamente, attendo finestra di intervento.';
	return 'Ho contattato il segnalante per maggiori dettagli prima di assegnare il fornitore.';
}

export function getTicketTimeline(ticketId: string): TicketEvent[] {
	const ticket = getTicketById(ticketId);
	if (!ticket) return [];

	const events: TicketEvent[] = [];
	const created = new Date(ticket.createdAt).getTime();
	const updated = new Date(ticket.updatedAt).getTime();

	events.push({
		id: `${ticket.id}-created`,
		kind: 'created',
		at: ticket.createdAt,
		actorId: ticket.reportedById
	});

	events.push({
		id: `${ticket.id}-ai-init`,
		kind: 'ai',
		at: new Date(created + 60_000).toISOString(),
		body: 'Sintesi e prossimo passo generati automaticamente.'
	});

	if (ticket.assignedToId) {
		events.push({
			id: `${ticket.id}-assigned`,
			kind: 'assigned',
			at: new Date(Math.max(updated - 60_000, created + 120_000)).toISOString(),
			targetUserId: ticket.assignedToId
		});
	}

	if (ticket.status !== 'nuovo') {
		events.push({
			id: `${ticket.id}-status`,
			kind: 'status',
			at: ticket.updatedAt,
			fromStatus: 'nuovo',
			toStatus: ticket.status
		});
	}

	events.push({
		id: `${ticket.id}-note-seed`,
		kind: 'note',
		at: new Date(updated + 30_000).toISOString(),
		actorId: 'adm-svicom-01',
		body: demoNoteFor(ticket)
	});

	return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function getTicketNextStep(ticketId: string): TicketNextStep | undefined {
	const ticket = getTicketById(ticketId);
	if (!ticket) return undefined;
	const supplier = resolveSupplier(ticket);
	const reporter = getUserById(ticket.reportedById);

	switch (ticket.status) {
		case 'nuovo':
			return {
				title: 'Effettua il triage e assegna un fornitore',
				detail: `Conferma la priorità "${ticket.priority}", individua un fornitore competente per "${ticket.category}" e invia richiesta di intervento. Tempo consigliato: entro 2 ore.`
			};
		case 'assegnato':
			return {
				title: `Sollecita conferma intervento${supplier ? ` a ${supplier.name}` : ''}`,
				detail: `${supplier ? supplier.name : 'Il fornitore'} non ha ancora confermato la finestra di intervento. ${ticket.metadata?.sla ?? 'Prevedere escalation se nessuna risposta nelle prossime ore.'}`
			};
		case 'in-corso':
			return {
				title: 'Verifica avanzamento sul posto',
				detail: `Contatta ${supplier?.name ?? 'il responsabile assegnato'} per un aggiornamento e richiedi documentazione fotografica del lavoro svolto.`
			};
		case 'risolto':
			return {
				title: 'Chiudi la pratica e raccogli feedback',
				detail: `Notifica a ${reporter?.name ?? 'il segnalante'} l'avvenuta risoluzione, richiedi conferma e archivia la pratica con esito positivo.`
			};
		case 'chiuso':
			return {
				title: 'Nessuna azione richiesta',
				detail:
					'La pratica è chiusa. Eventuali nuove segnalazioni sullo stesso punto andrebbero collegate come riferimento.'
			};
	}
}
