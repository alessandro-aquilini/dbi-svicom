<script lang="ts">
	import { getInvoicesBySupplierId, type Invoice } from '$lib/data/embeds/invoices';
	import { getQuotesBySupplierId, type Quote } from '$lib/data/embeds/quotes';
	import { getCurrentUser } from '$lib/auth';
	import { getUserById } from '$lib/data/users';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';

	const invoices = getInvoicesBySupplierId(supplierId);
	const quotes = getQuotesBySupplierId(supplierId);

	type DocumentItem = 
		| { type: 'invoice'; date: number; data: Invoice }
		| { type: 'quote'; date: number; data: Quote };

	let searchQuery = $state('');
	let selectedFilter = $state('all'); // all, invoices, quotes
	let selectedDocument: DocumentItem | null = $state(null);

	const allDocs = $derived(() => {
		const items: DocumentItem[] = [];
		for (const inv of invoices) {
			items.push({ type: 'invoice', date: new Date(inv.issueDate).getTime(), data: inv });
		}
		for (const q of quotes) {
			items.push({ type: 'quote', date: new Date(q.sentAt).getTime(), data: q });
		}
		return items.sort((a, b) => b.date - a.date); // newest first
	});

	const filteredDocs = $derived(() => {
		return allDocs().filter(doc => {
			const data = doc.data;
			let isMatch = true;

			// Search
			if (searchQuery) {
				const search = searchQuery.toLowerCase();
				const textMatch = data.description.toLowerCase().includes(search);
				
				let idMatch = false;
				if (doc.type === 'invoice') idMatch = doc.data.number.toLowerCase().includes(search);
				if (doc.type === 'quote') idMatch = doc.data.title.toLowerCase().includes(search);
				
				isMatch = textMatch || idMatch || data.amount.toString().includes(search);
			}

			// Filter
			if (selectedFilter !== 'all') {
				if (selectedFilter === 'invoices' && doc.type !== 'invoice') isMatch = false;
				if (selectedFilter === 'quotes' && doc.type !== 'quote') isMatch = false;
			}

			return isMatch;
		});
	});

</script>

<svelte:head>
	<title>Documenti — Fornitore — Svicom Living Hub</title>
</svelte:head>

<!-- Sticky Header -->
<div class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border text-foreground px-4 pt-4 pb-3 flex flex-col gap-3 shadow-sm">
	<h1 class="text-2xl font-bold tracking-tight">Documenti</h1>
	<div class="flex flex-col gap-2">
		<!-- Search -->
		<div class="relative">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
			<input type="text" bind:value={searchQuery} placeholder="Cerca titolo, numero o importo..." class="w-full rounded-2xl border border-input bg-muted/50 pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
		</div>
		<!-- Fliters -->
		<div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
			<button onclick={() => (selectedFilter = 'all')} class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors {selectedFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}">
				Tutti
			</button>
			<button onclick={() => (selectedFilter = 'invoices')} class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors {selectedFilter === 'invoices' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}">
				Fatture
			</button>
			<button onclick={() => (selectedFilter = 'quotes')} class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors {selectedFilter === 'quotes' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}">
				Preventivi
			</button>
		</div>
	</div>
</div>

