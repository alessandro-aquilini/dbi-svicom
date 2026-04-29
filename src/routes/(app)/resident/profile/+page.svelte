<script lang="ts">
	import { currentUser } from '$lib/data/users';
	import { getResidentById } from '$lib/data/residents';
	import { getPropertyById } from '$lib/data/properties';

	const resident = getResidentById(currentUser.id);
	const property = resident ? getPropertyById(resident.propertyId) : undefined;
</script>

<svelte:head>
	<title>Profilo — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="p-4">
	<h1 class="mb-4 text-xl font-semibold text-foreground">Il mio profilo</h1>

	<!-- User info card -->
	<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
		<div class="flex items-center gap-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">
				{currentUser.name.charAt(0)}
			</div>
			<div>
				<p class="font-medium text-foreground">{currentUser.name}</p>
				<p class="text-sm text-muted-foreground">{currentUser.email}</p>
			</div>
		</div>
	</div>

	<!-- Property info -->
	{#if resident && property}
		<div class="mt-4 rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 class="text-sm font-medium text-foreground">Condominio</h2>
			<p class="mt-1 text-sm text-muted-foreground">{property.name}</p>
			<p class="text-sm text-muted-foreground">{property.address.street}, {property.address.city}</p>
			<div class="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
				<span>📍 {resident.apartment}</span>
				<span>· {resident.type}</span>
			</div>
		</div>
	{/if}

	<!-- Settings placeholders -->
	<div class="mt-4 space-y-3">
		<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
			<h3 class="text-sm font-medium text-foreground">Notifiche</h3>
			<p class="text-xs text-muted-foreground">Gestisci le preferenze di notifica</p>
		</div>
		<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
			<h3 class="text-sm font-medium text-foreground">Privacy</h3>
			<p class="text-xs text-muted-foreground">Impostazioni privacy e dati personali</p>
		</div>
	</div>

	<div class="mt-6 text-center">
		<a href="/login" class="text-sm text-primary hover:underline">Cambia profilo</a>
	</div>
</div>
