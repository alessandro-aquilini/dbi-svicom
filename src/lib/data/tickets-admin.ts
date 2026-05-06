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
	// ── TCK-482 ── Full lifecycle: opened → estimating → approved →
	//              in_progress → completed → paid. No reassignment.
	{
		id: 'TCK-482',
		title: 'Perdita ricorrente nel locale contatori',
		description:
			'Tre segnalazioni sullo stesso punto in meno di due ore: va capito se è un nuovo guasto o un ritorno di un caso chiuso.',
		priority: 'alta',
		category: 'impianti',
		creatorId: 'adm-svicom-01',
		supplierId: 'frn-idroclima-nord',
		propertyId: 'cnd-marconi-14',
		cc: [],
		paymentIds: ['pay-003'],
		quoteIds: ['qte-482-01'],
		invoiceIds: ['inv-482-01'],
		eventTimeline: [
			{
				id: 'TCK-482-ev-01',
				kind: 'created',
				at: '2024-04-29T09:14:00Z',
				actorId: 'adm-svicom-01',
				toStatus: 'opened'
			},
			{
				id: 'TCK-482-ev-02',
				kind: 'assigned',
				at: '2024-04-29T09:14:00Z',
				actorId: 'adm-svicom-01',
				supplierId: 'frn-idroclima-nord'
			},
			{
				id: 'TCK-482-ev-03',
				kind: 'status',
				at: '2024-04-29T09:15:00Z',
				actorId: 'frn-idroclima-nord',
				fromStatus: 'opened',
				toStatus: 'estimating'
			},
			{
				id: 'TCK-482-ev-04',
				kind: 'status',
				at: '2024-04-29T09:20:00Z',
				actorId: 'adm-svicom-01',
				fromStatus: 'estimating',
				toStatus: 'approved'
			},
			{
				id: 'TCK-482-ev-05',
				kind: 'status',
				at: '2024-04-29T11:00:00Z',
				actorId: 'frn-idroclima-nord',
				fromStatus: 'approved',
				toStatus: 'in_progress'
			},
			{
				id: 'TCK-482-ev-06',
				kind: 'status',
				at: '2024-04-30T14:00:00Z',
				actorId: 'frn-idroclima-nord',
				fromStatus: 'in_progress',
				toStatus: 'completed'
			},
			{
				id: 'TCK-482-ev-07',
				kind: 'status',
				at: '2024-04-30T14:30:00Z',
				actorId: 'adm-svicom-01',
				fromStatus: 'completed',
				toStatus: 'paid'
			},
			{
				id: 'TCK-482-ev-08',
				kind: 'closed',
				at: '2024-04-30T14:35:00Z',
				actorId: 'adm-svicom-01',
				fromStatus: 'paid',
				toStatus: 'closed'
			}
		]
	},

	// ── TCK-476 ── Supplier reassignment example: frn-secure-entry → frn-eleva-service.
	//              Two residents in cc.
	{
		id: 'TCK-476',
		title: 'Ascensore scala B fermo a intermittenza',
		description:
			'Il problema si presenta a ondate e richiede una squadra disponibile in finestra rapida.',
		priority: 'alta',
		category: 'sicurezza',
		creatorId: 'adm-svicom-01',
		supplierId: 'frn-eleva-service',   // current supplier after reassignment
		propertyId: 'cnd-marconi-14',
		cc: ['res-bianchi-01', 'res-ferrari-04'],
		paymentIds: [],
		quoteIds: ['qte-476-01', 'qte-476-02'],
		invoiceIds: [],
		eventTimeline: [
			{
				id: 'TCK-476-ev-01',
				kind: 'created',
				at: '2024-04-29T08:40:00Z',
				actorId: 'adm-svicom-01',
				toStatus: 'opened'
			},
			{
				id: 'TCK-476-ev-02',
				kind: 'assigned',
				at: '2024-04-29T08:41:00Z',
				actorId: 'adm-svicom-01',
				supplierId: 'frn-secure-entry'
			},
			{
				id: 'TCK-476-ev-03',
				kind: 'status',
				at: '2024-04-29T08:42:00Z',
				actorId: 'frn-secure-entry',
				fromStatus: 'opened',
				toStatus: 'estimating'
			},
			{
				id: 'TCK-476-ev-04',
				kind: 'note',
				at: '2024-04-29T10:00:00Z',
				actorId: 'adm-svicom-01',
				body: 'frn-secure-entry non disponibile nei prossimi 3 giorni. Riassegno a specialista ascensori.'
			},
			{
				id: 'TCK-476-ev-05',
				kind: 'reassigned',
				at: '2024-04-29T10:05:00Z',
				actorId: 'adm-svicom-01',
				previousSupplierId: 'frn-secure-entry',
				supplierId: 'frn-eleva-service'
			},
			{
				id: 'TCK-476-ev-06',
				kind: 'status',
				at: '2024-04-29T10:10:00Z',
				actorId: 'frn-eleva-service',
				fromStatus: 'estimating',
				toStatus: 'approved'
			},
			{
				id: 'TCK-476-ev-07',
				kind: 'status',
				at: '2024-04-30T09:00:00Z',
				actorId: 'frn-eleva-service',
				fromStatus: 'approved',
				toStatus: 'in_progress'
			}
		]
	},

	// ── TCK-501 ── Private flat, resident in cc, completed but not yet paid.
	{
		id: 'TCK-501',
		title: 'Perdita dal condizionatore in sala',
		description:
			'Il condizionatore in sala perde acqua copiosamente dallo split interno. Urge intervento tecnico in appartamento privato.',
		priority: 'alta',
		category: 'impianti privati',
		creatorId: 'adm-svicom-01',
		supplierId: 'frn-idroclima-nord',
		propertyId: 'cnd-marconi-14',
		cc: ['res-conti-02'],
		paymentIds: ['pay-004'],
		quoteIds: ['qte-501-01'],
		invoiceIds: ['inv-501-01'],
		eventTimeline: [
			{
				id: 'TCK-501-ev-01',
				kind: 'created',
				at: '2024-05-02T10:15:00Z',
				actorId: 'adm-svicom-01',
				toStatus: 'opened'
			},
			{
				id: 'TCK-501-ev-02',
				kind: 'assigned',
				at: '2024-05-02T10:20:00Z',
				actorId: 'adm-svicom-01',
				supplierId: 'frn-idroclima-nord'
			},
			{
				id: 'TCK-501-ev-03',
				kind: 'status',
				at: '2024-05-02T11:00:00Z',
				actorId: 'frn-idroclima-nord',
				fromStatus: 'opened',
				toStatus: 'estimating'
			},
			{
				id: 'TCK-501-ev-04',
				kind: 'status',
				at: '2024-05-02T11:30:00Z',
				actorId: 'adm-svicom-01',
				fromStatus: 'estimating',
				toStatus: 'approved'
			},
			{
				id: 'TCK-501-ev-05',
				kind: 'status',
				at: '2024-05-03T09:00:00Z',
				actorId: 'frn-idroclima-nord',
				fromStatus: 'approved',
				toStatus: 'in_progress'
			},
			{
				id: 'TCK-501-ev-06',
				kind: 'status',
				at: '2024-05-03T12:00:00Z',
				actorId: 'frn-idroclima-nord',
				fromStatus: 'in_progress',
				toStatus: 'completed'
			}
		]
	},

	// ── TCK-510 ── Still in estimating, no documents yet.
	{
		id: 'TCK-510',
		title: 'Sostituzione rubinetto bagno',
		description:
			'Richiesta uscita per preventivo e sostituzione del rubinetto del lavabo bagno patronale.',
		priority: 'bassa',
		category: 'impianti privati',
		creatorId: 'adm-svicom-01',
		supplierId: 'frn-idroclima-nord',
		propertyId: 'cnd-marconi-14',
		cc: ['res-rossi-03'],
		paymentIds: ['pay-007'],
		quoteIds: [],
		invoiceIds: [],
		eventTimeline: [
			{
				id: 'TCK-510-ev-01',
				kind: 'created',
				at: '2024-05-04T08:00:00Z',
				actorId: 'adm-svicom-01',
				toStatus: 'opened'
			},
			{
				id: 'TCK-510-ev-02',
				kind: 'assigned',
				at: '2024-05-04T08:05:00Z',
				actorId: 'adm-svicom-01',
				supplierId: 'frn-idroclima-nord'
			},
			{
				id: 'TCK-510-ev-03',
				kind: 'status',
				at: '2024-05-04T09:00:00Z',
				actorId: 'frn-idroclima-nord',
				fromStatus: 'opened',
				toStatus: 'estimating'
			}
		]
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