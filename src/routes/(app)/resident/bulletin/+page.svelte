<script lang="ts">
	import { currentUser } from '$lib/data/users';
	import { getResidentById } from '$lib/data/residents';
	import { getPropertyById } from '$lib/data/properties';
	import { getAnnouncementsByPropertyId } from '$lib/data/announcements';
	import { getUserById } from '$lib/data/users';

	const resident = getResidentById(currentUser.id);
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const announcements = property ? getAnnouncementsByPropertyId(property.id) : [];
</script>

<svelte:head>
	<title>Bacheca — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="p-4">
	<h1 class="mb-1 text-xl font-semibold text-foreground">Bacheca</h1>
	<p class="mb-4 text-sm text-muted-foreground">Comunicazioni per {property?.name ?? 'il tuo condominio'}</p>

	<div class="space-y-3">
		{#each announcements as ann}
			{@const author = getUserById(ann.createdBy)}
			<div class="rounded-lg border border-border bg-card p-4 shadow-sm {ann.pinned ? 'border-primary/30' : ''}">
				{#if ann.pinned}
					<span class="mb-1 inline-block text-xs text-primary">📌 In evidenza</span>
				{/if}
				<h3 class="text-sm font-medium text-foreground">{ann.title}</h3>
				<p class="mt-1 text-sm text-muted-foreground">{ann.content}</p>
				<p class="mt-2 text-xs text-muted-foreground">{author?.name} · {ann.category}</p>
			</div>
		{/each}
		{#if announcements.length === 0}
			<p class="py-8 text-center text-sm text-muted-foreground">Nessuna comunicazione.</p>
		{/if}
	</div>
</div>
