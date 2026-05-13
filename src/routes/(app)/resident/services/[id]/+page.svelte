<script lang="ts">
	import { page } from '$app/state';
	import { getBookingById, inferBookingStatus } from '$lib/data/ticket/booking';
	import { services } from '$lib/data/services';
	import { users } from '$lib/data/users';
	import { getQuoteById } from '$lib/data/embeds/quotes';
	import { getInvoiceById } from '$lib/data/embeds/invoices';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		ArrowLeft01Icon, 
		InformationCircleIcon,
		Tick02Icon,
		Cancel01Icon,
		Clock01Icon,
		Calendar03Icon
	} from '@hugeicons/core-free-icons';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';
	import ChatBubble from '$lib/components/chat-cards/ChatBubble.svelte';
	import ChatQuoteCard from '$lib/components/chat-cards/ChatQuoteCard.svelte';
	import ChatInvoiceCard from '$lib/components/chat-cards/ChatInvoiceCard.svelte';
	import ChatPaymentCard from '$lib/components/chat-cards/ChatPaymentCard.svelte';
	import ChatTimelineEvent from '$lib/components/chat-cards/ChatTimelineEvent.svelte';

	const bookingId = page.params.id;
	const booking = $derived(bookingId ? getBookingById(bookingId) : undefined);
	const service = $derived(booking ? services.find(s => s.id === booking.serviceId) : null);
	const status = $derived(booking ? inferBookingStatus(booking) : 'unknown');

	// Combine all events, messages, and embeds into a single chronological timeline
	const timelineItems = $derived.by(() => {
		if (!booking) return [];

		const items: any[] = [];

		// Add messages
		if (booking.messageTimeline) {
			booking.messageTimeline.forEach(msg => {
				items.push({
					type: 'message',
					date: new Date(msg.timestamp),
					data: msg
				});
			});
		}

		// Add timeline events
		if (booking.timeline) {
			booking.timeline.forEach(event => {
				items.push({
					type: 'event',
					date: new Date(event.at),
					data: event
				});
			});
		}

		// Add quotes
		if (booking.quoteIds) {
			booking.quoteIds.forEach(id => {
				const quote = getQuoteById(id);
				if (quote) {
					items.push({
						type: 'quote',
						date: new Date(quote.sentAt),
						data: quote
					});
				}
			});
		}

		// Add invoices
		if (booking.invoiceIds) {
			booking.invoiceIds.forEach(id => {
				const invoice = getInvoiceById(id);
				if (invoice) {
					items.push({
						type: 'invoice',
						date: new Date(invoice.issueDate),
						data: invoice
					});
				}
			});
		}

		// Add payments
		if (booking.paymentIds) {
			booking.paymentIds.forEach(id => {
				const payment = getPaymentById(id);
				if (payment && payment.paidAt) {
					items.push({
						type: 'payment',
						date: new Date(payment.paidAt),
						data: payment
					});
				}
			});
		}

		return items.sort((a, b) => a.date.getTime() - b.date.getTime());
	});

	const statusColors = {
		requested: 'bg-amber-100 text-amber-700',
		confirmed: 'bg-emerald-100 text-emerald-700',
		timeslot_updated: 'bg-blue-100 text-blue-700',
		performed: 'bg-slate-100 text-slate-700',
		cancelled: 'bg-red-100 text-red-700',
		closed: 'bg-slate-100 text-slate-500',
		declined: 'bg-red-100 text-red-700',
		unknown: 'bg-slate-100 text-slate-400'
	};
</script>

{#if !booking}
	<div class="p-8 text-center mt-20">
		<h1 class="text-xl font-bold">Booking non trovato</h1>
		<a href="/resident/services" class="text-primary underline mt-4 block">Torna ai servizi</a>
	</div>
{:else}
	<div class="flex flex-col h-screen max-h-screen bg-slate-50">
		<!-- Header -->
		<header class="shrink-0 bg-white border-b border-border p-4 flex items-center gap-4 sticky top-0 z-10">
			<a href="/resident/services" class="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
				<HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
			</a>
			
			<div class="flex-1 min-w-0">
				<h1 class="font-bold text-base truncate">{service?.name || 'Dettaglio Servizio'}</h1>
				<div class="flex items-center gap-2">
					<span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded {statusColors[status]}">
						{status}
					</span>
					<span class="text-[10px] text-muted-foreground">ID: {booking.id}</span>
				</div>
			</div>

			<button class="p-2 rounded-full hover:bg-muted transition-colors">
				<HugeiconsIcon icon={InformationCircleIcon} size={20} />
			</button>
		</header>

		<!-- Timeline/Chat Content -->
		<div class="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
			{#each timelineItems as item}
				{#if item.type === 'message'}
					<ChatBubble 
						message={item.data} 
						isOwn={item.data.senderId === booking.residentId}
					/>
				{:else if item.type === 'event'}
					<ChatTimelineEvent event={item.data} />
				{:else if item.type === 'quote'}
					<ChatQuoteCard quote={item.data} isOwn={false} />
				{:else if item.type === 'invoice'}
					<ChatInvoiceCard invoice={item.data} isOwn={false} />
				{:else if item.type === 'payment'}
					<ChatPaymentCard payment={item.data} />
				{/if}
			{/each}
		</div>

		<!-- Quick Actions / Input (Placeholder) -->
		<div class="shrink-0 p-4 bg-white border-t border-border sticky bottom-0">
			<div class="flex gap-2">
				<input 
					type="text" 
					placeholder="Scrivi un messaggio..." 
					class="flex-1 bg-muted/50 border-none rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
				/>
				<button class="bg-primary text-white px-4 py-2.5 rounded-2xl font-semibold text-sm hover:opacity-90 transition-opacity">
					Invia
				</button>
			</div>
		</div>
	</div>
{/if}
