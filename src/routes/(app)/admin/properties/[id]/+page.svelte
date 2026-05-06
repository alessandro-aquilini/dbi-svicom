<script lang="ts">
	import { page } from '$app/state';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentsByPropertyId } from '$lib/data/residents';
	import { getTicketsByPropertyId } from '$lib/data/tickets-admin';
	import { getUserById } from '$lib/data/users';
	import { getCurrentStatus } from '$lib/components/tickets';

	const property = $derived(getPropertyById(page.params.id ?? ''));
	const residents = $derived(property ? getResidentsByPropertyId(property.id) : []);
	const tickets = $derived(property ? getTicketsByPropertyId(property.id) : []);

	const getTicketStatus = (ticket: (typeof tickets)[number]) =>
		getCurrentStatus(ticket) ?? 'opened';

	const tabs = [
		{ label: 'Panoramica', active: true },
		{ label: 'Residenti', href: `/admin/properties/${page.params.id}/residents` },
		{ label: 'Documenti', href: `/admin/properties/${page.params.id}/documents` },
		{ label: 'Bacheca', href: `/admin/properties/${page.params.id}/bulletin` }
	];
</script>

<svelte:head>
	<title>{property?.name ?? 'Condominio'} — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	{#if property}
		<!-- Header -->
		<div class="mb-6">
			<a href="/admin/properties" class="text-sm text-muted-foreground hover:text-foreground">← Condomìni</a>
			<h1 class="mt-2 text-2xl font-semibold tracking-tight">{property.name}</h1>
			<p class="mt-1 text-sm text-muted-foreground">{property.address.street}, {property.address.city} {property.address.cap}</p>
		</div>

		<!-- Tab navigation -->
		<div class="mb-6 flex gap-1 border-b border-border">
			{#each tabs as tab}
				{#if tab.active}
					<span class="border-b-2 border-primary px-4 py-2 text-sm font-medium text-foreground">
						{tab.label}
					</span>
				{:else}
					<a href={tab.href} class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
						{tab.label}
					</a>
				{/if}
			{/each}
		</div>

		<!-- Overview -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">Unità</p>
				<p class="mt-1 text-xl font-semibold">{property.units}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">Residenti registrati</p>
				<p class="mt-1 text-xl font-semibold">{residents.length}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-4">
				<p class="text-sm text-muted-foreground">Pratiche attive</p>
				<p class="mt-1 text-xl font-semibold">{property.activeTickets}</p>
			</div>
		</div>

		<!-- Recent tickets -->
		<div class="mt-6 rounded-lg border border-border bg-card p-5">
			<h2 class="text-base font-medium">Ultime pratiche</h2>
			{#if tickets.length > 0}
				<ul class="mt-3 divide-y divide-border">
					{#each tickets.slice(0, 5) as ticket}
						<li class="flex items-center justify-between py-3">
							<div>
								<p class="text-sm font-medium text-foreground">{ticket.title}</p>
								<p class="text-xs text-muted-foreground">
									{ticket.category} · {getTicketStatus(ticket)}
								</p>
							</div>
							<span class="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
								{ticket.priority}
							</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-3 text-sm text-muted-foreground">Nessuna pratica per questo condominio.</p>
			{/if}
		</div>
	{:else}
		<p class="text-muted-foreground">Condominio non trovato.</p>
	{/if}
</div>
