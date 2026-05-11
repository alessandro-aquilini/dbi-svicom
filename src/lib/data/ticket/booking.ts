import { services } from '../services';

export type BookingStatus = 
    | 'richiesto' 
    | 'preventivato' 
    | 'confermato' 
    | 'completato' 
    | 'cancellato';

export type BookingEventKind = 
    | 'created'
    | 'status_change'
    | 'quote_added'
    | 'note'
    | 'payment_confirmed';

export interface BookingEvent {
    id: string;
    kind: BookingEventKind;
    at: string; // ISO 8601
    fromStatus?: BookingStatus;
    toStatus?: BookingStatus;
    authorId: string;
    body?: string;
}

export interface Booking {
    id: string;
    serviceId: string;
    residentId: string;
    supplierId: string;
    propertyId: string;
    status: BookingStatus;
    workflow: 'instant' | 'quote_based';
    financials?: {
        quoteAmount?: number;
        invoiceId?: string;
        isPaid: boolean;
    };
    eventTimeline: BookingEvent[];
}

/**
 * Deriva lo stato attuale dall'ultimo evento di stato nella timeline.
 */
export function getCurrentBookingStatus(booking: Booking): BookingStatus {
    for (let i = booking.eventTimeline.length - 1; i >= 0; i--) {
        const ev = booking.eventTimeline[i];
        if (ev.toStatus) return ev.toStatus;
    }
    return 'richiesto';
}

/**
 * Crea un nuovo booking inizializzando lo stato in base al workflow.
 * Include validazione sulla disponibilità del servizio per il condominio.
 */
export function createBooking(
    id: string,
    params: Omit<Booking, 'id' | 'status' | 'eventTimeline'>,
    authorId: string
): Booking {
    const service = services.find(s => s.id === params.serviceId);
    
    if (!service) {
        throw new Error(`Servizio ${params.serviceId} non trovato.`);
    }

    // Validazione: Il servizio deve essere abilitato per il condominio (propertyId) 
    // a meno che non sia un servizio pubblico garantito a tutti (se previsto in futuro)
    if (!service.availableAtPropertyIds.includes(params.propertyId)) {
        throw new Error(`Il servizio ${service.name} non è disponibile per il condominio selezionato.`);
    }

    const initialStatus: BookingStatus = params.workflow === 'instant' ? 'confermato' : 'richiesto';
    
    const creationEvent: BookingEvent = {
        id: `ev-${id}-1`,
        kind: 'created',
        at: new Date().toISOString(),
        toStatus: initialStatus,
        authorId: authorId,
        body: params.workflow === 'instant' ? 'Servizio istantaneo confermato.' : 'Richiesta di preventivo inviata.'
    };

    return {
        id,
        ...params,
        status: initialStatus,
        eventTimeline: [creationEvent]
    };
}

/**
 * Helper per indicare al residente il prossimo passo necessario.
 */
export function getBookingNextStep(booking: Booking): { label: string; description: string } {
    const status = getCurrentBookingStatus(booking);

    switch (status) {
        case 'richiesto':
            return {
                label: 'In attesa di preventivo',
                description: "Il fornitore sta valutando la tua richiesta. Riceverai una notifica con il prezzo a breve."
            };
        case 'preventivato':
            return {
                label: 'Accetta preventivo',
                description: "Il preventivo è pronto. Conferma l'intervento per procedere."
            };
        case 'confermato':
            return {
                label: 'Intervento in programma',
                description: "Il servizio è stato confermato. Il fornitore ti contatterà per i dettagli finali."
            };
        case 'completato':
            return {
                label: 'Servizio terminato',
                description: "L'intervento è concluso. Puoi procedere al pagamento o lasciare una recensione."
            };
        case 'cancellato':
            return {
                label: 'Booking annullato',
                description: "Questa richiesta è stata chiusa o cancellata."
            };
        default:
            return {
                label: 'Stato sconosciuto',
                description: "Contatta l'amministratore per maggiori informazioni."
            };
    }
}
