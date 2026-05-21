<script lang="ts">
	import {
		getInvoicesBySupplierId,
		type Invoice,
	} from "$lib/data/embeds/invoices";
	import { getQuotesBySupplierId, type Quote } from "$lib/data/embeds/quotes";
	import {
		getPaymentsByUserId,
		type Payment,
	} from "$lib/data/embeds/payments";
	import { getCurrentUser } from "$lib/auth";
	import { getUserById } from "$lib/data/users";
	import { Button } from "$lib/components/ui/button";
	import {
		ArrowRightIcon,
		Invoice01Icon,
		Agreement01Icon,
	} from "@hugeicons/core-free-icons";
	import { HugeiconsIcon } from "@hugeicons/svelte";
	import FinanceRadar from "$lib/components/view-supplier/finances/FinanceRadar.svelte";
	import PaymentRow from "$lib/components/view-supplier/finances/payments/PaymentRow.svelte";
	import PaymentDetailsModal from "$lib/components/view-supplier/finances/payments/PaymentDetailsModal.svelte";
	import DocumentRow from "$lib/components/view-supplier/finances/documents/DocumentRow.svelte";
	import DocumentDetailsModal from "$lib/components/view-supplier/finances/documents/DocumentDetailsModal.svelte";

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? "frn-idroclima-nord";

	const supplierPayments = getPaymentsByUserId(supplierId)
		.filter((payment) => payment.toId === supplierId)
		.sort(
			(a, b) =>
				new Date(b.paidAt || b.createdAt || "").getTime() -
				new Date(a.paidAt || a.createdAt || "").getTime(),
		);

	const supplierInvoices = getInvoicesBySupplierId(supplierId);
	const supplierQuotes = getQuotesBySupplierId(supplierId);

	type DocumentItem =
		| { type: "invoice"; date: number; data: Invoice }
		| { type: "quote"; date: number; data: Quote };

	const supplierDocs: DocumentItem[] = [
		...supplierInvoices.map((invoice) => ({
			type: "invoice" as const,
			date: new Date(invoice.createdAt).getTime(),
			data: invoice,
		})),
		...supplierQuotes.map((quote) => ({
			type: "quote" as const,
			date: new Date(quote.createdAt).getTime(),
			data: quote,
		})),
	].sort((a, b) => b.date - a.date);

	const latestPayments = supplierPayments.slice(0, 3);
	const latestDocuments = supplierDocs.slice(0, 3);

	const totalGains = supplierPayments.reduce((acc, p) => acc + p.amount, 0);

	const now = new Date();
	const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	const previousMonthStart = new Date(
		now.getFullYear(),
		now.getMonth() - 1,
		1,
	);

	const revenueThisMonth = supplierPayments
		.filter((payment) => {
			const date = new Date(payment.paidAt || payment.createdAt || "");
			return date >= currentMonthStart && date < nextMonthStart;
		})
		.reduce((acc, payment) => acc + payment.amount, 0);

	const revenueLastMonth = supplierPayments
		.filter((payment) => {
			const date = new Date(payment.paidAt || payment.createdAt || "");
			return date >= previousMonthStart && date < currentMonthStart;
		})
		.reduce((acc, payment) => acc + payment.amount, 0);

	const monthlyGrowthRatio =
		revenueLastMonth === 0
			? revenueThisMonth === 0
				? 0
				: 12.5
			: Math.round(
					((revenueThisMonth - revenueLastMonth) / revenueLastMonth) *
						10,
				) / 10;

	const activeInvoicesCount = supplierInvoices.length; // Simplified for demo, could be filtered by status

	let selectedPayment: Payment | null = $state(null);
	let selectedDocument: DocumentItem | null = $state(null);
</script>

<div class="flex-1 overflow-y-auto pb-24 px-6">
	<header class="space-y-4 pt-6">
		<div
			class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6"
		>
			<div class="min-w-0">
				<h1 class="text-3xl font-bold tracking-tight">Finanze</h1>
				<p class="mt-2 max-w-2xl text-base text-muted-foreground">
					Monitora i tuoi guadagni e l'andamento della tua attività
					finanziaria.
				</p>
			</div>
		</div>
	</header>

	<section class="mt-8">
		<FinanceRadar
			totalRevenue={totalGains}
			monthlyRevenue={revenueThisMonth}
			{activeInvoicesCount}
			growthRate={monthlyGrowthRatio}
		/>
	</section>

	<section class="mt-12 space-y-6">
		<div class="flex items-center justify-between gap-4">
			<div>
				<h2 class="text-2xl font-bold text-foreground">
					Ultimi pagamenti
				</h2>
				<p class="mt-1 text-base text-muted-foreground">
					Le entrate più recenti in ordine cronologico.
				</p>
			</div>
		</div>

		<div
			class="overflow-hidden rounded-3xl border border-border bg-background divide-y divide-border/40"
		>
			{#each latestPayments as payment}
				<PaymentRow
					{payment}
					onclick={() => (selectedPayment = payment)}
				/>
			{/each}
			<Button
				variant="ghost"
				href="/supplier/finances/payments"
				class="h-14 w-full rounded-none border-t border-border/40 bg-muted/30 text-sm font-semibold text-primary hover:bg-muted/50 transition-colors"
			>
				Mostra tutta la cronologia
			</Button>
		</div>
	</section>

	<section class="mt-12 space-y-6">
		<div class="flex items-center justify-between gap-4">
			<div>
				<h2 class="text-2xl font-bold text-foreground">
					Documenti in evidenza
				</h2>
				<p class="mt-1 text-base text-muted-foreground">
					Fatture e preventivi recenti.
				</p>
			</div>
		</div>

		<div
			class="overflow-hidden rounded-3xl border border-border bg-background divide-y divide-border/40"
		>
			{#each latestDocuments as doc}
				<DocumentRow
					{doc}
					type={doc.type}
					onclick={() => (selectedDocument = doc)}
				/>
			{/each}
			<Button
				variant="ghost"
				href="/supplier/finances/documents"
				class="h-14 w-full rounded-none border-t border-border/40 bg-muted/30 text-sm font-semibold text-primary hover:bg-muted/50 transition-colors"
			>
				Mostra tutti i documenti
			</Button>
		</div>
	</section>

	<PaymentDetailsModal 
		payment={selectedPayment} 
		onclose={() => (selectedPayment = null)} 
	/>

	<DocumentDetailsModal 
		document={selectedDocument} 
		onclose={() => (selectedDocument = null)} 
	/>
</div>
