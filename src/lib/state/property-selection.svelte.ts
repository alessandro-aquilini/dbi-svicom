/**
 * Globally-shared selection of the "condominio attivo".
 *
 * `null` means "Tutti" — the user is looking at the whole portfolio.
 * Any non-null value is a `Property.id` from `src/lib/data/properties.ts`.
 *
 * Pages can read `propertySelection.selectedId` and apply their own filters.
 * No filtering logic lives here — this module owns selection state only.
 */

import { properties, getPropertyById, type Property } from '$lib/data/properties';

class PropertySelection {
	selectedId: string | null = $state(null);

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
	}
}

export const propertySelection = new PropertySelection();
