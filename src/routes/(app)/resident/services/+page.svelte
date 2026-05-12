<script lang="ts">
	import { services, type Service, type ServiceCategory } from '$lib/data/services';
	import { getResidentById } from '$lib/data/residents';
	import { getCurrentUser } from '$lib/auth';
	import { Dialog } from '$lib/components/shared';
	import ServiceCard from '$lib/components/services/ServiceCard.svelte';
	import ServiceDetailView from '$lib/components/services/ServiceDetailView.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Search01Icon,
		GridIcon,
		MenuSquareIcon,
		InformationCircleIcon,
		StarIcon
	} from '@hugeicons/core-free-icons';

	// For resident view, we filter based on the resident's property
	const currentUser = getCurrentUser();
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;
	const propertyId = resident?.propertyId;

	let allServices = $state(services);

	type ViewMode = 'grid' | 'table';
	let view = $state<ViewMode>('grid');

	let query = $state('');
	let filterCategory = $state<ServiceCategory | ''>('');

	let selectedService = $state<Service | null>(null);
	let dialogOpen = $state(false);

	const hasLocalFilters = $derived(query.trim().length > 0 || filterCategory !== '');

	// Services filtered by the resident's property (only enabled services)
	const scopedServices = $derived.by(() => {
		if (!propertyId) return [];
		return allServices.filter((s) => s.enabledAtPropertyIds.includes(propertyId));
	});

	// Services after local filters
	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		
		return scopedServices.filter((s) => {
			if (filterCategory && s.category !== filterCategory) return false;
			if (q) {
				const haystack = `${s.name} ${s.description} ${s.category}`.toLowerCase();
				if (!haystack.includes(q)) return false;
			}
			return true;
		});
	});

	function clearFilters() {
		query = '';
		filterCategory = '';
	}

	function getCategoryLabel(cat: ServiceCategory) {
		const labels: Record<ServiceCategory, string> = {
			'cura-animali': 'Cura Animali',
			'benessere': 'Benessere',
			'pulizie': 'Pulizie',
			'mobilita': 'Mobilità'
		};
		return labels[cat] || cat;
	}
</script>

<svelte:head>
	<title>Servizi — Svicom Living Hub</title>
</svelte:head>

<div class="p-4 lg:p-6 pb-24">
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Servizi per te</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{#if hasLocalFilters}
					{filtered.length} di {scopedServices.length} servizi disponibili
				{:else}
					Tutti i servizi attivi nel tuo condominio
				{/if}
			</p>
		</div>

		<div class="view-switch sm:flex hidden" role="tablist" aria-label="Modalità di visualizzazione">
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

	<!-- Toolbar -->
	<div class="mb-6 flex flex-wrap items-center gap-2">
		<div class="search-field">
			<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={2} class="search-field__icon" />
			<input
				type="search"
				bind:value={query}
				placeholder="Cerca servizi…"
				class="search-field__input"
				aria-label="Cerca servizi"
			/>
		</div>

		<select bind:value={filterCategory} class="filter-select" class:is-active={filterCategory !== ''}>
			<option value="">Tutte le categorie</option>
			<option value="cura-animali">Cura Animali</option>
			<option value="benessere">Benessere</option>
			<option value="pulizie">Pulizie</option>
			<option value="mobilita">Mobilità</option>
		</select>

		{#if hasLocalFilters}
			<button type="button" onclick={clearFilters} class="clear-link">
				Cancella
			</button>
		{/if}
	</div>

	{#if filtered.length === 0}
		<div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
				<HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.5} class="text-muted-foreground" />
			</div>
			<p class="mt-4 text-sm font-semibold text-foreground">Nessun servizio trovato</p>
			<p class="mt-1 text-xs text-muted-foreground">Prova a cambiare i filtri o la ricerca.</p>
		</div>
	{:else if view === 'grid'}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filtered as service (service.id)}
				<ServiceCard 
					{service} 
					onclick={() => { selectedService = service; dialogOpen = true }}
				/>
			{/each}
		</div>
	{:else}
		<div class="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border bg-muted/30 text-left">
							<th class="px-4 py-3 font-medium text-muted-foreground">Servizio</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Categoria</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Prezzo base</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Valutazione</th>
							<th class="px-4 py-3 font-medium text-muted-foreground text-right">Dettagli</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each filtered as service (service.id)}
							<tr class="hover:bg-muted/50 group transition-colors">
								<td class="px-4 py-3 min-w-50">
									<div class="font-medium text-foreground">{service.name}</div>
									<div class="text-[11px] text-muted-foreground truncate max-w-xs">{service.description}</div>
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<span class="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
										{getCategoryLabel(service.category)}
									</span>
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-xs font-semibold text-primary">
									{service.pricing}
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<div class="flex items-center gap-1 text-amber-500">
										<HugeiconsIcon icon={StarIcon} size={12} strokeWidth={2} class="fill-current" />
										<span class="text-xs font-bold">{service.rating.toFixed(1)}</span>
									</div>
								</td>
								<td class="px-4 py-3 text-right">
									<button 
										class="p-2 hover:bg-primary/10 rounded-full text-muted-foreground hover:text-primary transition-all"
										onclick={() => { selectedService = service; dialogOpen = true }}
										title="Vedi dettagli"
									>
										<HugeiconsIcon icon={InformationCircleIcon} size={18} />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

{#if selectedService}
	<Dialog 
		bind:open={dialogOpen}
		title=""
		confirmLabel="Chiudi"
		hideCancel
		onConfirm={() => { selectedService = null; dialogOpen = false }}
		onCancel={() => { selectedService = null; dialogOpen = false }}
	>
		{#if selectedService}
			<ServiceDetailView 
				service={selectedService} 
				isAdmin={false}
			/>
		{/if}
	</Dialog>
{/if}

<style>
	/* Toolbar fields */
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
		height: 2.5rem;
		padding: 0 0.75rem 0 2.25rem;
		border-radius: 0.75rem;
		border: 1px solid var(--border);
		background: var(--card);
		font-size: 0.875rem;
		color: var(--foreground);
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	
	.search-field__input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 1px var(--primary);
	}

	.filter-select {
		height: 2.5rem;
		padding: 0 2rem 0 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid var(--border);
		background: var(--card);
		font-size: 0.8125rem;
		color: var(--foreground);
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.filter-select.is-active {
		border-color: var(--primary);
		background: color-mix(in oklch, var(--primary) 5%, var(--card));
	}

	.clear-link {
		height: 2.5rem;
		padding: 0 0.75rem;
		border: 0;
		background: transparent;
		color: var(--muted-foreground);
		font-size: 0.8125rem;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	/* View switch */
	.view-switch {
		display: inline-flex;
		padding: 0.25rem;
		background: var(--muted);
		border-radius: 0.75rem;
		gap: 0.25rem;
	}

	.view-switch__btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		height: 2rem;
		padding: 0 0.75rem;
		border: 0;
		background: transparent;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted-foreground);
		cursor: pointer;
		transition: all 0.2s;
	}

	.view-switch__btn.is-active {
		background: var(--card);
		color: var(--foreground);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
</style>
