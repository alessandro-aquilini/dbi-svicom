<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { StarIcon, MailAdd01Icon, Wrench01Icon, PackageMovingIcon } from '@hugeicons/core-free-icons';
	import { catalogueEntries, suppliers, services } from '$lib/svicom/metrics';
	import { getUserById } from '$lib/data/users';
	import { DemoDialog } from '$lib/components/shared';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';

	let demoOpen = $state(false);

	type Tab = 'services' | 'suppliers';
	let tab = $state<Tab>('services');
	let categoryFilter = $state<string>('all');

	const entries = catalogueEntries();
	const categories = [...new Set(entries.map((e) => e.category))];

	const filtered = $derived(
		categoryFilter === 'all' ? entries : entries.filter((e) => e.category === categoryFilter)
	);

	const supplierRows = suppliers.map((s) => {
		const services_offered = services.filter((srv) => srv.supplierId === s.id).length;
		// Mock commercial: commissione % derived from rating, monthly fee € slot
		const hash = [...s.id].reduce((a, c) => a + c.charCodeAt(0), 0);
		const commissionPct = 8 + (hash % 8);
		const monthlyFee = 150 + (hash % 6) * 25;
		return { supplier: s, servicesOffered: services_offered, commissionPct, monthlyFee };
	});

	const categoryLabel: Record<string, string> = {
		'cura-animali': 'Cura animali',
		benessere: 'Benessere',
		pulizie: 'Pulizie',
		mobilita: 'Mobilità'
	};

	const availabilityClass: Record<string, string> = {
		disponibile: 'bg-success/15 text-success border-success/30',
		occupato: 'bg-warning/15 text-foreground border-warning/40',
		'fuori-servizio': 'bg-destructive/15 text-destructive border-destructive/40'
	};
</script>

<svelte:head>
	<title>Catalogo servizi — Svicom</title>
</svelte:head>

