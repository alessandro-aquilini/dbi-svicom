// ─── booking-types.ts ────────────────────────────────────────────────────────

export type BookingEventKind =
    | 'request_created'
    | 'confirmed'
    | 'declined'
    | 'timeslot_updated'
    | 'performed'
    | 'cancelled'
    | 'closed';

// ─── Embeds ──────────────────────────────────────────────────────────────────

export interface BookingSlot {
    start: string; // ISO datetime
    end: string; // ISO datetime
}

export interface BookingEvent {
    id: string;
    kind: BookingEventKind;
    authorId: string;
    at: string; // ISO datetime
    // Optional slot payload is attached to request creation or timeslot updates
    slot?: BookingSlot;
}

// Lightweight message type for booking-related conversations.
export interface BookingMessage {
    id: string;
    senderId: string; // References User.id
    text: string;
    timestamp: string; // ISO datetime
}

// Booking status (derived from the last event in the timeline)
export type BookingStatus = 'requested' | 'confirmed' | 'performed' | 'cancelled' | 'closed' | 'declined' | 'unknown';

// ─── Main Booking ─────────────────────────────────────────────────────────────

export interface Booking {
    id: string;
    residentId: string;
    serviceId: string; // The supplier ID can be inferred from the service metadata.

    timeline?: BookingEvent[];
    messageTimeline?: BookingMessage[];

    // Optional embeds (frontend-driven, not enforced by the data layer)
    slot?: BookingSlot;
    paymentIds?: string[];
    quoteIds?: string[];
    invoiceIds?: string[];
}

/**
 * Returns the last (most recent) event from a booking's timeline.
 * Handles empty or missing timelines gracefully (returns undefined).
 */
export function lastBookingEvent(booking: Booking): BookingEvent | undefined {
    const timeline = booking.timeline;
    if (!timeline || timeline.length === 0) return undefined;
    // Pick the event with the latest `at` value (ISO strings are safe to compare via Date)
    return timeline.reduce((last, ev) => {
        if (!last) return ev;
        return new Date(ev.at) > new Date(last.at) ? ev : last;
    }, timeline[0]);
}

/**
 * Infers a lightweight BookingStatus from the last event kind.
 * This is intentionally simple and frontend-driven; business rules may be applied elsewhere.
 */
export function inferBookingStatus(booking: Booking): BookingStatus {
    const last = lastBookingEvent(booking);
    if (!last) return 'unknown';
    switch (last.kind) {
        case 'request_created':
            return 'requested';
        case 'confirmed':
            return 'confirmed';
        case 'timeslot_updated': {
            // If a timeslot update exists, fallback to confirmed if a confirmed event exists earlier
            const timeline = booking.timeline || [];
            const hasConfirmed = timeline.some((ev) => ev.kind === 'confirmed');
            return hasConfirmed ? 'confirmed' : 'requested';
        }
        case 'performed':
            return 'performed';
        case 'cancelled':
            return 'cancelled';
        case 'declined':
            return 'declined';
        case 'closed':
            return 'closed';
        default:
            return 'unknown';
    }
}

