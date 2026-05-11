<script lang="ts">
	import { services, type Service, type ServiceCategory, type ServiceStatus } from '$lib/data/services';
	import { properties } from '$lib/data/properties';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import { getUserById } from '$lib/data/users';
	import { PropertyScopeChip, Dialog } from '$lib/components/shared';
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
		if (!property) return services;
		return services.filter((s) => s.availableAtPropertyIds.includes(property.id));
	});

	// Services after local filters
	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const list = propertySelection.isAll ? services : scopedServices;
		
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

	function toggleServiceForProperty(service: Service, propertyId: string) {
		// In a real app, this would be an API call
		if (service.availableAtPropertyIds.includes(propertyId)) {
			service.availableAtPropertyIds = service.availableAtPropertyIds.filter(id => id !== propertyId);
		} else {
			service.availableAtPropertyIds = [...service.availableAtPropertyIds, propertyId];
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
					{filtered.length} di {propertySelection.isAll ? services.length : scopedServices.length} servizi
				{:else if !propertySelection.isAll && propertySelection.selected}
					{scopedServices.length} servizi attivi su {propertySelection.selected.name}
				{:else}
					{services.length} servizi totali a catalogo
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
									{@const isActive = service.availableAtPropertyIds.includes(propertySelection.selected.id)}
									<span class={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-muted-foreground/30'}`}></span>
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
									<span class={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${getStatusClass(service.status)}`}>
										{service.status}
									</span>
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
	{@const s = selectedService}
	{@const supplier = getUserById(s.supplierId)}
	<Dialog 
		bind:open={dialogOpen}
		title={s.name}
		onCancel={() => { selectedService = null; dialogOpen = false }}
	>
		<div class="space-y-6 flex flex-col pt-2">
			<!-- Brand & Core Info -->
			<div class="flex flex-col gap-4 rounded-xl bg-card border border-border/60 p-4 shadow-sm">
				<div class="flex items-start justify-between gap-4">
					<div class="space-y-1.5 flex-1">
						<div class="flex items-center gap-2">
							<span class={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border shadow-sm ${getStatusClass(s.status)}`}>
								{s.status}
							</span>
							<span class="text-[10px] font-bold tracking-widest uppercase text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/40">
								{getCategoryLabel(s.category)}
							</span>
						</div>
						<div class="text-2xl font-black tracking-tight text-foreground pt-1">{s.pricing}</div>
					</div>
					<div class="flex flex-col items-end gap-2 text-right">
						<div class="text-sm font-bold bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-500/20 shadow-sm">
							{s.rating.toFixed(1)}
						</div>
						<span class="text-[10px] text-muted-foreground font-semibold">{s.comments.length} recensioni</span>
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-3 border-t border-border/40">
					<div class="flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 rounded-md border border-border/40 text-[11px] font-semibold text-foreground/80">
						<HugeiconsIcon icon={s.workflowType === 'instant' ? FlashIcon : Invoice01Icon} size={14} class="text-primary" />
						{s.workflowType === 'instant' ? 'Prenotazione Istantanea' : 'Su Preventivo'}
					</div>
					{#if s.isPublicMarketplace}
						<div class="flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 rounded-md border border-border/40 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
							<HugeiconsIcon icon={AiChat01Icon} size={14} class="text-emerald-500" />
							Marketplace Pubblico
						</div>
					{/if}
				</div>
			</div>

			<!-- Management Section -->
			<div class="space-y-3">
				<h4 class="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
					<HugeiconsIcon icon={Settings01Icon} size={14} class="text-primary/70" />
					Configurazione Condomini
				</h4>
				
				{#if !propertySelection.isAll && propertySelection.selected}
					{@const prop = propertySelection.selected}
					{@const isActive = s.availableAtPropertyIds.includes(prop.id)}
					<div class="group flex items-center justify-between p-4 rounded-xl border border-border bg-linear-to-br from-card to-muted/20 shadow-sm transition-all hover:border-primary/30">
						<div class="space-y-1">
							<div class="text-sm font-bold text-foreground">{prop.name}</div>
							<div class="text-xs text-muted-foreground font-medium">Abilita questo servizio per i residenti</div>
						</div>
						<button
							type="button"
							class={isActive
								? 'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-emerald-500'
								: 'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
							}
							onclick={() => toggleServiceForProperty(s, prop.id)}
							aria-pressed={isActive}
							title={isActive ? 'Disattiva servizio per questa proprietà' : 'Attiva servizio per questa proprietà'}
						>
							<span 
								class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
								class:translate-x-5={isActive}
								class:translate-x-0={!isActive}
							></span>
						</button>
					</div>
				{:else}
					<div class="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
							{#each properties as prop}
								{@const isActive = s.availableAtPropertyIds.includes(prop.id)}
								<button 
									type="button"
									class={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
										isActive 
											? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10' 
											: 'border-border/60 bg-card hover:border-border hover:bg-muted/30'
									}`}
									onclick={() => toggleServiceForProperty(s, prop.id)}
									title={isActive ? 'Disattiva ' + prop.name : 'Attiva ' + prop.name}
								>
									<span class={`text-[11px] font-bold truncate flex-1 pr-2 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
										{prop.name}
									</span>
									<div class={isActive
										? 'relative inline-flex h-4 w-7 shrink-0 rounded-full border border-transparent bg-emerald-500 transition-colors'
										: 'relative inline-flex h-4 w-7 shrink-0 rounded-full border border-transparent bg-muted-foreground/30 transition-colors'
									}>
										<span class={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${isActive ? 'translate-x-3' : 'translate-x-0'}`}></span>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="grid grid-cols-1 gap-4">
				<!-- Descrizione -->
				<div class="space-y-2 p-4 rounded-xl bg-card border border-border/60 shadow-sm">
					<h4 class="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Descrizione</h4>
					<p class="text-sm text-foreground/80 leading-relaxed font-medium">
						{s.description}
					</p>
				</div>
                
				<!-- Contact info -->
				<div class="space-y-2 p-4 rounded-xl bg-card border border-border/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<div class="h-10 w-10 py-1 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
							<HugeiconsIcon icon={Contact01Icon} size={20} />
						</div>
						<div>
							<h4 class="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-0.5">Fornitore</h4>
							<span class="font-bold text-sm text-foreground">{supplier?.name ?? 'Fornitore'}</span>
						</div>
					</div>
					<div class="flex flex-col gap-1.5 sm:items-end">
						{#if s.contactEmail}
							<a href="mailto:{s.contactEmail}" class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-2.5 py-1 rounded-md border border-border/30">
								<HugeiconsIcon icon={Mail01Icon} size={14} />
								{s.contactEmail}
							</a>
						{/if}
						{#if s.contactPhone}
							<a href="tel:{s.contactPhone}" class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-2.5 py-1 rounded-md border border-border/30">
								<HugeiconsIcon icon={Contact01Icon} size={14} />
								{s.contactPhone}
							</a>
						{/if}
					</div>
				</div>
			</div>

			<!-- Recent Feedback -->
			{#if s.comments.length > 0}
				<div class="space-y-3 pt-2">
					<h4 class="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Feedback Residenti</h4>
					<div class="grid grid-cols-1 gap-2.5">
						{#each s.comments as comment}
							{@const author = getUserById(comment.authorId)}
							<div class="p-3.5 rounded-xl bg-card/50 border border-border/60 shadow-sm relative overflow-hidden">
								<div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/40"></div>
								<p class="text-[13px] text-foreground/90 font-medium pl-2 leading-relaxed">"{comment.text}"</p>
								<div class="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pl-2 border-t border-border/40 pt-2">
									<span class="font-bold text-foreground/70">{author?.name ?? 'Residente'}</span>
									<span class="px-2 py-0.5 bg-muted rounded-md font-medium border border-border/30">{new Date(comment.date).toLocaleDateString('it-IT')}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
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
