<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Search01Icon, Building03Icon } from '@hugeicons/core-free-icons';
	import { PropertiesMap } from '$lib/components/shared';
	import {
		buildPortfolioRows,
		healthDistribution,
		statusDistribution,
		totalProperties,
		totalUnits,
		properties
	} from '$lib/svicom/metrics';
	import { getUserById } from '$lib/data/users';
	import type { PropertyHealth, PropertyStatus } from '$lib/data/properties';

	let query = $state('');
	let healthFilter = $state<'all' | PropertyHealth>('all');
	let statusFilter = $state<'all' | PropertyStatus>('all');

	const rows = buildPortfolioRows();
	const health = healthDistribution();
	const status = statusDistribution();

	const filtered = $derived(
		rows.filter((row) => {
			const q = query.trim().toLowerCase();
			const matchQuery =
				q === '' ||
				row.property.name.toLowerCase().includes(q) ||
				row.property.address.street.toLowerCase().includes(q);
			const matchHealth = healthFilter === 'all' || row.property.health === healthFilter;
			const matchStatus = statusFilter === 'all' || row.property.status === statusFilter;
			return matchQuery && matchHealth && matchStatus;
		})
	);

	const healthDotClass: Record<PropertyHealth, string> = {
		verde: 'bg-success',
		giallo: 'bg-warning',
		rosso: 'bg-destructive'
	};
	const healthLabel: Record<PropertyHealth, string> = {
		verde: 'In salute',
		giallo: 'Da monitorare',
		rosso: 'Critico'
	};
	const statusBadgeClass: Record<PropertyStatus, string> = {
		attivo: 'bg-success/10 text-success border-success/30',
		onboarding: 'bg-primary/10 text-primary border-primary/30',
		'in-uscita': 'bg-muted text-muted-foreground border-border'
	};
</script>

<svelte:head>
	<title>Portfolio — Svicom</title>
</svelte:head>

<div class="space-y-6 p-8">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portfolio</p>
			<h1 class="mt-1 text-3xl font-semibold tracking-tight text-foreground">
				Condomìni gestiti
			</h1>
			<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
				Mappa, lista e indicatori di salute degli immobili nel network. Filtra per health e stato.
			</p>
		</div>
		<div class="flex gap-3 text-sm text-muted-foreground">
			<div class="rounded-lg border border-border bg-card px-4 py-2 text-center">
				<p class="text-[10px] uppercase tracking-wider">Immobili</p>
				<p class="mt-0.5 text-lg font-semibold text-foreground">{totalProperties}</p>
			</div>
			<div class="rounded-lg border border-border bg-card px-4 py-2 text-center">
				<p class="text-[10px] uppercase tracking-wider">Unità</p>
				<p class="mt-0.5 text-lg font-semibold text-foreground">{totalUnits}</p>
			</div>
		</div>
	</header>

	<!-- Map -->
	<section class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
		<div class="h-[420px] w-full">
			<PropertiesMap {properties} />
		</div>
	</section>

	<!-- Filters -->
	<section class="rounded-xl border border-border bg-card p-4 shadow-sm">
		<div class="flex flex-wrap items-center gap-3">
			<div class="relative flex-1 min-w-[220px]">
				<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
					<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.75} />
				</span>
				<input
					type="search"
					bind:value={query}
					placeholder="Cerca per nome o indirizzo…"
					class="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
				/>
			</div>

			<div class="flex items-center gap-1.5 rounded-lg border border-border bg-background p-1">
				{#each [{ k: 'all', label: 'Tutti' }, { k: 'verde', label: 'Verde' }, { k: 'giallo', label: 'Giallo' }, { k: 'rosso', label: 'Rosso' }] as opt}
					<button
						type="button"
						onclick={() => (healthFilter = opt.k as 'all' | PropertyHealth)}
						class="rounded-md px-3 py-1 text-xs font-medium transition-colors {healthFilter ===
						opt.k
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
					>
						{opt.label}
						{#if opt.k !== 'all'}
							<span class="ml-1 opacity-70">{health[opt.k as PropertyHealth]}</span>
						{/if}
					</button>
				{/each}
			</div>

			<div class="flex items-center gap-1.5 rounded-lg border border-border bg-background p-1">
				{#each [{ k: 'all', label: 'Tutti' }, { k: 'attivo', label: 'Attivi' }, { k: 'onboarding', label: 'Onboarding' }, { k: 'in-uscita', label: 'In uscita' }] as opt}
					<button
						type="button"
						onclick={() => (statusFilter = opt.k as 'all' | PropertyStatus)}
						class="rounded-md px-3 py-1 text-xs font-medium transition-colors {statusFilter ===
						opt.k
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
					>
						{opt.label}
						{#if opt.k !== 'all'}
							<span class="ml-1 opacity-70">{status[opt.k as PropertyStatus]}</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- List -->
	<section class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
		<table class="w-full text-sm">
			<thead class="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
				<tr>
					<th class="px-5 py-3 font-medium">Immobile</th>
					<th class="px-5 py-3 font-medium">Indirizzo</th>
					<th class="px-5 py-3 font-medium text-right">Unità</th>
					<th class="px-5 py-3 font-medium text-right">Residenti</th>
					<th class="px-5 py-3 font-medium">Amministratore</th>
					<th class="px-5 py-3 font-medium">Stato</th>
					<th class="px-5 py-3 font-medium">Health</th>
					<th class="px-5 py-3 font-medium text-right">Ticket attivi</th>
					<th class="px-5 py-3 font-medium text-right">Quote scadute</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-border">
				{#each filtered as row (row.property.id)}
					{@const admin = getUserById(row.property.adminId)}
					<tr class="transition-colors hover:bg-muted/30">
						<td class="px-5 py-3 font-medium text-foreground">
							<div class="flex items-center gap-2">
								<span class="rounded-md bg-primary/10 p-1.5 text-primary">
									<HugeiconsIcon icon={Building03Icon} size={14} strokeWidth={1.75} />
								</span>
								{row.property.name}
							</div>
						</td>
						<td class="px-5 py-3 text-muted-foreground">
							{row.property.address.street}, {row.property.address.cap} {row.property.address.city}
						</td>
						<td class="px-5 py-3 text-right tabular-nums">{row.property.units}</td>
						<td class="px-5 py-3 text-right tabular-nums">{row.residents}</td>
						<td class="px-5 py-3 text-muted-foreground">{admin?.name ?? '—'}</td>
						<td class="px-5 py-3">
							<span
								class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium {statusBadgeClass[
									row.property.status
								]}"
							>
								{row.property.status === 'in-uscita' ? 'In uscita' : row.property.status}
							</span>
						</td>
						<td class="px-5 py-3">
							<span class="inline-flex items-center gap-1.5 text-xs text-foreground">
								<span class="h-2 w-2 rounded-full {healthDotClass[row.property.health]}"></span>
								{healthLabel[row.property.health]}
							</span>
						</td>
						<td class="px-5 py-3 text-right tabular-nums">
							{#if row.activeTickets > 0}
								<span class="rounded bg-warning/15 px-2 py-0.5 text-xs font-medium text-foreground">
									{row.activeTickets}
								</span>
							{:else}
								<span class="text-muted-foreground">0</span>
							{/if}
						</td>
						<td class="px-5 py-3 text-right tabular-nums">
							{#if row.overduePayments > 0}
								<span class="rounded bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
									{row.overduePayments}
								</span>
							{:else}
								<span class="text-muted-foreground">0</span>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="9" class="px-5 py-12 text-center text-sm text-muted-foreground">
							Nessun condominio corrisponde ai filtri selezionati.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</div>
