<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		Message01Icon,
		Clock01Icon,
		CheckmarkCircle02Icon,
		Cancel01Icon,
		InformationCircleIcon
	} from '@hugeicons/core-free-icons';
	import type { Booking, BookingMessage, BookingEvent } from '$lib/data/ticket/booking';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';
	import { getUserById } from '$lib/data/users';

	interface Props {
		booking: Booking;
		currentUserId: string;
	}

	let { booking, currentUserId }: Props = $props();

	// Merge messages and events into a single timeline
	type TimelineItem = 
		| { type: 'message', data: BookingMessage }
		| { type: 'event', data: BookingEvent };

	const unifiedTimeline = $derived.by(() => {
		const items: TimelineItem[] = [];
		
		(booking.messageTimeline || []).forEach(m => {
			items.push({ type: 'message', data: m });
		});
		
		(booking.timeline || []).forEach(e => {
			items.push({ type: 'event', data: e });
		});
		
		// Sort by timestamp
		return items.sort((a, b) => {
			const timeA = new Date(a.type === 'message' ? a.data.timestamp : a.data.at).getTime();
			const timeB = new Date(b.type === 'message' ? b.data.timestamp : b.data.at).getTime();
			return timeA - timeB;
		});
	});

	function getEventLabel(event: BookingEvent) {
		const author = getUserById(event.authorId);
		const name = author?.name || 'Sistema';
		
		switch (event.kind) {
			case 'request_created': return `${name} ha creato la richiesta`;
			case 'confirmed': return `${name} ha confermato l'appuntamento`;
			case 'declined': return `${name} ha rifiutato la richiesta`;
			case 'timeslot_updated': return `${name} ha modificato l'orario`;
			case 'performed': return `Servizio completato da ${name}`;
			case 'cancelled': return `Richiesta annullata da ${name}`;
			case 'closed': return `Pratica chiusa`;
			default: return `Stato aggiornato: ${event.kind}`;
		}
	}
</script>

<div class="flex flex-col gap-4 py-4 px-2 overflow-y-auto max-h-[60vh]">
	{#each unifiedTimeline as item}
		{#if item.type === 'message'}
			{@const isMine = item.data.senderId === currentUserId}
			<div class="flex {isMine ? 'justify-end' : 'justify-start'}">
				<div class="max-w-[85%] flex flex-col {isMine ? 'items-end' : 'items-start'}">
					<div 
						class="px-4 py-2.5 rounded-2xl text-sm {isMine 
							? 'bg-primary text-primary-foreground rounded-tr-none' 
							: 'bg-muted text-foreground rounded-tl-none'}"
					>
						{item.data.text}
					</div>
					<span class="text-[10px] text-muted-foreground mt-1 px-1">
						{format(new Date(item.data.timestamp), 'HH:mm', { locale: it })}
					</span>
				</div>
			</div>
		{:else}
			<div class="flex justify-center my-2">
				<div class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
					<div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
					<span class="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
						{getEventLabel(item.data)}
					</span>
					<span class="text-[9px] text-slate-400">
						{format(new Date(item.data.at), 'HH:mm')}
					</span>
				</div>
			</div>
		{/if}
	{/each}

	{#if unifiedTimeline.length === 0}
		<div class="flex flex-col items-center justify-center py-10 opacity-50">
			<HugeiconsIcon icon={Message01Icon} size={32} strokeWidth={1} />
			<p class="text-xs mt-2">Nessun messaggio in questa conversazione</p>
		</div>
	{/if}
</div>
