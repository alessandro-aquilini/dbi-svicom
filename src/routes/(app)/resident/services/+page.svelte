<script lang="ts">
	import { getActiveResidentBookings } from '$lib/components/services';
	import BookingCard from '$lib/components/services/BookingCard.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		PlusSignIcon, 
		TimeScheduleIcon, 
		Calendar03Icon
	} from '@hugeicons/core-free-icons';
	import { Dialog } from '$lib/components/shared';
	import BookingLifecycleDetail from '$lib/components/services/BookingLifecycleDetail.svelte';
	import BookingActions from '$lib/components/services/BookingActions.svelte';
	import { getCurrentUser } from '$lib/auth';
	import type { Booking } from '$lib/data/ticket/booking';

	const activeBookings = $derived(getActiveResidentBookings());
	const currentUser = getCurrentUser();

	let selectedBooking = $state<Booking | null>(null);
	let detailsOpen = $state(false);

	function handleAction(action: string) {
		console.log('Action performed:', action, 'on booking:', selectedBooking?.id);
		// Logic for actions would go here
		detailsOpen = false;
		selectedBooking = null;
	}
</script>

<svelte:head>
	<title>Servizi Attivi — Svicom Living Hub</title>
</svelte:head>

<div class="p-4 lg:p-6 pb-24">
	<div class="mb-8 flex items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">I tuoi Servizi</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Gestisci le tue richieste attive e prenotazioni in corso
			</p>
		</div>

		<a 
			href="/resident/services/book-new" 
			class="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
		>
			<HugeiconsIcon icon={PlusSignIcon} size={18} />
			<span class="hidden sm:inline">Nuovo Servizio</span>
			<span class="sm:hidden">Nuovo</span>
		</a>
	</div>

	{#if activeBookings.length === 0}
		<div class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
			<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border shadow-sm mb-4">
				<HugeiconsIcon icon={Calendar03Icon} size={28} strokeWidth={1.5} class="text-muted-foreground" />
			</div>
			<h3 class="text-lg font-semibold text-foreground">Nessun servizio attivo</h3>
			<p class="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
				Non hai prenotazioni in corso. Esplora il marketplace per scoprire i servizi disponibili.
			</p>
			<a 
				href="/resident/services/book-new" 
				class="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
			>
				Esplora Marketplace
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4">
			{#each activeBookings as booking (booking.id)}
				<BookingCard 
					{booking} 
					onclick={() => { selectedBooking = booking; detailsOpen = true; }}
				/>
			{/each}
		</div>
	{/if}

	<div class="mt-8 pt-8 border-t border-border">
		<a 
			href="/resident/services/history" 
			class="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-colors group"
		>
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
					<HugeiconsIcon icon={TimeScheduleIcon} size={20} />
				</div>
				<div>
					<p class="font-semibold text-foreground">Storico Servizi</p>
					<p class="text-xs text-muted-foreground">Visualizza i tuoi interventi passati</p>
				</div>
			</div>
			<div class="text-muted-foreground group-hover:translate-x-1 transition-transform">
				<HugeiconsIcon icon={PlusSignIcon} size={20} class="rotate-45" /> 
			</div>
		</a>
	</div>
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

