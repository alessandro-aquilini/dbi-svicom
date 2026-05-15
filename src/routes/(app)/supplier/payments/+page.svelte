<script lang="ts">
	import { getPaymentsByUserId, type Payment } from '$lib/data/embeds/payments';
	import { getUserById } from '$lib/data/users';
	import { getCurrentUser } from '$lib/auth';
	import { formatPaymentDate, formatPaymentDateTime } from '$lib/components/payments/presentation';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const allPayments = getPaymentsByUserId(supplierId);

	let searchQuery = $state('');
	let selectedFilter = $state('all'); // all, paid, pending

	// Selected payment for the modal sheet
	let selectedPayment: Payment | null = $state(null);

	// Derived visible payments
	const filteredPayments = $derived(() => {
		return allPayments
			.filter((p) => {
				const user = getUserById(p.fromId);
				const userName = user?.name.toLowerCase() ?? '';
				const search = searchQuery.toLowerCase();
				const matchesSearch = p.description.toLowerCase().includes(search) || userName.includes(search) || p.amount.toString().includes(search) || p.id.toLowerCase().includes(search);
				const isPaid = !!p.paidAt;
				const matchesFilter = selectedFilter === 'all' || (selectedFilter === 'paid' && isPaid) || (selectedFilter === 'pending' && !isPaid);
				return matchesSearch && matchesFilter;
			})
			.sort((a, b) => {
				const dateA = new Date(a.createdAt || a.paidAt || '').getTime();
				const dateB = new Date(b.createdAt || b.paidAt || '').getTime();
				return dateB - dateA;
			});
	});

	const groupedPayments = $derived(() => {
		const groups: Record<string, Payment[]> = {};
		for (const p of filteredPayments()) {
			const d = new Date(p.paidAt || p.createdAt || '');
			// Example "Aprile 2024"
			const monthYear = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
			const capitalized = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
			if (!groups[capitalized]) groups[capitalized] = [];
			groups[capitalized].push(p);
		}
		return groups;
	});
</script>

<svelte:head>
	<title>Pagamenti — Fornitore — Svicom Living Hub</title>
</svelte:head>

<!-- Sticky Header with Title, Search, and Filters -->
<div class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm px-4 pt-4 pb-3 flex flex-col gap-3">
	<h1 class="text-2xl font-bold tracking-tight">Attività</h1>
	<div class="flex flex-col gap-2">
		<!-- Search Bar -->
		<div class="relative">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
			<input type="text" bind:value={searchQuery} placeholder="Cerca nome, importo o ID..." class="w-full rounded-2xl border border-input bg-muted/50 pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
		</div>
		<!-- Scrollable Filters -->
		<div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
			<button onclick={() => (selectedFilter = 'all')} class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors {selectedFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}">
				Tutti
			</button>
			<button onclick={() => (selectedFilter = 'paid')} class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors {selectedFilter === 'paid' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}">
				Ricevuti
			</button>
			<button onclick={() => (selectedFilter = 'pending')} class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors {selectedFilter === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}">
				In attesa
			</button>
		</div>
	</div>
</div>

