<script lang="ts">
	import { suppliers, type Supplier, type SupplierType } from '$lib/data/suppliers';
	import { getUserById } from '$lib/data/users';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import { PropertyScopeChip } from '$lib/components/shared';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Search01Icon, GridIcon, MenuSquareIcon, StarIcon, Contact01Icon, Mail01Icon, Building01Icon, UserIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
	import { getServiceById } from '$lib/data/services';

	type Availability = Supplier['availability'];

	type ViewMode = 'grid' | 'table';
	let view = $state<ViewMode>('grid');

	let query = $state('');
	let filterAvailability = $state<Availability | ''>('');
	let filterType = $state<SupplierType | ''>('');

	const hasLocalFilters = $derived(query.trim().length > 0 || filterAvailability !== '' || filterType !== '');

	const scopedSuppliers = $derived.by(() => {
		const property = propertySelection.selected;
		if (!property) return suppliers;
		return suppliers.filter((s) => s.propertyIds.includes(property.id));
	});

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return scopedSuppliers.filter((s) => {
			if (filterAvailability && s.availability !== filterAvailability) return false;
			if (filterType && s.type !== filterType) return false;
			if (q) {
				const user = getUserById(s.id);
				const tags = (s.tags ?? []).join(' ');
				const haystack = `${user?.name ?? ''} ${s.category} ${s.description} ${tags}`.toLowerCase();
				if (!haystack.includes(q)) return false;
			}
			return true;
		});
	});

	function clearFilters() {
		query = '';
		filterAvailability = '';
		filterType = '';
	}

	function getTypeIcon(type: SupplierType) {
		if (type === 'Condominium') return Building01Icon;
		if (type === 'Residential') return UserIcon;
		return UserGroupIcon;
	}

	function availabilityDotClass(av: Supplier['availability']) {
		if (av === 'disponibile') return 'bg-emerald-500';
		if (av === 'occupato') return 'bg-amber-500';
		return 'bg-rose-500';
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
			bind:value={filterAvailability}
			class="filter-select"
			aria-label="Filtra per disponibilità"
			class:is-active={filterAvailability !== ''}
		>
			<option value="">Disponibilità</option>
			<option value="disponibile">Disponibile</option>
			<option value="occupato">Occupato</option>
			<option value="fuori-servizio">Fuori servizio</option>
		</select>

		<select
			bind:value={filterType}
			class="filter-select"
			aria-label="Filtra per tipo"
			class:is-active={filterType !== ''}
		>
			<option value="">Tutti i tipi</option>
			<option value="Condominium">Condominiale</option>
			<option value="Residential">Residenziale</option>
			<option value="Both">Entrambi</option>
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
				<div class="flex flex-col rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
					<div class="p-5">
						<div class="flex items-start justify-between">
							<div class="flex gap-3">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<HugeiconsIcon icon={getTypeIcon(supplier.type)} size={20} strokeWidth={1.5} />
								</div>
								<div>
									<h3 class="text-sm font-semibold text-foreground">{user?.name ?? supplier.id}</h3>
									<p class="text-xs font-medium text-primary">{supplier.category}</p>
								</div>
							</div>
							<div class="flex flex-col items-end gap-1">
								<div class="flex items-center gap-1 rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] font-bold text-secondary-foreground uppercase tracking-tight">
									<span class={`h-1 w-1 rounded-full ${availabilityDotClass(supplier.availability)}`}></span>
									{supplier.availability}
								</div>
								<span class="rating text-xs">
									<HugeiconsIcon icon={StarIcon} size={10} strokeWidth={2} class="text-amber-500 fill-amber-500" />
									{supplier.rating.toFixed(1)}
								</span>
							</div>
						</div>
						
						<div class="mt-4 text-xs leading-relaxed text-muted-foreground">
							{supplier.description}
						</div>

						<div class="mt-4 flex flex-wrap gap-1">
							<span class="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
								<HugeiconsIcon icon={getTypeIcon(supplier.type)} size={10} />
								{supplier.type}
							</span>
							{#each supplier.tags ?? [] as tag}
								<span class="rounded-full bg-secondary/30 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
									{tag}
								</span>
							{/each}

							{#if supplier.serviceIds && supplier.serviceIds.length > 0}
								<div class="w-full mt-2 text-[12px] text-muted-foreground">
									<p class="text-[11px] font-semibold text-muted-foreground/80">Servizi residenziali</p>
									<ul class="mt-1 list-disc list-inside">
										{#each supplier.serviceIds as sid}
											{@const svc = getServiceById(sid)}
											<li>{svc ? svc.name : sid}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					</div>

					<div class="mt-auto border-t border-border/50 bg-muted/5 p-4 space-y-3">
						<div class="grid grid-cols-2 gap-2">
							{#if user?.email}
								<div class="flex items-center gap-2 overflow-hidden text-[11px] text-muted-foreground">
									<HugeiconsIcon icon={Mail01Icon} size={14} strokeWidth={1.5} />
									<span class="truncate">{user.email}</span>
								</div>
							{/if}
							{#if user?.phone}
								<div class="flex items-center gap-2 text-[11px] text-muted-foreground">
									<HugeiconsIcon icon={Contact01Icon} size={14} strokeWidth={1.5} />
									<span>{user.phone}</span>
								</div>
							{/if}
						</div>

						{#if supplier.comments && supplier.comments.length > 0}
							<div class="space-y-2 border-t border-border/50 pt-3">
								<p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Note Recenti</p>
								{#each supplier.comments as comment}
									{@const author = getUserById(comment.authorId)}
									<div class="rounded-md bg-white border border-border/40 p-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
										<p class="text-xs text-foreground/90 leading-normal italic">"{comment.text}"</p>
										<div class="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/20 pt-1.5">
											<span class="font-medium">{author?.name ?? 'Utente'}</span>
											<span>{new Date(comment.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</span>
										</div>
									</div>
								{/each}
							</div>
						{/if}
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
							<th class="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Contatti</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Categoria</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Descrizione</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Rating</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Disponibilità</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Tag</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each filtered as supplier (supplier.id)}
							{@const user = getUserById(supplier.id)}
							<tr class="hover:bg-muted/50">
								<td class="px-4 py-3">
									<p class="font-medium text-foreground">{user?.name ?? supplier.id}</p>
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-1 text-[11px] text-muted-foreground">
										<HugeiconsIcon icon={getTypeIcon(supplier.type)} size={12} />
										{supplier.type}
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
										{#if user?.email}
											<span class="truncate">{user.email}</span>
										{/if}
										{#if user?.phone}
											<span>{user.phone}</span>
										{/if}
									</div>
								</td>
								<td class="px-4 py-3 text-muted-foreground">{supplier.category}</td>
								<td class="px-4 py-3">
									<span class="block max-w-xs truncate text-xs text-muted-foreground" title={supplier.description}>
										{supplier.description}
									</span>
								</td>
								<td class="px-4 py-3">
									<span class="rating">
										<HugeiconsIcon icon={StarIcon} size={12} strokeWidth={2} />
										{supplier.rating.toFixed(1)}
									</span>
								</td>
								<td class="px-4 py-3 text-xs text-muted-foreground">{supplier.availability}</td>
								<td class="px-4 py-3">
									<div class="flex flex-wrap gap-1">
										{#each supplier.tags ?? [] as tag}
											<span class="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
										{/each}
									</div>
								</td>
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
