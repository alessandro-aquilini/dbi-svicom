// ───────────────── booking-types.ts ──────────────────────────────────────────
import { getUserById } from '../users';
import { services } from '../services';
import { getPropertyById } from '../properties';
import { getResidentById } from '../residents';
import { browser } from '$app/environment';

export type BookingEventKind =
    | 'booking_created'
    | 'confirmed'
    | 'declined'
    | 'booking_updated'
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
    notes?: string;
    place?: string;
    description?: string;
    propertyId?: string;
    // Optional slot payload is attached to booking creation or updates
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
export type BookingStatus = 'requested' | 'confirmed' | 'cancelled' | 'closed' | 'declined' | 'unknown';

// ─── Main Booking ─────────────────────────────────────────────────────────────

export interface Booking {
    id: string;
    residentId: string;
    serviceId: string; // The supplier ID can be inferred from the service metadata.
    supplierId?: string;

    timeline?: BookingEvent[];
    messageTimeline?: BookingMessage[];

    // Optional embeds (frontend-driven, not enforced by the data layer)
    slot?: BookingSlot;
    paymentIds?: string[];
    quoteIds?: string[];
    invoiceIds?: string[];
    interventionIds?: string[];
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
        case 'booking_created':
            return 'requested';
        case 'confirmed':
            return 'confirmed';
        case 'booking_updated': {
            const timeline = booking.timeline || [];
            const hasConfirmed = timeline.some((ev) => ev.kind === 'confirmed');
            return hasConfirmed ? 'confirmed' : 'requested';
        }
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
const STORAGE_KEY = 'svicom.bookings';

const baseBookings: Booking[] = [
    // 1) Pet sitting: supplier confirms then cancels
    {
        id: 'bkg-001',
        residentId: 'res-bianchi-01',
        serviceId: 'srv-pet-sitting-premium',
        timeline: [
            {
                id: 'bkg-001-e1',
                kind: 'booking_created',
                authorId: 'res-bianchi-01',
                at: '2026-05-06T08:00:00',
                slot: { start: '2026-05-06T09:30:00', end: '2026-05-06T11:00:00' },
                notes: 'Pet sitting per cane di taglia media'
            },
            { id: 'bkg-001-e2', kind: 'confirmed', authorId: 'frn-pet-care-h24', at: '2026-05-06T09:00:00' },
            { id: 'bkg-001-e3', kind: 'cancelled', authorId: 'frn-pet-care-h24', at: '2026-05-06T10:00:00' }
        ],
        messageTimeline: [
            { id: 'msg-bkg-001-1', senderId: 'res-bianchi-01', text: 'Vorrei prenotare un pet sitter per il 6 maggio, mattina.', timestamp: '2026-05-06T08:00:00' },
            { id: 'msg-bkg-001-2', senderId: 'frn-pet-care-h24', text: 'Ricevuto, confermiamo alle 09:30.', timestamp: '2026-05-06T09:00:00' },
            { id: 'msg-bkg-001-3', senderId: 'frn-pet-care-h24', text: 'Purtroppo dobbiamo cancellare per indisponibilità del personale. Ci scusiamo.', timestamp: '2026-05-06T10:00:00' }
        ]
    },

    // 2) Pulizie extra: confirmato e chiuso dopo l'intervento
    {
        id: 'bkg-002',
        residentId: 'res-bianchi-01',
        serviceId: 'srv-pulizie-extra',
        timeline: [
            {
                id: 'bkg-002-e1',
                kind: 'booking_created',
                authorId: 'res-bianchi-01',
                at: '2026-04-20T09:00:00',
                slot: { start: '2026-04-20T10:00:00', end: '2026-04-20T13:00:00' },
                notes: 'Pulizia extra della zona giorno e corridoio'
            },
            { id: 'bkg-002-e2', kind: 'confirmed', authorId: 'frn-clean-green', at: '2026-04-20T10:00:00' },
            { id: 'bkg-002-e4', kind: 'closed', authorId: 'frn-clean-green', at: '2026-04-20T15:00:00' }
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
            {
                id: 'bkg-003-e1',
                kind: 'booking_created',
                authorId: 'res-bianchi-01',
                at: '2026-05-01T09:00:00',
                slot: { start: '2026-05-02T09:00:00', end: '2026-05-02T17:00:00' },
                notes: 'Installazione climatizzatore in soggiorno'
            },
            { id: 'bkg-003-e2', kind: 'confirmed', authorId: 'frn-idroclima-nord', at: '2026-05-01T11:45:00' },
            {
                id: 'bkg-003-e3',
                kind: 'booking_updated',
                authorId: 'res-bianchi-01',
                at: '2026-05-02T08:00:00',
                slot: { start: '2026-05-02T10:00:00', end: '2026-05-02T18:00:00' },
                notes: 'Richiesta di posticipare l’intervento di un’ora'
            },
            { id: 'bkg-003-e5', kind: 'closed', authorId: 'frn-idroclima-nord', at: '2026-05-03T09:00:00' }
        ],
        messageTimeline: [
            { id: 'msg-bkg-003-1', senderId: 'res-bianchi-01', text: 'Vorrei un preventivo per installare un climatizzatore.', timestamp: '2026-05-01T09:01:00' },
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
            {
                id: 'bkg-004-e1',
                kind: 'booking_created',
                authorId: 'res-bianchi-01',
                at: '2026-05-10T14:20:00',
                slot: { start: '2026-05-15T10:00:00', end: '2026-05-15T11:00:00' },
                notes: 'Controllo termico della caldaia'
            }
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
            {
                id: 'bkg-005-e1',
                kind: 'booking_created',
                authorId: 'res-rossi-01',
                at: '2026-05-12T09:00:00',
                slot: { start: '2026-05-20T09:00:00', end: '2026-05-20T12:00:00' },
                notes: 'Installazione climatizzatore camera da letto'
            },
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
            {
                id: 'bkg-006-e1',
                kind: 'booking_created',
                authorId: 'res-bellini-05',
                at: '2026-05-10T08:30:00',
                slot: { start: '2026-05-12T09:00:00', end: '2026-05-12T11:00:00' },
                notes: 'Riparazione citofono con suoneria difettosa'
            }
        ]
    }
];

function loadPersistedBookings(): Booking[] {
    if (!browser) return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as Booking[];
        if (!Array.isArray(parsed)) return [];
        const baseIds = new Set(baseBookings.map((b) => b.id));
        return parsed.filter((booking) => booking?.id && !baseIds.has(booking.id));
    } catch {
        return [];
    }
}

