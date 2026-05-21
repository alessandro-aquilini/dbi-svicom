<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getServiceById } from '$lib/data/services';
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
</script>

<svelte:head>
	<title>Storico servizi — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8">
	<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm uppercase tracking-[0.24em] text-primary">Storico</p>
			<h1 class="mt-3 text-3xl font-semibold tracking-tight">Cronologia servizi</h1>
			<p class="mt-2 text-sm text-muted-foreground">Tutte le richieste chiuse e completate.</p>
		</div>
		<a href="/resident/services" class="text-sm font-medium text-primary hover:underline">Torna a servizi</a>
	</div>

	<div class="space-y-4">
		{#if closedBookings.length > 0}
			{#each closedBookings as booking (booking.id)}
				<HistoryBookingCard {booking} service={getServiceById(booking.serviceId)} view="resident" />
			{/each}
		{:else}
			<div class="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Non ci sono prenotazioni chiuse da mostrare.
			</div>
		{/if}
	</div>
</div>
