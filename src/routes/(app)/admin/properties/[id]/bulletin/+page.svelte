<script lang="ts">
	import { page } from '$app/state';
	import { getPropertyById } from '$lib/data/properties';
	import { getAnnouncementsByPropertyId } from '$lib/data/announcements';
	import { getUserById } from '$lib/data/users';

	const property = $derived(getPropertyById(page.params.id ?? ''));
	const announcements = $derived(property ? getAnnouncementsByPropertyId(property.id) : []);
</script>

<svelte:head>
	<title>Bacheca — {property?.name ?? 'Condominio'} — Svicom</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<a href="/admin/properties/{page.params.id}" class="text-sm text-muted-foreground hover:text-foreground">← {property?.name ?? 'Condominio'}</a>
	<h1 class="mt-2 text-2xl font-semibold tracking-tight">Bacheca</h1>
	<p class="mt-1 text-sm text-muted-foreground">Comunicazioni per {property?.name ?? 'questo condominio'}</p>

	<div class="mt-6 space-y-4">
		{#each announcements as ann}
			{@const author = getUserById(ann.createdBy)}
			<article class="rounded-lg border border-border bg-card p-5 shadow-sm {ann.pinned ? 'border-primary/30' : ''}">
				{#if ann.pinned}
					<span class="mb-2 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">📌 In evidenza</span>
				{/if}
				<h3 class="text-sm font-medium text-foreground">{ann.title}</h3>
				<p class="mt-1 text-sm text-muted-foreground">{ann.content}</p>
				<div class="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
					<span>{author?.name ?? 'Sconosciuto'}</span>
					<span>·</span>
					<span>{ann.category}</span>
				</div>
			</article>
		{/each}
		{#if announcements.length === 0}
			<p class="py-8 text-center text-sm text-muted-foreground">Nessuna comunicazione.</p>
		{/if}
	</div>
</div>
