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

export * as tickets from './tickets-admin';

export * as announcements from './announcements';
export * as documents from './documents';
export * as chats from './chats';

export * as payments from './payments';
export * as invoices from './invoices';
export * as quotes from './quotes';

export * as maintenanceWorks from './maintenance-work';
export * as meetings from './meetings';
export * as assemblies from './assemblies';