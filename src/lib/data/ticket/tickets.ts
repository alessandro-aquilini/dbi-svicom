// ─── ticket-admin.ts ──────────────────────────────────────────────────────────

export type TicketStatus =
	| 'opened'
	| 'estimating'
	| 'approved'
	| 'in_progress'
	| 'completed'
	| 'paid'
	| 'closed';

export type TicketPriority = 'bassa' | 'media' | 'alta' | 'critica';

// ─── Timeline ─────────────────────────────────────────────────────────────────

export type TicketEventKind =
	| 'createTicket'
	| 'assignToSupplier'
	| 'reassigned'
	| 'accepted'
	| 'declined'
	| 'reportCompletion'
	| 'validateAndClose'
	| 'archiveTicket'
	// admin-only / metadata events
	| 'updatePriority'
	| 'addInternalNote'
	| 'ai'
	| 'closed';

export interface TicketEvent {
	id: string;
	kind: TicketEventKind;
	at: string; // ISO 8601
	authorId?: string; // user who produced the event

	// optional payloads for certain kinds
	supplierId?: string; // assignToSupplier
	body?: string; // accepted/declined, addInternalNote, ai
	previousSupplierId?: string; // reassigned
	// updatePriority payload
	fromPriority?: string;
	toPriority?: string;
}

// ─── Ticket ───────────────────────────────────────────────────────────────────

export interface TicketMessage {
	id: string;
	senderId: string; // References User.id
	text: string;
	timestamp: string; // ISO datetime
}

export interface Ticket {
	id: string;
	title: string;
	description: string;
	priority: TicketPriority;
	category: string;

	creatorId: string; // Always an Admin User.id
	supplierId?: string; // Current active supplier User.id (mirrors last assignToSupplier/reassigned event)
	propertyId: string; // The condominium

	/** Resident User IDs who can view this ticket (read-only observers). */
	cc: string[];

	/** Ordered activity log (timeline-driven). */
	eventTimeline: TicketEvent[];

	/** Conversation messages related to the ticket (migrated from chats). */
	messageTimeline?: TicketMessage[];

