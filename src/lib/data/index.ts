/**
 * Punto di ingresso del data layer (fake backend).
 * Vedi AGENTS.md (sezione "Data Layer") per le convenzioni:
 * - dati read-only (deterministic simulation)
 * - strutturato per entità di dominio
 * - relazioni espresse via ID stabili
 */
// TODO: Add invoices. 
export * as users from './users';
export * as properties from './properties';
export * as residents from './residents';
export * as suppliers from './suppliers';
export * as services from './services';

export * as tickets from './ticket/tickets-admin';

export * as announcements from './announcements';
export * as documents from './documents';
export * as chats from './chats';

export * as payments from './ticket-embeds/payments';
export * as invoices from './ticket-embeds/invoices';
export * as quotes from './ticket-embeds/quotes';

export * as maintenanceWorks from './events/maintenance-work';
export * as meetings from './events/meetings';
export * as assemblies from './events/assemblies';