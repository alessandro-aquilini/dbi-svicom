<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getServiceById } from '$lib/data/services';
	import {
		getBookingsBySupplierId,
		getActiveBookings,
		getRecentClosedBookings,
		type Booking
	} from '$lib/data/ticket/booking';
	import ActiveBookingCard from '$lib/components/shared/booking/booking-card/ActiveBookingCard.svelte';
	import HistoryBookingCard from '$lib/components/shared/booking/booking-card/HistoryBookingCard.svelte';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';
	const allBookings = getBookingsBySupplierId(supplierId);
	const activeBookings = getActiveBookings(allBookings);
	const recentHistory = getRecentClosedBookings(allBookings, 3);
</script>

<svelte:head>
	<title>Servizi — Fornitore — Svicom Living Hub</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8">
	<div class="mb-6 max-w-5xl">
		<h1 class="mt-3 text-3xl font-semibold tracking-tight">Servizi</h1>
		<p class="mt-2 max-w-2xl text-sm text-muted-foreground">Qui trovi le richieste attive e le ultimi prenotazioni avvenute</p>
	</div>

	<section class="space-y-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h2 class="text-xl font-semibold">Servizi in corso</h2>
				<p class="mt-1 text-sm text-muted-foreground">Prenotazioni create e non ancora chiuse.</p>
			</div>
			<div class="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
				<span class="font-semibold">{activeBookings.length}</span> in corso
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			{#if activeBookings.length > 0}
				{#each activeBookings as booking (booking.id)}
					<ActiveBookingCard {booking} service={getServiceById(booking.serviceId)} view="supplier" />
				{/each}
			{:else}
				<div class="col-span-full rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Nessuna prenotazione attiva al momento. Torna qui quando riceverai nuove richieste.
				</div>
			{/if}
		</div>
	</section>

	<section class="mt-10 space-y-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 class="text-xl font-semibold">Cronologia recente</h2>
				<p class="mt-1 text-sm text-muted-foreground">Le ultime 3 prenotazioni chiuse.</p>
			</div>
			<a href="/supplier/services/history" class="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/10 transition hover:bg-primary/90">
				Vai allo storico
			</a>
		</div>

		<div class="grid gap-4">
			{#if recentHistory.length > 0}
				{#each recentHistory as booking (booking.id)}
					<HistoryBookingCard {booking} service={getServiceById(booking.serviceId)} view="supplier" />
				{/each}
			{:else}
				<div class="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Nessuna prenotazione chiusa recentemente.
				</div>
			{/if}
		</div>
	</section>
</div>
