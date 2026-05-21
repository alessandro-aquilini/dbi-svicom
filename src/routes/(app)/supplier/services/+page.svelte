<script lang="ts">
	import { 
		getActiveSupplierBookings, 
		getPastSupplierBookings, 
		getSupplierServices,
		getServiceById
	} from '$lib/components/services';
	import BookingCard from '$lib/components/services/BookingCard.svelte';
	import ServiceCard from '$lib/components/services/ServiceCard.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		PlusSignIcon, 
		TimeScheduleIcon, 
		Calendar03Icon,
		PackageIcon,
		ArrowRight02Icon
	} from '@hugeicons/core-free-icons';
	import { Dialog } from '$lib/components/shared';
	import BookingLifecycleDetail from '$lib/components/services/BookingLifecycleDetail.svelte';
	import BookingActions from '$lib/components/services/BookingActions.svelte';
	import { getCurrentUser } from '$lib/auth';
	import type { Booking } from '$lib/data/ticket/booking';
	import { goto } from '$app/navigation';

	const currentUser = getCurrentUser();
	const activeBookings = $derived(getActiveSupplierBookings());
	const pastBookings = $derived(getPastSupplierBookings().slice(0, 3));
	const myServices = $derived(currentUser ? getSupplierServices(currentUser.id) : []);

	let selectedBooking = $state<Booking | null>(null);
	let detailsOpen = $state(false);

	function handleAction(action: string) {
		console.log('Action performed:', action, 'on booking:', selectedBooking?.id);
		// Logic for actions would go here
		detailsOpen = false;
		selectedBooking = null;
	}

	function handleServiceClick(serviceId: string) {
		goto(`/supplier/services/edit/${serviceId}`);
	}
</script>

<svelte:head>
	<title>I Tuoi Servizi & Prenotazioni — Svicom Supplier</title>
</svelte:head>

<div class="p-4 lg:p-6 pb-24 max-w-5xl mx-auto">
	<div class="mb-10">
		<h1 class="text-3xl font-bold tracking-tight text-foreground italic">I Tuoi Servizi</h1>
		<p class="mt-2 text-muted-foreground font-medium">
			Gestisci le prenotazioni dei clienti e i tuoi servizi a catalogo
		</p>
	</div>

	<!-- SECTION 1: ACTIVE BOOKINGS -->
	<section class="mb-12">
		<div class="flex items-center justify-between mb-6">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
					<HugeiconsIcon icon={Calendar03Icon} size={20} />
				</div>
				<h2 class="text-xl font-bold italic">Prenotazioni Attive</h2>
			</div>
			<span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
				{activeBookings.length} totali
			</span>
		</div>

		{#if activeBookings.length === 0}
			<div class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
				<p class="text-muted-foreground font-medium">Nessuna prenotazione attiva al momento.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each activeBookings as booking (booking.id)}
					<BookingCard 
						{booking} 
						onclick={() => { selectedBooking = booking; detailsOpen = true; }}
					/>
				{/each}
			</div>
		{/if}

		<!-- HISTORY LINK -->
		<div class="mt-6">
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-2">
					<HugeiconsIcon icon={TimeScheduleIcon} size={18} class="text-muted-foreground" />
					<h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ultime Completate</h3>
				</div>
				<a 
					href="/supplier/services/history" 
					class="text-xs font-bold text-primary hover:underline flex items-center gap-1"
				>
					MOSTRA TUTTI
					<HugeiconsIcon icon={ArrowRight02Icon} size={14} />
				</a>
			</div>

			<div class="grid grid-cols-1 gap-3">
				{#each pastBookings as booking (booking.id)}
					<button 
						onclick={() => { selectedBooking = booking; detailsOpen = true; }}
						class="flex items-center justify-between p-4 rounded-2xl border border-border bg-card/40 hover:bg-card transition-colors text-left"
					>
						<div class="flex items-center gap-4">
							<div class="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
								<HugeiconsIcon icon={PackageIcon} size={20} />
							</div>
							<div>
								<h4 class="font-bold text-sm">{getServiceById(booking.serviceId)?.name}</h4>
								<p class="text-xs text-muted-foreground">
									{new Date(booking.timeline?.[0].at || '').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
								</p>
							</div>
						</div>
						<div class="text-muted-foreground">
							<HugeiconsIcon icon={ArrowRight02Icon} size={18} />
						</div>
					</button>
				{/each}
				
				{#if pastBookings.length === 0}
					<p class="text-sm text-muted-foreground italic px-4">Nessuna prenotazione passata.</p>
				{/if}
			</div>
		</div>
	</section>

	<!-- SECTION 2: MY SERVICES -->
	<section>
		<div class="flex items-center justify-between mb-6">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
					<HugeiconsIcon icon={PackageIcon} size={20} />
				</div>
				<h2 class="text-xl font-bold italic">I Tuoi Servizi</h2>
			</div>
			<button 
				onclick={() => goto('/supplier/services/new')}
				class="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
			>
				<HugeiconsIcon icon={PlusSignIcon} size={16} />
				AGGIUNGI
			</button>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each myServices as service (service.id)}
				<div class="h-full">
					<ServiceCard 
						{service} 
						onclick={() => handleServiceClick(service.id)}
					/>
				</div>
			{:else}
				<div class="col-span-full py-12 text-center bg-card/50 rounded-3xl border border-dashed border-border">
					<p class="text-muted-foreground">Non hai ancora configurato alcun servizio attivo.</p>
				</div>
			{/each}
		</div>
	</section>
</div>

{#if selectedBooking && currentUser}
	<Dialog
		bind:open={detailsOpen}
		title="Dettaglio Prenotazione"
		hideCancel
		confirmLabel="Chiudi"
		onConfirm={() => { detailsOpen = false; selectedBooking = null; }}
	>
		<div class="flex flex-col gap-6">
			<BookingLifecycleDetail 
				booking={selectedBooking} 
				currentUserId={currentUser.id} 
			/>
			
			<div class="border-t border-border pt-4">
				<BookingActions 
					booking={selectedBooking} 
					onAction={handleAction}
				/>
			</div>
		</div>
	</Dialog>
{/if}

<style>
	/* Optimization for Tablet view */
	@media (min-width: 768px) and (max-width: 1024px) {
		.max-w-5xl {
			padding-left: 2rem;
			padding-right: 2rem;
		}
	}
</style>
