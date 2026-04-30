<script lang="ts">
	import { tickets } from '$lib/data/tickets';
	import { getPropertyById } from '$lib/data/properties';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Add01Icon } from '@hugeicons/core-free-icons';

	const priorityColors: Record<string, string> = {
		critica: 'bg-destructive/15 text-destructive',
		alta: 'bg-warning/15 text-warning',
		media: 'bg-primary/10 text-primary',
		bassa: 'bg-secondary text-secondary-foreground'
	};
</script>

<svelte:head>
	<title>Pratiche — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6 flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Pratiche</h1>
			<p class="mt-1 text-sm text-muted-foreground">{tickets.length} pratiche totali</p>
		</div>
		<a
			href="/admin/tickets/new"
			class="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
		>
			<HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
			Nuova pratica
		</a>
	</div>

	<div class="rounded-lg border border-border bg-card shadow-sm">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-4 py-3 font-medium text-muted-foreground">ID</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Titolo</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Condominio</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Stato</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Priorità</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each tickets as ticket}
						{@const property = getPropertyById(ticket.propertyId)}
						<tr class="hover:bg-muted/50">
							<td class="px-4 py-3 font-mono text-xs text-muted-foreground">{ticket.id}</td>
							<td class="px-4 py-3 font-medium text-foreground">{ticket.title}</td>
							<td class="px-4 py-3 text-muted-foreground">{property?.name ?? '-'}</td>
							<td class="px-4 py-3">
								<span class="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{ticket.status}</span>
							</td>
							<td class="px-4 py-3">
								<span class="rounded-md px-2 py-0.5 text-xs font-medium {priorityColors[ticket.priority] ?? ''}">{ticket.priority}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