<div class="space-y-6 p-8">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Governance</p>
			<h1 class="mt-1 text-3xl font-semibold tracking-tight text-foreground">
				Catalogo servizi & partner
			</h1>
			<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
				Configura i servizi residenziali offerti dalla piattaforma, i fornitori abilitati e le relative condizioni commerciali.
			</p>
		</div>
		<button
			type="button"
			onclick={() => (demoOpen = true)}
			class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
		>
			<HugeiconsIcon icon={MailAdd01Icon} size={16} strokeWidth={1.75} />
			Invita nuovo partner
		</button>
	</header>

	<div class="rounded-xl border border-border bg-card shadow-sm">
		<div class="flex border-b border-border">
			<button
				type="button"
				onclick={() => (tab = 'services')}
				class="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors {tab ===
				'services'
					? 'border-b-2 border-primary text-primary -mb-px'
					: 'text-muted-foreground hover:text-foreground'}"
			>
				<HugeiconsIcon icon={PackageMovingIcon} size={16} strokeWidth={1.75} />
				Servizi residenziali
				<span class="rounded-full bg-muted px-2 py-0.5 text-[10px]">{entries.length}</span>
			</button>
			<button
				type="button"
				onclick={() => (tab = 'suppliers')}
				class="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors {tab ===
				'suppliers'
					? 'border-b-2 border-primary text-primary -mb-px'
					: 'text-muted-foreground hover:text-foreground'}"
			>
				<HugeiconsIcon icon={Wrench01Icon} size={16} strokeWidth={1.75} />
				Fornitori
				<span class="rounded-full bg-muted px-2 py-0.5 text-[10px]">{suppliers.length}</span>
			</button>
		</div>

		{#if tab === 'services'}
			<div class="border-b border-border px-5 py-3">
				<div class="flex flex-wrap items-center gap-1.5">
					<span class="mr-2 text-xs uppercase tracking-wider text-muted-foreground">Categoria</span>
					<button
						type="button"
						onclick={() => (categoryFilter = 'all')}
						class="rounded-md px-3 py-1 text-xs font-medium transition-colors {categoryFilter ===
						'all'
							? 'bg-primary text-primary-foreground'
							: 'border border-border text-muted-foreground hover:text-foreground'}"
					>
						Tutte
					</button>
					{#each categories as cat}
						<button
							type="button"
							onclick={() => (categoryFilter = cat)}
							class="rounded-md px-3 py-1 text-xs font-medium transition-colors {categoryFilter ===
							cat
								? 'bg-primary text-primary-foreground'
								: 'border border-border text-muted-foreground hover:text-foreground'}"
						>
							{categoryLabel[cat] ?? cat}
						</button>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
				{#each filtered as entry (entry.id)}
					{@const supplier = getUserById(entry.supplierId)}
					{@const published = entry.enabledProperties > 0}
					<article class="flex flex-col rounded-lg border border-border bg-background p-4">
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="text-[10px] uppercase tracking-wider text-muted-foreground">
									{categoryLabel[entry.category] ?? entry.category}
								</p>
								<h3 class="mt-1 truncate text-base font-semibold text-foreground">{entry.name}</h3>
								<p class="mt-0.5 truncate text-xs text-muted-foreground">
									Fornito da {supplier?.name ?? entry.supplierId}
								</p>
							</div>
							<span class="flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
								<HugeiconsIcon icon={StarIcon} size={12} strokeWidth={1.75} class="text-warning" />
								<span class="tabular-nums">{entry.rating.toFixed(1)}</span>
							</span>
						</div>

						<p class="mt-3 text-xs text-muted-foreground">{entry.availability}</p>

						<dl class="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
							<div>
								<dt class="text-muted-foreground">Prezzo</dt>
								<dd class="mt-0.5 font-medium text-foreground">{entry.pricing}</dd>
							</div>
							<div>
								<dt class="text-muted-foreground">Abilitato in</dt>
								<dd class="mt-0.5 font-medium text-foreground">
									{entry.enabledProperties} / {entry.availableProperties} immobili
								</dd>
							</div>
						</dl>

						<div class="mt-4 flex items-center justify-between">
							<button
								type="button"
								onclick={() => (demoOpen = true)}
								class="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
							>
								Configura
							</button>
							<div class="flex items-center gap-2 text-xs text-muted-foreground">
								<Label for={`pub-${entry.id}`} class="cursor-pointer text-xs text-muted-foreground">
									{published ? 'Pubblicato' : 'Bozza'}
								</Label>
								<Switch
									id={`pub-${entry.id}`}
									checked={published}
									onCheckedChange={() => (demoOpen = true)}
								/>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
						<tr>
							<th class="px-5 py-3 font-medium">Fornitore</th>
							<th class="px-5 py-3 font-medium">Categoria</th>
							<th class="px-5 py-3 font-medium">Tipo</th>
							<th class="px-5 py-3 font-medium text-right">Servizi</th>
							<th class="px-5 py-3 font-medium text-right">Condomìni</th>
							<th class="px-5 py-3 font-medium">Disponibilità</th>
							<th class="px-5 py-3 font-medium text-right">Commissione</th>
							<th class="px-5 py-3 font-medium text-right">Canone mensile</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each supplierRows as row (row.supplier.id)}
							{@const user = getUserById(row.supplier.id)}
							<tr class="hover:bg-muted/30">
								<td class="px-5 py-3">
									<div class="font-medium text-foreground">{user?.name ?? row.supplier.id}</div>
									<div class="text-xs text-muted-foreground line-clamp-1">
										{row.supplier.description}
									</div>
								</td>
								<td class="px-5 py-3 text-muted-foreground">{row.supplier.category}</td>
								<td class="px-5 py-3 text-muted-foreground">{row.supplier.type}</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.servicesOffered}</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.supplier.propertyIds.length}</td>
								<td class="px-5 py-3">
									<span
										class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize {availabilityClass[
											row.supplier.availability
										]}"
									>
										{row.supplier.availability.replace('-', ' ')}
									</span>
								</td>
								<td class="px-5 py-3 text-right tabular-nums text-foreground">{row.commissionPct}%</td>
								<td class="px-5 py-3 text-right tabular-nums text-foreground">€{row.monthlyFee}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<DemoDialog bind:open={demoOpen} />
