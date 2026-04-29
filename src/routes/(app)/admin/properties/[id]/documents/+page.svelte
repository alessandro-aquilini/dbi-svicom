<script lang="ts">
	import { page } from '$app/state';
	import { getPropertyById } from '$lib/data/properties';
	import { getDocumentsByPropertyId } from '$lib/data/documents';

	const property = $derived(getPropertyById(page.params.id));
	const documents = $derived(property ? getDocumentsByPropertyId(property.id) : []);
</script>

<svelte:head>
	<title>Documenti — {property?.name ?? 'Condominio'} — Svicom</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<a href="/admin/properties/{page.params.id}" class="text-sm text-muted-foreground hover:text-foreground">← {property?.name ?? 'Condominio'}</a>
	<h1 class="mt-2 text-2xl font-semibold tracking-tight">Documenti</h1>
	<p class="mt-1 text-sm text-muted-foreground">{documents.length} documenti disponibili</p>

	<div class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
		{#each documents as doc}
			<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
				<div class="flex items-start justify-between">
					<h3 class="text-sm font-medium text-foreground">{doc.title}</h3>
					<span class="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">{doc.type.toUpperCase()}</span>
				</div>
				<p class="mt-1 text-xs text-muted-foreground">{doc.summary}</p>
				<div class="mt-2 flex items-center justify-between text-xs text-muted-foreground">
					<span>{doc.category}</span>
					<span>{doc.status}</span>
				</div>
			</div>
		{/each}
		{#if documents.length === 0}
			<p class="col-span-full py-8 text-center text-sm text-muted-foreground">Nessun documento.</p>
		{/if}
	</div>
</div>
