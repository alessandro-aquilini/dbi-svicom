<script lang="ts">
	import { getInvoicesBySupplierId, type Invoice } from '$lib/data/embeds/invoices';
	import { getQuotesBySupplierId, type Quote } from '$lib/data/embeds/quotes';
	import { getCurrentUser } from '$lib/auth';
	import { getUserById } from '$lib/data/users';
	import { Button } from '$lib/components/ui/button';
	import {
		ArrowLeft02Icon,
		Search01Icon,
		Invoice01Icon,
		Agreement01Icon,
		Download01Icon,
		FilterIcon
	} from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import DocumentRow from '$lib/components/supplier/finances/documents/DocumentRow.svelte';
	import DocumentDetailsModal from '$lib/components/supplier/finances/documents/DocumentDetailsModal.svelte';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';

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
			if (inv.createdAt) items.push({ type: 'invoice', date: new Date(inv.createdAt).getTime(), data: inv });
		}
		for (const q of quotes) {
			if (q.createdAt) items.push({ type: 'quote', date: new Date(q.createdAt).getTime(), data: q });
		}
		return items.sort((a, b) => b.date - a.date); // newest first
	});

	const filteredDocs = $derived(() => {
		return allDocs().filter((doc) => {
			const data = doc.data;
			let isMatch = true;

			// Search
			if (searchQuery) {
				const search = searchQuery.toLowerCase();
				const textMatch = data.description.toLowerCase().includes(search);

				let idMatch = false;
				if (doc.type === 'invoice') idMatch = (doc.data as Invoice).number.toLowerCase().includes(search);
				if (doc.type === 'quote') idMatch = (doc.data as Quote).title.toLowerCase().includes(search);

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

	const groupedDocs = $derived(() => {
		const groups: Record<string, DocumentItem[]> = {};
		for (const doc of filteredDocs()) {
			const d = new Date(doc.date);
			const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
			if (!groups[monthKey]) groups[monthKey] = [];
			groups[monthKey].push(doc);
		}
		return groups;
	});
</script>

<svelte:head>
	<title>Documenti — Fornitore — Svicom Living Hub</title>
</svelte:head>

<!-- Sticky Header -->
<div class="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-md">
	<div class="w-full px-4 py-4">
		<div class="flex items-center gap-3">
			<Button variant="ghost" size="icon" href="/supplier/finances" class="h-10 w-10 shrink-0 rounded-full">
				<HugeiconsIcon icon={ArrowLeft02Icon} size={22} />
			</Button>
			<h1 class="text-xl font-bold tracking-tight">Documenti</h1>
		</div>

		<div class="mt-4 flex flex-col gap-3">
			<!-- Search Bar -->
			<div class="relative">
				<div class="absolute inset-y-0 left-3 flex items-center text-muted-foreground/60">
					<HugeiconsIcon icon={Search01Icon} size={18} />
				</div>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cerca titolo, numero o importo..."
					class="h-11 w-full rounded-2xl border-none bg-muted/60 pl-10 pr-4 text-[15px] transition-all focus:bg-muted focus:ring-2 focus:ring-primary/20"
				/>
			</div>

			<!-- Filters -->
			<div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
				<button
					onclick={() => (selectedFilter = 'all')}
					class="whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all {selectedFilter ===
					'all'
						? 'bg-foreground text-background shadow-md'
						: 'bg-muted/60 text-muted-foreground hover:bg-muted'}"
				>
					Tutti
				</button>
				<button
					onclick={() => (selectedFilter = 'invoices')}
					class="whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all {selectedFilter ===
					'invoices'
						? 'bg-foreground text-background shadow-md'
						: 'bg-muted/60 text-muted-foreground hover:bg-muted'}"
				>
					Fatture
				</button>
				<button
					onclick={() => (selectedFilter = 'quotes')}
					class="whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all {selectedFilter ===
					'quotes'
						? 'bg-foreground text-background shadow-md'
						: 'bg-muted/60 text-muted-foreground hover:bg-muted'}"
				>
					Preventivi
				</button>
			</div>
		</div>
	</div>
</div>

<!-- List -->
<div class="w-full max-w-full p-4 pb-20">
	{#each Object.entries(groupedDocs()) as [monthKey, ds]}
		<div class="mb-8">
			<h2 class="px-1 text-sm font-bold uppercase tracking-[0.24em] text-muted-foreground">
				{format(new Date(`${monthKey}-01`), 'LLLL yyyy', { locale: it })}
			</h2>
			<div class="mt-3 overflow-hidden rounded-3xl border border-border bg-card divide-y divide-border/40">
				{#each ds as doc}
					<DocumentRow {doc} type={doc.type} onclick={() => (selectedDocument = doc)} />
				{/each}
			</div>
		</div>
	{/each}

	{#if filteredDocs().length === 0}
		<div class="flex flex-col items-center justify-center py-20 text-center">
			<div class="mb-4 rounded-full bg-muted/40 p-5 text-muted-foreground/40">
				<HugeiconsIcon icon={FilterIcon} size={32} />
			</div>
			<h3 class="text-base font-semibold text-foreground">Nessun documento</h3>
			<p class="mt-1 text-sm text-muted-foreground">La tua ricerca non ha prodotto risultati.</p>
		</div>
	{/if}
</div>

<DocumentDetailsModal
	document={selectedDocument}
	onclose={() => (selectedDocument = null)}
/>


