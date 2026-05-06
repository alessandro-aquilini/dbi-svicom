<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getUserById } from '$lib/data/users';
	import { getSupplierById } from '$lib/data/suppliers';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const user = getUserById(supplierId);
	const supplier = getSupplierById(supplierId);
</script>

<svelte:head>
	<title>Profilo — Fornitore — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<h1 class="mb-6 text-2xl font-semibold tracking-tight">Il mio profilo</h1>

	{#if user && supplier}
		<!-- Profile card -->
		<div class="max-w-2xl rounded-lg border border-border bg-card p-5 shadow-sm">
			<div class="flex items-center gap-4">
				<div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
					{user.name.charAt(0)}
				</div>
				<div>
					<p class="text-lg font-medium text-foreground">{user.name}</p>
					<p class="text-sm text-muted-foreground">{user.email}</p>
					{#if user.phone}<p class="text-sm text-muted-foreground">{user.phone}</p>{/if}
				</div>
			</div>
		</div>

		<!-- Supplier details -->
		<div class="mt-4 max-w-2xl rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 class="text-base font-medium text-foreground">Dettagli fornitore</h2>
			<div class="mt-3 grid grid-cols-2 gap-4 text-sm">
				<div>
					<p class="text-muted-foreground">Categoria</p>
					<p class="font-medium text-foreground">{supplier.category}</p>
				</div>
				<div>
					<p class="text-muted-foreground">Descrizione</p>
					<p class="font-medium text-foreground">{supplier.description}</p>
				</div>
				<div>
					<p class="text-muted-foreground">Valutazione</p>
					<p class="font-medium text-foreground">★ {supplier.rating}</p>
				</div>
				<div>
					<p class="text-muted-foreground">Disponibilità</p>
					<p class="font-medium text-foreground">{supplier.availability}</p>
				</div>
			</div>
			{#if supplier.tags}
				<div class="mt-3">
					<p class="text-sm text-muted-foreground">Tag</p>
					<div class="mt-1 flex flex-wrap gap-1">
						{#each supplier.tags as tag}
							<span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
						{/each}
					</div>
				</div>
			{/if}
			{#if supplier.residentialServices}
				<div class="mt-3">
					<p class="text-sm text-muted-foreground">Servizi residenziali collegati</p>
					<div class="mt-1 flex flex-wrap gap-1">
						{#each supplier.residentialServices as rs}
							<span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{rs}</span>
						{/each}
					</div>
				</div>
			{/if}
			{#if supplier.comments}
				<div class="mt-3">
					<p class="text-sm text-muted-foreground">Note amministrative</p>
					<ul class="mt-1 list-disc pl-5 text-sm text-foreground">
						{#each supplier.comments as c}
							<li>{c}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{:else}
		<p class="text-muted-foreground">Profilo non trovato.</p>
	{/if}
</div>
