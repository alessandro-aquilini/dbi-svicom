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
	| 'created'   // ticket opened by admin
	| 'status'    // any status transition
	| 'assigned'  // first supplier assignment
	| 'reassigned'// supplier replaced by another
	| 'note'      // free-text comment
	| 'ai'        // system-generated narrative
	| 'closed';   // ticket explicitly closed

export interface TicketEvent {
	id: string;
	kind: TicketEventKind;
	at: string;          // ISO 8601
	actorId?: string;    // References User.id — who triggered this event

	// ── status / closed events ──
	fromStatus?: TicketStatus;
	toStatus?: TicketStatus;

	// ── assigned / reassigned events ──
	supplierId?: string;          // incoming supplier
	previousSupplierId?: string;  // outgoing supplier (reassigned only)

	// ── note / ai events ──
	body?: string;
}

// ─── Ticket ───────────────────────────────────────────────────────────────────

export interface Ticket {
	id: string;
	title: string;
	description: string;
	priority: TicketPriority;
	category: string;

	creatorId: string;    // Always an Admin User.id
	supplierId?: string;  // Current active supplier User.id (mirrors last 'assigned'/'reassigned' event)
	propertyId: string;   // The condominium

	/** Resident User IDs who can view this ticket (read-only observers). */
	cc: string[];

	/** Ordered activity log. Replaces statusHistory — derive current status
	 *  from the `toStatus` of the last 'status' or 'closed' event. */
	eventTimeline: TicketEvent[];

	// ── Document links (ID-only — timestamps live in their own modules) ──
	paymentIds: string[];  // References Payment.id  (payments.ts)
	quoteIds: string[];    // References Quote.id    (quotes.ts)
	invoiceIds: string[];  // References Invoice.id  (invoices.ts)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derives current status by walking the timeline. O(n) but n is tiny. */
export function getCurrentStatus(ticket: Ticket): TicketStatus {
	for (let i = ticket.eventTimeline.length - 1; i >= 0; i--) {
		const ev = ticket.eventTimeline[i];
		if ((ev.kind === 'status' || ev.kind === 'closed') && ev.toStatus) {
			return ev.toStatus;
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
		cc: ['res-bianchi-01', 'res-ext-05'],
		eventTimeline: [
			{ id: 'ev-1', kind: 'created', at: '2026-05-01T10:00:00Z', actorId: 'adm-giorgio-01' },
			{ id: 'ev-2', kind: 'status', at: '2026-05-01T10:05:00Z', actorId: 'adm-giorgio-01', fromStatus: 'opened', toStatus: 'estimating' },
			{ id: 'ev-3', kind: 'assigned', at: '2026-05-01T10:05:00Z', actorId: 'adm-giorgio-01', supplierId: 'frn-idroclima-nord' },
			{ id: 'ev-4', kind: 'note', at: '2026-05-01T10:30:00Z', actorId: 'frn-idroclima-nord', body: 'Ricevuto. Invio tecnico per sopralluogo immediato.' },
			{ id: 'ev-5', kind: 'status', at: '2026-05-01T12:00:00Z', actorId: 'frn-idroclima-nord', fromStatus: 'estimating', toStatus: 'approved' },
			{ id: 'ev-6', kind: 'status', at: '2026-05-01T14:00:00Z', actorId: 'frn-idroclima-nord', fromStatus: 'approved', toStatus: 'in_progress' },
			{ id: 'ev-7', kind: 'status', at: '2026-05-01T18:00:00Z', actorId: 'frn-idroclima-nord', fromStatus: 'in_progress', toStatus: 'completed' }
		],
		paymentIds: ['pay-001'],
		quoteIds: ['quo-001'],
		invoiceIds: ['inv-001']
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
			{ id: 'ev-201', kind: 'created', at: '2026-05-03T16:30:00Z', actorId: 'adm-giorgio-01' },
			{ id: 'ev-202', kind: 'assigned', at: '2026-05-03T16:35:00Z', actorId: 'adm-giorgio-01', supplierId: 'frn-secure-entry' },
			{ id: 'ev-203', kind: 'status', at: '2026-05-03T16:35:00Z', actorId: 'adm-giorgio-01', fromStatus: 'opened', toStatus: 'estimating' }
		],
		paymentIds: [],
		quoteIds: ['quo-002'],
		invoiceIds: []
	}
];

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getTicketById(id: string): Ticket | undefined {
	return tickets.find((t) => t.id === id);
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