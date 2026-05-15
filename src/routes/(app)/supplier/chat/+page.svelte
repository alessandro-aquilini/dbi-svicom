<script lang="ts">
	import { bookings, inferBookingStatus, getBookingById } from '$lib/data/ticket/booking';
	import { tickets, getCurrentSupplier, getCurrentStatus, getSupplierRelevantTimeline, getTicketById } from '$lib/data/ticket/tickets';
	import { services } from '$lib/data/services';
	import { residents } from '$lib/data/residents';
	import { users } from '$lib/data/users';
	import { getQuoteById } from '$lib/data/embeds/quotes';
	import { getInvoiceById } from '$lib/data/embeds/invoices';
	import { getPaymentById } from '$lib/data/embeds/payments';
	import { getCurrentUser } from '$lib/auth';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { 
		ArrowLeft01Icon, 
		InformationCircleIcon,
		Search01Icon,
		Message01Icon,
		UserCircleIcon,
		SentIcon
	} from '@hugeicons/core-free-icons';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';
	import ChatBubble from '$lib/components/chat-cards/ChatBubble.svelte';
	import ChatQuoteCard from '$lib/components/chat-cards/ChatQuoteCard.svelte';
	import ChatInvoiceCard from '$lib/components/chat-cards/ChatInvoiceCard.svelte';
	import ChatPaymentCard from '$lib/components/chat-cards/ChatPaymentCard.svelte';
	import ChatTimelineEvent from '$lib/components/chat-cards/ChatTimelineEvent.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Badge } from '$lib/components/ui/badge';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';

	// Filter bookings for this supplier
	const supplierBookings = bookings.filter(b => {
		const service = services.find(s => s.id === b.serviceId);
		return service?.supplierId === supplierId;
	});

	// Filter tickets for this supplier
	const supplierTickets = tickets.filter(t => getCurrentSupplier(t) === supplierId);

	type ChatType = 'booking' | 'ticket';
	let activeTab = $state<ChatType>('booking');
	const selectedId = $derived(page.url.searchParams.get('id'));

	const selectedBooking = $derived(activeTab === 'booking' && selectedId ? getBookingById(selectedId) : null);
	const selectedTicket = $derived(activeTab === 'ticket' && selectedId ? getTicketById(selectedId) : null);
	
	const timelineItems = $derived.by(() => {
		const items: any[] = [];
		const activeObj = selectedBooking || selectedTicket;
		if (!activeObj) return [];

		if (activeObj.messageTimeline) {
			activeObj.messageTimeline.forEach(msg => {
				items.push({ type: 'message', date: new Date(msg.timestamp), data: msg });
			});
		}

		if (activeTab === 'booking' && selectedBooking) {
			if (selectedBooking.timeline) {
				selectedBooking.timeline.forEach(event => {
					items.push({ type: 'event', date: new Date(event.at), data: event });
				});
			}
		} else if (activeTab === 'ticket' && selectedTicket) {
			const rel = getSupplierRelevantTimeline(selectedTicket, supplierId);
			rel.forEach(event => {
				items.push({ type: 'event', date: new Date(event.at), data: event });
			});
		}

		if (activeObj.quoteIds) {
			activeObj.quoteIds.forEach(id => {
				const quote = getQuoteById(id);
				if (quote && quote.createdAt) {
					items.push({ type: 'quote', date: new Date(quote.createdAt), data: quote });
				}
			});
		}
		if (activeObj.invoiceIds) {
			activeObj.invoiceIds.forEach(id => {
				const invoice = getInvoiceById(id);
				if (invoice && invoice.createdAt) {
					items.push({ type: 'invoice', date: new Date(invoice.createdAt), data: invoice });
				}
			});
		}
		if (activeObj.paymentIds) {
			activeObj.paymentIds.forEach(id => {
				const payment = getPaymentById(id);
				const dateStr = payment ? (payment.createdAt ?? payment.paidAt) : undefined;
				if (payment && dateStr) items.push({ type: 'payment', date: new Date(dateStr), data: payment });
			});
		}
		return items.sort((a, b) => a.date.getTime() - b.date.getTime());
	});

	function selectChat(id: string, type: ChatType) {
		activeTab = type;
		goto(`?id=${id}`, { replaceState: true });
	}

	function getResidentInfo(residentId: string) {
		const user = users.find(u => u.id === residentId);
		return user;
	}

	const statusColors = {
		requested: 'bg-amber-100 text-amber-700',
		confirmed: 'bg-emerald-100 text-emerald-700',
		timeslot_updated: 'bg-blue-100 text-blue-700',
		performed: 'bg-slate-100 text-slate-700',
		cancelled: 'bg-red-100 text-red-700',
		closed: 'bg-slate-100 text-slate-500',
		declined: 'bg-red-100 text-red-700',
		unknown: 'bg-slate-100 text-slate-400',
		// Ticket statuses
		opened: 'bg-amber-100 text-amber-700',
		estimating: 'bg-blue-100 text-blue-700',
		approved: 'bg-emerald-100 text-emerald-700',
		in_progress: 'bg-indigo-100 text-indigo-700',
		completed: 'bg-emerald-100 text-emerald-700',
		paid: 'bg-slate-100 text-slate-700'
	};
