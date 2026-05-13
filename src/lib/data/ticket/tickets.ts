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
	interventionIds: string[]; // References Intervento.id (intervento.ts)
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
		cc: ['res-bianchi-01', 'res-bellini-05'],
		eventTimeline: [
			{ id: 'ev-1', kind: 'created', at: '2026-05-01T10:00:00' },
			{ id: 'ev-2', kind: 'status', at: '2026-05-01T10:05:00', fromStatus: 'opened', toStatus: 'estimating' },
			{ id: 'ev-3', kind: 'assigned', at: '2026-05-01T10:05:00', supplierId: 'frn-idroclima-nord' },
			{ id: 'ev-4', kind: 'note', at: '2026-05-01T10:30:00', body: 'Idroclina Nord ha risposto subito ed è disponibile.' },
			{ id: 'ev-5', kind: 'status', at: '2026-05-01T12:40:00', fromStatus: 'estimating', toStatus: 'approved' },
			{ id: 'ev-6', kind: 'status', at: '2026-05-01T14:00:00', fromStatus: 'approved', toStatus: 'in_progress' },
			{ id: 'ev-7', kind: 'status', at: '2026-05-01T18:00:00', fromStatus: 'in_progress', toStatus: 'completed' },
			{ id: 'ev-8', kind: 'status', at: '2026-05-03T19:00:00', fromStatus: 'completed', toStatus: 'paid' }
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
			{ id: 'ev-201', kind: 'created', at: '2026-05-03T16:30:00' },
			{ id: 'ev-202', kind: 'assigned', at: '2026-05-03T16:35:00', supplierId: 'frn-secure-entry' },
			{ id: 'ev-203', kind: 'status', at: '2026-05-03T16:35:00', fromStatus: 'opened', toStatus: 'estimating' }
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
			{ id: 'ev-301', kind: 'created', at: '2026-05-11T08:15:00' }
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
			{ id: 'ev-401', kind: 'created', at: '2026-05-08T11:20:00' }
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
			{ id: 'ev-501', kind: 'created', at: '2026-05-06T09:00:00' }
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
			{ id: 'ev-601', kind: 'created', at: '2026-05-09T14:00:00' }
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
			{ id: 'ev-701', kind: 'created', at: '2026-05-10T07:30:00' }
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
			{ id: 'ev-801', kind: 'created', at: '2026-05-12T10:15:00' }
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
		if (ev.kind === 'assigned' || ev.kind === 'reassigned') {
			if (ev.supplierId === supplierId) {
				relevant = true;
			} else if (relevant) {
				// Reassigned to someone else
				relevant = false;
			}
		}

		if (relevant && ev.kind != 'note') {
			result.push(ev);
		}

		if (ev.kind === 'closed') {
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