<!-- List -->
<div class="p-4 space-y-4 pb-20">
	{#each filteredDocs() as doc}
		{@const customerName = getUserById(doc.data.customerId)?.name ?? 'Sconosciuto'}
		{@const isInv = doc.type === 'invoice'}
		<button class="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-opacity hover:opacity-90 hover:bg-muted/30" onclick={() => (selectedDocument = doc)}>
			<div class="mb-3 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="flex h-8 w-8 items-center justify-center rounded-full {isInv ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}">
						{#if isInv}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
						{/if}
					</div>
					<span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isInv ? 'Fattura' : 'Preventivo'} • {new Date(doc.date).toLocaleDateString('it-IT')}</span>
				</div>
				<span class="text-sm font-bold text-foreground">{doc.data.amount.toLocaleString('it-IT', { style: 'currency', currency: doc.data.currency })}</span>
			</div>
			
			<div class="px-1">
				<h3 class="mb-1 font-semibold text-foreground line-clamp-1">{doc.type === 'invoice' ? doc.data.number : doc.data.title}</h3>
				<p class="text-sm text-muted-foreground line-clamp-2">{doc.data.description}</p>
				<p class="text-xs font-medium text-foreground mt-3">Per: {customerName}</p>
			</div>
		</button>
	{/each}

	{#if filteredDocs().length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
			<h3 class="text-sm font-medium">Nessun documento</h3>
			<p class="text-xs mt-1">Non ci sono documenti che corrispondono alla tua ricerca.</p>
		</div>
	{/if}
</div>

<!-- Details Modal -->
{#if selectedDocument}
	{@const doc = selectedDocument}
	{@const isInv = doc.type === 'invoice'}
	{@const customerName = getUserById(doc.data.customerId)?.name ?? 'Sconosciuto'}
	<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4 backdrop-blur-[2px]">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0" onclick={() => (selectedDocument = null)}></div>
		<div class="relative w-full max-h-[90vh] overflow-y-auto sm:max-w-sm flex flex-col rounded-t-3xl sm:rounded-3xl bg-background p-6 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-300">
			<!-- Handle for mobile sheet -->
			<div class="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/20 mb-6 sm:hidden"></div>

			<div class="flex flex-col items-center text-center pb-6 border-b border-border/50">
				<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full {isInv ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}">
					{#if isInv}
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
					{/if}
				</div>
				<h2 class="text-lg font-bold text-foreground">{isInv ? doc.data.number : doc.data.title}</h2>
				<h3 class="text-3xl font-mono tracking-tight font-bold text-foreground mt-2">{doc.data.amount.toLocaleString('it-IT', { style: 'currency', currency: doc.data.currency })}</h3>
			</div>

			<div class="py-6 space-y-4 border-b border-border/50">
				<div class="flex justify-between items-center text-sm">
					<span class="text-muted-foreground">Tipo</span>
					<span class="font-medium text-foreground">{isInv ? 'Fattura' : 'Preventivo'}</span>
				</div>
				<div class="flex justify-between items-center text-sm">
					<span class="text-muted-foreground">Destinatario</span>
					<span class="font-medium text-foreground">{customerName}</span>
				</div>
				<div class="flex justify-between items-center text-sm">
					<span class="text-muted-foreground">Data Emissione</span>
					<span class="font-medium text-foreground">{new Date(doc.date).toLocaleDateString('it-IT')}</span>
				</div>
				{#if isInv && doc.data.dueDate}
					<div class="flex justify-between items-center text-sm">
						<span class="text-muted-foreground">Scadenza</span>
						<span class="font-medium text-foreground">{new Date(doc.data.dueDate).toLocaleDateString('it-IT')}</span>
					</div>
				{/if}
				{#if !isInv && doc.data.expiresAt}
					<div class="flex justify-between items-center text-sm">
						<span class="text-muted-foreground">Scadenza</span>
						<span class="font-medium text-foreground">{new Date(doc.data.expiresAt).toLocaleDateString('it-IT')}</span>
					</div>
				{/if}
				{#if !isInv && 'status' in doc.data}
					<div class="flex justify-between items-center text-sm">
						<span class="text-muted-foreground">Stato</span>
						<span class="font-medium uppercase tracking-widest text-xs px-2 py-0.5 rounded-sm bg-muted text-foreground">{doc.data.status}</span>
					</div>
				{/if}
				<div class="flex flex-col gap-1.5 pt-2">
					<span class="text-muted-foreground text-sm">Descrizione</span>
					<span class="font-medium text-foreground text-sm leading-snug">{doc.data.description}</span>
				</div>
			</div>

			<div class="mt-6 flex flex-col gap-3">
				<button class="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3.5 text-[15px] font-semibold shadow-sm transition-colors hover:bg-primary/95">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
					Scarica PDF
				</button>
				<button class="w-full flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground py-3.5 text-[15px] font-semibold shadow-sm transition-colors hover:bg-secondary/80">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
					Condividi
				</button>
				<button class="w-full rounded-xl border-2 border-input bg-transparent py-3 text-[15px] font-bold text-foreground transition-colors hover:bg-accent/50 mt-2" onclick={() => (selectedDocument = null)}>
					Chiudi
				</button>
			</div>
		</div>
	</div>
{/if}
