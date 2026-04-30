<script lang="ts">
	import { tickets, type TicketPriority, type TicketStatus, type TicketType } from '$lib/data/tickets';
	import { getPropertyById } from '$lib/data/properties';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Add01Icon, Search01Icon } from '@hugeicons/core-free-icons';

	const priorityColors: Record<string, string> = {
		critica: 'bg-destructive/15 text-destructive',
		alta: 'bg-warning/15 text-warning',
		media: 'bg-primary/10 text-primary',
		bassa: 'bg-secondary text-secondary-foreground'
	};

	let query = $state('');
	let filterStatus = $state<TicketStatus | ''>('');
	let filterPriority = $state<TicketPriority | ''>('');
	let filterType = $state<TicketType | ''>('');

	const hasFilters = $derived(
		query.trim().length > 0 || filterStatus !== '' || filterPriority !== '' || filterType !== ''
	);

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return tickets.filter((t) => {
			if (filterStatus && t.status !== filterStatus) return false;
			if (filterPriority && t.priority !== filterPriority) return false;
			if (filterType && t.type !== filterType) return false;
			if (q) {
				const haystack = `${t.id} ${t.title} ${t.description}`.toLowerCase();
				if (!haystack.includes(q)) return false;
			}
			return true;
		});
	});

	function clearFilters() {
		query = '';
		filterStatus = '';
		filterPriority = '';
		filterType = '';
	}
</script>

<svelte:head>
	<title>Pratiche — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Pratiche</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{#if hasFilters}
					{filtered.length} di {tickets.length} pratiche
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
			<option value="nuovo">Nuovo</option>
			<option value="assegnato">Assegnato</option>
			<option value="in-corso">In corso</option>
			<option value="risolto">Risolto</option>
			<option value="chiuso">Chiuso</option>
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
			bind:value={filterType}
			class="filter-select"
			aria-label="Filtra per tipo"
			class:is-active={filterType !== ''}
		>
			<option value="">Tutti i tipi</option>
			<option value="segnalazione">Segnalazione</option>
			<option value="intervento">Intervento</option>
			<option value="amministrativo">Amministrativo</option>
		</select>

		{#if hasFilters}
			<button type="button" onclick={clearFilters} class="clear-link">
				Cancella filtri
			</button>
		{/if}
	</div>

	<div class="rounded-lg border border-border bg-card shadow-sm">
		{#if filtered.length === 0}
			<div class="flex flex-col items-center justify-center px-6 py-16 text-center">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
					<HugeiconsIcon
						icon={Search01Icon}
						size={18}
						strokeWidth={1.75}
						class="text-muted-foreground"
					/>
				</div>
				<p class="mt-3 text-sm font-medium text-foreground">Nessuna pratica trovata</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Prova a cambiare i criteri di ricerca o cancella i filtri.
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border text-left">
							<th class="px-4 py-3 font-medium text-muted-foreground">ID</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Titolo</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Condominio</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Stato</th>
							<th class="px-4 py-3 font-medium text-muted-foreground">Priorità</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each filtered as ticket (ticket.id)}
							{@const property = getPropertyById(ticket.propertyId)}
							<tr class="hover:bg-muted/50">
								<td class="px-4 py-3 font-mono text-xs text-muted-foreground">{ticket.id}</td>
								<td class="px-4 py-3 font-medium text-foreground">{ticket.title}</td>
								<td class="px-4 py-3 text-muted-foreground">{property?.name ?? '-'}</td>
								<td class="px-4 py-3">
									<span
										class="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
									>
										{ticket.status}
									</span>
								</td>
								<td class="px-4 py-3">
									<span
										class="rounded-md px-2 py-0.5 text-xs font-medium {priorityColors[
											ticket.priority
										] ?? ''}"
									>
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
