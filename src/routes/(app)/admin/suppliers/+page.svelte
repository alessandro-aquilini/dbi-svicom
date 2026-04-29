<script lang="ts">
	import { suppliers } from '$lib/data/suppliers';
	import { getUserById } from '$lib/data/users';

	const statusColors: Record<string, string> = {
		affidabile: 'bg-success/15 text-success',
		attivo: 'bg-primary/10 text-primary',
		'in-corso': 'bg-warning/15 text-warning',
		'da-monitorare': 'bg-destructive/15 text-destructive'
	};
</script>

<svelte:head>
	<title>Fornitori — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6">
		<h1 class="text-2xl font-semibold tracking-tight">Fornitori</h1>
		<p class="mt-1 text-sm text-muted-foreground">{suppliers.length} fornitori registrati</p>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each suppliers as supplier}
			{@const user = getUserById(supplier.id)}
			<div class="rounded-lg border border-border bg-card p-5 shadow-sm">
				<div class="flex items-start justify-between">
					<div>
						<h3 class="text-sm font-medium text-foreground">{user?.name ?? supplier.id}</h3>
						<p class="text-xs text-muted-foreground">{supplier.category}</p>
					</div>
					<span class="rounded-md px-2 py-0.5 text-xs font-medium {statusColors[supplier.status] ?? ''}">
						{supplier.status}
					</span>
				</div>
				<div class="mt-3 flex items-center gap-2">
					<span class="text-sm font-medium text-foreground">★ {supplier.rating}</span>
					<span class="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">{supplier.type}</span>
					<span class="ml-auto text-xs text-muted-foreground">{supplier.availability}</span>
				</div>
				<div class="mt-2 flex flex-wrap gap-1">
					{#each supplier.tags as tag}
						<span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
