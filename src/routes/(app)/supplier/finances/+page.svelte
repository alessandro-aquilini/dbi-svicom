<script lang="ts">
	import { getInvoicesBySupplierId, type Invoice } from '$lib/data/embeds/invoices';
	import { getQuotesBySupplierId, type Quote } from '$lib/data/embeds/quotes';
	import { getPaymentsByUserId, type Payment } from '$lib/data/embeds/payments';
	import { getCurrentUser } from '$lib/auth';
	import { getUserById } from '$lib/data/users';
	import { Button } from '$lib/components/ui/button';
	import { ArrowRightIcon, Invoice01Icon, Agreement01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import FinanceRadar from '$lib/components/supplier/finances/FinanceRadar.svelte';
	import PaymentRow from '$lib/components/supplier/finances/payments/PaymentRow.svelte';
	import DocumentRow from '$lib/components/supplier/finances/documents/DocumentRow.svelte';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';

	const supplierPayments = getPaymentsByUserId(supplierId)
		.filter((payment) => payment.toId === supplierId)
		.sort((a, b) => new Date(b.paidAt || b.createdAt || '').getTime() - new Date(a.paidAt || a.createdAt || '').getTime());

	const supplierInvoices = getInvoicesBySupplierId(supplierId);
	const supplierQuotes = getQuotesBySupplierId(supplierId);

	type DocumentItem =
		| { type: 'invoice'; date: number; data: Invoice }
		| { type: 'quote'; date: number; data: Quote };

	const supplierDocs: DocumentItem[] = [
		...supplierInvoices.map((invoice) => ({ type: 'invoice' as const, date: new Date(invoice.createdAt).getTime(), data: invoice })),
		...supplierQuotes.map((quote) => ({ type: 'quote' as const, date: new Date(quote.createdAt).getTime(), data: quote }))
	].sort((a, b) => b.date - a.date);

	const latestPayments = supplierPayments.slice(0, 3);
	const latestDocuments = supplierDocs.slice(0, 3);

	const totalGains = supplierPayments.reduce((acc, p) => acc + p.amount, 0);

	const now = new Date();
	const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

	const revenueThisMonth = supplierPayments
		.filter((payment) => {
			const date = new Date(payment.paidAt || payment.createdAt || '');
			return date >= currentMonthStart && date < nextMonthStart;
		})
		.reduce((acc, payment) => acc + payment.amount, 0);

	const revenueLastMonth = supplierPayments
		.filter((payment) => {
			const date = new Date(payment.paidAt || payment.createdAt || '');
			return date >= previousMonthStart && date < currentMonthStart;
		})
		.reduce((acc, payment) => acc + payment.amount, 0);

	const monthlyGrowthRatio = revenueLastMonth === 0
		? revenueThisMonth === 0
			? 0
			: 12.5
		: Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 10) / 10;

	let selectedPayment: Payment | null = $state(null);
	let selectedDocument: DocumentItem | null = $state(null);
</script>

