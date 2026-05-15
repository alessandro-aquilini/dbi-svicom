<script lang="ts">
	import { invoices, type Invoice } from '$lib/data/embeds/invoices';
	import { quotes, type Quote } from '$lib/data/embeds/quotes';
	import { payments, type Payment } from '$lib/data/embeds/payments';
	import { getCurrentUser } from '$lib/auth';
	import { FinanceCard } from '$lib/components/shared';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		Search01Icon, 
		FilterIcon,
		Download01Icon,
		FileAddIcon as FileAdd02Icon,
        ArrowUpDownIcon
	} from '@hugeicons/core-free-icons';

	const currentUser = getCurrentUser();
	const adminId = currentUser?.id ?? 'adm-giorgio-01';

	type FinanceItem = 
		| { type: 'invoice'; date: number; data: Invoice }
		| { type: 'quote'; date: number; data: Quote }
		| { type: 'payment'; date: number; data: Payment };

	let searchQuery = $state('');
	let selectedFilter = $state('all'); // all, invoices, quotes, payments

	const allFinances = $derived(() => {
		const items: FinanceItem[] = [];
		
		// Filter invoices: where admin is customer or linked to property (usually admin manages all property finances)
		// For this view, we'll take all where customerId is admin or it's a known admin-managed entity
		invoices.forEach(inv => {
			if (inv.customerId === adminId || inv.supplierId === adminId) {
				items.push({ type: 'invoice', date: new Date(inv.createdAt).getTime(), data: inv });
			}
		});

		quotes.forEach(q => {
			if (q.customerId === adminId || q.supplierId === adminId) {
				items.push({ type: 'quote', date: new Date(q.createdAt).getTime(), data: q });
			}
		});

		payments.forEach(p => {
			if (p.fromId === adminId || p.toId === adminId) {
				items.push({ type: 'payment', date: new Date(p.createdAt || p.paidAt || 0).getTime(), data: p });
			}
		});

		return items.sort((a, b) => b.date - a.date);
	});

	const filteredFinances = $derived(() => {
		return allFinances().filter(item => {
			const data = item.data;
			let isMatch = true;

			// Search
			if (searchQuery) {
				const search = searchQuery.toLowerCase();
				const descMatch = data.description.toLowerCase().includes(search);
				let idMatch = false;
				if (item.type === 'invoice') idMatch = item.data.number.toLowerCase().includes(search);
				if (item.type === 'quote') idMatch = item.data.title.toLowerCase().includes(search);
				
				isMatch = descMatch || idMatch || data.amount.toString().includes(search);
			}

			// Filter
			if (selectedFilter !== 'all') {
				if (selectedFilter === 'invoices' && item.type !== 'invoice') isMatch = false;
				if (selectedFilter === 'quotes' && item.type !== 'quote') isMatch = false;
				if (selectedFilter === 'payments' && item.type !== 'payment') isMatch = false;
			}

			return isMatch;
		});
	});

	const stats = $derived(() => {
		const list = filteredFinances();
		return {
			total: list.length,
			sum: list.reduce((acc, item) => acc + item.data.amount, 0),
			invoices: list.filter(i => i.type === 'invoice').length,
			quotes: list.filter(i => i.type === 'quote').length
		};
	});
</script>

<svelte:head>
	<title>Contabilità — Admin — Svicom Living Hub</title>
</svelte:head>