function persistBookings(): void {
    if (!browser) return;
    const baseIds = new Set(baseBookings.map((b) => b.id));
    const dynamicBookings = bookings.filter((booking) => !baseIds.has(booking.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamicBookings));
}

export const bookings: Booking[] = [...baseBookings, ...loadPersistedBookings()];

export function getBookingById(id: string): Booking | undefined {
    return bookings.find((b) => b.id === id);
}

export function getBookingsByResidentId(residentId: string): Booking[] {
    return bookings.filter((b) => b.residentId === residentId);
}

export function getBookingsBySupplierId(supplierId: string): Booking[] {
    const supplierServiceIds = services
        .filter((s) => s.supplierId === supplierId)
        .map((s) => s.id);
    return bookings.filter((b) => supplierServiceIds.includes(b.serviceId) || b.supplierId === supplierId);
}

// ─── Booking Info Helpers ─────────────────────────────────────────────────────

export interface BookingInfo {
    bookingId: string;
    serviceId: string;
    serviceName: string;
    residentId: string;
    residentName?: string;
    supplierId?: string;
    supplierName?: string;
    status: BookingStatus;
    slot?: BookingSlot;
    place?: string;
    notes?: string;
    propertyId?: string;
    createdAt?: string;
    updatedAt?: string;
    closedAt?: string;
    lastEvent?: BookingEvent;
}

export function isBookingActive(booking: Booking): boolean {
    const status = inferBookingStatus(booking);
    return status !== 'closed' && status !== 'cancelled' && status !== 'declined';
}

export function isBookingClosed(booking: Booking): boolean {
    return inferBookingStatus(booking) === 'closed';
}

export function getBookingCreatedAt(booking: Booking): string | undefined {
    return booking.timeline?.find((event) => event.kind === 'booking_created')?.at;
}

