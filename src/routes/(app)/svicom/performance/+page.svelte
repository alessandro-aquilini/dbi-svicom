<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { UserGroupIcon, Wrench01Icon, Building03Icon, StarIcon } from '@hugeicons/core-free-icons';
	import {
		adminKpis,
		supplierKpis,
		condoKpis,
		eurFormatter
	} from '$lib/svicom/metrics';

	type Section = 'admins' | 'suppliers' | 'condos';
	let active = $state<Section>('admins');

	const admins = adminKpis();
	const sups = supplierKpis();
	const condos = condoKpis();

	const avgAdminResponse =
		admins.reduce((s, a) => s + a.avgResponseHours, 0) / Math.max(admins.length, 1);
	const avgAdoption =
		admins.reduce((s, a) => s + a.adoptionPct, 0) / Math.max(admins.length, 1);
	const avgSupplierRating =
		sups.reduce((s, k) => s + k.rating, 0) / Math.max(sups.length, 1);
	const avgOnTime = sups.reduce((s, k) => s + k.onTimePct, 0) / Math.max(sups.length, 1);
	const avgEngagement =
		condos.reduce((s, c) => s + c.engagementPct, 0) / Math.max(condos.length, 1);
	const avgSatisfaction =
		condos.reduce((s, c) => s + c.satisfactionScore, 0) / Math.max(condos.length, 1);

	const tabs = [
		{ key: 'admins' as Section, label: 'Amministratori', icon: UserGroupIcon, count: admins.length },
		{ key: 'suppliers' as Section, label: 'Fornitori', icon: Wrench01Icon, count: sups.length },
		{ key: 'condos' as Section, label: 'Condomìni', icon: Building03Icon, count: condos.length }
	];

	function barClass(pct: number) {
		if (pct >= 75) return 'bg-success';
		if (pct >= 50) return 'bg-warning';
		return 'bg-destructive';
	}
</script>

<svelte:head>
	<title>Performance — Svicom</title>
</svelte:head>

