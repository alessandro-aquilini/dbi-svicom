<script lang="ts">
	import { currentUser } from '$lib/data/users';
	import { getResidentById } from '$lib/data/residents';
	import { getPropertyById } from '$lib/data/properties';
	import { getDocumentsByPropertyId } from '$lib/data/documents';

	const resident = getResidentById(currentUser.id);
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const documents = property ? getDocumentsByPropertyId(property.id) : [];
</script>

<svelte:head>
	<title>Documenti — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="p-4">
	<h1 class="mb-1 text-xl font-semibold text-foreground">Documenti</h1>
	<p class="mb-4 text-sm text-muted-foreground">{documents.length} documenti disponibili</p>

	<div class="space-y-3">
		{#each documents as doc}
			<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
				<div class="flex items-start justify-between">
					<h3 class="text-sm font-medium text-foreground">{doc.title}</h3>
					<span class="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">{doc.type.toUpperCase()}</span>
				</div>
				<p class="mt-1 text-xs text-muted-foreground">{doc.summary}</p>
				<p class="mt-2 text-xs text-muted-foreground">{doc.category} · {doc.status}</p>
			</div>
		{/each}
		{#if documents.length === 0}
			<p class="py-8 text-center text-sm text-muted-foreground">Nessun documento disponibile.</p>
		{/if}
	</div>
</div>
