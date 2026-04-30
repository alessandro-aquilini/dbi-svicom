<script lang="ts">
	import { page } from '$app/state';
	import { getPropertyById } from '$lib/data/properties';
	import { getResidentsByPropertyId } from '$lib/data/residents';
	import { getUserById } from '$lib/data/users';

	const property = $derived(getPropertyById(page.params.id ?? ''));
	const residents = $derived(property ? getResidentsByPropertyId(property.id) : []);
</script>

<svelte:head>
	<title>Residenti — {property?.name ?? 'Condominio'} — Svicom</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<a href="/admin/properties/{page.params.id}" class="text-sm text-muted-foreground hover:text-foreground">← {property?.name ?? 'Condominio'}</a>
	<h1 class="mt-2 text-2xl font-semibold tracking-tight">Residenti</h1>
	<p class="mt-1 text-sm text-muted-foreground">{residents.length} residenti registrati</p>

	<div class="mt-6 rounded-lg border border-border bg-card">
		{#if residents.length > 0}
			<ul class="divide-y divide-border">
				{#each residents as resident}
					{@const user = getUserById(resident.id)}
					<li class="flex items-center justify-between px-5 py-4">
						<div>
							<p class="text-sm font-medium text-foreground">{user?.name ?? resident.id}</p>
							<p class="text-xs text-muted-foreground">{resident.apartment} · {resident.type}</p>
						</div>
						<span class="text-xs text-muted-foreground">{user?.email}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="px-5 py-8 text-center text-sm text-muted-foreground">Nessun residente registrato.</p>
		{/if}
	</div>
</div>