<div class="flex h-full flex-col">
	<!-- Header Section -->
	<header class="border-b border-border bg-card px-8 py-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-foreground">Contabilità</h1>
				<p class="text-sm text-muted-foreground">Gestione flussi finanziari, fatture e preventivi.</p>
			</div>
			<div class="flex items-center gap-3">
				<button class="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
					<HugeiconsIcon icon={Download01Icon} size={18} />
					<span>Esporta report</span>
				</button>
				<button class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
					<HugeiconsIcon icon={FileAdd02Icon} size={18} />
					<span>Nuova operazione</span>
				</button>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-xl border border-border bg-background p-4">
				<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Volume Totale</p>
				<p class="mt-1 text-2xl font-bold text-foreground">
					{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(stats().sum)}
				</p>
			</div>
			<div class="rounded-xl border border-border bg-background p-4">
				<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Documenti Attivi</p>
				<p class="mt-1 text-2xl font-bold text-foreground">{stats().total}</p>
			</div>
			<div class="rounded-xl border border-border bg-background p-4">
				<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Fatture</p>
				<p class="mt-1 text-2xl font-bold text-foreground">{stats().invoices}</p>
			</div>
			<div class="rounded-xl border border-border bg-background p-4">
				<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Preventivi</p>
				<p class="mt-1 text-2xl font-bold text-foreground">{stats().quotes}</p>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<div class="flex-1 space-y-6 overflow-y-auto p-8">
		<!-- Filters & Search -->
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<div class="relative w-64 lg:w-80">
					<HugeiconsIcon icon={Search01Icon} size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<input 
						type="text" 
						bind:value={searchQuery}
						placeholder="Cerca per numero, titolo o importo..." 
						class="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
					/>
				</div>
				<div class="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
					<button 
						onclick={() => (selectedFilter = 'all')}
						class="rounded-md px-3 py-1 text-sm font-medium transition-colors {selectedFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}"
					>
						Tutti
					</button>
					<button 
						onclick={() => (selectedFilter = 'invoices')}
						class="rounded-md px-3 py-1 text-sm font-medium transition-colors {selectedFilter === 'invoices' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}"
					>
						Fatture
					</button>
					<button 
						onclick={() => (selectedFilter = 'quotes')}
						class="rounded-md px-3 py-1 text-sm font-medium transition-colors {selectedFilter === 'quotes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}"
					>
						Preventivi
					</button>
					<button 
						onclick={() => (selectedFilter = 'payments')}
						class="rounded-md px-3 py-1 text-sm font-medium transition-colors {selectedFilter === 'payments' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}"
					>
						Pagamenti
					</button>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<button class="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent font-medium transition-colors">
					<HugeiconsIcon icon={ArrowUpDownIcon} size={18} />
					<span>Ordina per data</span>
				</button>
			</div>
		</div>

		<!-- List -->
		<div class="space-y-3">
			{#each filteredFinances() as item}
				{#if item.type === 'invoice'}
					<FinanceCard 
						type="invoice"
						date={item.date}
						amount={item.data.amount}
						currency={item.data.currency}
						title={item.data.number}
						description={item.data.description}
						customerId={item.data.customerId}
						supplierId={item.data.supplierId}
						propertyId={item.data.propertyId}
						ticketId={item.data.ticketId}
						number={item.data.number}
						dueDate={item.data.dueDate}
					/>
				{:else if item.type === 'quote'}
					<FinanceCard 
						type="quote"
						date={item.date}
						amount={item.data.amount}
						currency={item.data.currency}
						title={item.data.title}
						description={item.data.description}
						customerId={item.data.customerId}
						supplierId={item.data.supplierId}
						propertyId={item.data.propertyId}
						ticketId={item.data.ticketId}
						expiresAt={item.data.expiresAt}
					/>
				{:else if item.type === 'payment'}
					<FinanceCard 
						type="payment"
						date={item.date}
						amount={item.data.amount}
						currency={item.data.currency}
						title={item.data.description}
						description={item.data.description}
						fromId={item.data.fromId}
						toId={item.data.toId}
						propertyId={item.data.propertyId}
						ticketId={item.data.ticketId || item.data.bookingId}
						paidAt={item.data.paidAt}
					/>
				{/if}
			{:else}
				<div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-24 text-center">
					<div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
						<HugeiconsIcon icon={FilterIcon} size={28} class="text-muted-foreground" />
					</div>
					<h3 class="text-lg font-semibold text-foreground">Nessun risultato trovato</h3>
					<p class="mt-1 text-sm text-muted-foreground">Prova a cambiare i filtri o la query di ricerca.</p>
				</div>
			{/each}
		</div>
	</div>
</div>
