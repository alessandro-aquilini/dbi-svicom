<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		CheckmarkCircle02Icon,
		Cancel01Icon,
		Message01Icon,
		Calendar03Icon,
		Invoice01Icon,
		Folder01Icon,
		Refresh01Icon
	} from '@hugeicons/core-free-icons';
	import type { Booking } from '$lib/data/ticket/booking';
	import { inferBookingStatus } from '$lib/data/ticket/booking';

	interface Props {
		booking: Booking;
		onAction: (action: string) => void;
	}

	let { booking, onAction }: Props = $props();
	const status = $derived(inferBookingStatus(booking));
</script>

<div class="flex flex-wrap gap-2 p-1">
	{#if status === 'requested'}
		<button 
			onclick={() => onAction('cancel')}
			class="flex-1 min-w-35 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors"
		>
			<HugeiconsIcon icon={Cancel01Icon} size={18} />
			Annulla Richiesta
		</button>
		<button 
			onclick={() => onAction('message')}
			class="flex-1 min-w-35 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
		>
			<HugeiconsIcon icon={Message01Icon} size={18} />
			Messaggio
		</button>
	{:else if status === 'confirmed'}
		<button 
			onclick={() => onAction('reschedule')}
			class="flex-1 min-w-35 flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 text-amber-600 font-semibold rounded-xl hover:bg-amber-100 transition-colors"
		>
			<HugeiconsIcon icon={Calendar03Icon} size={18} />
			Sposta orario
		</button>
		<button 
			onclick={() => onAction('message')}
			class="flex-1 min-w-35 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
		>
			<HugeiconsIcon icon={Message01Icon} size={18} />
			Messaggio
		</button>
	{:else if status === 'performed'}
		{#if (booking.invoiceIds?.length ?? 0) > 0}
			<button 
				onclick={() => onAction('view-invoice')}
				class="flex-1 min-w-35 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
			>
				<HugeiconsIcon icon={Invoice01Icon} size={18} />
				Vedi Fattura
			</button>
		{/if}
		<button 
			onclick={() => onAction('close')}
			class="flex-1 min-w-35 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
		>
			<HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
			Chiudi Pratica
		</button>
	{:else if status === 'closed' || status === 'cancelled' || status === 'declined'}
		<button 
			onclick={() => onAction('archive')}
			class="flex-1 min-w-35 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
		>
			<HugeiconsIcon icon={Folder01Icon} size={18} />
			Archivia
		</button>
		<button 
			onclick={() => onAction('book-again')}
			class="flex-1 min-w-35 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
		>
			<HugeiconsIcon icon={Refresh01Icon} size={18} />
			Prenota Ancora
		</button>
	{/if}
</div>
