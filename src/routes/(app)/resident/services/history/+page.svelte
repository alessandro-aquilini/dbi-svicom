<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getServiceById } from '$lib/data/services';
	import { getUserById } from '$lib/data/users';
	import { Button } from '$lib/components/ui/button';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowLeft02Icon, Search01Icon, FilterIcon } from '@hugeicons/core-free-icons';
	import {
		getBookingsByResidentId,
		getRecentClosedBookings,
		type Booking
	} from '$lib/data/ticket/booking';
	import HistoryBookingCard from '$lib/components/shared/booking/booking-card/HistoryBookingCard.svelte';

	const currentUser = getCurrentUser();
	const residentId = currentUser?.id ?? '';
	const allBookings = residentId ? getBookingsByResidentId(residentId) : [];
	const closedBookings = getRecentClosedBookings(allBookings, allBookings.length);

	let searchQuery = $state('');
	let selectedFilter = $state('all');

	const filterOptions = $derived(() => {
		const categories = new Set<string>();
		for (const booking of closedBookings) {
			const service = getServiceById(booking.serviceId);
			if (service?.category) categories.add(service.category);
		}
		return ['all', ...Array.from(categories)];
	});

	function getCategoryLabel(category: string) {
		return category === 'all'
			? 'Tutti'
			: category === 'cura-animali'
			? 'Cura animali'
			: category === 'benessere'
			? 'Benessere'
			: category === 'pulizie'
			? 'Pulizie'
			: category === 'mobilita'
			? 'Mobilità'
			: category;
	}

	const filteredBookings = $derived(() => {
		const query = searchQuery.trim().toLowerCase();
		return closedBookings.filter((booking) => {
			const service = getServiceById(booking.serviceId);
			const supplierName = getUserById(service?.supplierId ?? '')?.name ?? '';
			const serviceName = service?.name ?? '';
			const category = service?.category ?? '';

			let matchesSearch = true;
			if (query) {
				matchesSearch = [serviceName, supplierName].some((value) => value.toLowerCase().includes(query));
			}

			let matchesFilter = selectedFilter === 'all' || category === selectedFilter;
			return matchesSearch && matchesFilter;
		});
	});
</script>

<svelte:head>
	<title>Storico servizi — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-md">
	<div class="w-full px-4 py-4">
		<div class="flex items-center gap-3">
			<Button variant="ghost" size="icon" href="/resident/services" class="h-10 w-10 shrink-0 rounded-full">
				<HugeiconsIcon icon={ArrowLeft02Icon} size={22} />
			</Button>
			<h1 class="text-xl font-bold tracking-tight">Cronologia servizi</h1>
		</div>

		<div class="mt-4 flex flex-col gap-3">
			<div class="relative">
				<div class="absolute inset-y-0 left-3 flex items-center text-muted-foreground/60">
					<HugeiconsIcon icon={Search01Icon} size={18} />
				</div>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cerca servizio o fornitore..."
					class="h-11 w-full rounded-2xl border-none bg-muted/60 pl-10 pr-4 text-[15px] transition-all focus:bg-muted focus:ring-2 focus:ring-primary/20"
				/>
			</div>

			<div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
				<div class="flex items-center rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
					<HugeiconsIcon icon={FilterIcon} size={16} />
					<span class="ml-2">Filtra</span>
				</div>
				{#each filterOptions() as category}
					<button
						onclick={() => (selectedFilter = category)}
						class="whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all {selectedFilter === category ? 'bg-foreground text-background shadow-md' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}"
					>
						{getCategoryLabel(category)}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>

<div class="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8">
	<div class="space-y-4">
		{#if filteredBookings().length > 0}
			{#each filteredBookings() as booking (booking.id)}
				<HistoryBookingCard {booking} service={getServiceById(booking.serviceId)} view="resident" />
			{/each}
		{:else}
			<div class="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Nessuna prenotazione chiusa corrisponde ai criteri.
			</div>
		{/if}
	</div>
</div>
