<script lang="ts">
	import { getPaymentsByUserId } from '$lib/data/payments';
	import { currentUser, getUserById } from '$lib/data/users';

	const myPayments = getPaymentsByUserId(currentUser.id);

	const statusLabels: Record<string, string> = {
		paid: 'Pagato',
		pending: 'In attesa',
		overdue: 'Scaduto',
		cancelled: 'Annullato'
	};

	const statusColors: Record<string, string> = {
		paid: 'bg-success/15 text-success',
		pending: 'bg-warning/15 text-warning',
		overdue: 'bg-destructive/15 text-destructive',
		cancelled: 'bg-muted text-muted-foreground'
	};
</script>

<svelte:head>
	<title>Pagamenti — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="p-4">
	<h1 class="mb-1 text-xl font-semibold text-foreground">Pagamenti</h1>
	<p class="mb-4 text-sm text-muted-foreground">{myPayments.length} transazioni</p>

	<div class="space-y-3">
		{#each myPayments as payment}
			<div class="rounded-lg border border-border bg-card p-4 shadow-sm">
				<div class="flex items-start justify-between">
					<div>
						<h3 class="text-sm font-medium text-foreground">{payment.description}</h3>
						<p class="text-xs text-muted-foreground">Scadenza: {payment.dueDate}</p>
					</div>
					<span class="rounded-md px-2 py-0.5 text-xs font-medium {statusColors[payment.status] ?? ''}">
						{statusLabels[payment.status] ?? payment.status}
					</span>
				</div>
				<p class="mt-2 text-lg font-semibold text-foreground">€{payment.amount.toFixed(2)}</p>
			</div>
		{/each}
		{#if myPayments.length === 0}
			<p class="py-8 text-center text-sm text-muted-foreground">Nessun pagamento registrato.</p>
		{/if}
	</div>
</div>