// ─── Sample bookings dataset (resident: res-bianchi-01, property: cnd-marconi-14) ───
export const bookings: Booking[] = [
    // 1) Pet sitting: supplier confirms then cancels
    {
        id: 'bkg-001',
        residentId: 'res-bianchi-01',
        serviceId: 'srv-pet-sitting-premium',
        timeline: [
            { id: 'bkg-001-e1', kind: 'request_created', authorId: 'res-bianchi-01', at: '2026-05-06T08:00:00', slot: { start: '2026-05-06T09:30:00', end: '2026-05-06T11:00:00' } },
            { id: 'bkg-001-e2', kind: 'confirmed', authorId: 'frn-pet-care-h24', at: '2026-05-06T09:00:00' },
            { id: 'bkg-001-e3', kind: 'cancelled', authorId: 'frn-pet-care-h24', at: '2026-05-06T10:00:00' }
        ],
        messageTimeline: [
            { id: 'msg-bkg-001-1', senderId: 'res-bianchi-01', text: 'Vorrei prenotare un pet sitter per il 6 maggio, mattina.', timestamp: '2026-05-06T08:00:00' },
            { id: 'msg-bkg-001-2', senderId: 'frn-pet-care-h24', text: 'Ricevuto, confermiamo alle 09:30.', timestamp: '2026-05-06T09:00:00' },
            { id: 'msg-bkg-001-3', senderId: 'frn-pet-care-h24', text: 'Purtroppo dobbiamo cancellare per indisponibilità del personale. Ci scusiamo.', timestamp: '2026-05-06T10:00:00' }
        ]
    },

    // 2) Pulizie extra: performed and paid (simple flow)
    {
        id: 'bkg-002',
        residentId: 'res-bianchi-01',
        serviceId: 'srv-pulizie-extra',
        timeline: [
            { id: 'bkg-002-e1', kind: 'request_created', authorId: 'res-bianchi-01', at: '2026-04-20T09:00:00', slot: { start: '2026-04-20T10:00:00', end: '2026-04-20T13:00:00' } },
            { id: 'bkg-002-e2', kind: 'confirmed', authorId: 'frn-clean-green', at: '2026-04-20T10:00:00' },
            { id: 'bkg-002-e3', kind: 'performed', authorId: 'frn-clean-green', at: '2026-04-20T13:00:00' },
            { id: 'bkg-002-e4', kind: 'closed', authorId: 'adm-giorgio-01', at: '2026-04-20T15:00:00' }
        ],
        messageTimeline: [
            { id: 'msg-bkg-002-1', senderId: 'res-bianchi-01', text: 'Richiedo pulizia extra per interno 5, possibile il 20 aprile?', timestamp: '2026-04-20T09:00:00' },
            { id: 'msg-bkg-002-2', senderId: 'frn-clean-green', text: 'Confermato per le 10:00. A dopo!', timestamp: '2026-04-20T10:00:00' },
            { id: 'msg-bkg-002-3', senderId: 'frn-clean-green', text: 'Intervento completato alle 13:00. Grazie!', timestamp: '2026-04-20T13:00:00' },
            { id: 'msg-bkg-002-4', senderId: 'res-bianchi-01', text: 'Perfetto, grazie. Effettuato il pagamento.', timestamp: '2026-04-20T16:00:00' }
        ],
        invoiceIds: ['inv-002'],
        paymentIds: ['pay-002'],
    },

    // 3) Installazione climatizzatore: has a preventivo (quote) -> accepted -> invoiced
    {
        id: 'bkg-003',
        residentId: 'res-bianchi-01',
        serviceId: 'srv-installazione-climatizzatore',
        timeline: [
            { id: 'bkg-003-e1', kind: 'request_created', authorId: 'res-bianchi-01', at: '2026-05-01T09:00:00', slot: { start: '2026-05-02T09:00:00', end: '2026-05-02T17:00:00' } },
            { id: 'bkg-003-e2', kind: 'confirmed', authorId: 'frn-idroclima-nord', at: '2026-05-01T11:45:00' },
            { id: 'bkg-003-e3', kind: 'timeslot_updated', authorId: 'res-bianchi-01', at: '2026-05-02T08:00:00', slot: { start: '2026-05-02T10:00:00', end: '2026-05-02T18:00:00' } },
            { id: 'bkg-003-e4', kind: 'performed', authorId: 'frn-idroclima-nord', at: '2026-05-02T14:00:00' },
            { id: 'bkg-003-e5', kind: 'closed', authorId: 'adm-giorgio-01', at: '2026-05-03T09:00:00' }
        ],
        messageTimeline: [
            { id: 'msg-bkg-003-1', senderId: 'res-bianchi-01', text: 'Vorrei un preventivo per installare un climatizzatore.', timestamp: '2026-05-01T09:00:00' },
            { id: 'msg-bkg-003-2', senderId: 'frn-idroclima-nord', text: 'Ti invio un preventivo, controllo materiali e costi.', timestamp: '2026-05-01T11:30:00' },
            { id: 'msg-bkg-003-3', senderId: 'res-bianchi-01', text: 'Accetto il preventivo, procedete con l\'intervento.', timestamp: '2026-05-02T09:00:00' },
            { id: 'msg-bkg-003-4', senderId: 'frn-idroclima-nord', text: 'Intervento completato. Abbiamo emesso la fattura.', timestamp: '2026-05-03T10:00:00' },
            { id: 'msg-bkg-003-5', senderId: 'res-bianchi-01', text: 'Pagamento eseguito.', timestamp: '2026-05-04T11:00:00' }
        ],

        quoteIds: ['quo-003'],
        invoiceIds: ['inv-003'],
        paymentIds: ['pay-003'],
    },

    // 4) Check Termico: Requested to frn-idroclima-nord
    {
        id: 'bkg-004',
        residentId: 'res-bianchi-01',
        serviceId: 'srv-check-termico',
        timeline: [
            { id: 'bkg-004-e1', kind: 'request_created', authorId: 'res-bianchi-01', at: '2026-05-10T14:20:00', slot: { start: '2026-05-15T10:00:00', end: '2026-05-15T11:00:00' } }
        ],
        messageTimeline: [
            { id: 'msg-bkg-004-1', senderId: 'res-bianchi-01', text: 'Vorrei un controllo della caldaia prima dell\'estate.', timestamp: '2026-05-10T14:20:00' }
        ]
    },

    // 5) Installazione Climatizzatore: New request for another property
    {
        id: 'bkg-005',
        residentId: 'res-rossi-01',
        serviceId: 'srv-installazione-climatizzatore',
        timeline: [
            { id: 'bkg-005-e1', kind: 'request_created', authorId: 'res-rossi-01', at: '2026-05-12T09:00:00', slot: { start: '2026-05-20T09:00:00', end: '2026-05-20T12:00:00' } },
            { id: 'bkg-005-e2', kind: 'confirmed', authorId: 'frn-idroclima-nord', at: '2026-05-13T08:30:00' }
        ],
        messageTimeline: [
            { id: 'msg-bkg-005-1', senderId: 'res-rossi-01', text: 'Preventivo per climatizzatore in camera da letto.', timestamp: '2026-05-12T09:00:00' },
            { id: 'msg-bkg-005-2', senderId: 'frn-idroclima-nord', text: 'Confermato sopralluogo per il 20 maggio.', timestamp: '2026-05-13T08:30:00' }
        ]
    },

    // 6) Citofono: resident requested, waiting for supplier (demonstrates 'requested' state)
    {
        id: 'bkg-006',
        residentId: 'res-bellini-05',
        serviceId: 'srv-riparazione-citofono',
        timeline: [
            { id: 'bkg-006-e1', kind: 'request_created', authorId: 'res-bellini-05', at: '2026-05-10T08:30:00', slot: { start: '2026-05-12T09:00:00', end: '2026-05-12T11:00:00' } }
        ]
    }
];

export function getBookingById(id: string): Booking | undefined {
    return bookings.find((b) => b.id === id);
}

export function getBookingsByResidentId(residentId: string): Booking[] {
    return bookings.filter((b) => b.residentId === residentId);
}

export function getBookingsBySupplierId(supplierId: string): Booking[] {
    // Note: serviceId contains supplier info in the services dataset
    // For now we filter based on IDs we know belong to the supplier
    const supplierServiceIds = ['srv-installazione-climatizzatore', 'srv-check-termico'];
    return bookings.filter((b) => supplierServiceIds.includes(b.serviceId));
}