	// Document links (ID-only)
	paymentIds: string[];
	quoteIds: string[];
	invoiceIds: string[];
	interventionIds: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derives current status by walking the timeline. O(n) but n is tiny. */
export function getCurrentStatus(ticket: Ticket): TicketStatus {
	// Walk backwards through timeline and pick the first event that maps to a public status.
	for (let i = ticket.eventTimeline.length - 1; i >= 0; i--) {
		const ev = ticket.eventTimeline[i];
		switch (ev.kind) {
			case 'reportCompletion':
				return 'completed';
			case 'validateAndClose':
				return 'closed';
			case 'archiveTicket':
				return 'closed';
			case 'assignToSupplier':
				return 'in_progress';
			case 'accepted':
				return 'estimating';
			case 'declined':
				return 'estimating';
			case 'createTicket':
				return 'opened';
			// Legacy support
			case 'closed':
				return 'closed';
		}
	}
	return 'opened';
}

// ─── Seed data ────────────────────────────────────────────────────────────────

export const tickets: Ticket[] = [
	{
		id: 'tkt-001',
		title: 'Riparazione perdita locale caldaia e ripristino acqua calda',
		description: 'Intervento urgente per perdita su collettore principale e ripristino servizio acqua calda sanitaria scala B. Derivato dalle segnalazioni REP-001 e REP-002.',
		priority: 'critica',
		category: 'Idraulica',
		creatorId: 'adm-giorgio-01',
		supplierId: 'frn-idroclima-nord',
		propertyId: 'cnd-marconi-14',
		cc: ['res-bianchi-01', 'res-bellini-05'],
		eventTimeline: [
			{ id: 'ev-1', kind: 'createTicket', at: '2026-05-01T10:00:00', authorId: 'adm-giorgio-01' },
			{ id: 'ev-2', kind: 'accepted', at: '2026-05-01T10:05:00', authorId: 'frn-idroclima-nord', body: 'Ricevuto, invio tecnico.' },
			{ id: 'ev-3', kind: 'assignToSupplier', at: '2026-05-01T10:05:00', authorId: 'adm-giorgio-01', supplierId: 'frn-idroclima-nord' },
			{ id: 'ev-4', kind: 'accepted', at: '2026-05-01T11:45:00', authorId: 'frn-idroclima-nord', body: 'Trovata la perdita e inviato preventivo.' },
			{ id: 'ev-5', kind: 'accepted', at: '2026-05-01T12:05:00', authorId: 'adm-giorgio-01', body: 'Procedi pure, è urgente.' },
			{ id: 'ev-6', kind: 'reportCompletion', at: '2026-05-01T18:00:00', authorId: 'frn-idroclima-nord' },
			{ id: 'ev-7', kind: 'validateAndClose', at: '2026-05-03T19:00:00', authorId: 'adm-giorgio-01' }
		],
		messageTimeline: [
			{ id: 'msg-101', senderId: 'adm-giorgio-01', text: 'Ciao, abbiamo un\'emergenza a Via Marconi 14. Perdita nel locale caldaia e manca acqua calda nella scala B. Ti ho aperto un ticket.', timestamp: '2026-05-01T10:05:00Z' },
			{ id: 'msg-101-meta', senderId: 'adm-giorgio-01', text: 'Ticket aperto: tkt-001', timestamp: '2026-05-01T10:05:00Z' },
			{ id: 'msg-102', senderId: 'frn-idroclima-nord', text: 'Ricevuto Giorgio. Mando subito un tecnico per un sopralluogo. Ti aggiorno tra poco.', timestamp: '2026-05-01T10:10:00Z' },
			{ id: 'msg-103', senderId: 'frn-idroclima-nord', text: 'Trovata la perdita. È il collettore principale, va sostituita anche una valvola. Ti ho caricato il preventivo.', timestamp: '2026-05-01T11:45:00Z' },
			{ id: 'msg-104', senderId: 'adm-giorgio-01', text: 'Procedi pure, è urgente. Fammi sapere appena l\'acqua calda è ripristinata.', timestamp: '2026-05-01T12:05:00Z' }
		],
		paymentIds: ['pay-001'],
		quoteIds: ['quo-001'],
		invoiceIds: ['inv-001'],
		interventionIds: ['int-001', 'int-002']
	},
	{
		id: 'tkt-002',
		title: 'Riparazione videocitofonia Corso Europa',
		description: 'Verifica e riparazione modulo telecamera videocitofono esterno. Segnalazione REP-003.',
		priority: 'media',
		category: 'Elettrico',
		creatorId: 'adm-giorgio-01',
		supplierId: 'frn-secure-entry',
		propertyId: 'cnd-europa-7',
		cc: ['res-conti-02'],
		eventTimeline: [
			{ id: 'ev-201', kind: 'createTicket', at: '2026-05-03T16:30:00', authorId: 'adm-giorgio-01' },
			{ id: 'ev-202', kind: 'assignToSupplier', at: '2026-05-03T16:35:00', authorId: 'adm-giorgio-01', supplierId: 'frn-secure-entry' },
			{ id: 'ev-203', kind: 'accepted', at: '2026-05-03T17:30:00', authorId: 'frn-secure-entry', body: 'Passiamo domani mattina a controllare.' }
		],
		messageTimeline: [
			{ id: 'msg-201', senderId: 'adm-giorgio-01', text: 'Buongiorno, ci segnalano problemi al videocitofono in Corso Europa 7. Non arriva l\'immagine.', timestamp: '2026-05-03T16:40:00Z' },
			{ id: 'msg-201-meta', senderId: 'adm-giorgio-01', text: 'Ticket aperto: tkt-002', timestamp: '2026-05-03T16:40:00Z' },
			{ id: 'msg-202', senderId: 'frn-secure-entry', text: 'Buongiorno Giorgio, passiamo domani mattina a controllare.', timestamp: '2026-05-03T17:30:00Z' },
			{ id: 'msg-203', senderId: 'frn-secure-entry', text: 'Telecamera guasta, va sostituito il modulo. Ti ho inviato il preventivo nel ticket.', timestamp: '2026-05-04T09:05:00Z' }
		],
		paymentIds: [],
		quoteIds: ['quo-002'],
		invoiceIds: [],
		interventionIds: []
	},
	{
		id: 'tkt-003',
		title: 'Ascensore fuori uso',
		description: 'Cabina ascensore principale bloccata al piano terra dopo intervento manutentivo programmato.',
		priority: 'alta',
		category: 'Ascensori',
		creatorId: 'adm-giorgio-01',
		propertyId: 'cnd-europa-7',
		cc: ['res-conti-02'],
		eventTimeline: [
			{ id: 'ev-301', kind: 'createTicket', at: '2026-05-11T08:15:00' }
		],
		paymentIds: [],
		quoteIds: [],
		invoiceIds: [],
		interventionIds: []
	},
	{
		id: 'tkt-004',
		title: 'Sostituzione luci scale e pianerottoli',
		description: 'Quattro plafoniere fulminate nelle scale B; necessario sostituirle e verificare i sensori di presenza.',
		priority: 'media',
		category: 'Elettrico',
		creatorId: 'adm-giorgio-01',
		propertyId: 'cnd-solari-30',
		cc: ['res-moretti-07'],
		eventTimeline: [
			{ id: 'ev-401', kind: 'createTicket', at: '2026-05-08T11:20:00' }
		],
		paymentIds: [],
		quoteIds: [],
		invoiceIds: [],
		interventionIds: []
	},
	{
		id: 'tkt-005',
		title: 'Revisione annuale impianto antincendio',
		description: 'Scadenza prevista entro fine maggio. Necessario coordinarsi con il fornitore certificato.',
		priority: 'media',
		category: 'Sicurezza',
		creatorId: 'adm-giorgio-01',
		propertyId: 'cnd-pacini-44',
		cc: ['res-esposito-06'],
		eventTimeline: [
			{ id: 'ev-501', kind: 'createTicket', at: '2026-05-06T09:00:00' }
		],
		paymentIds: [],
		quoteIds: [],
		invoiceIds: [],
		interventionIds: []
	},
	{
		id: 'tkt-006',
		title: 'Ripristino citofono interno 3',
		description: 'Citofono non riceve chiamate dall\'esterno. Da verificare integrazione con videocitofonia centralizzata.',
		priority: 'media',
		category: 'Elettrico',
		creatorId: 'adm-giorgio-01',
		propertyId: 'cnd-verdi-3',
		cc: ['res-rossi-03'],
		eventTimeline: [
			{ id: 'ev-601', kind: 'createTicket', at: '2026-05-09T14:00:00' }
		],
		paymentIds: [],
		quoteIds: [],
		invoiceIds: [],
		interventionIds: []
	},
	{
		id: 'tkt-007',
		title: 'Pulizia straordinaria parti comuni',
		description: 'Richiesta intervento di pulizia per garage e vano scale dopo lavori condominiali.',
		priority: 'bassa',
		category: 'Pulizie',
		creatorId: 'adm-giorgio-01',
		propertyId: 'cnd-tortona-12',
		cc: ['res-bruno-08'],
		eventTimeline: [
			{ id: 'ev-701', kind: 'createTicket', at: '2026-05-10T07:30:00' }
		],
		paymentIds: [],
		quoteIds: [],
		invoiceIds: [],
		interventionIds: []
	},
	{
		id: 'tkt-008',
		title: 'Richiesta informazioni polizza globale fabbricato',
		description: 'Un condomino chiede dettagli sulla copertura per danni da acqua. Da girare al broker.',
		priority: 'bassa',
		category: 'Amministrativo',
		creatorId: 'adm-giorgio-01',
		propertyId: 'cnd-carducci-21',
		cc: ['res-greco-04'],
		eventTimeline: [
			{ id: 'ev-801', kind: 'createTicket', at: '2026-05-12T10:15:00' }
		],
		paymentIds: [],
		quoteIds: [],
		invoiceIds: [],
		interventionIds: []
	}
];

/** Tickets that are still active (not paid, completed or closed). */
export function getOpenTickets(propertyId?: string | null): Ticket[] {
	return tickets.filter((t) => {
		if (propertyId && t.propertyId !== propertyId) return false;
		const status = getCurrentStatus(t);
		return status !== 'closed' && status !== 'completed' && status !== 'paid';
	});
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getTicketById(id: string): Ticket | undefined {
	return tickets.find((t) => t.id === id);
}

/**
 * Returns the timeline events that are relevant to a specific supplier.
 * This includes events from when they were assigned until they were reassigned or the ticket closed.
 */
export function getSupplierRelevantTimeline(ticket: Ticket, supplierId: string): TicketEvent[] {
	let relevant = false;
	const result: TicketEvent[] = [];

	for (const ev of ticket.eventTimeline) {
		if (ev.kind === 'assignToSupplier' || ev.kind === 'reassigned') {
			if (ev.supplierId === supplierId) {
				relevant = true;
			} else if (relevant) {
				// Reassigned to someone else
				relevant = false;
			}
		}

		// ignore internal notes when building supplier timeline
		if (relevant && ev.kind !== 'addInternalNote') {
			result.push(ev);
		}

		if (ev.kind === 'closed' || ev.kind === 'archiveTicket') {
			relevant = false;
		}
	}
	return result;
}

export function getTicketsByPropertyId(propertyId: string): Ticket[] {
	return tickets.filter((t) => t.propertyId === propertyId);
}

export function getTicketsBySupplierId(supplierId: string): Ticket[] {
	return tickets.filter((t) => t.supplierId === supplierId);
}

export function getTicketsByResidentCc(residentId: string): Ticket[] {
	return tickets.filter((t) => t.cc.includes(residentId));
}

// ─── AI-derived narratives ────────────────────────────────────────────────────
// TODO: replace stubs with real model calls when AI integration ships.

export interface TicketNextStep {
	title: string;
	detail: string;
}

export function getTicketNextStep(ticketId: string): TicketNextStep | undefined {
	const ticket = getTicketById(ticketId);
	if (!ticket) return undefined;
	const status = getCurrentStatus(ticket);

	switch (status) {
		case 'opened':
			return {
				title: 'Assegna un fornitore',
				detail: `Individua un fornitore competente per "${ticket.category}" e invia richiesta di preventivo.`
			};
		case 'estimating':
			return {
				title: 'In attesa di preventivo',
				detail: 'Sollecita il fornitore se non si riceve risposta entro le prossime ore.'
			};
		case 'approved':
			return {
				title: 'Preventivo approvato — attendi conferma intervento',
				detail: 'Verifica che il fornitore abbia ricevuto il via libera e confermato la finestra di lavoro.'
			};
		case 'in_progress':
			return {
				title: 'Verifica avanzamento sul posto',
				detail: 'Richiedi aggiornamento al fornitore e documentazione fotografica del lavoro svolto.'
			};
		case 'completed':
			return {
				title: 'Raccogli fattura e chiudi il pagamento',
				detail: 'Carica la fattura, collega il pagamento e notifica i residenti in cc.'
			};
		case 'paid':
			return {
				title: 'Chiudi la pratica',
				detail: 'Pagamento registrato. Archivia il ticket e notifica eventuali residenti in cc.'
			};
		case 'closed':
			return {
				title: 'Nessuna azione richiesta',
				detail: 'La pratica è chiusa. Nuove segnalazioni sullo stesso punto andrebbero aperte come nuovo ticket con riferimento a questo.'
			};
	}
}