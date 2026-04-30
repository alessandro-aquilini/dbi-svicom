<script lang="ts">
	import { tickets } from '$lib/data/tickets';
	import { getPropertyById } from '$lib/data/properties';
	import { getCurrentUser } from '$lib/auth';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const myJobs = tickets.filter((t) => t.assignedToId === supplierId);
</script>

<svelte:head>
	<title>Interventi — Fornitore — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6">
		<h1 class="text-2xl font-semibold tracking-tight">I miei interventi</h1>
		<p class="mt-1 text-sm text-muted-foreground">{myJobs.length} interventi assegnati</p>
	</div>

	<div class="space-y-3">
		{#each myJobs as job}
			{@const property = getPropertyById(job.propertyId)}
			<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
				<div class="flex items-start justify-between">
					<div>
						<h3 class="text-sm font-medium text-foreground">{job.title}</h3>
						<p class="mt-1 text-xs text-muted-foreground">{property?.name ?? '-'} · {job.location ?? ''}</p>
					</div>
					<div class="flex gap-2">
						<span class="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{job.status}</span>
						<span class="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">{job.priority}</span>
					</div>
				</div>
				<p class="mt-2 text-xs text-muted-foreground">{job.description}</p>
			</div>
		{/each}
		{#if myJobs.length === 0}
			<p class="py-8 text-center text-sm text-muted-foreground">Nessun intervento assegnato.</p>
		{/if}
	</div>
</div>
