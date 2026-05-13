<script lang="ts">
	import { services, type Service } from '$lib/data/services';
	import { getUserById } from '$lib/data/users';
	import { getSupplierById } from '$lib/data/suppliers';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import { PropertyScopeChip } from '$lib/components/shared';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Search01Icon, GridIcon, MenuSquareIcon, Mail01Icon, Contact01Icon, StarIcon } from '@hugeicons/core-free-icons';

	type ViewMode = 'grid' | 'table';
	let view = $state<ViewMode>('grid');

	let query = $state('');

	const scopedServices = $derived.by(() => {
		const property = propertySelection.selected;
		if (!property) return services;
		// keep services whose supplier has at least one matching property
		return services.filter((s) => {
			const supplier = getSupplierById(s.supplierId);
			if (!supplier) return false;
			return supplier.propertyIds.includes(property.id);
		});
	});

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return scopedServices.filter((s) => {
			if (q) {
				const hay = `${s.name} ${s.category} ${s.description} ${s.pricing}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			return true;
		});
	});

	function clearFilters() {
		query = '';
	}
</script>

<svelte:head>
	<title>Servizi residenziali — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Servizi residenziali</h1>
			<p class="mt-1 text-sm text-muted-foreground">{services.length} servizi registrati</p>
		</div>

		<div class="view-switch" role="tablist" aria-label="Modalità di visualizzazione">
			<button type="button" class="view-switch__btn" class:is-active={view === 'grid'} onclick={() => (view = 'grid')}>
				<HugeiconsIcon icon={GridIcon} size={14} strokeWidth={2} />
				Schede
			</button>
			<button type="button" class="view-switch__btn" class:is-active={view === 'table'} onclick={() => (view = 'table')}>
				<HugeiconsIcon icon={MenuSquareIcon} size={14} strokeWidth={2} />
				Tabella
			</button>
		</div>
	</div>

	<PropertyScopeChip />

	<div class="mb-4 flex flex-wrap items-center gap-2">
		<div class="search-field">
			<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={2} class="search-field__icon" />
			<input type="search" bind:value={query} placeholder="Cerca per nome, categoria o descrizione…" class="search-field__input" />
		</div>

		{#if query.trim().length > 0}
			<button type="button" onclick={clearFilters} class="clear-link">Cancella filtri</button>
		{/if}
	</div>

	{#if filtered.length === 0}
		<div class="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
			<p class="mt-3 text-sm font-medium text-foreground">Nessun servizio</p>
			<p class="mt-1 text-xs text-muted-foreground">Prova a cambiare i criteri di ricerca.</p>
		</div>
	{:else if view === 'grid'}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each filtered as svc}
				{@const supplier = getUserById(svc.supplierId)}
				<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
					<div class="flex items-start justify-between">
						<div>
							<h3 class="text-sm font-semibold text-foreground">{svc.name}</h3>
							<p class="text-xs text-muted-foreground">{svc.category} • {svc.pricing}</p>
						</div>
						<div class="text-right text-xs text-muted-foreground">
							<p>{supplier?.name ?? svc.supplierId}</p>
							{#if svc.contactEmail}
								<p class="truncate">{svc.contactEmail}</p>
							{/if}
							{#if svc.contactPhone}
								<p>{svc.contactPhone}</p>
							{/if}
						</div>
					</div>

					<div class="mt-3 text-xs text-muted-foreground">{svc.description}</div>

					<div class="mt-4 space-y-2 border-t border-border/50 pt-3">
						<p class="text-[11px] font-semibold text-muted-foreground/80">Feedback</p>
						{#each svc.comments as c}
							{@const author = getUserById(c.authorId)}
							<div class="text-[12px] text-foreground/90 italic">"{c.text}"</div>
							<div class="text-[11px] text-muted-foreground">{author?.name ?? c.authorId} — {new Date(c.date).toLocaleDateString()}</div>
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
							<th class="px-4 py-3 font-medium text-muted-foreground">Servizio</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Categoria</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Fornitore</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Contatti</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Rating</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each filtered as svc}
							{@const supplier = getUserById(svc.supplierId)}
							<tr class="hover:bg-muted/50">
								<td class="px-4 py-3 font-medium text-foreground">{svc.name}</td>
								<td class="px-4 py-3 text-muted-foreground">{svc.category}</td>
								<td class="px-4 py-3">{supplier?.name ?? svc.supplierId}</td>
								<td class="px-4 py-3 text-[11px] text-muted-foreground">
									{#if svc.contactEmail}
										<div>{svc.contactEmail}</div>
									{/if}
									{#if svc.contactPhone}
										<div>{svc.contactPhone}</div>
									{/if}
								</td>
								<td class="px-4 py-3">{svc.rating.toFixed(1)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
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
</style>
