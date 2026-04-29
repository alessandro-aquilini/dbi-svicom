/**
 * Shared types for the Svicom Living Hub platform.
 *
 * Domain types (User, Property, Ticket, etc.) are defined alongside their
 * data modules in src/lib/data/. This file holds UI-level and cross-cutting
 * types that don't belong to any single domain module.
 */

/** Navigation item used in sidebar and bottom navigation */
export interface NavItem {
	label: string;
	href: string;
	icon: string;
	badge?: number;
}

/** Role-aware current session (will be expanded with real auth) */
export interface Session {
	userId: string;
	role: 'admin' | 'resident' | 'supplier';
}

/** Generic paginated response shape */
export interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}

/** Status badge variant mapping */
export type StatusVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted';
