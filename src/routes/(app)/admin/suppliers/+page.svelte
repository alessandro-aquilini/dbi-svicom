<script lang="ts">
	import { suppliers, type SupplierStatus, type SupplierType, type Supplier } from '$lib/data/suppliers';
	import { getUserById } from '$lib/data/users';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import { PropertyScopeChip } from '$lib/components/shared';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Search01Icon, GridIcon, MenuSquareIcon, StarIcon } from '@hugeicons/core-free-icons';

	type Availability = Supplier['availability'];

	const statusColors: Record<string, string> = {
		affidabile: 'bg-success/15 text-success',
		attivo: 'bg-primary/10 text-primary',
		'in-corso': 'bg-warning/15 text-warning',
		'da-monitorare': 'bg-destructive/15 text-destructive'
	};

	type ViewMode = 'grid' | 'table';
	let view = $state<ViewMode>('grid');

	let query = $state('');
	let filterStatus = $state<SupplierStatus | ''>('');
	let filterType = $state<SupplierType | ''>('');
	let filterAvailability = $state<Availability | ''>('');

	const hasLocalFilters = $derived(
		query.trim().length > 0 ||
			filterStatus !== '' ||
			filterType !== '' ||
			filterAvailability !== ''
	);

	// Suppliers scoped to the active property (sidebar): a supplier is shown only
	// if the active property lists it among its `supplierIds`. Relationship comes
	// from `properties.ts`, so no schema change needed.
	const scopedSuppliers = $derived.by(() => {
		const property = propertySelection.selected;
		if (!property) return suppliers;
		const ids = new Set(property.supplierIds);
		return suppliers.filter((s) => ids.has(s.id));
	});

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return scopedSuppliers.filter((s) => {
			if (filterStatus && s.status !== filterStatus) return false;
			if (filterType && s.type !== filterType) return false;
			if (filterAvailability && s.availability !== filterAvailability) return false;
			if (q) {
				const user = getUserById(s.id);
				const haystack =
					`${user?.name ?? ''} ${s.category} ${s.servicesOffered.join(' ')} ${s.tags.join(' ')}`.toLowerCase();
				if (!haystack.includes(q)) return false;
			}
			return true;
		});
	});

	function clearFilters() {
		query = '';
		filterStatus = '';
		filterType = '';
		filterAvailability = '';
	}
</script>

