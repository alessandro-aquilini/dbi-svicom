/**
 * Punto di ingresso del data layer (fake backend).
 * Vedi AGENTS.md (sezione "Data Layer") per le convenzioni:
 * - dati read-only (deterministic simulation)
 * - strutturato per entità di dominio
 * - relazioni espresse via ID stabili
 */

export * as users from './users';
export * as properties from './properties';
export * as residents from './residents';
export * as suppliers from './suppliers';
export * as tickets from './tickets';
export * as events from './events';
export * as payments from './payments';
export * as quotes from './quotes';
export * as announcements from './announcements';
export * as documents from './documents';
export * as services from './services';
export * as assemblies from './assemblies';
export * as chats from './chats';