</script>

<div class="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
	<!-- Sidebar: Chat List -->
	<aside class="w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-slate-50/30 {selectedId ? 'hidden md:flex' : 'flex'}">
		<div class="p-4 bg-white border-b border-border">
			<h1 class="text-xl font-bold text-slate-900 mb-4">Messaggi</h1>
			
			<div class="flex p-1 bg-slate-100 rounded-xl mb-4">
				<button 
					onclick={() => { activeTab = 'booking'; if(selectedId) goto('?', { replaceState: true }); }}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab === 'booking' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}"
				>
					Servizi
				</button>
				<button 
					onclick={() => { activeTab = 'ticket'; if(selectedId) goto('?', { replaceState: true }); }}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab === 'ticket' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}"
				>
					Interventi
				</button>
			</div>

			<div class="relative">
				<HugeiconsIcon icon={Search01Icon} size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
				<input 
					type="text" 
					placeholder="Cerca conversazioni..." 
					class="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 placeholder:text-slate-400"
				/>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto">
			{#if activeTab === 'booking'}
				{#each supplierBookings as b}
					{@const resident = getResidentInfo(b.residentId)}
					{@const service = services.find(s => s.id === b.serviceId)}
					{@const lastMsg = b.messageTimeline?.[b.messageTimeline.length - 1]}
					<button 
						onclick={() => selectChat(b.id, 'booking')}
						class="w-full p-4 flex gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left {selectedId === b.id ? 'bg-white shadow-sm' : ''}"
					>
						<div class="w-12 h-12 rounded-full bg-[#5D7D94]/10 flex items-center justify-center text-[#5D7D94] shrink-0 border border-[#5D7D94]/5">
							<HugeiconsIcon icon={UserCircleIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-slate-900 truncate">{resident?.name || 'Residente'}</span>
								{#if lastMsg}
									<span class="text-[10px] text-slate-400">{format(new Date(lastMsg.timestamp), "HH:mm")}</span>
								{/if}
							</div>
							<div class="text-xs font-semibold text-[#5D7D94] mb-1">{service?.name}</div>
							<p class="text-xs text-slate-500 line-clamp-1">
								{lastMsg?.text || 'Inizia la conversazione...'}
							</p>
						</div>
					</button>
				{/each}
			{:else}
				{#each supplierTickets as t}
					{@const lastMsg = t.messageTimeline?.[t.messageTimeline.length - 1]}
					<button 
						onclick={() => selectChat(t.id, 'ticket')}
						class="w-full p-4 flex gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left {selectedId === t.id ? 'bg-white shadow-sm' : ''}"
					>
						<div class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
							<HugeiconsIcon icon={UserCircleIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-slate-900 truncate text-sm">Amministrazione</span>
								{#if lastMsg}
									<span class="text-[10px] text-slate-400">{format(new Date(lastMsg.timestamp), "HH:mm")}</span>
								{/if}
							</div>
							<div class="text-[11px] font-semibold text-primary mb-1 line-clamp-1">{t.title}</div>
							<p class="text-[11px] text-slate-500 line-clamp-1">
								{lastMsg?.text || 'Vedi cronologia...'}
							</p>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</aside>

	<!-- Main: Chat Conversation -->
	<main class="flex-1 flex flex-col bg-slate-50/50 {selectedId ? 'flex' : 'hidden md:flex'}">
		{#if selectedBooking || selectedTicket}
			{@const activeObj = selectedBooking || selectedTicket}
			{@const residentName = selectedBooking ? getResidentInfo(selectedBooking.residentId)?.name : 'Amministrazione'}
			{@const subtitle = selectedBooking ? services.find(s => s.id === selectedBooking.serviceId)?.name : selectedTicket?.title}
			{@const status = selectedBooking ? inferBookingStatus(selectedBooking) : getCurrentStatus(selectedTicket!)}
			
			<header class="h-16 shrink-0 bg-white border-b border-border px-4 flex items-center gap-3 relative z-10 transition-shadow">
				<button 
					onclick={() => goto('?', { replaceState: true })}
					class="p-2 -ml-2 rounded-full hover:bg-slate-100 md:hidden transition-colors"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
				</button>
				
				<div class="w-10 h-10 rounded-full {selectedBooking ? 'bg-[#5D7D94]/10 text-[#5D7D94]' : 'bg-amber-50 text-amber-600'} flex items-center justify-center border border-current/5 shrink-0 ml-1">
					<HugeiconsIcon icon={UserCircleIcon} size={24} />
				</div>
				
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h2 class="font-bold text-slate-900 text-sm truncate">{residentName}</h2>
						<Badge variant="secondary" class="text-[10px] uppercase {statusColors[status]}">
							{status.replace(/_/g, ' ')}
						</Badge>
					</div>
					<p class="text-[11px] text-[#5D7D94] font-medium truncate">{subtitle}</p>
				</div>

				<div class="flex items-center gap-1">
					<button class="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
						<HugeiconsIcon icon={InformationCircleIcon} size={20} />
					</button>
				</div>
			</header>

			<div class="flex-1 overflow-y-auto p-4 space-y-6">
				{#each timelineItems as item}
					{#if item.type === 'message'}
						<ChatBubble 
							message={item.data} 
							isOwn={item.data.senderId === supplierId}
						/>
					{:else if item.type === 'event'}
						<ChatTimelineEvent event={item.data} />
					{:else if item.type === 'quote'}
						<ChatQuoteCard 
							quote={item.data} 
							isOwn={item.data.supplierId === supplierId} 
						/>
					{:else if item.type === 'invoice'}
						<ChatInvoiceCard 
							invoice={item.data} 
							isOwn={item.data.supplierId === supplierId} 
						/>
					{:else if item.type === 'payment'}
						<ChatPaymentCard payment={item.data} />
					{/if}
				{/each}
			</div>

			<footer class="p-4 bg-white border-t border-border sticky bottom-0">
				<div class="flex gap-3 max-w-4xl mx-auto items-center">
					<div class="bg-slate-50 flex items-center gap-2 border border-slate-200 rounded-2xl p-1.5 w-full">
						<input 
							type="text" 
							placeholder="Scrivi un messaggio..." 
							class="flex-1 bg-transparent border-none px-3 py-1.5 text-sm focus:ring-0 text-slate-900 placeholder:text-slate-400"
						/>
						<button class="bg-[#5D7D94] text-white p-2 rounded-xl hover:opacity-90 transition-opacity">
							<HugeiconsIcon icon={SentIcon} size={18} />
						</button>
					</div>
				</div>
			</footer>
		{:else}
			<div class="flex-1 flex flex-col items-center justify-center text-center p-8">
				<div class="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 mb-4">
					<HugeiconsIcon icon={Message01Icon} size={32} />
				</div>
				<h3 class="text-lg font-bold text-slate-900">Seleziona una conversazione</h3>
				<p class="text-sm text-slate-500 max-w-xs mt-1">Scegli una pratica dalla lista a sinistra per visualizzare la cronologia e rispondere.</p>
			</div>
		{/if}
	</main>
</div>
