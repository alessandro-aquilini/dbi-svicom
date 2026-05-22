<script lang="ts">
	import { bookings, inferBookingStatus, getBookingById, lastBookingEvent } from '$lib/data/ticket/booking';
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
		CustomerServiceIcon,
		SentIcon
	} from '@hugeicons/core-free-icons';
	import { format } from 'date-fns';
	import { it } from 'date-fns/locale';
	import ChatBubble from '$lib/components/shared/chat-cards/ChatBubble.svelte';
	import ChatQuoteCard from '$lib/components/shared/chat-cards/ChatQuoteCard.svelte';
	import ChatInvoiceCard from '$lib/components/shared/chat-cards/ChatInvoiceCard.svelte';
	import ChatPaymentCard from '$lib/components/shared/chat-cards/ChatPaymentCard.svelte';
	import ChatTimelineEvent from '$lib/components/shared/chat-cards/ChatTimelineEvent.svelte';
	import BookingTimelineEvent from '$lib/components/shared/booking/actions-cards/BookingTimelineEvent.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Badge } from '$lib/components/ui/badge';

	const currentUser = getCurrentUser();
	const supplierId = currentUser?.id ?? 'frn-idroclima-nord';

	// Grouped Chats: either with administration (tickets) or with residents (bookings)
	type ChatType = 'admin' | 'resident';
	let activeTab = $state<ChatType>('resident');
	const selectedId = $derived(page.url.searchParams.get('id'));

	// Resident Chats: group bookings by residentId
	const residentChats = $derived.by(() => {
		const groups = new Map<string, { userId: string, lastDate: Date, bookings: any[] }>();
		
		bookings.forEach(b => {
			const service = services.find(s => s.id === b.serviceId);
			if (service?.supplierId !== supplierId) return;

			if (!groups.has(b.residentId)) {
				groups.set(b.residentId, { userId: b.residentId, lastDate: new Date(0), bookings: [] });
			}
			const g = groups.get(b.residentId)!;
			g.bookings.push(b);
			
			const lastEv = lastBookingEvent(b);
			const updatedAt = new Date(lastEv?.at || 0);
			if (updatedAt > g.lastDate) g.lastDate = updatedAt;
		});

		return Array.from(groups.values()).sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
	});

	// Admin Chats: group tickets by adminId (usually only one admin per property, but we group by adminId for consistency)
	const adminChats = $derived.by(() => {
		const groups = new Map<string, { adminId: string, lastDate: Date, tickets: any[] }>();
		
		tickets.filter(t => getCurrentSupplier(t) === supplierId).forEach(t => {
			const aid = t.creatorId || 'adm-giorgio-01'; // Fallback
			if (!groups.has(aid)) {
				groups.set(aid, { adminId: aid, lastDate: new Date(0), tickets: [] });
			}
			const g = groups.get(aid)!;
			g.tickets.push(t);
			
			const rel = getSupplierRelevantTimeline(t, supplierId);
			const msgs = (t.messageTimeline ?? []).filter(m => m.senderId === supplierId || m.senderId === aid);
			let lastActivity = new Date(0);
			if (msgs.length) lastActivity = new Date(msgs[msgs.length - 1].timestamp);
			else if (rel.length) lastActivity = new Date(rel[rel.length - 1].at);
			
			if (lastActivity > g.lastDate) g.lastDate = lastActivity;
		});

		return Array.from(groups.values()).sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
	});

	function selectChat(id: string, type: ChatType) {
		activeTab = type;
		goto(`?id=${id}`, { replaceState: true });
	}

	const activeChat = $derived.by(() => {
		if (!selectedId) return null;
		if (activeTab === 'resident') return residentChats.find(c => c.userId === selectedId);
		return adminChats.find(c => c.adminId === selectedId);
	});

	const counterparty = $derived(activeChat 
		? (activeTab === 'resident' ? getResidentInfo((activeChat as any).userId) : getResidentInfo((activeChat as any).adminId))
		: null);
	
	const timelineItems = $derived.by(() => {
		const items: any[] = [];
		if (!activeChat) return [];

		if (activeTab === 'resident') {
			const chat = activeChat as any;
			chat.bookings.forEach((b: any) => {
				if (b.messageTimeline) {
					b.messageTimeline.forEach((msg: any) => {
						items.push({ type: 'message', date: new Date(msg.timestamp), data: msg });
					});
				}
				if (b.timeline) {
					b.timeline.forEach((event: any) => {
						items.push({ type: 'event', date: new Date(event.at), data: event });
					});
				}
				// Embeds
				if (b.quoteIds) b.quoteIds.forEach((id: string) => {
					const quote = getQuoteById(id);
					if (quote && quote.createdAt) items.push({ type: 'quote', date: new Date(quote.createdAt), data: quote });
				});
				if (b.invoiceIds) b.invoiceIds.forEach((id: string) => {
					const invoice = getInvoiceById(id);
					if (invoice && invoice.createdAt) items.push({ type: 'invoice', date: new Date(invoice.createdAt), data: invoice });
				});
				if (b.paymentIds) b.paymentIds.forEach((id: string) => {
					const payment = getPaymentById(id);
					const dateStr = payment ? (payment.createdAt ?? payment.paidAt) : undefined;
					if (payment && dateStr) items.push({ type: 'payment', date: new Date(dateStr), data: payment });
				});
			});
		} else {
			const chat = activeChat as any;
			const aid = chat.adminId;
			chat.tickets.forEach((t: any) => {
				if (t.messageTimeline) {
					t.messageTimeline.filter((m: any) => m.senderId === supplierId || m.senderId === aid).forEach((msg: any) => {
						items.push({ type: 'message', date: new Date(msg.timestamp), data: msg });
					});
				}
				const rel = getSupplierRelevantTimeline(t, supplierId);
				rel.forEach((event: any) => {
					items.push({ type: 'event', date: new Date(event.at), data: event });
				});
				// Embeds
				if (t.quoteIds) t.quoteIds.forEach((id: string) => {
					const quote = getQuoteById(id);
					if (quote && quote.createdAt) items.push({ type: 'quote', date: new Date(quote.createdAt), data: quote });
				});
				if (t.invoiceIds) t.invoiceIds.forEach((id: string) => {
					const invoice = getInvoiceById(id);
					if (invoice && invoice.createdAt) items.push({ type: 'invoice', date: new Date(invoice.createdAt), data: invoice });
				});
				if (t.paymentIds) t.paymentIds.forEach((id: string) => {
					const payment = getPaymentById(id);
					const dateStr = payment ? (payment.createdAt ?? payment.paidAt) : undefined;
					if (payment && dateStr) items.push({ type: 'payment', date: new Date(dateStr), data: payment });
				});
			});
		}
		
		return items.sort((a, b) => a.date.getTime() - b.date.getTime());
	});

	function getResidentInfo(userId: string) {
		return users.find(u => u.id === userId);
	}

	const statusColors: Record<string, string> = {
		requested: 'bg-amber-100 text-amber-700',
		confirmed: 'bg-emerald-100 text-emerald-700',
		cancelled: 'bg-red-100 text-red-700',
		closed: 'bg-slate-100 text-slate-500',
		declined: 'bg-red-100 text-red-700',
		unknown: 'bg-slate-100 text-slate-400',
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
					onclick={() => { activeTab = 'resident'; if(selectedId) goto('?', { replaceState: true }); }}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab === 'resident' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}"
				>
					Residenti
				</button>
				<button 
					onclick={() => { activeTab = 'admin'; if(selectedId) goto('?', { replaceState: true }); }}
					class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all {activeTab === 'admin' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}"
				>
					Amministrazione
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
			{#if activeTab === 'resident'}
				{#each residentChats as group}
					{@const resident = getResidentInfo(group.userId)}
					{@const lastBkg = group.bookings[group.bookings.length - 1]}
					{@const lastMsg = lastBkg?.messageTimeline?.[lastBkg.messageTimeline.length - 1]}
					<button 
						onclick={() => selectChat(group.userId, 'resident')}
						class="w-full p-4 flex gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left {selectedId === group.userId ? 'bg-white shadow-sm' : ''}"
					>
						<div class="w-12 h-12 rounded-full bg-[#5D7D94]/10 flex items-center justify-center text-[#5D7D94] shrink-0 border border-[#5D7D94]/5">
							<HugeiconsIcon icon={UserCircleIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-slate-900 truncate">{resident?.name || 'Residente'}</span>
								{#if group.lastDate.getTime() > 0}
									<span class="text-[10px] text-slate-400">{format(group.lastDate, "HH:mm")}</span>
								{/if}
							</div>
							<p class="text-xs text-slate-500 line-clamp-1">
								{lastMsg?.text || 'Inizia la conversazione...'}
							</p>
						</div>
					</button>
				{/each}
			{:else}
				{#each adminChats as group}
					{@const admin = getResidentInfo(group.adminId)}
					{@const lastTkt = group.tickets[group.tickets.length - 1]}
					{@const lastMsg = lastTkt?.messageTimeline?.[lastTkt.messageTimeline.length - 1]}
					<button 
						onclick={() => selectChat(group.adminId, 'admin')}
						class="w-full p-4 flex gap-3 hover:bg-white border-b border-slate-100 transition-colors text-left {selectedId === group.adminId ? 'bg-white shadow-sm' : ''}"
					>
						<div class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
							<HugeiconsIcon icon={CustomerServiceIcon} size={28} />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex justify-between items-baseline mb-0.5">
								<span class="font-bold text-slate-900 truncate text-sm">{admin?.name || 'Amministrazione'}</span>
								{#if group.lastDate.getTime() > 0}
									<span class="text-[10px] text-slate-400">{format(group.lastDate, "HH:mm")}</span>
								{/if}
							</div>
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
		{#if activeChat && counterparty}
			<header class="h-16 shrink-0 bg-white border-b border-border px-4 flex items-center gap-3 relative z-10 transition-shadow">
				<button 
					onclick={() => goto('?', { replaceState: true })}
					class="p-2 -ml-2 rounded-full hover:bg-slate-100 md:hidden transition-colors"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
				</button>
				
				<div class="w-10 h-10 rounded-full {activeTab === 'resident' ? 'bg-[#5D7D94]/10 text-[#5D7D94]' : 'bg-amber-50 text-amber-600'} flex items-center justify-center border border-current/5 shrink-0 ml-1">
					<HugeiconsIcon icon={activeTab === 'resident' ? UserCircleIcon : CustomerServiceIcon} size={24} />
				</div>
				
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h2 class="font-bold text-slate-900 text-sm truncate">{counterparty.name}</h2>
					</div>
					<p class="text-[11px] text-[#5D7D94] font-medium truncate">
						{activeTab === 'resident' ? 'Residente' : 'Amministratore'}
					</p>
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
						{#if ['booking_created', 'confirmed', 'declined', 'booking_updated', 'cancelled', 'closed'].includes(item.data.kind)}
							<BookingTimelineEvent event={item.data} currentUserId={supplierId} />
						{:else}
							<ChatTimelineEvent event={item.data} />
						{/if}
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
