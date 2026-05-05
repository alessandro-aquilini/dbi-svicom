<script lang="ts">
	import { properties } from '$lib/data/properties';
	import { tickets } from '$lib/data/tickets';
	import { suppliers } from '$lib/data/suppliers';

	type Stat = {
		label: string;
		value: number;
		image?: string;
	};

	function getLatestTicketStatus() {
		return (ticket: (typeof tickets)[number]) =>
			ticket.statusHistory[ticket.statusHistory.length - 1]?.status ?? 'opened';
	}

	const isActiveTicket = (ticket: (typeof tickets)[number]) => {
		const status = getLatestTicketStatus()(ticket);
		return status !== 'paid' && status !== 'completed';
	};

	const stats: Stat[] = [
		{
			label: 'Condomìni gestiti',
			value: properties.length,
			image: '/icons/condominium.png'
		},
		{
			label: 'Pratiche attive',
			value: tickets.filter(isActiveTicket).length,
			image: '/icons/tickets.png'
		},
		{
			label: 'Fornitori attivi',
			value: suppliers.filter((s) => s.availability === 'disponibile').length,
			image: '/icons/suppliers.png'
		},
		{
			label: 'Unità totali',
			value: properties.reduce((sum, p) => sum + p.units, 0),
			image: '/icons/units.png'
		}
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
			<div class="kpi-card">
				<div class="kpi-illustration">
					{#if stat.image}
						<img src={stat.image} alt="" class="h-full w-full object-contain" />
					{/if}
				</div>
				<p class="kpi-label">{stat.label}</p>
				<p class="kpi-value">{stat.value}</p>
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
