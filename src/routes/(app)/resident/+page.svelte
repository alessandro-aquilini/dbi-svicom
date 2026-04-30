<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getResidentById } from '$lib/data/residents';
	import { getPropertyById } from '$lib/data/properties';
	import { getAnnouncementsByPropertyId } from '$lib/data/announcements';

	const currentUser = getCurrentUser();
	const resident = currentUser ? getResidentById(currentUser.id) : undefined;
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
	const announcements = property ? getAnnouncementsByPropertyId(property.id).slice(0, 3) : [];
</script>

<svelte:head>
	<title>Home — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="p-4">
	<!-- Welcome -->
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-foreground">Ciao, {currentUser ? currentUser.name.split(' ')[0] : 'ospite'} 👋</h1>
		{#if property}
			<p class="mt-1 text-sm text-muted-foreground">{property.name} — {resident?.apartment}</p>
		{/if}
	</div>

	<!-- Quick actions -->
	<div class="mb-6 grid grid-cols-2 gap-3">
		<a href="/resident/reports" class="rounded-lg border border-border bg-card p-4 text-center shadow-sm transition-all hover:shadow-md">
			<span class="text-2xl">📢</span>
			<p class="mt-1 text-sm font-medium text-foreground">Segnala</p>
		</a>
		<a href="/resident/chat" class="rounded-lg border border-border bg-card p-4 text-center shadow-sm transition-all hover:shadow-md">
			<span class="text-2xl">💬</span>
			<p class="mt-1 text-sm font-medium text-foreground">Chat</p>
		</a>
		<a href="/resident/assemblies" class="rounded-lg border border-border bg-card p-4 text-center shadow-sm transition-all hover:shadow-md">
			<span class="text-2xl">🗳️</span>
			<p class="mt-1 text-sm font-medium text-foreground">Assemblee</p>
		</a>
		<a href="/resident/documents" class="rounded-lg border border-border bg-card p-4 text-center shadow-sm transition-all hover:shadow-md">
			<span class="text-2xl">📄</span>
			<p class="mt-1 text-sm font-medium text-foreground">Documenti</p>
		</a>
	</div>

	<!-- Recent announcements -->
	<div>
		<div class="mb-3 flex items-center justify-between">
			<h2 class="text-base font-medium text-foreground">Bacheca</h2>
			<a href="/resident/bulletin" class="text-xs text-primary hover:underline">Vedi tutte</a>
		</div>
		<div class="space-y-3">
			{#each announcements as ann}
				<div class="rounded-lg border border-border bg-card p-4 shadow-sm {ann.pinned ? 'border-primary/30' : ''}">
					{#if ann.pinned}<span class="text-xs text-primary">📌</span>{/if}
					<h3 class="text-sm font-medium text-foreground">{ann.title}</h3>
					<p class="mt-1 line-clamp-2 text-xs text-muted-foreground">{ann.content}</p>
				</div>
			{/each}
			{#if announcements.length === 0}
				<p class="text-center text-sm text-muted-foreground">Nessuna comunicazione recente.</p>
			{/if}
		</div>
	</div>
</div>
