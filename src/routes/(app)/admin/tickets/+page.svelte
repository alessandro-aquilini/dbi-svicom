<script lang="ts">
	import { tickets } from '$lib/data/tickets';
	import { getPropertyById } from '$lib/data/properties';

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
	<div class="mb-6">
		<h1 class="text-2xl font-semibold tracking-tight">Pratiche</h1>
		<p class="mt-1 text-sm text-muted-foreground">{tickets.length} pratiche totali</p>
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
