<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		Calendar03Icon, 
		UserCircleIcon,
		ArrowRight02Icon,
		Clock01Icon
	} from '@hugeicons/core-free-icons';
	import type { Booking } from '$lib/data/ticket/booking';
	import { inferBookingStatus, lastBookingEvent } from '$lib/data/ticket/booking';
	import { services } from '$lib/data/services';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';

	interface Props {
		booking: Booking;
		onclick?: () => void;
	}

	let { booking, onclick }: Props = $props();
	
	const service = $derived(services.find(s => s.id === booking.serviceId));
	const status = $derived(inferBookingStatus(booking));
	const lastEvent = $derived(lastBookingEvent(booking));
	
	const statusColors = {
		requested: 'bg-amber-100 text-amber-700 border-amber-200',
		confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
		timeslot_updated: 'bg-blue-100 text-blue-700 border-blue-200',
		performed: 'bg-slate-100 text-slate-700 border-slate-200',
		cancelled: 'bg-red-100 text-red-700 border-red-200',
		closed: 'bg-slate-100 text-slate-500 border-slate-200',
		declined: 'bg-red-100 text-red-700 border-red-200',
		unknown: 'bg-slate-100 text-slate-400 border-slate-200'
	};

	const statusLabels = {
		requested: 'Richiesta inviata',
		confirmed: 'Confermato',
		timeslot_updated: 'Orario aggiornato',
		performed: 'Eseguito',
		cancelled: 'Annullato',
		closed: 'Chiuso',
		declined: 'Rifiutato',
		unknown: 'Sconosciuto'
	};
</script>

<button
	type="button"
	class="flex items-center gap-4 p-4 w-full rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/30 hover:shadow-sm group"
	{onclick}
>
	<div class="shrink-0 w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
		<HugeiconsIcon icon={Calendar03Icon} size={24} />
	</div>

	<div class="flex-1 min-w-0">
		<div class="flex items-center justify-between gap-2 mb-1">
			<h3 class="font-semibold text-foreground truncate">{service?.name || 'Servizio'}</h3>
			<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border {statusColors[status] || statusColors.unknown}">
				{statusLabels[status] || status}
			</span>
		</div>

		<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
			{#if booking.slot}
				<div class="flex items-center gap-1.5">
					<HugeiconsIcon icon={Clock01Icon} size={14} />
					<span>
						{format(new Date(booking.slot.start), "d MMM 'alle' HH:mm", { locale: it })}
					</span>
				</div>
			{/if}
			
			{#if lastEvent}
				<div class="flex items-center gap-1.5 italic">
					<span>Ultimo agg: {format(new Date(lastEvent.at), "d MMM", { locale: it })}</span>
				</div>
			{/if}
		</div>
	</div>

	<div class="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
		<HugeiconsIcon icon={ArrowRight02Icon} size={20} />
	</div>
</button>
