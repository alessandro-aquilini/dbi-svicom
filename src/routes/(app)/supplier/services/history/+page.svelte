<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getServiceById } from '$lib/data/services';
	import {
		getBookingsBySupplierId,
		getRecentClosedBookings,
		type Booking
	} from '$lib/data/ticket/booking';
	import HistoryBookingCard from '$lib/components/shared/booking/booking-card/HistoryBookingCard.svelte';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const allBookings = getBookingsBySupplierId(supplierId);
	const closedBookings = getRecentClosedBookings(allBookings, allBookings.length);
</script>

<svelte:head>
	<title>Storico servizi — Fornitore — Svicom Living Hub</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8">
	<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm uppercase tracking-[0.24em] text-primary">Storico</p>
			<h1 class="mt-3 text-3xl font-semibold tracking-tight">Cronologia servizi</h1>
			<p class="mt-2 max-w-2xl text-sm text-muted-foreground">Tutte le prenotazioni chiuse gestite dal tuo account.</p>
		</div>
		<a href="/supplier/services" class="text-sm font-medium text-primary hover:underline">Torna a servizi</a>
	</div>

	<div class="grid gap-4">
		{#if closedBookings.length > 0}
			{#each closedBookings as booking (booking.id)}
				<HistoryBookingCard {booking} service={getServiceById(booking.serviceId)} view="supplier" />
			{/each}
		{:else}
			<div class="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Non ci sono prenotazioni chiuse da mostrare.
			</div>
		{/if}
	</div>
</div>
