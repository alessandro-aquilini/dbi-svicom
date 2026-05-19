<script lang="ts">
	import { payments } from '$lib/data/embeds/payments';
	import { documents } from '$lib/data/documents';
	import { getCurrentUser } from '$lib/auth';
	import FinanceRadar from '$lib/components/supplier/finances/FinanceRadar.svelte';
	import FinanceSummaryList from '$lib/components/supplier/finances/FinanceSummaryList.svelte';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';

	const supplierPayments = payments
		.filter((p) => p.toId === supplierId)
		.sort((a, b) => new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime());

	const latestPayments = supplierPayments.slice(0, 3);

	// Mocking docs for now as there isn't a direct "docs for supplier" collection but we can filter by uploader or relevant ones
	const latestDocuments = documents.slice(0, 3);

	const totalGains = supplierPayments.reduce((acc, p) => acc + p.amount, 0);
</script>

<div class="container mx-auto max-w-6xl space-y-12 p-6 pb-24">
	<header class="space-y-1">
		<h1 class="text-3xl font-bold tracking-tight">Finanze</h1>
		<p class="text-muted-foreground">Monitora i tuoi guadagni e la tua attività finanziaria.</p>
	</header>

	<section class="space-y-6">
		<div class="flex items-center justify-between px-1">
			<h2 class="text-lg font-semibold">RADAR</h2>
		</div>
		<FinanceRadar {totalGains} activeInvoices={4} monthlyGrowthRatio={12.5} />
	</section>

	<div class="grid gap-12 lg:grid-cols-2">
		<section>
			<FinanceSummaryList
				title="Ultimi Pagamenti"
				items={latestPayments}
				viewAllHref="/supplier/finances/payments"
			/>
		</section>

		<section>
			<FinanceSummaryList
				title="Documenti Recenti"
				items={latestDocuments}
				viewAllHref="/supplier/finances/documents"
			/>
		</section>
	</div>
</div>
