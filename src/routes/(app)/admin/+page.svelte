<script lang="ts">
	import { properties } from '$lib/data/properties';
	import { tickets, type TicketPriority } from '$lib/data/tickets-admin';
	import { suppliers } from '$lib/data/suppliers';
	import { getPropertyById } from '$lib/data/properties';

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

	const priorityDot: Record<TicketPriority, string> = {
		critica: 'bg-destructive',
		alta: 'bg-warning',
		media: 'bg-primary',
		bassa: 'bg-muted-foreground/40'
	};

	const recentTickets = tickets
		.filter((t) => t.status !== 'chiuso')
		.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
		.slice(0, 5);

	function formatRelative(iso: string): string {
		const diffMs = Date.now() - new Date(iso).getTime();
		const minutes = Math.round(diffMs / 60_000);
		if (minutes < 1) return 'ora';
		if (minutes < 60) return `${minutes}m fa`;
		const hours = Math.round(minutes / 60);
		if (hours < 24) return `${hours}h fa`;
		const days = Math.round(hours / 24);
		if (days < 7) return `${days}g fa`;
		return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
	}
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
				<div class="kpi-card__text">
					<p class="kpi-label">{stat.label}</p>
					<p class="kpi-value">{stat.value}</p>
				</div>
				<div class="kpi-illustration">
					{#if stat.image}
						<img src={stat.image} alt="" class="h-full w-full object-contain" />
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Placeholder sections -->
	<div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="rounded-lg border border-border bg-card shadow-sm">
			<div class="flex items-baseline justify-between border-b border-border px-5 py-4">
				<h2 class="text-base font-medium text-foreground">Pratiche recenti</h2>
				<a href="/admin/tickets" class="text-xs text-muted-foreground hover:text-foreground">
					Vedi tutte
				</a>
			</div>

			{#if recentTickets.length === 0}
				<p class="px-5 py-6 text-sm text-muted-foreground">Nessuna pratica aperta.</p>
			{:else}
				<ul class="divide-y divide-border">
					{#each recentTickets as ticket (ticket.id)}
						{@const property = getPropertyById(ticket.propertyId)}
						<li>
							<a
								href="/admin/tickets"
								class="flex items-center gap-3 px-5 py-3 hover:bg-muted/50"
							>
								<span
									class="h-2 w-2 shrink-0 rounded-full {priorityDot[ticket.priority]}"
									aria-label="Priorità {ticket.priority}"
								></span>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-foreground">{ticket.title}</p>
									<p class="truncate text-xs text-muted-foreground">
										{property?.name ?? '—'} · {ticket.status}
									</p>
								</div>
								<span class="shrink-0 text-xs text-muted-foreground">
									{formatRelative(ticket.updatedAt)}
								</span>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 class="text-base font-medium text-foreground">Attività in scadenza</h2>
			<p class="mt-2 text-sm text-muted-foreground">Scadenze, SLA e interventi programmati.</p>
		</div>
	</div>
</div>
