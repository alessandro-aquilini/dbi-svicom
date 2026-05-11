<script lang="ts">
	import { services, type Service, type ServiceCategory, type ServiceStatus } from '$lib/data/services';
	import { properties } from '$lib/data/properties';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import { getUserById } from '$lib/data/users';
	import { PropertyScopeChip, Dialog } from '$lib/components/shared';
	import ServiceDetailView from '$lib/components/admin/ServiceDetailView.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Search01Icon,
		GridIcon,
		MenuSquareIcon,
		StarIcon,
		Mail01Icon,
		Contact01Icon,
		Settings01Icon,
		Tick01Icon,
		Cancel01Icon,
		InformationCircleIcon,
		AiChat01Icon,
		FlashIcon,
		Invoice01Icon
	} from '@hugeicons/core-free-icons';

	let allServices = $state(services);

	type ViewMode = 'grid' | 'table';
	let view = $state<ViewMode>('grid');

	let query = $state('');
	let filterCategory = $state<ServiceCategory | ''>('');
	let filterStatus = $state<ServiceStatus | ''>('');

	let selectedService = $state<Service | null>(null);
	let dialogOpen = $state(false);

	const hasLocalFilters = $derived(query.trim().length > 0 || filterCategory !== '' || filterStatus !== '');

	// Services filtered by current property selection
	const scopedServices = $derived.by(() => {
		const property = propertySelection.selected;
		if (!property) return allServices;
		// Use availableAtPropertyIds so the service stays visible even if disabled
		return allServices.filter((s) => s.availableAtPropertyIds.includes(property.id));
	});

	// Services after local filters
	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const list = propertySelection.isAll ? allServices : scopedServices;
		
		return list.filter((s) => {
			if (filterCategory && s.category !== filterCategory) return false;
			if (filterStatus && s.status !== filterStatus) return false;
			if (q) {
				const supplier = getUserById(s.supplierId);
				const haystack = `${s.name} ${s.description} ${supplier?.name ?? ''} ${s.category}`.toLowerCase();
				if (!haystack.includes(q)) return false;
			}
			return true;
		});
	});

	function clearFilters() {
		query = '';
		filterCategory = '';
		filterStatus = '';
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

	function getStatusClass(status: ServiceStatus) {
		if (status === 'attivo') return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
		if (status === 'beta') return 'bg-amber-500/10 text-amber-600 border-amber-200';
		return 'bg-blue-500/10 text-blue-600 border-blue-200';
	}

	function toggleServiceForProperty(_service: Service, propertyId: string) {
		// Ensure we operate on the provided service (not necessarily the selected dialog)
		const index = allServices.findIndex((s) => s.id === _service.id);
		if (index === -1) return;

		// Only allow toggling if the property is part of availableAtPropertyIds
		const available = allServices[index].availableAtPropertyIds;
		if (!available.includes(propertyId)) return;

		// Toggle presence while ensuring enabled list never contains unavailable ids
		let updatedEnabled = allServices[index].enabledAtPropertyIds.filter((id) => available.includes(id));
		if (updatedEnabled.includes(propertyId)) {
			updatedEnabled = updatedEnabled.filter((id) => id !== propertyId);
		} else {
			updatedEnabled = [...updatedEnabled, propertyId];
		}

		// Reassign to trigger Svelte 5 reactivity for the whole list
		allServices[index] = {
			...allServices[index],
			enabledAtPropertyIds: updatedEnabled
		};

		// Keep the dialog in sync if it shows the same service
		if (selectedService && selectedService.id === _service.id) {
			selectedService = allServices[index];
		}
	}
</script>

<svelte:head>
	<title>Servizi Residenziali — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Servizi Residenziali</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{#if hasLocalFilters}
					{filtered.length} di {propertySelection.isAll ? allServices.length : scopedServices.length} servizi
				{:else if !propertySelection.isAll && propertySelection.selected}
					{scopedServices.length} servizi attivi su {propertySelection.selected.name}
				{:else}
					{allServices.length} servizi totali a catalogo
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

	<!-- Toolbar -->
	<div class="mb-4 flex flex-wrap items-center gap-2">
		<div class="search-field">
			<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={2} class="search-field__icon" />
			<input
				type="search"
				bind:value={query}
				placeholder="Cerca per nome, categoria o fornitore…"
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

		<select bind:value={filterStatus} class="filter-select" class:is-active={filterStatus !== ''}>
			<option value="">Tutti gli stati</option>
			<option value="attivo">Attivo</option>
			<option value="beta">Beta</option>
			<option value="in-richiesta">In richiesta</option>
		</select>

		{#if hasLocalFilters}
			<button type="button" onclick={clearFilters} class="clear-link">
				Cancella filtri
			</button>
		{/if}
	</div>

	{#if filtered.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
				<HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.75} class="text-muted-foreground" />
			</div>
			<p class="mt-3 text-sm font-medium text-foreground">Nessun servizio trovato</p>
			<p class="mt-1 text-xs text-muted-foreground">Prova a cambiare i criteri di ricerca o seleziona un altro condominio.</p>
		</div>
	{:else if view === 'grid'}
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filtered as service (service.id)}
				{@const supplier = getUserById(service.supplierId)}
				<button 
					type="button"
					class="group relative flex flex-col justify-between p-4 rounded-2xl border border-border bg-card transition-all hover:bg-muted/20 hover:shadow-xl hover:-translate-y-1 text-left"
					onclick={() => { selectedService = service; dialogOpen = true }}
				>
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div class="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
								<HugeiconsIcon icon={service.workflowType === 'instant' ? FlashIcon : Invoice01Icon} size={20} />
							</div>
							<div class="flex items-center gap-2">
								{#if !propertySelection.isAll && propertySelection.selected}
									{@const isEnabled = service.enabledAtPropertyIds.includes(propertySelection.selected.id)}
									<span class={`h-2 w-2 rounded-full ${isEnabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-muted-foreground/30'}`}></span>
								{/if}
								<span class={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border ${getStatusClass(service.status)}`}>
									{service.status}
								</span>
							</div>
						</div>

						<div class="space-y-1">
							<h3 class="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
								{service.name}
							</h3>
							<div class="flex items-center gap-1.5 text-[10px]">
								<span class="font-bold text-primary/70 uppercase tracking-tight">{getCategoryLabel(service.category)}</span>
								<span class="opacity-20">|</span>
								<span class="font-medium text-muted-foreground truncate">{supplier?.name}</span>
							</div>
						</div>
					</div>

					<div class="mt-8 flex items-end justify-between border-t border-border/40 pt-4">
						<div class="space-y-0.5">
							<p class="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Prezzo base</p>
							<p class="text-base font-black text-foreground">{service.pricing}</p>
						</div>
						
						<div class="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-all">
							<HugeiconsIcon icon={InformationCircleIcon} size={14} />
						</div>
					</div>
				</button>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border bg-muted/30 text-left">
							<th class="px-4 py-3 font-medium text-muted-foreground">Servizio</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Categoria</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Fornitore</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Prezzo</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Rating</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Stato</th>
							<th class="px-4 py-3 font-medium text-muted-foreground text-right">Azioni</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each filtered as service (service.id)}
							{@const supplier = getUserById(service.supplierId)}
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
								<td class="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
									{supplier?.name ?? '-'}
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-xs font-medium text-primary">
									{service.pricing}
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<div class="flex items-center gap-1 text-amber-500">
										<HugeiconsIcon icon={StarIcon} size={12} strokeWidth={2} class="fill-current" />
										<span class="text-xs font-bold">{service.rating.toFixed(1)}</span>
									</div>
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<div class="flex items-center gap-2">
										{#if !propertySelection.isAll && propertySelection.selected}
											{@const isEnabled = service.enabledAtPropertyIds.includes(propertySelection.selected.id)}
											<span class={`h-2 w-2 rounded-full ${isEnabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-muted-foreground/30'}`} title={isEnabled ? 'Servizio attivo' : 'Servizio disattivato'}></span>
										{/if}
										<span class={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${getStatusClass(service.status)}`}>
											{service.status}
										</span>
									</div>
								</td>
								<td class="px-4 py-3 text-right">
									<button 
										class="p-1.5 hover:bg-primary/10 rounded-md text-muted-foreground hover:text-primary transition-all"
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
				onToggleProperty={toggleServiceForProperty}
				selectedPropertyId={propertySelection.selected?.id}
				isAllProperties={propertySelection.isAll}
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
		height: 2.25rem;
		padding: 0 0.75rem 0 2.25rem;
		border-radius: 0.5rem;
		border: 1px solid var(--input);
		background: var(--card);
		font-size: 0.875rem;
		color: var(--foreground);
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
	}

	/* View switch */
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

	.view-switch__btn.is-active {
		background: var(--card);
		color: var(--foreground);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 0 0 1px var(--border);
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: 10px;
	}
</style>