export function getBookingInfo(booking: Booking): BookingInfo {
    const service = services.find((s) => s.id === booking.serviceId);
    const resident = getUserById(booking.residentId);
    const residentProfile = getResidentById(booking.residentId);
    const property = residentProfile?.propertyId ? getPropertyById(residentProfile.propertyId) : undefined;
    const createdEvent = booking.timeline?.find((event) => event.kind === 'booking_created');
    const closedEvent = booking.timeline?.find((event) => event.kind === 'closed');
    const lastEvent = lastBookingEvent(booking);

    const place = property
        ? `${property.address.street}, ${property.address.city}${residentProfile?.apartment ? ` · ${residentProfile.apartment}` : ''}`
        : residentProfile?.apartment;

    const noteEvent = [...(booking.timeline || [])].reverse().find((event) => event.notes || event.description);
    const notes = noteEvent?.notes ?? noteEvent?.description;

    return {
        bookingId: booking.id,
        serviceId: booking.serviceId,
        serviceName: service?.name ?? 'Servizio',
        residentId: booking.residentId,
        residentName: resident?.name,
        supplierId: booking.supplierId ?? service?.supplierId,
        supplierName: service ? getUserById(service.supplierId)?.name : undefined,
        status: inferBookingStatus(booking),
        slot: lastEvent?.slot ?? createdEvent?.slot ?? booking.slot,
        place,
        notes,
        propertyId: residentProfile?.propertyId,
        createdAt: createdEvent?.at,
        updatedAt: lastEvent?.at,
        closedAt: closedEvent?.at,
        lastEvent
    };
}

export function getActiveBookings(bookings: Booking[]): Booking[] {
    return bookings
        .filter(isBookingActive)
        .sort((a, b) => {
            const createdA = getBookingCreatedAt(a) ?? '';
            const createdB = getBookingCreatedAt(b) ?? '';
            return createdA.localeCompare(createdB);
        });
}

export function getRecentClosedBookings(bookings: Booking[], limit = 3): Booking[] {
    return bookings
        .filter(isBookingClosed)
        .sort((a, b) => {
            const aLast = lastBookingEvent(a)?.at ?? '';
            const bLast = lastBookingEvent(b)?.at ?? '';
            return bLast.localeCompare(aLast);
        })
        .slice(0, limit);
}

export function addBookingEvent(bookingId: string, event: Omit<BookingEvent, 'id' | 'at'>): void {
    const booking = getBookingById(bookingId);
    if (!booking) return;

    if (!booking.timeline) booking.timeline = [];

    const newEvent: BookingEvent = {
        ...event,
        id: `bkg-${bookingId.split('-').pop()}-e${booking.timeline.length + 1}`,
        at: new Date().toISOString()
    };

    booking.timeline.push(newEvent);
    persistBookings();
}

export function updateBookingStatusAction(bookingId: string, kind: BookingEventKind, authorId: string): void {
    addBookingEvent(bookingId, {
        kind,
        authorId
    });
}

export function linkDocumentToBooking(bookingId: string, type: 'invoice' | 'quote' | 'payment' | 'intervention', documentId: string): void {
    const booking = getBookingById(bookingId);
    if (!booking) return;

    if (type === 'invoice') {
        booking.invoiceIds = [...(booking.invoiceIds || []), documentId];
    } else if (type === 'quote') {
        booking.quoteIds = [...(booking.quoteIds || []), documentId];
    } else if (type === 'payment') {
        booking.paymentIds = [...(booking.paymentIds || []), documentId];
    } else if (type === 'intervention') {
        booking.interventionIds = [...(booking.interventionIds || []), documentId];
    }

    persistBookings();
}

export function createBooking(booking: Booking): Booking {
    // Create a shallow copy to avoid mutating the caller object unexpectedly.
    const record: Booking = { ...booking };

    // Ensure booking has an id
    if (!record.id) {
        record.id = `bkg-new-${Math.random().toString(36).slice(2, 7)}`;
    }

    // Resolve supplierId from the service if missing
    const svc = services.find((s) => s.id === record.serviceId);
    if (!record.supplierId && svc) record.supplierId = svc.supplierId;

    // If residentId is missing, infer it from the first event author
    if (!record.residentId && record.timeline?.length) {
        const firstEventAuthor = record.timeline[0]?.authorId;
        if (firstEventAuthor) record.residentId = firstEventAuthor;
    }

    const now = new Date().toISOString();

    if (!record.timeline || record.timeline.length === 0) {
        record.timeline = [
            {
                id: `${record.id}-e1`,
                kind: 'booking_created',
                authorId: record.residentId,
                at: now,
                slot: record.slot,
                notes: undefined
            }
        ];
    } else {
        // Normalize first event if the booking already includes a timeline.
        const first = record.timeline[0];
        if (!first.id) first.id = `${record.id}-e1`;
        if (!first.authorId) first.authorId = record.residentId;
        if (!first.at) first.at = now;
    }

    // Ensure message timeline exists
    if (!record.messageTimeline) record.messageTimeline = [];

    // Keep top-level slot in sync with the last known slot
    const lastEv = lastBookingEvent(record);
    record.slot = lastEv?.slot ?? record.slot;

    bookings.push(record);
    persistBookings();
    return record;
}