<div class="w-full min-h-screen px-6 pb-24">
	<header class="space-y-4 pt-6">
		<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
			<div class="min-w-0">
				<h1 class="text-3xl font-bold tracking-tight">Finanze</h1>
				<p class="mt-2 max-w-2xl text-base text-muted-foreground">
					Monitora i tuoi guadagni e l'andamento della tua attività finanziaria.
				</p>
			</div>
		</div>
	</header>

	<section class="mt-8">
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<FinanceRadar
				{totalGains}
				revenueLastMonth={revenueLastMonth}
				activeInvoices={supplierInvoices.length}
				monthlyGrowthRatio={monthlyGrowthRatio}
			/>
		</div>
	</section>

	<div class="mt-10 grid gap-8 xl:grid-cols-2">
		<section class="rounded-3xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<h2 class="text-lg font-semibold text-foreground">Ultimi pagamenti</h2>
					<p class="mt-1 text-sm text-muted-foreground">Le entrate più recenti in ordine cronologico.</p>
				</div>
				<Button variant="ghost" size="sm" href="/supplier/finances/payments" class="h-9 text-xs">
					Mostra tutto
					<HugeiconsIcon icon={ArrowRightIcon} size={14} class="ml-1" />
				</Button>
			</div>

			<div class="mt-6 overflow-hidden rounded-3xl border border-border bg-background divide-y divide-border/40">
				{#each latestPayments as payment}
					<PaymentRow {payment} onclick={() => (selectedPayment = payment)} />
				{/each}
			</div>
		</section>

		<section class="rounded-3xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<h2 class="text-lg font-semibold text-foreground">Documenti in evidenza</h2>
					<p class="mt-1 text-sm text-muted-foreground">Fatture e preventivi recenti.</p>
				</div>
				<Button variant="ghost" size="sm" href="/supplier/finances/documents" class="h-9 text-xs">
					Mostra tutto
					<HugeiconsIcon icon={ArrowRightIcon} size={14} class="ml-1" />
				</Button>
			</div>

			<div class="mt-6 overflow-hidden rounded-3xl border border-border bg-background divide-y divide-border/40">
				{#each latestDocuments as doc}
					<DocumentRow {doc} type={doc.type} onclick={() => (selectedDocument = doc)} />
				{/each}
			</div>
		</section>
	</div>

	{#if selectedPayment}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="absolute inset-0" onclick={() => (selectedPayment = null)}></div>
				<div class="relative w-full max-w-lg rounded-4xl bg-background p-8 shadow-2xl">
					<div class="flex flex-col items-center text-center">
						<h2 class="text-2xl font-bold text-foreground">{selectedPayment.amount.toLocaleString('it-IT', { style: 'currency', currency: selectedPayment.currency })}</h2>
						<p class="mt-2 text-sm text-muted-foreground">Pagamento ricevuto da {getUserById(selectedPayment.fromId)?.name ?? 'Sconosciuto'}.</p>
					</div>
					<div class="mt-8 space-y-4 rounded-3xl bg-muted/40 p-6">
						<div class="flex items-center justify-between text-sm text-muted-foreground">
							<span>Mittente</span>
							<span class="text-foreground font-semibold">{getUserById(selectedPayment.fromId)?.name ?? 'Sconosciuto'}</span>
						</div>
						<div class="flex items-center justify-between text-sm text-muted-foreground">
							<span>Stato</span>
							<span class="font-semibold text-foreground">{selectedPayment.paidAt ? 'Ricevuto' : 'In elaborazione'}</span>
						</div>
						<div class="text-sm text-muted-foreground">
							<span class="font-semibold text-foreground">Descrizione</span>
							<p class="mt-1 leading-relaxed">{selectedPayment.description}</p>
						</div>
					</div>
					<div class="mt-6 flex justify-end">
						<Button class="h-12 rounded-2xl text-[15px] font-bold" onclick={() => (selectedPayment = null)}>
							Chiudi
						</Button>
					</div>
				</div>
		</div>
	{/if}

	{#if selectedDocument}
		{@const doc = selectedDocument}
		{@const isInv = doc.type === 'invoice'}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="absolute inset-0" onclick={() => (selectedDocument = null)}></div>
				<div class="relative w-full max-w-lg rounded-4xl bg-background p-8 shadow-2xl">
					<div class="flex flex-col items-center text-center">
						<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full {isInv ? 'bg-blue-500/5 text-blue-600' : 'bg-purple-500/5 text-purple-600'}">
							<HugeiconsIcon icon={isInv ? Invoice01Icon : Agreement01Icon} size={28} />
						</div>
						<h2 class="text-2xl font-bold text-foreground">{isInv ? doc.data.number : doc.data.title}</h2>
						<p class="mt-2 text-sm text-muted-foreground">{doc.data.amount.toLocaleString('it-IT', { style: 'currency', currency: doc.data.currency })}</p>
					</div>
					<div class="mt-8 space-y-4 rounded-3xl bg-muted/40 p-6">
						<div class="flex items-center justify-between text-sm text-muted-foreground">
							<span>Tipo</span>
							<span class="font-semibold text-foreground">{isInv ? 'Fattura' : 'Preventivo'}</span>
						</div>
						<div class="flex items-center justify-between text-sm text-muted-foreground">
							<span>Cliente</span>
							<span class="font-semibold text-foreground">{getUserById(doc.data.customerId)?.name ?? 'Sconosciuto'}</span>
						</div>
						<div class="text-sm text-muted-foreground">
							<span class="font-semibold text-foreground">Descrizione</span>
							<p class="mt-1 leading-relaxed">{doc.data.description}</p>
						</div>
					</div>
					<div class="mt-6 flex justify-between gap-3">
						<Button class="h-12 rounded-2xl text-[15px] font-bold" onclick={() => (selectedDocument = null)}>
							Chiudi
						</Button>
						<Button class="h-12 rounded-2xl text-[15px] font-bold shadow-lg">
							Scarica PDF
						</Button>
					</div>
				</div>
		</div>
	{/if}
</div>
