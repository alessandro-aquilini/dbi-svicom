<script lang="ts">
	import { properties } from '$lib/data/properties';
	import { tickets } from '$lib/data/tickets';
	import { suppliers } from '$lib/data/suppliers';

	const stats = [
		{ label: 'Condomìni gestiti', value: properties.length, icon: '🏢' },
		{ label: 'Pratiche attive', value: tickets.filter((t) => t.status !== 'chiuso').length, icon: '📋' },
		{ label: 'Fornitori attivi', value: suppliers.filter((s) => s.availability === 'disponibile').length, icon: '🔧' },
		{ label: 'Unità totali', value: properties.reduce((sum, p) => sum + p.units, 0), icon: '🏠' }
	];
</script>

<svelte:head>
	<title>Dashboard — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-8">
		<h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
		<p class="mt-1 text-sm text-muted-foreground">Panoramica dello stato dei tuoi condomìni</p>
	</div>

	<!-- Stats grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat}
			<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">{stat.label}</span>
					<span class="text-xl">{stat.icon}</span>
				</div>
				<p class="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
			</div>
		{/each}
	</div>

	<!-- Placeholder sections -->
	<div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 class="text-base font-medium text-foreground">Pratiche recenti</h2>
			<p class="mt-2 text-sm text-muted-foreground">Le ultime pratiche aperte verranno mostrate qui.</p>
		</div>
		<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 class="text-base font-medium text-foreground">Attività in scadenza</h2>
			<p class="mt-2 text-sm text-muted-foreground">Scadenze, SLA e interventi programmati.</p>
		</div>
	</div>
</div>
