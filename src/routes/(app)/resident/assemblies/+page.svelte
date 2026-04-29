<script lang="ts">
	import { currentUser } from '$lib/data/users';
	import { getResidentById } from '$lib/data/residents';
	import { getPropertyById } from '$lib/data/properties';
	import { getAssembliesByPropertyId } from '$lib/data/assemblies';

	const resident = getResidentById(currentUser.id);
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const assemblies = property ? getAssembliesByPropertyId(property.id) : [];

	const statusLabels: Record<string, string> = {
		pianificata: '📅 Pianificata',
		svolta: '✅ Svolta',
		annullata: '❌ Annullata'
	};
</script>

<svelte:head>
	<title>Assemblee — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="p-4">
	<h1 class="mb-1 text-xl font-semibold text-foreground">Assemblee</h1>
	<p class="mb-4 text-sm text-muted-foreground">Assemblee condominiali per {property?.name ?? 'il tuo condominio'}</p>

	<div class="space-y-4">
		{#each assemblies as assembly}
			<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
				<div class="flex items-start justify-between">
					<div>
						<span class="text-xs font-medium text-primary uppercase">{assembly.type}</span>
						<h3 class="mt-1 text-sm font-medium text-foreground">{assembly.location}</h3>
						<p class="text-xs text-muted-foreground">{assembly.scheduledAt}</p>
					</div>
					<span class="text-xs">{statusLabels[assembly.status] ?? assembly.status}</span>
				</div>

				<!-- Agenda -->
				<div class="mt-3">
					<p class="text-xs font-medium text-muted-foreground">Ordine del giorno</p>
					<ul class="mt-1 list-inside list-disc space-y-0.5 text-xs text-foreground">
						{#each assembly.agenda as item}
							<li>{item}</li>
						{/each}
					</ul>
				</div>

				<!-- Resolutions (if available) -->
				{#if assembly.minutes}
					<div class="mt-3 border-t border-border pt-3">
						<p class="text-xs font-medium text-muted-foreground">Delibere</p>
						{#each assembly.minutes.resolutions as resolution}
							<div class="mt-1 flex items-center justify-between text-xs">
								<span class="text-foreground">{resolution.title}</span>
								<span class="rounded bg-{resolution.outcome === 'approvata' ? 'success' : 'destructive'}/15 px-1.5 py-0.5 text-{resolution.outcome === 'approvata' ? 'success' : 'destructive'}">
									{resolution.outcome}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
		{#if assemblies.length === 0}
			<p class="py-8 text-center text-sm text-muted-foreground">Nessuna assemblea programmata.</p>
		{/if}
	</div>
</div>