<svelte:head>
	<title>Fornitori — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Fornitori</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{#if hasLocalFilters}
					{filtered.length} di {scopedSuppliers.length} fornitori
				{:else if !propertySelection.isAll && propertySelection.selected}
					{scopedSuppliers.length} fornitori su {propertySelection.selected.name}
				{:else}
					{suppliers.length} fornitori registrati
				{/if}
			</p>
		</div>

		<div class="view-switch" role="tablist" aria-label="Modalità di visualizzazione">
			<button
				type="button"
				role="tab"
				class="view-switch__btn"
				class:is-active={view === 'grid'}
				aria-selected={view === 'grid'}
				onclick={() => (view = 'grid')}
			>
				<HugeiconsIcon icon={GridIcon} size={14} strokeWidth={2} />
				Schede
			</button>
			<button
				type="button"
				role="tab"
				class="view-switch__btn"
				class:is-active={view === 'table'}
				aria-selected={view === 'table'}
				onclick={() => (view = 'table')}
			>
				<HugeiconsIcon icon={MenuSquareIcon} size={14} strokeWidth={2} />
				Tabella
			</button>
		</div>
	</div>

	<PropertyScopeChip />

	<!-- Toolbar: search + filters -->
	<div class="mb-4 flex flex-wrap items-center gap-2">
		<div class="search-field">
			<HugeiconsIcon
				icon={Search01Icon}
				size={16}
				strokeWidth={2}
				class="search-field__icon"
			/>
			<input
				type="search"
				bind:value={query}
				placeholder="Cerca per nome, categoria o servizio…"
				class="search-field__input"
				aria-label="Cerca fornitori"
			/>
		</div>

		<select
			bind:value={filterStatus}
			class="filter-select"
			aria-label="Filtra per stato"
			class:is-active={filterStatus !== ''}
		>
			<option value="">Tutti gli stati</option>
			<option value="affidabile">Affidabile</option>
			<option value="attivo">Attivo</option>
			<option value="in-corso">In corso</option>
			<option value="da-monitorare">Da monitorare</option>
		</select>

		<select
			bind:value={filterType}
			class="filter-select"
			aria-label="Filtra per tipo"
			class:is-active={filterType !== ''}
		>
			<option value="">Tutti i tipi</option>
			<option value="condominiale">Condominiale</option>
			<option value="residenziale">Residenziale</option>
		</select>

		<select
			bind:value={filterAvailability}
			class="filter-select"
			aria-label="Filtra per disponibilità"
			class:is-active={filterAvailability !== ''}
		>
			<option value="">Tutte le disponibilità</option>
			<option value="disponibile">Disponibile</option>
			<option value="occupato">Occupato</option>
			<option value="fuori-servizio">Fuori servizio</option>
		</select>

		{#if hasLocalFilters}
			<button type="button" onclick={clearFilters} class="clear-link">
				Cancella filtri
			</button>
		{/if}
	</div>

	{#if filtered.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-16 text-center"
		>
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
				<HugeiconsIcon
					icon={Search01Icon}
					size={18}
					strokeWidth={1.75}
					class="text-muted-foreground"
				/>
			</div>
			<p class="mt-3 text-sm font-medium text-foreground">Nessun fornitore</p>
			<p class="mt-1 text-xs text-muted-foreground">
				{#if !propertySelection.isAll && scopedSuppliers.length === 0 && propertySelection.selected}
					Su <strong>{propertySelection.selected.name}</strong> non risultano fornitori associati.
				{:else if hasLocalFilters}
					Prova a cambiare i criteri di ricerca o cancella i filtri.
				{:else}
					Non ci sono fornitori registrati.
				{/if}
			</p>
		</div>
	{:else if view === 'grid'}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each filtered as supplier (supplier.id)}
				{@const user = getUserById(supplier.id)}
				<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
					<div class="flex items-start justify-between">
						<div>
							<h3 class="text-sm font-medium text-foreground">{user?.name ?? supplier.id}</h3>
							<p class="text-xs text-muted-foreground">{supplier.category}</p>
						</div>
						<span class="rounded-md px-2 py-0.5 text-xs font-medium {statusColors[supplier.status] ?? ''}">
							{supplier.status}
						</span>
					</div>
					<div class="mt-3 flex items-center gap-2">
						<span class="text-sm font-medium text-foreground">★ {supplier.rating}</span>
						<span class="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">{supplier.type}</span>
						<span class="ml-auto text-xs text-muted-foreground">{supplier.availability}</span>
					</div>
					<div class="mt-2 flex flex-wrap gap-1">
						{#each supplier.tags as tag}
							<span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-border bg-card shadow-sm">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border text-left">
							<th class="px-4 py-3 font-medium text-muted-foreground">Fornitore</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Categoria</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Rating</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Stato</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Disponibilità</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each filtered as supplier (supplier.id)}
							{@const user = getUserById(supplier.id)}
							<tr class="hover:bg-muted/50">
								<td class="px-4 py-3 font-medium text-foreground">{user?.name ?? supplier.id}</td>
								<td class="px-4 py-3 text-muted-foreground">{supplier.category}</td>
								<td class="px-4 py-3">
									<span class="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
										{supplier.type}
									</span>
								</td>
								<td class="px-4 py-3">
									<span class="rating">
										<HugeiconsIcon icon={StarIcon} size={12} strokeWidth={2} />
										{supplier.rating.toFixed(1)}
									</span>
								</td>
								<td class="px-4 py-3">
									<span class="rounded-md px-2 py-0.5 text-xs font-medium {statusColors[supplier.status] ?? ''}">
										{supplier.status}
									</span>
								</td>
								<td class="px-4 py-3 text-xs text-muted-foreground">{supplier.availability}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	/* ─── Toolbar fields (mirrored from /admin/tickets) ─── */
	.search-field {
		position: relative;
		flex: 1 1 16rem;
		min-width: 14rem;
	}

	.search-field :global(.search-field__icon) {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--muted-foreground);
		pointer-events: none;
	}

	.search-field__input {
		width: 100%;
		height: 2.25rem;
		padding: 0 0.75rem 0 2.25rem;
		border-radius: 0.5rem;
		border: 1px solid var(--input);
		background: var(--card);
		font-size: 0.875rem;
		color: var(--foreground);
	}

	.search-field__input::placeholder {
		color: var(--muted-foreground);
	}

	.search-field__input::-webkit-search-cancel-button {
		appearance: none;
	}

	.filter-select {
		height: 2.25rem;
		padding: 0 2rem 0 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--input);
		background: var(--card);
		font-size: 0.8125rem;
		color: var(--foreground);
		cursor: pointer;
	}

	.filter-select.is-active {
		border-color: color-mix(in oklch, var(--primary) 50%, var(--input));
		background: color-mix(in oklch, var(--primary) 4%, var(--card));
	}

	.clear-link {
		height: 2.25rem;
		padding: 0 0.5rem;
		border: 0;
		background: transparent;
		color: var(--muted-foreground);
		font-size: 0.8125rem;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: color 150ms ease;
	}

	.clear-link:hover {
		color: var(--foreground);
	}

	/* ─── View switch ─── */
	.view-switch {
		display: inline-flex;
		padding: 0.1875rem;
		background: var(--muted);
		border-radius: 0.5rem;
		gap: 0.125rem;
	}

	.view-switch__btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		height: 1.875rem;
		padding: 0 0.625rem;
		border: 0;
		background: transparent;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--muted-foreground);
		cursor: pointer;
		transition: background 0.12s, color 0.12s, box-shadow 0.12s;
	}

	.view-switch__btn:hover {
		color: var(--foreground);
	}

	.view-switch__btn.is-active {
		background: var(--card);
		color: var(--foreground);
		box-shadow: 0 1px 2px oklch(0 0 0 / 0.06), 0 0 0 1px var(--border);
	}

	/* ─── Inline rating in table ─── */
	.rating {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-weight: 500;
		color: var(--foreground);
	}
</style>
