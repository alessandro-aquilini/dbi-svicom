<script lang="ts">
	import { getCurrentUser } from '$lib/auth';
	import { getServiceById } from '$lib/data/services';
	import {
		getBookingsByResidentId,
		getActiveBookings,
		getRecentClosedBookings,
		type Booking
	} from '$lib/data/ticket/booking';
	import ActiveBookingCard from '$lib/components/shared/booking/booking-card/ActiveBookingCard.svelte';
	import HistoryBookingCard from '$lib/components/shared/booking/booking-card/HistoryBookingCard.svelte';
	import { ResidentProBadge } from '$lib/components/view-resident/resident';
	import { onMount } from 'svelte';

	const currentUser = getCurrentUser();
	const residentId = currentUser?.id ?? '';
	let allBookings = $state<Booking[]>([]);
	let activeBookings = $state<Booking[]>([]);
	let recentHistory = $state<Booking[]>([]);

	function refreshBookings() {
		allBookings = residentId ? getBookingsByResidentId(residentId) : [];
		activeBookings = getActiveBookings(allBookings);
		recentHistory = getRecentClosedBookings(allBookings, 3);
	}

	onMount(() => {
		refreshBookings();
	});
</script>

<svelte:head>
	<title>Servizi — Residente — Svicom Living Hub</title>
</svelte:head>

<div class="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8">
	<div class="mb-6">
		<div class="flex items-center justify-between">
			<div>
				<p class="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Servizi</p>
				<h1 class="mt-1 text-3xl font-black tracking-tight text-foreground">Le mie prenotazioni</h1>
			</div>
			<a href="/resident/services/marketplace" class="group inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
				<span>Marketplace</span>
				<ResidentProBadge tone="inverse" />
			</a>
		</div>
		<p class="mt-3 text-[15px] leading-relaxed text-muted-foreground/80">Controlla le richieste che hai già inviato e consulta lo storico dei servizi completati.</p>
	</div>

	<section class="space-y-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h2 class="text-xl font-semibold">Prenotazioni attive</h2>
				<p class="mt-1 text-sm text-muted-foreground">Richieste ancora aperte o confermate.</p>
			</div>
			<div class="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
				<span class="font-semibold">{activeBookings.length}</span> attive
			</div>
		</div>

		<div class="space-y-4">
			{#if activeBookings.length > 0}
				{#each activeBookings as booking (booking.id)}
					<ActiveBookingCard {booking} service={getServiceById(booking.serviceId)} view="resident" />
				{/each}
			{:else}
				<div class="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Non ci sono richieste attive al momento.
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
			<a href="/resident/services/history" class="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/10 transition hover:bg-primary/90">
				Vai allo storico
			</a>
		</div>

		<div class="space-y-4">
			{#if recentHistory.length > 0}
				{#each recentHistory as booking (booking.id)}
					<HistoryBookingCard {booking} service={getServiceById(booking.serviceId)} view="resident" />
				{/each}
			{:else}
				<div class="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Non hai ancora prenotazioni chiuse.
				</div>
			{/if}
		</div>
	</section>
</div>
