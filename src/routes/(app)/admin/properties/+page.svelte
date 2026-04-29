<script lang="ts">
	import { properties } from '$lib/data/properties';

	const healthColors: Record<string, string> = {
		verde: 'bg-success/15 text-success',
		giallo: 'bg-warning/15 text-warning',
		rosso: 'bg-destructive/15 text-destructive'
	};

	const statusLabels: Record<string, string> = {
		attivo: 'Attivo',
		onboarding: 'Onboarding',
		'in-uscita': 'In uscita'
	};
</script>

<svelte:head>
	<title>Condomìni — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Condomìni</h1>
			<p class="mt-1 text-sm text-muted-foreground">{properties.length} condomìni in gestione</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each properties as property}
			<a
				href="/admin/properties/{property.id}"
				class="group rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
			>
				<div class="flex items-start justify-between">
					<h2 class="font-medium text-foreground group-hover:text-primary">{property.name}</h2>
					<span class="rounded-md px-2 py-0.5 text-xs font-medium {healthColors[property.health] ?? ''}">
						{property.health}
					</span>
				</div>
				<p class="mt-1 text-xs text-muted-foreground">{property.address.street}, {property.address.city}</p>
				<div class="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
					<span>{property.units} unità</span>
					<span>{property.activeTickets} pratiche</span>
					<span class="ml-auto rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">
						{statusLabels[property.status] ?? property.status}
					</span>
				</div>
			</a>
		{/each}
	</div>
</div>