<div class="p-4 space-y-6 pb-20">
	{#each Object.entries(groupedPayments()) as [monthYear, ps]}
		<div>
			<h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">{monthYear}</h2>
			<div class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
				<div class="divide-y divide-border">
					{#each ps as payment}
						{@const user = getUserById(payment.fromId)}
						{@const isPaid = !!payment.paidAt}
						<button class="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors" onclick={() => (selectedPayment = payment)}>
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full {isPaid ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}">
									<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
								</div>
								<div>
									<p class="text-sm font-semibold text-foreground line-clamp-1">{user?.name ?? 'Sconosciuto'}</p>
									<p class="text-xs text-muted-foreground mt-0.5 line-clamp-1">{payment.description}</p>
									<p class="text-[10px] text-muted-foreground/70 mt-0.5">{formatPaymentDate(payment.paidAt ?? payment.createdAt)}</p>
								</div>
							</div>
							<div class="flex flex-col items-end shrink-0 pl-3">
								<span class="text-[15px] font-bold {isPaid ? 'text-foreground' : 'text-foreground/80'}">
									{payment.amount.toLocaleString('it-IT', { style: 'currency', currency: payment.currency })}
								</span>
								{#if !isPaid}
									<span class="text-[10px] font-medium mt-1 uppercase text-orange-600 bg-orange-500/10 px-1.5 py-0.5 rounded-sm">In sospeso</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/each}

	{#if Object.keys(groupedPayments()).length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
			</div>
			<h3 class="text-sm font-medium">Nessuna transazione trovata</h3>
			<p class="text-xs text-muted-foreground mt-1">Prova a cambiare i filtri o la ricerca.</p>
		</div>
	{/if}
</div>

<!-- Details Model / Bottom Sheet -->
{#if selectedPayment}
	{@const user = getUserById(selectedPayment.fromId)}
	{@const isPaid = !!selectedPayment.paidAt}
	<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4 backdrop-blur-[2px]">
		<!-- Click away dismiss -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0" onclick={() => (selectedPayment = null)}></div>
		
		<div class="relative w-full max-h-[90vh] overflow-y-auto sm:max-w-sm flex flex-col rounded-t-3xl sm:rounded-3xl bg-background p-6 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-300">
			<!-- Header Sheet Handle -->
			<div class="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/20 mb-6 sm:hidden"></div>
			
			<div class="flex flex-col items-center text-center">
				<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full {isPaid ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}">
					<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
				</div>
				<h2 class="text-3xl font-bold text-foreground mb-1 font-mono tracking-tight">{selectedPayment.amount.toLocaleString('it-IT', { style: 'currency', currency: selectedPayment.currency })}</h2>
				<p class="text-sm font-medium {isPaid ? 'text-green-600' : 'text-orange-600'}">{isPaid ? 'Completato' : 'In attesa di pagamento'}</p>
			</div>

			<div class="mt-8 rounded-2xl bg-muted/30 border border-border/50 p-4 space-y-4">
				<div class="flex justify-between items-center text-sm border-b border-border/50 pb-3">
					<span class="text-muted-foreground">Stato</span>
					<span class="font-medium text-foreground">{isPaid ? 'Ricevuto' : 'In sospeso'}</span>
				</div>
				<div class="flex justify-between items-center text-sm border-b border-border/50 pb-3">
					<span class="text-muted-foreground">Mittente</span>
					<span class="font-medium text-foreground">{user?.name ?? 'Sconosciuto'}</span>
				</div>
				<div class="flex justify-between items-center text-sm border-b border-border/50 pb-3">
					<span class="text-muted-foreground">Data</span>
								<span class="font-medium text-foreground">{formatPaymentDateTime(selectedPayment.paidAt ?? selectedPayment.createdAt)}</span>
				</div>
				<div class="flex justify-between items-start text-sm border-b border-border/50 pb-3">
					<span class="text-muted-foreground pt-0.5">Causale</span>
					<span class="font-medium text-foreground text-right w-2/3 leading-snug">{selectedPayment.description}</span>
				</div>
				<div class="flex justify-between items-center text-sm">
					<span class="text-muted-foreground">ID Transazione</span>
					<span class="font-mono text-foreground font-medium uppercase">{selectedPayment.id}</span>
				</div>
			</div>

			<div class="mt-8 flex flex-col gap-3">
				{#if isPaid}
					<button class="w-full rounded-xl bg-primary text-primary-foreground py-3.5 text-[15px] font-semibold shadow-sm transition-colors hover:bg-primary/95 flex items-center justify-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
						Scarica Ricevuta
					</button>
				{:else}
					<button class="w-full rounded-xl bg-primary text-primary-foreground py-3.5 text-[15px] font-semibold shadow-sm transition-colors hover:bg-primary/95 flex items-center justify-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
						Segna come Pagato
					</button>
				{/if}
				<button class="w-full rounded-xl border-2 border-input bg-transparent py-3.5 text-[15px] font-bold text-foreground transition-colors hover:bg-accent/50" onclick={() => (selectedPayment = null)}>
					Chiudi
				</button>
			</div>
		</div>
	</div>
{/if}
