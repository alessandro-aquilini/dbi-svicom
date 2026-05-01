/**
 * Globally-shared selection of the "condominio attivo".
 *
 * `null` means "Tutti" — the user is looking at the whole portfolio.
 * Any non-null value is a `Property.id` from `src/lib/data/properties.ts`.
 *
 * Pages can read `propertySelection.selectedId` and apply their own filters.
 * No filtering logic lives here — this module owns selection state only.
 *
 * The selection persists in `localStorage` so it survives a page refresh.
 * SSR-safe: reads/writes only happen in the browser.
 */

import { browser } from '$app/environment';
import { properties, getPropertyById, type Property } from '$lib/data/properties';

const STORAGE_KEY = 'svicom:active-property';
const ALL_SENTINEL = '__all__';

function loadInitial(): string | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === null || raw === ALL_SENTINEL) return null;
		// Validate against the current dataset — a stale id (e.g. property removed)
		// silently falls back to "Tutti".
		return getPropertyById(raw) ? raw : null;
	} catch {
		return null;
	}
}

function persist(id: string | null) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, id ?? ALL_SENTINEL);
	} catch {
		// Storage may be unavailable (private mode, quota, etc.) — non-fatal.
	}
}

class PropertySelection {
	selectedId: string | null = $state(loadInitial());

	get selected(): Property | null {
		return this.selectedId ? (getPropertyById(this.selectedId) ?? null) : null;
	}

	get isAll(): boolean {
		return this.selectedId === null;
	}

	get options(): Property[] {
		return properties;
	}

	select(id: string | null) {
		this.selectedId = id;
		persist(id);
	}
}

export const propertySelection = new PropertySelection();
