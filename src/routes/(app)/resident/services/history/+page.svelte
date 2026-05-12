<script lang="ts">
	import { getPastResidentBookings } from '$lib/components/services';
	import BookingCard from '$lib/components/services/BookingCard.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		ArrowLeft01Icon,
		TimeScheduleIcon
	} from '@hugeicons/core-free-icons';
	import { Dialog } from '$lib/components/shared';
	import BookingLifecycleDetail from '$lib/components/services/BookingLifecycleDetail.svelte';
	import BookingActions from '$lib/components/services/BookingActions.svelte';
	import { getCurrentUser } from '$lib/auth';
	import type { Booking } from '$lib/data/ticket/booking';

	const pastBookings = $derived(getPastResidentBookings());
	const currentUser = getCurrentUser();

	let selectedBooking = $state<Booking | null>(null);
	let detailsOpen = $state(false);

	function handleAction(action: string) {
		console.log('Action performed:', action, 'on booking:', selectedBooking?.id);
		detailsOpen = false;
		selectedBooking = null;
	}
</script>

<svelte:head>
	<title>Storico Servizi — Svicom Living Hub</title>
</svelte:head>

<div class="p-4 lg:p-6 pb-24">
	<div class="mb-6">
		<a href="/resident/services" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
			<HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
			Torna ai miei servizi
		</a>
		
		<h1 class="text-2xl font-semibold tracking-tight">Storico Servizi</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Le tue prenotazioni concluse, annullate o archiviate
		</p>
	</div>

	{#if pastBookings.length === 0}
		<div class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
			<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border shadow-sm mb-4">
				<HugeiconsIcon icon={TimeScheduleIcon} size={28} strokeWidth={1.5} class="text-muted-foreground" />
			</div>
			<h3 class="text-lg font-semibold text-foreground">Storico vuoto</h3>
			<p class="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
				Non ci sono interventi passati da mostrare.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4">
			{#each pastBookings as booking (booking.id)}
				<BookingCard 
					{booking} 
					onclick={() => { selectedBooking = booking; detailsOpen = true; }}
				/>
			{/each}
		</div>
	{/if}
</div>

{#if selectedBooking && currentUser}
	<Dialog
		bind:open={detailsOpen}
		title="Dettaglio Prenotazione Passata"
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
