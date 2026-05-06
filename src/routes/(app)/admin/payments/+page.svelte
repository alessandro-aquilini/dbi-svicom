<script lang="ts">
	import { payments } from '$lib/data/ticket-embeds/payments';
	import { getUserById } from '$lib/data/users';

	const statusColors: Record<string, string> = {
		paid: 'bg-success/15 text-success',
		pending: 'bg-warning/15 text-warning',
		overdue: 'bg-destructive/15 text-destructive',
		cancelled: 'bg-muted text-muted-foreground'
	};

	const statusLabels: Record<string, string> = {
		paid: 'Pagato',
		pending: 'In attesa',
		overdue: 'Scaduto',
		cancelled: 'Annullato'
	};

	function getPaymentStatus(payment: (typeof payments)[number]) {
		if (payment.paidAt) return 'paid';
		if (new Date(payment.dueDate).getTime() < Date.now()) return 'overdue';
		return 'pending';
	}
</script>

<svelte:head>
	<title>Pagamenti — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="p-6 lg:p-8">
	<div class="mb-6">
		<h1 class="text-2xl font-semibold tracking-tight">Pagamenti</h1>
		<p class="mt-1 text-sm text-muted-foreground">{payments.length} transazioni registrate</p>
	</div>

	<div class="rounded-lg border border-border bg-card shadow-sm">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-4 py-3 font-medium text-muted-foreground">Descrizione</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Da</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">A</th>
						<th class="px-4 py-3 font-medium text-muted-foreground text-right">Importo</th>
						<th class="px-4 py-3 font-medium text-muted-foreground">Stato</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each payments as payment}
						{@const paymentStatus = getPaymentStatus(payment)}
						<tr class="hover:bg-muted/50">
							<td class="px-4 py-3 font-medium text-foreground">{payment.description}</td>
							<td class="px-4 py-3 text-muted-foreground">{getUserById(payment.fromId)?.name ?? '-'}</td>
							<td class="px-4 py-3 text-muted-foreground">{getUserById(payment.toId)?.name ?? '-'}</td>
							<td class="px-4 py-3 text-right font-medium text-foreground">€{payment.amount.toFixed(2)}</td>
							<td class="px-4 py-3">
								<span class="rounded-md px-2 py-0.5 text-xs font-medium {statusColors[paymentStatus] ?? ''}">
									{statusLabels[paymentStatus] ?? paymentStatus}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
