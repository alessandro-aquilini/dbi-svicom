<script lang="ts">
	import { goto } from '$app/navigation';
	import { tickets, getCurrentStatus } from '$lib/data/ticket/tickets-admin';
	import { getPropertyById } from '$lib/data/properties';
	import { propertySelection } from '$lib/state/property-selection.svelte';
	import { PropertyScopeChip, EmptyState } from '$lib/components/shared';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Add01Icon, Search01Icon } from '@hugeicons/core-free-icons';

	function openTicket(id: string) {
		goto(`/admin/tickets/${id}`);
	}

	const priorityColors: Record<string, string> = {
		critica: 'bg-destructive/15 text-destructive',
		alta: 'bg-warning/15 text-warning',
		media: 'bg-primary/10 text-primary',
		bassa: 'bg-secondary text-secondary-foreground'
	};

	let query = $state('');
	let filterStatus = $state('');
	let filterPriority = $state('');
	let filterCategory = $state('');

	const scopedTickets = $derived(
		propertySelection.isAll
			? tickets
			: tickets.filter((t) => t.propertyId === propertySelection.selectedId)
	);

	const filtered = $derived(
		scopedTickets.filter((t) => {
			const matchesSearch =
				query === '' ||
				t.title.toLowerCase().includes(query.toLowerCase()) ||
				t.description.toLowerCase().includes(query.toLowerCase()) ||
				t.id.toLowerCase().includes(query.toLowerCase());
			const matchesStatus = filterStatus === '' || getCurrentStatus(t) === filterStatus;
			const matchesPriority = filterPriority === '' || t.priority === filterPriority;
			const matchesCategory = filterCategory === '' || t.category === filterCategory;

			return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
		})
	);

	const hasLocalFilters = $derived(
		query !== '' || filterStatus !== '' || filterPriority !== '' || filterCategory !== ''
	);

	function clearFilters() {
		query = '';
		filterStatus = '';
		filterPriority = '';
		filterCategory = '';
	}

	const uniqueCategories = Array.from(new Set(tickets.map((t) => t.category)));
</script>

<svelte:head>
	<title>Pratiche — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Pratiche</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{#if hasLocalFilters}
					{filtered.length} di {scopedTickets.length} pratiche
				{:else if !propertySelection.isAll}
					{scopedTickets.length} pratiche su {tickets.length} totali
				{:else}
					{tickets.length} pratiche totali
				{/if}
			</p>
		</div>
		<a
			href="/admin/tickets/new"
			class="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
		>
			<HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
			Nuova pratica
		</a>
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
				placeholder="Cerca per titolo, descrizione o ID…"
				class="search-field__input"
				aria-label="Cerca pratiche"
			/>
		</div>

		<select
			bind:value={filterStatus}
			class="filter-select"
			aria-label="Filtra per stato"
			class:is-active={filterStatus !== ''}
		>
			<option value="">Tutti gli stati</option>
			<option value="opened">Aperto</option>
			<option value="estimating">In preventivazione</option>
			<option value="approved">Approvato</option>
			<option value="in_progress">In corso</option>
			<option value="completed">Completato</option>
			<option value="paid">Pagato</option>
			<option value="closed">Chiuso</option>
		</select>

		<select
			bind:value={filterPriority}
			class="filter-select"
			aria-label="Filtra per priorità"
			class:is-active={filterPriority !== ''}
		>
			<option value="">Tutte le priorità</option>
			<option value="critica">Critica</option>
			<option value="alta">Alta</option>
			<option value="media">Media</option>
			<option value="bassa">Bassa</option>
		</select>

		<select
			bind:value={filterCategory}
			class="filter-select"
			aria-label="Filtra per categoria"
			class:is-active={filterCategory !== ''}
		>
			<option value="">Tutte le categorie</option>
			{#each uniqueCategories as category}
				<option value={category}>{category}</option>
			{/each}
		</select>

		{#if hasLocalFilters}
			<button type="button" onclick={clearFilters} class="clear-link">
				Cancella filtri
			</button>
		{/if}
	</div>

	<div class="rounded-lg border border-border bg-card shadow-sm">
		{#if filtered.length === 0}
			<div class="p-8">
				<EmptyState
					message="Nessuna pratica trovata modificando i filtri di ricerca o per il condominio selezionato."
					icon="🔍"
				/>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border text-left">
							<th class="px-4 py-3 font-medium text-muted-foreground">ID</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Titolo</th>
							{#if propertySelection.isAll}
								<th class="px-4 py-3 font-medium text-muted-foreground">Condominio</th>
							{/if}
							<th class="px-4 py-3 font-medium text-muted-foreground">Stato</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Priorità</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each filtered as ticket (ticket.id)}
							{@const property = getPropertyById(ticket.propertyId)}
							{@const currentStatus = getCurrentStatus(ticket)}
							<tr
								class="cursor-pointer hover:bg-muted/50"
								role="link"
								tabindex="0"
								onclick={() => openTicket(ticket.id)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										openTicket(ticket.id);
									}
								}}
							>
								<td class="px-4 py-3 font-mono text-xs text-muted-foreground">{ticket.id}</td>
								<td class="px-4 py-3 font-medium text-foreground">{ticket.title}</td>
								{#if propertySelection.isAll}
									<td class="px-4 py-3 text-muted-foreground">{property?.name ?? '-'}</td>
								{/if}
								<td class="px-4 py-3">
									<span class="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
										{currentStatus}
									</span>
								</td>
								<td class="px-4 py-3">
									<span class="rounded-md px-2 py-0.5 text-xs font-medium {priorityColors[ticket.priority] ?? ''}">
										{ticket.priority}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
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
</style>
