// ─── booking-types.ts ────────────────────────────────────────────────────────

export type BookingEventKind =
    | 'request_created'
    | 'confirmed'
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
}

// Booking status (derived from the last event in the timeline)
export type BookingStatus = 'requested' | 'confirmed' | 'performed' | 'cancelled' | 'closed' | 'unknown';

// ─── Main Booking ─────────────────────────────────────────────────────────────

export interface Booking {
    id: string;
    residentId: string;
    serviceId: string; // The supplier ID can be inferred from the service metadata.

    // Timeline of events. Optional to allow minimal hardcoded records in the frontend.
    timeline?: BookingEvent[];

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
        case 'request_created':
            return 'requested';
        case 'confirmed':
            return 'confirmed';
        case 'performed':
            return 'performed';
        case 'cancelled':
            return 'cancelled';
        case 'closed':
            return 'closed';
        default:
            return 'unknown';
    }
}