<div class="space-y-6 p-8">
	<header>
		<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Performance</p>
		<h1 class="mt-1 text-3xl font-semibold tracking-tight text-foreground">
			KPI dell'ecosistema
		</h1>
		<p class="mt-2 max-w-2xl text-sm text-muted-foreground">
			Confronto operativo tra amministratori, fornitori e condomìni. Le metriche sono aggregate sui dati operativi del periodo corrente.
		</p>
	</header>

	<!-- Summary cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<div class="rounded-xl border border-border bg-card p-5 shadow-sm">
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				Amministratori
			</p>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-3xl font-semibold text-primary">{avgAdminResponse.toFixed(1)}h</span>
				<span class="text-xs text-muted-foreground">tempo medio di risposta</span>
			</div>
			<p class="mt-2 text-xs text-muted-foreground">
				Adozione media piattaforma: <span class="font-medium text-foreground">{avgAdoption.toFixed(0)}%</span>
			</p>
		</div>
		<div class="rounded-xl border border-border bg-card p-5 shadow-sm">
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Fornitori</p>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-3xl font-semibold text-primary">{avgSupplierRating.toFixed(1)}</span>
				<span class="text-xs text-muted-foreground">★ rating medio</span>
			</div>
			<p class="mt-2 text-xs text-muted-foreground">
				Puntualità media: <span class="font-medium text-foreground">{avgOnTime.toFixed(0)}%</span>
			</p>
		</div>
		<div class="rounded-xl border border-border bg-card p-5 shadow-sm">
			<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Condomìni</p>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-3xl font-semibold text-primary">{avgSatisfaction.toFixed(1)}</span>
				<span class="text-xs text-muted-foreground">/ 5 soddisfazione residenti</span>
			</div>
			<p class="mt-2 text-xs text-muted-foreground">
				Engagement medio: <span class="font-medium text-foreground">{avgEngagement.toFixed(0)}%</span>
			</p>
		</div>
	</div>

	<!-- Tabs -->
	<div class="rounded-xl border border-border bg-card shadow-sm">
		<div class="flex border-b border-border">
			{#each tabs as tab}
				<button
					type="button"
					onclick={() => (active = tab.key)}
					class="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors {active ===
					tab.key
						? 'border-b-2 border-primary text-primary -mb-px'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					<HugeiconsIcon icon={tab.icon} size={16} strokeWidth={1.75} />
					{tab.label}
					<span class="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
						{tab.count}
					</span>
				</button>
			{/each}
		</div>

		{#if active === 'admins'}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
						<tr>
							<th class="px-5 py-3 font-medium">Amministratore</th>
							<th class="px-5 py-3 font-medium text-right">Condomìni</th>
							<th class="px-5 py-3 font-medium text-right">Ticket aperti</th>
							<th class="px-5 py-3 font-medium text-right">Ticket chiusi</th>
							<th class="px-5 py-3 font-medium text-right">Risposta media</th>
							<th class="px-5 py-3 font-medium">Adozione piattaforma</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each admins as row (row.admin.id)}
							<tr class="hover:bg-muted/30">
								<td class="px-5 py-3 font-medium text-foreground">{row.admin.name}</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.propertiesManaged}</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.openTickets}</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.closedTickets}</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.avgResponseHours.toFixed(1)}h</td>
								<td class="px-5 py-3">
									<div class="flex items-center gap-2">
										<div class="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
											<div class="h-full {barClass(row.adoptionPct)}" style="width: {row.adoptionPct}%"></div>
										</div>
										<span class="text-xs tabular-nums text-muted-foreground">{row.adoptionPct}%</span>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if active === 'suppliers'}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
						<tr>
							<th class="px-5 py-3 font-medium">Fornitore</th>
							<th class="px-5 py-3 font-medium">Categoria</th>
							<th class="px-5 py-3 font-medium text-right">Rating</th>
							<th class="px-5 py-3 font-medium text-right">Job completati</th>
							<th class="px-5 py-3 font-medium text-right">Job aperti</th>
							<th class="px-5 py-3 font-medium">Puntualità</th>
							<th class="px-5 py-3 font-medium text-right">Feedback</th>
							<th class="px-5 py-3 font-medium text-right">Ricavi mediati</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each sups as row (row.supplier.id)}
							<tr class="hover:bg-muted/30">
								<td class="px-5 py-3 font-medium text-foreground">
									{row.supplier.description}
								</td>
								<td class="px-5 py-3 text-muted-foreground">{row.supplier.category}</td>
								<td class="px-5 py-3 text-right">
									<span class="inline-flex items-center gap-1 tabular-nums">
										<HugeiconsIcon icon={StarIcon} size={12} strokeWidth={1.75} class="text-warning" />
										{row.rating.toFixed(1)}
									</span>
								</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.jobsCompleted}</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.openJobs}</td>
								<td class="px-5 py-3">
									<div class="flex items-center gap-2">
										<div class="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
											<div class="h-full {barClass(row.onTimePct)}" style="width: {row.onTimePct}%"></div>
										</div>
										<span class="text-xs tabular-nums text-muted-foreground">{row.onTimePct}%</span>
									</div>
								</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.feedbackCount}</td>
								<td class="px-5 py-3 text-right tabular-nums text-foreground">
									{eurFormatter.format(row.revenueContribution)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
						<tr>
							<th class="px-5 py-3 font-medium">Condominio</th>
							<th class="px-5 py-3 font-medium text-right">Unità</th>
							<th class="px-5 py-3 font-medium text-right">Soddisfazione</th>
							<th class="px-5 py-3 font-medium">Engagement residenti</th>
							<th class="px-5 py-3 font-medium">Tasso ticket ricorrenti</th>
							<th class="px-5 py-3 font-medium text-right">Ticket aperti</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each condos as row (row.property.id)}
							<tr class="hover:bg-muted/30">
								<td class="px-5 py-3 font-medium text-foreground">{row.property.name}</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.property.units}</td>
								<td class="px-5 py-3 text-right tabular-nums text-foreground">
									{row.satisfactionScore.toFixed(1)} / 5
								</td>
								<td class="px-5 py-3">
									<div class="flex items-center gap-2">
										<div class="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
											<div class="h-full {barClass(row.engagementPct)}" style="width: {row.engagementPct}%"></div>
										</div>
										<span class="text-xs tabular-nums text-muted-foreground">{row.engagementPct}%</span>
									</div>
								</td>
								<td class="px-5 py-3">
									<div class="flex items-center gap-2">
										<div class="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
											<div class="h-full {barClass(100 - row.recurringTicketsRate)}" style="width: {row.recurringTicketsRate}%"></div>
										</div>
										<span class="text-xs tabular-nums text-muted-foreground">{row.recurringTicketsRate}%</span>
									</div>
								</td>
								<td class="px-5 py-3 text-right tabular-nums">{row.openTickets}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
