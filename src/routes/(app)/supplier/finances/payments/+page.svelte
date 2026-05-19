<script lang="ts">
	import { getPaymentsByUserId, type Payment } from '$lib/data/embeds/payments';
	import { getUserById } from '$lib/data/users';
	import { getCurrentUser } from '$lib/auth';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft02Icon, FilterIcon, Search01Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import PaymentRow from '$lib/components/supplier/finances/payments/PaymentRow.svelte';
	import PaymentDetailsModal from '$lib/components/supplier/finances/payments/PaymentDetailsModal.svelte';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const allPayments = getPaymentsByUserId(supplierId);

	let searchQuery = $state('');
	let selectedFilter = $state('all'); // all, admin, resident

	// Selected payment for the modal sheet
	let selectedPayment: Payment | null = $state(null);

	// Derived visible payments
	const filteredPayments = $derived(() => {
		return allPayments
			.filter((p) => {
				const user = getUserById(p.fromId);
				const userName = user?.name.toLowerCase() ?? '';
				const search = searchQuery.toLowerCase();
				const matchesSearch =
					p.description.toLowerCase().includes(search) ||
					userName.includes(search) ||
					p.amount.toString().includes(search) ||
					p.id.toLowerCase().includes(search);

				let matchesFilter = true;
				if (selectedFilter === 'admin' && user?.role !== 'admin') matchesFilter = false;
				if (selectedFilter === 'resident' && user?.role !== 'resident') matchesFilter = false;

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
			const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
			if (!groups[monthKey]) groups[monthKey] = [];
			groups[monthKey].push(p);
		}
		return groups;
	});
</script>

<svelte:head>
	<title>Movimenti — Fornitore — Svicom Living Hub</title>
</svelte:head>

<!-- Sticky Header -->
<div class="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-md">
	<div class="w-full px-4 py-4">
		<div class="flex items-center gap-3">
			<Button variant="ghost" size="icon" href="/supplier/finances" class="h-10 w-10 shrink-0 rounded-full">
				<HugeiconsIcon icon={ArrowLeft02Icon} size={22} />
			</Button>
			<h1 class="text-xl font-bold tracking-tight">Movimenti</h1>
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
					placeholder="Cerca per mittente o causale..."
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
					onclick={() => (selectedFilter = 'admin')}
					class="whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all {selectedFilter ===
					'admin'
						? 'bg-foreground text-background shadow-md'
						: 'bg-muted/60 text-muted-foreground hover:bg-muted'}"
				>
					Amministratori
				</button>
				<button
					onclick={() => (selectedFilter = 'resident')}
					class="whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all {selectedFilter ===
					'resident'
						? 'bg-foreground text-background shadow-md'
						: 'bg-muted/60 text-muted-foreground hover:bg-muted'}"
				>
					Residenti
				</button>
			</div>
		</div>
	</div>
</div>

<div class="w-full max-w-full p-4 pb-20">
	{#each Object.entries(groupedPayments()) as [monthKey, ps]}
		<div class="mb-8">
			<h2 class="px-1 text-sm font-bold uppercase tracking-[0.24em] text-muted-foreground">
				{format(new Date(`${monthKey}-01`), 'LLLL yyyy', { locale: it })}
			</h2>
			<div class="mt-3 overflow-hidden rounded-3xl border border-border bg-card divide-y divide-border/40">
				{#each ps as payment}
					<PaymentRow {payment} onclick={() => (selectedPayment = payment)} />
				{/each}
			</div>
		</div>
	{/each}

	{#if Object.keys(groupedPayments()).length === 0}
		<div class="flex flex-col items-center justify-center py-20 text-center">
			<div class="mb-4 rounded-full bg-muted/40 p-5 text-muted-foreground/40">
				<HugeiconsIcon icon={FilterIcon} size={32} />
			</div>
			<h3 class="text-base font-semibold text-foreground">Nessun movimento</h3>
			<p class="mt-1 text-sm text-muted-foreground">Prova a cambiare i filtri o la ricerca.</p>
		</div>
	{/if}
</div>

<PaymentDetailsModal 
	payment={selectedPayment} 
	onclose={() => (selectedPayment = null)} 
/>


